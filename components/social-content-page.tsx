'use client';
/* oxlint-disable next/no-img-element -- Source thumbnails and local editorial photography do not use an image service. */
/* oxlint-disable next/no-html-link-for-pages -- Full document navigation refreshes shared device-local planning state after collecting content. */
import { useEffect, useState } from 'react';
import {
  socialStories,
  socialPosts,
  placeById,
  initialData,
  restore,
  storageKey,
  type SocialPost,
  type Theme,
  themeInfo,
} from '@/lib/travel';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  Check,
  Sparkles,
  MapPin,
  Mountain,
} from '@/components/travel-icons';
import { Button } from '@/components/ui/button';
import { GoScoreCard } from '@/components/go-score';
import { goScore } from '@/lib/day-plan';
import { BackToTop } from '@/components/back-to-top';

export function SocialContentPage({ post }: { post: SocialPost }) {
  const story = socialStories[post.id];
  const [saved, setSaved] = useState(false);
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState('');
  const [preferences, setPreferences] = useState<Theme[]>([]);
  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      try {
        const raw = localStorage.getItem(storageKey);
        const state = raw ? restore(raw) : null;
        if (state) {
          setSaved(state.savedPostIds.includes(post.id));
          setPreferences(
            state.trips.find((t) => t.id === state.activeTripId)?.preferences ||
              [],
          );
        } else if (raw)
          setMessage('本机数据无法读取。为保留已有数据，本页不会覆盖它。');
      } catch {
        setMessage('浏览器存储不可用，仍可阅读并规划。');
      }
      setReady(true);
    });
    return () => {
      active = false;
    };
  }, [post.id]);
  function save() {
    try {
      const raw = localStorage.getItem(storageKey);
      const state = raw ? restore(raw) : initialData();
      if (!state) throw new Error('本机数据无法读取，未覆盖已有内容。');
      const nextSaved = !state.savedPostIds.includes(post.id);
      state.savedPostIds = nextSaved
        ? [...state.savedPostIds, post.id]
        : state.savedPostIds.filter((id) => id !== post.id);
      localStorage.setItem(storageKey, JSON.stringify(state));
      setSaved(nextSaved);
      setMessage(
        nextSaved
          ? '已保存到“我的 → 规划素材”，以后可再次使用。'
          : '已取消收藏，原有行程不受影响。',
      );
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : '收藏失败，请稍后重试。',
      );
    }
  }
  return (
    <div className="story-page">
      <header className="story-header">
        <a href="/" className="text-btn">
          <ArrowLeft size={17} /> 返回首页
        </a>
        <a className="story-brand" href="/">
          <Mountain size={23} />
          AI 黔驴
        </a>
        <span className="mini-tag">灵感内容库 · 来源可追溯</span>
      </header>
      <main>
        <div className="story-heading">
          <div className="eyebrow">
            {post.kind === 'video'
              ? '贵州综合旅行 · 原作者公开视频'
              : `${post.theme || '综合灵感'} · 站内攻略`}
          </div>
          <h1>{post.title}</h1>
          <p>
            {post.author} ·{' '}
            {post.kind === 'video' ? '原作者' : 'AI 黔驴编辑整理'}{' '}
            <span>
              {post.publishedAt || '持续更新'} · {story.readTime}
            </span>
          </p>
          <div className="social-tags">
            {post.tags.map((tag) => (
              <span key={tag}>#{tag}</span>
            ))}
          </div>
        </div>
        {post.theme && post.kind === 'article' && (
          <aside className="content-theme-note">
            <b>
              {post.theme} · {themeInfo[post.theme].subtitle} · 以“
              {themeInfo[post.theme].verb}”为核心
            </b>
            <p>{post.recommendation}</p>
            <small>{themeInfo[post.theme].boundary}</small>
          </aside>
        )}
        {post.kind === 'video' && (
          <aside className="content-theme-note">
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
          </aside>
        )}
        <div className="story-layout">
          <article className="story-article">
            <div
              className={
                'story-media ' + (post.kind === 'video' ? 'is-video' : '')
              }
            >
              {post.kind === 'video' ? (
                <iframe
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
            </div>
            <p className="story-media-note">
              {post.kind === 'video'
                ? '使用原平台公开播放器，不下载、不转存、不替代来源页。'
                : 'AI 黔驴依据贵州旅行分类整理的站内攻略。'}
              {post.sourceUrl && (
                <a href={post.sourceUrl} target="_blank" rel="noreferrer">
                  在原页面查看 <ArrowUpRight size={12} />
                </a>
              )}
            </p>
            <p className="story-lead">{post.intro}</p>
            {story.sections.map((section) => (
              <section className="story-section" key={section.title}>
                <h2>{section.title}</h2>
                <p>{section.text}</p>
              </section>
            ))}
            <section className="story-section">
              <h2>
                {post.kind === 'video'
                  ? '来源页明确提及的地点'
                  : '攻略里提到的地点'}
              </h2>
              <p>
                每个地点都可以作为规划候选，展开指数查看品类与文旅属性依据。
              </p>
              <div className="story-places">
                {post.mentions.map((mention, i) => {
                  const place = placeById(mention.placeId);
                  return (
                    <article key={place.id}>
                      <div className="story-place-heading">
                        <span className="round-number">{i + 1}</span>
                        <div>
                          <h3>{place.name}</h3>
                          <p>
                            <MapPin size={12} />
                            {place.region} · {place.category}
                          </p>
                        </div>
                      </div>
                      <blockquote>{mention.quote}</blockquote>
                      <GoScoreCard
                        placeName={place.name}
                        score={goScore(place, { preferences })}
                      />
                    </article>
                  );
                })}
              </div>
            </section>
            <section className="story-checklist">
              <h2>留给定制的空间</h2>
              <ul>
                {story.tips.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
            </section>
          </article>
          <aside className="story-planning">
            <span className="feature-icon">
              <Sparkles />
            </span>
            <h2>这篇心动，留给下一程</h2>
            <p>
              先收藏为素材，或现在整理成路线。你可以删改地点，再选择日期、预算与节奏。
            </p>
            <div className="story-planning-stats">
              <span>
                <b>{post.mentions.length}</b>个候选地点
              </span>
              <span>
                <b>
                  {
                    new Set(
                      post.mentions.map((m) => placeById(m.placeId).region),
                    ).size
                  }
                </b>
                个区域
              </span>
            </div>
            <a
              className="primary-btn"
              href={'/?plan=' + encodeURIComponent(post.id)}
            >
              <Sparkles size={17} /> 成为我的出行规划 <ArrowRight size={17} />
            </a>
            <Button className="outline-btn" onClick={save} disabled={!ready}>
              {saved ? <Check /> : <Bookmark />}
              {saved ? '已收藏为素材' : '收藏为规划素材'}
            </Button>
            <p className="story-storage-note">
              仅保存在本机浏览器。用此内容创建的行程会保留来源，支持后续重新定制。
            </p>
            <output className="story-feedback" aria-live="polite">
              {message}
            </output>
            <div className="story-more">
              <h3>再读一篇</h3>
              {socialPosts
                .filter((p) => p.id !== post.id)
                .slice(0, 2)
                .map((p) => (
                  <a key={p.id} href={'/inspiration/' + p.id}>
                    {p.title}
                    <ArrowRight size={14} />
                  </a>
                ))}
            </div>
          </aside>
        </div>
      </main>
      <BackToTop />
      <footer className="story-site-footer">
        AI 黔驴 ·
        内容是灵感，选择由你决定。指数、场次与供给信息均为规划参考，出发前请核验。
      </footer>
    </div>
  );
}
