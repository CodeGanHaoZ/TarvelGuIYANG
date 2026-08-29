'use client';
/* oxlint-disable next/no-img-element -- Temporary object URLs preview locally selected files without uploading them. */
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RecommendationScore } from '@/components/recommendation-score';
import {
  Sparkles,
  Link2,
  ImagePlus,
  Send,
  X,
  MapPin,
  ArrowRight,
  LoaderCircle,
  Trash2,
  Check,
} from '@/components/travel-icons';
import {
  placeById,
  planningWarnings,
  suggestedTripDays,
  uid,
} from '@/lib/travel';
import {
  emptyPlanningDraft,
  organizePlanningMaterial,
  planningContext,
  planningThemes,
  validatePlanningImage,
  type ImageText,
  type PlanningContext,
} from '@/lib/planning-input';

type Attachment = { id: string; file: File; preview: string };
type Message = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  images?: ImageText[];
};

export function InspirationPlanner({
  onCustomize,
}: {
  onCustomize: (
    ids: string[],
    sourceIds: string[],
    context?: PlanningContext,
  ) => void;
}) {
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState(emptyPlanningDraft);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');
  const [linkOpen, setLinkOpen] = useState(false);
  const [link, setLink] = useState('');
  const input = useRef<HTMLTextAreaElement>(null);
  const files = useRef<HTMLInputElement>(null);
  const ownedUrls = useRef(new Set<string>());
  const active = useRef<AbortController | null>(null);
  const generation = useRef(0);
  const reply = useRef<HTMLDivElement>(null);
  const stopIds = draft.stops.map((stop) => stop.placeId);
  const warnings = planningWarnings(stopIds);

  useEffect(
    () => () => {
      generation.current++;
      active.current?.abort();
      for (const url of ownedUrls.current) URL.revokeObjectURL(url);
    },
    [],
  );
  useEffect(() => {
    if (reply.current) reply.current.scrollTop = reply.current.scrollHeight;
  }, [messages, busy]);

  function clearAttachments() {
    for (const url of ownedUrls.current) URL.revokeObjectURL(url);
    ownedUrls.current.clear();
    setAttachments([]);
  }
  function addImages(incoming: File[]) {
    if (busy) return;
    const next = [...attachments];
    const problems: string[] = [];
    for (const file of incoming) {
      const problem = validatePlanningImage(file);
      if (problem) {
        problems.push(`${file.name}：${problem}`);
        continue;
      }
      if (next.length >= 3) {
        problems.push('每次最多添加 3 张图片，请分批发送。');
        break;
      }
      if (
        next.some(
          (item) =>
            item.file.name === file.name &&
            item.file.size === file.size &&
            item.file.lastModified === file.lastModified,
        )
      )
        continue;
      const preview = URL.createObjectURL(file);
      ownedUrls.current.add(preview);
      next.push({ id: uid(), file, preview });
    }
    setError(problems.join(' '));
    setAttachments(next);
  }
  function cancel() {
    generation.current++;
    active.current?.abort();
    active.current = null;
    setBusy(false);
    setProgress('');
  }
  function reset() {
    cancel();
    clearAttachments();
    setMessages([]);
    setDraft(emptyPlanningDraft());
    setText('');
    setLink('');
    setLinkOpen(false);
    setError('');
  }
  async function send() {
    if (active.current || (!text.trim() && !attachments.length)) return;
    const token = ++generation.current;
    const controller = new AbortController();
    active.current = controller;
    setBusy(true);
    setError('');
    setProgress('正在整理你的旅行灵感…');
    const userText = text.trim();
    const selectedFiles = [...attachments];
    setMessages(
      (current) =>
        [
          ...current,
          {
            id: uid(),
            role: 'user',
            text: [
              userText,
              ...selectedFiles.map((item) => `已添加图片：${item.file.name}`),
            ]
              .filter(Boolean)
              .join('\n'),
          },
        ].slice(-12) as Message[],
    );
    try {
      let imageText: ImageText[] = [];
      if (selectedFiles.length) {
        try {
          const { recognizePlanningImages } =
            await import('@/lib/planning-ocr');
          imageText = await recognizePlanningImages(
            selectedFiles.map((item) => item.file),
            (message) => {
              if (token === generation.current) setProgress(message);
            },
            controller.signal,
          );
        } catch (cause) {
          if (controller.signal.aborted) return;
          imageText = selectedFiles.map((item) => ({
            name: item.file.name,
            text: '',
            error:
              cause instanceof Error
                ? cause.message
                : '识别失败，请改用清晰截图或粘贴文字。',
          }));
        }
      }
      if (token !== generation.current) return;
      const next = organizePlanningMaterial(
        { text: userText, images: imageText, origin: window.location.origin },
        draft,
      );
      const ids = next.stops.map((stop) => stop.placeId);
      const count = next.constraints.dayCount ?? suggestedTripDays(ids);
      const summary = ids.length
        ? `已整理好 ${ids.length} 个候选地点，${next.constraints.dayCount ? '按你的要求' : '建议'}安排 ${count} 天。先确认下方清单，再补充日期、人数与预算，生成每日行程。`
        : '我先帮你提取地点，确认后再排成每日路线。';
      setDraft(next);
      setMessages(
        (current) =>
          [
            ...current,
            {
              id: uid(),
              role: 'assistant',
              text: [
                summary,
                next.choices.length
                  ? '同一地点有不同玩法，请先选择要体验的内容。'
                  : '',
                ...next.warnings,
              ]
                .filter(Boolean)
                .join('\n'),
              images: imageText,
            },
          ].slice(-12) as Message[],
      );
      setText('');
      if (!imageText.some((image) => image.error)) clearAttachments();
    } catch (cause) {
      if (token === generation.current)
        setError(cause instanceof Error ? cause.message : '整理失败，请重试。');
    } finally {
      if (token === generation.current) {
        active.current = null;
        setBusy(false);
        setProgress('');
      }
    }
  }
  function addLink() {
    try {
      const parsed = new URL(link.trim());
      if (
        !['http:', 'https:'].includes(parsed.protocol) ||
        parsed.username ||
        parsed.password
      )
        throw new Error();
      if ((text + link).length > 3999) {
        setError('文字过长，请分次发送。');
        return;
      }
      setText((value) => [value, link.trim()].filter(Boolean).join('\n'));
      setLink('');
      setLinkOpen(false);
      setError('');
      input.current?.focus();
    } catch {
      setError('请添加完整的 http:// 或 https:// 链接。');
    }
  }
  return (
    <section
      className="inspiration-planner"
      aria-labelledby="inspiration-planner-title"
    >
      <div className="section-heading">
        <h2 id="inspiration-planner-title">把刷到的心动，变成你的路线</h2>
      </div>
      <div className="planner-chat">
        <div className="planner-chat-heading">
          <span className="planner-avatar">
            <Sparkles size={22} />
          </span>
          <div>
            <b>黔驴 AI 规划助手</b>
            <p>发来旅行灵感，我们一起把它排成行程。</p>
          </div>
          {messages.length > 0 && (
            <Button
              variant="ghost"
              onClick={reset}
              aria-label="清空规划对话"
              title="清空规划对话"
            >
              <Trash2 size={17} />
              <span>重新开始</span>
            </Button>
          )}
        </div>
        {messages.length > 0 && (
          <div
            className="planner-messages"
            ref={reply}
            role="log"
            aria-label="规划对话"
            aria-live="polite"
            aria-relevant="additions"
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`planner-message ${message.role}`}
              >
                <small>{message.role === 'user' ? '你' : '黔驴'}</small>
                <p>{message.text}</p>
                {!!message.images?.some((image) => image.text) && (
                  <details className="planner-ocr-text">
                    <summary>核对图片识别文字</summary>
                    {message.images.map(
                      (image, i) =>
                        image.text && (
                          <div key={i}>
                            <b>{image.name}</b>
                            <p>{image.text}</p>
                          </div>
                        ),
                    )}
                  </details>
                )}
              </div>
            ))}
          </div>
        )}
        {draft.choices.length > 0 && (
          <div className="planner-choices">
            {draft.choices.map((choice) => (
              <div key={choice.name}>
                <b>{choice.name}，你想怎么玩？</b>
                <div>
                  {choice.ids.map((id) => (
                    <Button
                      key={id}
                      variant="outline"
                      disabled={busy}
                      onClick={() =>
                        setDraft((current) => ({
                          ...current,
                          choices: current.choices.filter(
                            (item) => item.name !== choice.name,
                          ),
                          stops: current.stops.some(
                            (stop) => stop.placeId === id,
                          )
                            ? current.stops
                            : [
                                ...current.stops,
                                { placeId: id, sources: ['你确认的具体玩法'] },
                              ],
                        }))
                      }
                    >
                      {placeById(id).name}
                    </Button>
                  ))}
                  <Button
                    variant="ghost"
                    disabled={busy}
                    onClick={() =>
                      setDraft((current) => ({
                        ...current,
                        choices: current.choices.filter(
                          (item) => item.name !== choice.name,
                        ),
                      }))
                    }
                  >
                    暂不加入
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
        {stopIds.length > 0 && (
          <div className="planner-route">
            <div className="row-between">
              <b>
                <Check size={16} /> 待确认的行程地点
              </b>
              <span>{stopIds.length} 个地点</span>
            </div>
            <ol>
              {draft.stops.map((stop, i) => {
                const place = placeById(stop.placeId);
                return (
                  <li key={stop.placeId}>
                    <span className="planner-stop-index">{i + 1}</span>
                    <div>
                      <b>{place.name}</b>
                      <small>
                        {place.region} · {place.category}
                      </small>
                      <small className="planner-source">
                        {stop.sources.join('；')}
                      </small>
                      <RecommendationScore
                        place={place}
                        preferences={planningThemes(draft)}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      disabled={busy}
                      aria-label={`移除${place.name}`}
                      onClick={() =>
                        setDraft((current) => ({
                          ...current,
                          stops: current.stops.filter(
                            (s) => s.placeId !== stop.placeId,
                          ),
                        }))
                      }
                    >
                      <X size={16} />
                    </Button>
                  </li>
                );
              })}
            </ol>
            {warnings.length > 0 && (
              <p className="planner-warning">{warnings.join(' ')}</p>
            )}
            <div className="planner-route-footer">
              <span>可继续发送“再加甲秀楼”或“不去青岩古镇”</span>
              <Button
                className="primary-btn"
                disabled={busy || !!draft.choices.length}
                onClick={() =>
                  onCustomize(stopIds, draft.postIds, planningContext(draft))
                }
              >
                成为我的出行规划 <ArrowRight size={17} />
              </Button>
            </div>
          </div>
        )}
        <form
          className="planner-composer"
          onSubmit={(e) => {
            e.preventDefault();
            void send();
          }}
        >
          <label className="sr-only" htmlFor="inspiration-message">
            旅行链接、攻略文字或补充要求
          </label>
          <textarea
            ref={input}
            id="inspiration-message"
            value={text}
            maxLength={4000}
            disabled={busy}
            rows={3}
            placeholder="粘贴旅行链接、攻略文字，或添加截图。比如：想去黄果树和天星桥，2个人，预算1500元…"
            onChange={(e) => setText(e.target.value)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              addImages(Array.from(e.dataTransfer.files));
            }}
            onPaste={(e) => {
              const pasted = Array.from(e.clipboardData.files);
              if (pasted.length) {
                e.preventDefault();
                addImages(pasted);
                const value = e.clipboardData.getData('text/plain');
                if (value)
                  setText((current) => (current + '\n' + value).slice(0, 4000));
              }
            }}
            onKeyDown={(e) => {
              if (
                e.key === 'Enter' &&
                (e.ctrlKey || e.metaKey) &&
                !e.nativeEvent.isComposing
              ) {
                e.preventDefault();
                void send();
              }
            }}
          />
          {attachments.length > 0 && (
            <div className="planner-attachments">
              {attachments.map((item) => (
                <div key={item.id}>
                  <img
                    src={item.preview}
                    alt={`待识别截图：${item.file.name}`}
                  />
                  <span>{item.file.name}</span>
                  <button
                    type="button"
                    disabled={busy}
                    aria-label={`删除图片${item.file.name}`}
                    onClick={() => {
                      URL.revokeObjectURL(item.preview);
                      ownedUrls.current.delete(item.preview);
                      setAttachments((current) =>
                        current.filter((a) => a.id !== item.id),
                      );
                    }}
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
          {linkOpen && (
            <div className="planner-link-field">
              <Input
                aria-label="添加旅行链接"
                placeholder="https://…"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                disabled={busy}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addLink();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                disabled={busy || !link.trim()}
                onClick={addLink}
              >
                添加
              </Button>
              <Button
                type="button"
                variant="ghost"
                disabled={busy}
                aria-label="关闭链接输入"
                onClick={() => setLinkOpen(false)}
              >
                <X size={16} />
              </Button>
            </div>
          )}
          <input
            type="file"
            ref={files}
            accept="image/jpeg,image/png,image/webp"
            multiple
            hidden
            onChange={(e) => {
              addImages(Array.from(e.target.files ?? []));
              e.target.value = '';
            }}
          />
          <div className="planner-composer-footer">
            <div className="planner-input-actions">
              <Button
                type="button"
                variant="ghost"
                disabled={busy}
                aria-expanded={linkOpen}
                onClick={() => setLinkOpen((open) => !open)}
              >
                <Link2 size={17} />
                添加链接
              </Button>
              <Button
                type="button"
                variant="ghost"
                disabled={busy}
                onClick={() => files.current?.click()}
              >
                <ImagePlus size={17} />
                添加图片
              </Button>
              <span>也可粘贴截图</span>
            </div>
            {busy ? (
              <Button type="button" variant="outline" onClick={cancel}>
                取消整理
              </Button>
            ) : (
              <Button
                type="submit"
                className="primary-btn"
                disabled={!text.trim() && !attachments.length}
              >
                <Send size={17} />
                整理为行程
              </Button>
            )}
          </div>
        </form>
        {busy && (
          <output className="planner-progress">
            <LoaderCircle className="spin" size={16} />
            {progress}
          </output>
        )}
        {error && (
          <p className="error-message" role="alert">
            {error}
          </p>
        )}
        {!messages.length && (
          <div className="planner-examples">
            <span>试试这样说</span>
            {[
              '甲秀楼、青岩古镇，2天慢游，2人，预算1500元',
              '想去梵净山和马岭河峡谷',
            ].map((example) => (
              <Button
                key={example}
                variant="outline"
                disabled={busy}
                onClick={() => {
                  setText(example);
                  input.current?.focus();
                }}
              >
                <MapPin size={13} />
                {example}
              </Button>
            ))}
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => {
                setText(
                  new URL(
                    '/inspiration/hot-nature-video',
                    window.location.origin,
                  ).href,
                );
                input.current?.focus();
              }}
            >
              <Link2 size={13} />
              添加一篇示例攻略链接
            </Button>
          </div>
        )}
        <details className="planner-capabilities">
          <summary>支持范围与隐私</summary>
          <p>
            文字按已收录的贵州地点名称整理；本站攻略及内置链接可提取地点，其他平台链接暂不联网抓取。图片在本机识别中英文文字，不上传、不识别无文字的风景照片。每次最多
            3 张 JPG / PNG / WebP、单张 8
            MB；识别文字请先核对。对话和原图仅本次页面保留，生成后保存地点和来源摘要。AI
            规划为本地规则，出行前仍需核实。
          </p>
        </details>
      </div>
    </section>
  );
}
