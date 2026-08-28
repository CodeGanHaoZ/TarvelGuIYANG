import type { Worker } from 'tesseract.js';
import { validatePlanningImage, type ImageText } from './planning-input';

/** Load OCR only on demand; image bytes stay in this browser. */
export async function recognizePlanningImages(
  files: File[],
  onProgress: (message: string) => void,
  signal: AbortSignal,
): Promise<ImageText[]> {
  if (!files.length) return [];
  let worker: Worker | undefined;
  let stopped = false;
  let rejectAbort: (reason: Error) => void = () => {};
  const abort = () => {
    stopped = true;
    rejectAbort(new DOMException('已取消识别', 'AbortError'));
    void worker?.terminate();
  };
  const interrupted = new Promise<never>((_, reject) => {
    rejectAbort = reject;
  });
  signal.addEventListener('abort', abort, { once: true });
  const timeout = setTimeout(() => {
    stopped = true;
    rejectAbort(new Error('图片识别超时，请压缩截图或改为粘贴文字。'));
  }, 90000);
  try {
    return await Promise.race([
      (async () => {
        if (signal.aborted) throw new DOMException('已取消识别', 'AbortError');
        onProgress('准备本机文字识别，首次使用需要加载字库…');
        const { createWorker, PSM } = await import('tesseract.js');
        const base = new URL('/ocr/', window.location.origin).href;
        worker = await createWorker(['chi_sim', 'eng'], 1, {
          workerPath: base + 'worker.min.js',
          corePath: base,
          langPath: base + 'lang',
          workerBlobURL: false,
          cacheMethod: 'none',
          // Tesseract otherwise rethrows worker errors outside the awaited job.
          errorHandler: () => {
            stopped = true;
            rejectAbort(new Error('图片识别暂时不可用，请重试或改为粘贴文字。'));
          },
          logger: (event) => {
            if (
              !stopped &&
              !signal.aborted &&
              event.status === 'recognizing text'
            )
              onProgress(
                `正在识别截图文字 · ${Math.round(event.progress * 100)}%`,
              );
          },
        });
        if (stopped || signal.aborted) {
          await worker.terminate();
          throw new DOMException('已取消识别', 'AbortError');
        }
        await worker.setParameters({ tessedit_pageseg_mode: PSM.SPARSE_TEXT });
        const results: ImageText[] = [];
        for (const file of files) {
          if (stopped || signal.aborted)
            throw new DOMException('已取消识别', 'AbortError');
          try {
            const error = validatePlanningImage(file);
            if (error) throw new Error(error);
            const bitmap = await createImageBitmap(file);
            const pixels = bitmap.width * bitmap.height;
            bitmap.close();
            if (pixels > 20000000)
              throw new Error('图片分辨率过大，请裁剪或缩小后重试。');
            onProgress(`正在读取「${file.name}」…`);
            const { data } = await worker.recognize(file);
            results.push({ name: file.name, text: data.text.slice(0, 8000) });
          } catch (error) {
            if (signal.aborted)
              throw new DOMException('已取消识别', 'AbortError');
            results.push({
              name: file.name,
              text: '',
              error:
                error instanceof Error
                  ? error.message
                  : '识别失败，请改用清晰截图或粘贴文字。',
            });
          }
        }
        return results;
      })(),
      interrupted,
    ]);
  } finally {
    stopped = true;
    clearTimeout(timeout);
    signal.removeEventListener('abort', abort);
    await worker?.terminate();
  }
}
