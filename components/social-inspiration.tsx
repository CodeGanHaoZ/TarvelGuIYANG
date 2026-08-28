'use client';
/* oxlint-disable next/no-img-element -- Fixed-size local demo assets do not require an image service. */
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { HomeCarousel } from '@/components/home-carousel';
import { RouteMap } from '@/components/route-map';
import {
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Play,
  Heart,
  Sparkles,
  MapPin,
  Check,
  Plus,
  Trash2,
  LoaderCircle,
  NotebookPen,
} from '@/components/travel-icons';
import {
  socialPosts,
  organizeSocialPosts,
  recommendSocialPlaces,
  places,
  placeById,
  themes,
  type Theme,
} from '@/lib/travel';

export function SocialInspiration({
  onCustomize,
}: {
  onCustomize: (ids: string[]) => void;
}) {
  const [platform, setPlatform] = useState('全部');
  const [chosen, setChosen] = useState<string[]>([]);
  const [panel, setPanel] = useState<'post' | 'route' | null>(null);
  const [postId, setPostId] = useState(socialPosts[0].id);
  const [result, setResult] = useState<ReturnType<
    typeof organizeSocialPosts
  > | null>(null);
  const [route, setRoute] = useState<string[]>([]);
  const [preferences, setPreferences] = useState<Theme[]>([]);
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState(0);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [selectedStop, setSelectedStop] = useState<string | null>(null);
  const request = useRef(0);
  const transfer = useRef<string[] | null>(null);
  useEffect(
    () => () => {
      request.current++;
    },
    [],
  );
  const post = socialPosts.find((p) => p.id === postId)!;
  const shown = socialPosts.filter(
    (p) => platform === '全部' || p.platform === platform,
  );
  const recommended = recommendSocialPlaces(route, preferences);
  const matches = query.trim()
    ? places
        .filter(
          (p) =>
            !route.includes(p.id) &&
            (p.name + p.region + p.category).includes(query.trim()),
        )
        .slice(0, 5)
    : [];
  const regions = [...new Set(route.map((id) => placeById(id).region))];
  function toggle(id: string) {
    setChosen((ids) =>
      ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id],
    );
  }
  function close() {
    request.current++;
    setBusy(false);
    setPanel(null);
  }
  async function organize(ids: string[]) {
    const token = ++request.current;
    setPanel('route');
    setBusy(true);
    setError('');
    setResult(null);
    setRoute([]);
    setQuery('');
    setPreferences([]);
    setSelectedStop(null);
    try {
      for (let i = 0; i < 3; i++) {
        setStage(i);
        await new Promise((resolve) => setTimeout(resolve, 350));
        if (token !== request.current) return;
      }
      const next = organizeSocialPosts(ids);
      setResult(next);
      setRoute(next.stops.map((s) => s.placeId));
    } catch (e) {
      if (token === request.current) setError((e as Error).message);
    } finally {
      if (token === request.current) setBusy(false);
    }
  }
  function move(id: string, delta: number) {
    setRoute((ids) => {
      const next = [...ids],
        from = next.indexOf(id),
        to = from + delta;
      if (from < 0 || to < 0 || to >= next.length) return ids;
      [next[from], next[to]] = [next[to], next[from]];
      return next;
    });
  }
  function add(id: string) {
    setRoute((ids) => (ids.includes(id) ? ids : [...ids, id]));
    setQuery('');
  }
  return (
    <>
      <HomeCarousel
        title="把刷到的心动，变成你的路线"
        subtitle="抖音视频 · 小红书笔记 · 内容与账号均为 Mock"
        actions={
          <div className="social-filters" aria-label="筛选内容平台">
            {['全部', '抖音', '小红书'].map((p) => (
              <button
                key={p}
                aria-pressed={platform === p}
                onClick={() => setPlatform(p)}
              >
                {p}
              </button>
            ))}
          </div>
        }
      >
        {shown.map((p) => (
          <article
            key={p.id}
            className={
              'social-card ' + (chosen.includes(p.id) ? 'is-chosen' : '')
            }
          >
            <button
              className="social-cover"
              aria-label={`${p.kind === 'video' ? '播放演示视频' : '阅读演示笔记'}：${p.title}`}
              onClick={() => {
                setPostId(p.id);
                setPanel('post');
              }}
            >
              <img src={p.cover} alt={p.title} loading="lazy" />
              <span
                className={
                  'platform-tag ' +
                  (p.platform === '抖音' ? 'douyin' : 'xiaohongshu')
                }
              >
                {p.platform}
              </span>
              <span className="social-mock">Mock</span>
              {p.kind === 'video' ? (
                <>
                  <span className="play-bubble">
                    <Play size={24} />
                  </span>
                  <span className="media-type">演示短片 · {p.duration}</span>
                </>
              ) : (
                <span className="media-type">
                  <NotebookPen size={14} /> 图文笔记
                </span>
              )}
            </button>
            <div className="social-copy">
              <div className="social-tags">
                {p.tags.map((t) => (
                  <span key={t}>#{t}</span>
                ))}
              </div>
              <button
                className="social-title"
                onClick={() => {
                  setPostId(p.id);
                  setPanel('post');
                }}
              >
                <h3>{p.title}</h3>
              </button>
              <div className="social-author">
                <span>
                  <i>{p.author.slice(0, 1)}</i>
                  {p.author}
                </span>
                <span>
                  <Heart size={13} /> {p.likes}
                </span>
              </div>
              <div className="social-card-actions">
                <label>
                  <input
                    type="checkbox"
                    checked={chosen.includes(p.id)}
                    onChange={() => toggle(p.id)}
                  />
                  <span>加入灵感篮</span>
                </label>
                <button
                  className="text-btn"
                  onClick={() => void organize([p.id])}
                >
                  <Sparkles size={15} /> AI 整理
                </button>
              </div>
            </div>
          </article>
        ))}
      </HomeCarousel>
      <div className="inspiration-basket">
        <div>
          <span className="feature-icon">
            <Sparkles size={20} />
          </span>
          <div>
            <b>
              {chosen.length
                ? `已收集 ${chosen.length} 篇灵感`
                : '刷到喜欢的，就一起排进旅行'}
            </b>
            <p>
              {chosen.length
                ? '支持跨平台多选，重复地点自动合并。'
                : '勾选视频或笔记，黔驴帮你提取地点与路线。'}
            </p>
          </div>
        </div>
        <div className="basket-actions">
          {chosen.length > 0 && (
            <button className="text-btn" onClick={() => setChosen([])}>
              清空
            </button>
          )}
          <Button
            className="primary-btn"
            disabled={!chosen.length}
            onClick={() => void organize(chosen)}
          >
            <Sparkles size={17} />
            整理所选{chosen.length > 0 ? ` ${chosen.length} 篇` : ''}
            <ArrowRight size={16} />
          </Button>
        </div>
      </div>
      <Dialog
        open={panel !== null}
        onOpenChange={(open) => {
          if (!open) close();
        }}
        onOpenChangeComplete={(open) => {
          if (!open && transfer.current) {
            const ids = transfer.current;
            transfer.current = null;
            onCustomize(ids);
          }
        }}
      >
        <DialogContent className="social-dialog">
          <DialogTitle className="sr-only">
            {panel === 'post' ? post.title : 'AI 整理与定制路线'}
          </DialogTitle>
          <DialogDescription className="sr-only">
            虚构社交内容与本地规则演示。所有路线都可修改，不会抓取真实平台内容。
          </DialogDescription>
          {panel === 'post' ? (
            <div className="post-reader">
              <div className="post-media">
                {post.kind === 'video' ? (
                  <video
                    key={post.id}
                    controls
                    playsInline
                    preload="metadata"
                    poster={post.cover}
                    aria-label={post.title + '，无声演示短片'}
                  >
                    <source src={post.media} type="video/mp4" />
                    <track
                      kind="captions"
                      src={post.captions}
                      srcLang="zh"
                      label="中文样例字幕"
                      default
                    />
                    您的浏览器不支持视频，请阅读右侧分镜文案。
                  </video>
                ) : (
                  <img src={post.cover} alt={post.title} />
                )}
                <p>
                  {post.kind === 'video'
                    ? '由风景图合成的无声演示短片，非真实平台视频。'
                    : '演示图文，非真实平台博文。'}
                </p>
              </div>
              <div className="post-article">
                <span className="eyebrow">
                  {post.platform} ·{' '}
                  {post.kind === 'video' ? '视频分镜' : '图文笔记'} · MOCK
                </span>
                <h2>{post.title}</h2>
                <p className="post-byline">{post.author} · 虚构创作者</p>
                <p>{post.intro}</p>
                {post.mentions.map((m, i) => (
                  <div className="post-paragraph" key={m.placeId}>
                    <b>
                      {m.at || `0${i + 1}`} · {placeById(m.placeId).name}
                    </b>
                    <p>{m.quote}</p>
                  </div>
                ))}
                <div className="post-footer">
                  <Button
                    className="primary-btn"
                    onClick={() => void organize([post.id])}
                  >
                    <Sparkles /> AI 整理这篇
                  </Button>
                  <Button
                    variant="outline"
                    className="outline-btn"
                    onClick={() => toggle(post.id)}
                  >
                    {chosen.includes(post.id) ? <Check /> : <Plus />}
                    {chosen.includes(post.id) ? '已加入灵感篮' : '加入灵感篮'}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="social-planner">
              <span className="eyebrow">FROM INSPIRATION TO ITINERARY</span>
              <h2>
                {busy
                  ? '让喜欢的内容，连成一条路线。'
                  : '路线已整理，你来决定怎么走。'}
              </h2>
              <p className="planner-intro">
                AI 整理为本地规则模拟，不抓取真实视频，不调用大模型。
              </p>
              {busy ? (
                <div className="social-loading">
                  <LoaderCircle className="spin" size={30} />
                  <output>
                    {
                      [
                        '读取样例文案与视频分镜…',
                        '提取地点，合并重复提及…',
                        '连接路线，补充同区域推荐…',
                      ][stage]
                    }
                  </output>
                  <div>
                    {[0, 1, 2].map((i) => (
                      <span key={i} className={i <= stage ? 'done' : ''} />
                    ))}
                  </div>
                </div>
              ) : error ? (
                <div role="alert" className="error-message">
                  {error}
                </div>
              ) : (
                result && (
                  <>
                    <div className="social-summary">
                      <span>
                        <NotebookPen size={15} />
                        {result.postIds.length} 篇内容
                      </span>
                      <span>
                        <MapPin size={15} />
                        {route.length} 个地点
                      </span>
                      <span>
                        {regions.length > 1
                          ? `${regions.length} 个区域 · 需分天安排`
                          : regions[0] || '空白草稿'}
                      </span>
                    </div>
                    <div className="social-workbench">
                      <div className="social-draft">
                        <div className="row-between">
                          <h3>我的路线草稿</h3>
                          <button
                            className="text-btn"
                            onClick={() =>
                              setRoute(result.stops.map((s) => s.placeId))
                            }
                          >
                            恢复提取顺序
                          </button>
                        </div>
                        {route.length > 0 ? (
                          <ol className="draft-stops">
                            {route.map((id, i) => {
                              const p = placeById(id),
                                origin = result.stops.find(
                                  (s) => s.placeId === id,
                                );
                              return (
                                <li
                                  id={'draft-' + id}
                                  key={id}
                                  className={
                                    selectedStop === id ? 'selected' : ''
                                  }
                                >
                                  <button
                                    className="round-number"
                                    aria-label={'在地图定位' + p.name}
                                    onClick={() => setSelectedStop(id)}
                                  >
                                    {i + 1}
                                  </button>
                                  <div className="draft-stop-copy">
                                    <b>{p.name}</b>
                                    <small>
                                      {p.region} · {p.category} · {p.duration}{' '}
                                      分钟
                                    </small>
                                    {origin ? (
                                      <details>
                                        <summary>
                                          来自 {origin.sources.length} 篇内容
                                        </summary>
                                        {origin.sources.map((s) => (
                                          <p key={s.postId + s.quote}>
                                            <strong>
                                              {
                                                socialPosts.find(
                                                  (p) => p.id === s.postId,
                                                )?.title
                                              }
                                              {s.at && ` · ${s.at}`}
                                            </strong>
                                            <q>{s.quote}</q>
                                          </p>
                                        ))}
                                      </details>
                                    ) : (
                                      <small className="added-label">
                                        你添加的地点
                                      </small>
                                    )}
                                  </div>
                                  <div className="draft-controls">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      disabled={i === 0}
                                      aria-label={'上移' + p.name}
                                      onClick={() => move(id, -1)}
                                    >
                                      <ArrowUp size={15} />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      disabled={i === route.length - 1}
                                      aria-label={'下移' + p.name}
                                      onClick={() => move(id, 1)}
                                    >
                                      <ArrowDown size={15} />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      aria-label={'移除' + p.name}
                                      onClick={() =>
                                        setRoute((ids) =>
                                          ids.filter((x) => x !== id),
                                        )
                                      }
                                    >
                                      <Trash2 size={15} />
                                    </Button>
                                  </div>
                                </li>
                              );
                            })}
                          </ol>
                        ) : (
                          <div className="social-empty">
                            草稿还没有地点。可以从推荐中添加，或搜索你想去的地方。
                          </div>
                        )}
                      </div>
                      <div className="social-map-panel">
                        <RouteMap
                          label="路线草稿 · 未排期"
                          items={route.map((id) => ({
                            id,
                            placeId: id,
                            duration: placeById(id).duration,
                          }))}
                          selected={selectedStop}
                          dayIndex={0}
                          onSelect={(id) => {
                            setSelectedStop(id);
                            document
                              .getElementById('draft-' + id)
                              ?.scrollIntoView({
                                behavior: 'smooth',
                                block: 'nearest',
                              });
                          }}
                        />
                        <p>
                          按当前顺序连接的示意轨迹；跨区域交通、日期与停留时长在下一步安排。
                        </p>
                      </div>
                    </div>
                    <div className="social-recommendations">
                      <h3>再加一点，你喜欢的贵州</h3>
                      <p>偏好只筛选下面的补充推荐，不会替你删除已选地点。</p>
                      <div className="preference-chips">
                        {themes.map((t) => (
                          <button
                            key={t}
                            aria-pressed={preferences.includes(t)}
                            onClick={() =>
                              setPreferences((ps) =>
                                ps.includes(t)
                                  ? ps.filter((p) => p !== t)
                                  : [...ps, t],
                              )
                            }
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                      <div className="social-suggestions">
                        {recommended.length ? (
                          recommended.map((r) => (
                            <button
                              key={r.placeId}
                              onClick={() => add(r.placeId)}
                            >
                              <span>
                                <b>{placeById(r.placeId).name}</b>
                                <small>{r.reason}</small>
                              </span>
                              <Plus size={18} />
                            </button>
                          ))
                        ) : (
                          <p className="social-empty">
                            当前偏好没有更多同区域样例，可换个偏好或手动搜索。
                          </p>
                        )}
                      </div>
                      <Input
                        aria-label="搜索并补充路线地点"
                        placeholder="也可以搜索地点，如甲秀楼、黄果树…"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                      />
                      {query.trim() && (
                        <div className="social-suggestions">
                          {matches.length ? (
                            matches.map((p) => (
                              <button key={p.id} onClick={() => add(p.id)}>
                                <span>
                                  <b>{p.name}</b>
                                  <small>{p.region} · 手动补充</small>
                                </span>
                                <Plus size={18} />
                              </button>
                            ))
                          ) : (
                            <p className="social-empty">
                              没有未加入的匹配地点，试试其他名称。
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="social-planner-footer">
                      <p>下一步选择日期、预算与节奏。生成后仍可随时编辑。</p>
                      <Button
                        className="primary-btn"
                        disabled={!route.length}
                        onClick={() => {
                          transfer.current = [...route];
                          close();
                        }}
                      >
                        用这条路线定制旅行 <ArrowRight />
                      </Button>
                    </div>
                  </>
                )
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
