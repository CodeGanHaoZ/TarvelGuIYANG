import { createRequire } from 'node:module';
import { copyFile, mkdir, readdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Ship OCR runtime and language files with the app: no third-party CDN or image upload.
const require = createRequire(import.meta.url);
const target = fileURLToPath(new URL('../public/ocr/', import.meta.url));
const library = dirname(require.resolve('tesseract.js/package.json'));
const core = dirname(
  createRequire(join(library, 'package.json')).resolve(
    'tesseract.js-core/package.json',
  ),
);
await mkdir(join(target, 'lang'), { recursive: true });
await copyFile(
  join(library, 'dist/worker.min.js'),
  join(target, 'worker.min.js'),
);
await copyFile(
  join(library, 'dist/worker.min.js.LICENSE.txt'),
  join(target, 'worker.LICENSE.txt'),
);
await copyFile(
  join(library, 'LICENSE.md'),
  join(target, 'LICENSE-tesseract.txt'),
);
for (const name of await readdir(core)) {
  if (/^tesseract-core.*\.wasm(?:\.js)?$/.test(name))
    await copyFile(join(core, name), join(target, name));
}
for (const lang of ['chi_sim', 'eng']) {
  const packageDir = dirname(require.resolve(`@tesseract.js-data/${lang}`));
  await copyFile(
    join(packageDir, '4.0.0_best_int', `${lang}.traineddata.gz`),
    join(target, 'lang', `${lang}.traineddata.gz`),
  );
}
console.log('Local OCR assets ready.');
