'use client';
/* oxlint-disable next/no-img-element -- Source thumbnails and local editorial photography do not use an image service. */
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
import { InspirationPlanner } from '@/components/inspiration-planner';
import type { PlanningContext } from '@/lib/planning-input';
import { RouteMap } from '@/components/route-map';
import { GoScoreCard } from '@/components/go-score';
import { goScore } from '@/lib/day-plan';
import {
  ArrowRight,
  ArrowUpRight,
  ArrowUp,
  ArrowDown,
  Play,
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
  themeInfo,
  planningWarnings,
  score,
  type Theme,
} from '@/lib/travel';

export function SocialInspiration({
  onCustomize,
  savedPostIds,
  onChangeSavedPosts,
}: {
  onCustomize: (
    ids: string[],
    sourceIds: string[],
    context?: PlanningContext,
  ) => void;
  savedPostIds: string[];
  onChangeSavedPosts: (ids: string[]) => void;
}) {
  const chosen = savedPostIds;
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
  const transfer = useRef<{ ids: string[]; sourceIds: string[] } | null>(null);
  useEffect(() => {
    let active = true;
    const url = new URL(window.location.href);
    const id = url.searchParams.get('plan');
    if (id && socialPosts.some((p) => p.id === id)) {
      queueMicrotask(() => {
        if (!active) return;
        const next = organizeSocialPosts([id]);
        setResult(next);
        setRoute(next.stops.map((s) => s.placeId));
        setPreferences(next.themes);
        setPanel('route');
        url.searchParams.delete('plan');
        window.history.replaceState(
          null,
          '',
          url.pathname + url.search + url.hash,
        );
      });
    }
    return () => {
      active = false;
    };
  }, []);
  useEffect(
    () => () => {
      request.current++;
    },
    [],
  );
  const post = socialPosts.find((p) => p.id === postId)!;
  const popular = socialPosts.filter((p) => p.featured);
  const warnings = planningWarnings(route);
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
    onChangeSavedPosts(
      chosen.includes(id) ? chosen.filter((x) => x !== id) : [...chosen, id],
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
      setPreferences(next.themes);
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
      <InspirationPlanner onCustomize={onCustomize} />
      <HomeCarousel variant="social" title="热门推荐，把喜欢变成下一程">
        {popular.map((p) => (
          <article
            key={p.id}
            className={
              'social-card ' + (chosen.includes(p.id) ? 'is-chosen' : '')
            }
          >
            <button
              className="social-cover"
              aria-label={`${p.kind === 'video' ? '播放原作者视频' : '阅读站内攻略'}：${p.title}`}
              onClick={() => {
                setPostId(p.id);
                setPanel('post');
              }}
            >
              <img
                src={p.cover}
                alt={p.title}
                loading="lazy"
                referrerPolicy="no-referrer"
              />
              {p.kind === 'video' && (
                <>
                  <span className="play-bubble">
                    <Play size={20} />
                  </span>
                  <span className="media-type">{p.duration}</span>
                </>
              )}
            </button>
            <div className="social-copy">
              <span className="social-topic">
                {p.kind === 'video'
                  ? '贵州综合旅行 · 原作者视频'
                  : `${p.theme} · 站内攻略`}
              </span>
              <a className="social-title" href={'/inspiration/' + p.id}>
                <h3>{p.title}</h3>
              </a>
              <div className="social-author">
                <span className="social-author-name">
                  <i aria-hidden="true">{p.author.slice(0, 1)}</i>
                  <span>{p.author}</span>
                </span>
                <span className="social-source-label">
                  {p.kind === 'video' ? p.publishedAt : '编辑整理'}
                </span>
              </div>
              <div className="social-card-actions">
                <label>
                  <input
                    type="checkbox"
                    aria-label={`收藏为规划素材：${p.title}`}
                    checked={chosen.includes(p.id)}
                    onChange={() => toggle(p.id)}
                  />
                  <span>收藏为素材</span>
                </label>
                <button
                  className="social-plan-button"
                  onClick={() => void organize([p.id])}
                >
                  成为我的出行规划
                </button>
              </div>
            </div>
          </article>
        ))}
      </HomeCarousel>
      <Dialog
        open={panel !== null}
        onOpenChange={(open) => {
          if (!open) close();
        }}
        onOpenChangeComplete={(open) => {
          if (!open && transfer.current) {
            const { ids, sourceIds } = transfer.current;
            transfer.current = null;
            onCustomize(ids, sourceIds);
          }
        }}
      >
        <DialogContent className="social-dialog">
          <DialogTitle className="sr-only">
            {panel === 'post' ? post.title : 'AI 整理与定制路线'}
          </DialogTitle>
          <DialogDescription className="sr-only">
            公开视频使用原平台播放器并标注原作者与来源。地点提取结果可继续修改。
          </DialogDescription>
          {panel === 'post' ? (
            <div className="post-reader">
              <div className="post-media">
                {post.kind === 'video' ? (
                  <iframe
                    key={post.id}
                    src={post.embedUrl}
                    title={`${post.title} · ${post.author}`}
                    loading="lazy"
                    allow="autoplay; fullscreen; picture-in-picture"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                ) : (
                  <img
                    src={post.cover}
                    alt={post.title}
                    referrerPolicy="no-referrer"
                  />
                )}
                <p>
                  {post.kind === 'video'
                    ? '原平台公开视频播放器；播放、登录和下架状态以来源页为准。'
                    : 'AI 黔驴编辑整理的贵州旅行攻略。'}
                  {post.sourceUrl && (
                    <a href={post.sourceUrl} target="_blank" rel="noreferrer">
                      在原页面查看 <ArrowUpRight size={12} />
                    </a>
                  )}
                </p>
              </div>
              <div className="post-article">
                <span className="eyebrow">
                  {post.kind === 'video'
                    ? '贵州综合旅行 · 原作者公开视频'
                    : `${post.theme || '综合灵感'} · 站内攻略`}
                </span>
                <h2>{post.title}</h2>
                <p className="post-byline">
                  {post.author} ·{' '}
                  {post.kind === 'video'
                    ? `原作者 · ${post.publishedAt}`
                    : 'AI 黔驴编辑整理'}
                </p>
                <p>{post.intro}</p>
                {post.theme && post.kind === 'article' && (
                  <div className="content-theme-note">
                    <b>
                      {post.theme} · {themeInfo[post.theme].subtitle} · 以“
                      {themeInfo[post.theme].verb}”为核心
                    </b>
                    <p>{post.recommendation}</p>
                    <small>{themeInfo[post.theme].boundary}</small>
                  </div>
                )}
                {post.kind === 'video' && (
                  <div className="content-theme-note">
                    <b>一条内容，多种贵州体验</b>
                    <p>{post.recommendation}</p>
                    <small>
                      已识别：
                      {[
                        ...new Set(
                          post.mentions.map(
                            (mention) => placeById(mention.placeId).category,
                          ),
                        ),
                      ].join('、')}
                    </small>
                  </div>
                )}
                {post.mentions.map((m, i) => (
                  <div className="post-paragraph" key={m.placeId}>
                    <b>
                      {String(i + 1).padStart(2, '0')} ·{' '}
                      {placeById(m.placeId).name}
                    </b>
                    <p>{m.quote}</p>
                  </div>
                ))}
                <div className="post-footer">
                  <a className="outline-btn" href={'/inspiration/' + post.id}>
                    阅读全文与推荐依据 <ArrowRight size={16} />
                  </a>
                  <Button
                    className="primary-btn"
                    onClick={() => void organize([post.id])}
                  >
                    <Sparkles /> 成为我的出行规划
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
                根据已记录的来源标题与简介提取地点；无法说明来源的内容不会伪装成原视频到访点。
              </p>
              {busy ? (
                <div className="social-loading">
                  <LoaderCircle className="spin" size={30} />
                  <output>
                    {
                      [
                        '读取来源页与地点提及…',
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
                    {warnings.length > 0 && (
                      <aside
                        className="planning-cautions"
                        aria-label="玩法与规划提醒"
                      >
                        {warnings.map((warning) => (
                          <p key={warning}>{warning}</p>
                        ))}
                      </aside>
                    )}
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
                                    <GoScoreCard
                                      placeName={p.name}
                                      score={goScore(p, { preferences })}
                                    />
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
                          onAddPlace={(id) => setRoute((current) => current.includes(id) ? current : [...current, id])}
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
                      <p>
                        偏好会更新草稿中的推荐指数，并筛选补充地点；不会替你删除已选地点。
                      </p>
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
                            当前偏好没有更多同区域候选，可换个偏好或手动搜索。
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
                                  <small>
                                    {p.region} · 推荐指数{' '}
                                    {score(p, 'normal', preferences).total} ·
                                    规划参考
                                  </small>
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
                      <div>
                        <b>统一输出为详细行程</b>
                        <p>
                          下一步选择日期、预算与同行人；生成后进入“行程概览 →
                          完整时间轴 → 五项
                          GoScore”。支持排序、删除、替换、延时与加点，后续时间自动重算。
                        </p>
                      </div>
                      <Button
                        className="primary-btn"
                        disabled={!route.length}
                        onClick={() => {
                          transfer.current = {
                            ids: [...route],
                            sourceIds: [...result.postIds],
                          };
                          close();
                        }}
                      >
                        继续生成标准行程 <ArrowRight />
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
