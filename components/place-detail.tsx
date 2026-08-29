'use client';
/* oxlint-disable next/no-img-element -- Self-hosted demo photos use fixed CSS dimensions; no Next image service is required by this Vite app. */
import { useState } from 'react';
import {
  type Place,
  score,
  type Theme,
  money,
  places,
  placeAttributes,
  placeMedia,
} from '@/lib/travel';
import {
  MapPin,
  Clock,
  Heart,
  Plus,
  Sparkles,
  Info,
  BedDouble,
  TrainFront,
  Ticket,
  Mountain,
  ImagePlus,
  Play,
  ArrowUpRight,
} from '@/components/travel-icons';
import { Button } from '@/components/ui/button';
import { GoScoreCard } from '@/components/go-score';
import { goScore, type GoScore } from '@/lib/day-plan';
export function PlaceDetail({
  place,
  onAdd,
  onSave,
  saved,
  compact = false,
  preferences = [],
  journeyScore,
}: {
  place: Place;
  onAdd: (id: string) => void;
  onSave: (id: string) => void;
  saved: boolean;
  compact?: boolean;
  preferences?: Theme[];
  journeyScore?: GoScore;
}) {
  const [tab, setTab] = useState('介绍');
  const [scenario, setScenario] = useState('normal');
  const s = journeyScore ?? goScore(place, { scenario, preferences });
  const media = placeMedia(place.id);
  const attributes = placeAttributes[place.id];
  return (
    <div className={'place-detail ' + (compact ? 'compact' : '')}>
      <div className="detail-title-row">
        <div>
          <span className="eyebrow">在地探索 / {place.region}</span>
          <h2>{place.name}</h2>
          <p>
            <MapPin size={13} />
            {place.region} · {place.category}{' '}
            <span className="mini-tag">规划参考</span>
          </p>
        </div>
        <button
          className={'icon-btn ' + (saved ? 'saved' : '')}
          aria-label={saved ? '取消收藏地点' : '收藏地点'}
          onClick={() => onSave(place.id)}
        >
          <Heart size={20} />
        </button>
      </div>
      {!compact && place.image && (
        <img className="detail-cover" src={place.image} alt={place.name} />
      )}
      <GoScoreCard score={s} placeName={place.name} />
      {journeyScore ? (
        <p className="source-note">
          已按当前时间轴、交通与同行类型计算。在“今日概览”调整后会同步更新。
        </p>
      ) : (
        <label className="score-scenario">
          模拟情景
          <select
            value={scenario}
            onChange={(e) => setScenario(e.target.value)}
          >
            <option value="normal">常规场景</option>
            <option value="rain">降雨</option>
            <option value="crowd">拥挤</option>
            <option value="closed">闭园 / 不营业</option>
          </select>
          <span>仅调整当前评分预览</span>
        </label>
      )}
      {s.warnings.map((w) => (
        <p className="score-warning" key={w}>
          {w}
        </p>
      ))}
      <div className="ai-tip">
        <Sparkles size={17} />
        <div>
          <b>黔驴的小建议</b>
          <p>{place.tip}</p>
        </div>
      </div>
      <div className="detail-meta">
        <span>
          <Clock size={15} />
          建议 {place.duration} 分钟
        </span>
        <span>
          <Ticket size={15} />
          参考 ¥{money(place.price)} / 人
        </span>
      </div>
      <div className="tab-row">
        {['介绍', '图片', '视频', '评分依据', '出行信息'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={tab === t ? 'active' : ''}
          >
            {t}
          </button>
        ))}
      </div>
      {tab === '介绍' && (
        <div className="detail-tab-body">
          <h3>景点介绍</h3>
          <p>{place.description}</p>
          <div className="place-intro-facts">
            <div>
              <small>体验类型</small>
              <b>{attributes.nature}</b>
            </div>
            <div>
              <small>游览方式</small>
              <b>{attributes.effort}</b>
            </div>
            <div>
              <small>建议停留</small>
              <b>{place.duration} 分钟</b>
            </div>
          </div>
          {place.culture && (
            <div className="culture-note">
              <Mountain size={19} />
              <div>
                <b>在地文化 · 温柔相待</b>
                <p>{place.culture}</p>
              </div>
            </div>
          )}
          <h4>附近，也值得遇见</h4>
          <div className="nearby-list">
            {places
              .filter((p) => p.region === place.region && p.id !== place.id)
              .slice(0, 2)
              .map((p) => (
                <button key={p.id} onClick={() => onAdd(p.id)}>
                  <span>
                    {p.name}
                    <small>
                      {p.category} · 推荐指数{' '}
                      {score(p, 'normal', preferences).total} · 规划参考
                    </small>
                  </span>
                  <Plus size={17} />
                </button>
              ))}
          </div>
        </div>
      )}
      {tab === '图片' && (
        <div className="detail-tab-body">
          <div className="detail-section-heading">
            <div>
              <h3>地点图片</h3>
              <p>地点素材及明确提到该地点的内容封面。</p>
            </div>
            <ImagePlus size={19} />
          </div>
          {media.images.length ? (
            <div className="place-photo-grid">
              {media.images.map((image, index) => (
                <figure key={image.src}>
                  <img
                    src={image.src}
                    alt={`${place.name}图片 ${index + 1}`}
                    loading="lazy"
                  />
                  <figcaption>{image.source}</figcaption>
                </figure>
              ))}
            </div>
          ) : (
            <div className="place-media-empty">
              <ImagePlus size={24} />
              <b>暂无可展示图片</b>
              <p>后续可补充明确属于该地点的图片素材。</p>
            </div>
          )}
        </div>
      )}
      {tab === '视频' && (
        <div className="detail-tab-body">
          <div className="detail-section-heading">
            <div>
              <h3>相关视频</h3>
              <p>仅展示明确提到该地点的原平台公开内容。</p>
            </div>
            <Play size={19} />
          </div>
          {media.videos.length ? (
            <div className="place-video-list">
              {media.videos.map((video) => (
                <article key={video.id}>
                  <div className="place-video-frame">
                    <iframe
                      src={video.embedUrl}
                      title={`${place.name}相关视频：${video.title}`}
                      loading="lazy"
                      allow="autoplay; fullscreen; picture-in-picture"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                    />
                  </div>
                  <div className="place-video-copy">
                    <div>
                      <b>{video.title}</b>
                      <small>
                        {video.author}
                        {video.publishedAt ? ` · ${video.publishedAt}` : ''}
                      </small>
                    </div>
                    <a href={video.sourceUrl} target="_blank" rel="noreferrer">
                      原视频 <ArrowUpRight size={14} />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="place-media-empty">
              <Play size={24} />
              <b>暂无可核验的相关视频</b>
              <p>不使用无来源片段，也不把相似景观冒充为该地点。</p>
            </div>
          )}
        </div>
      )}
      {tab === '评分依据' && (
        <div className="detail-tab-body">
          {s.factors.map((f) => (
            <p key={f.name}>
              <b>
                {f.name} · {f.value}分
              </b>
              <br />
              {f.note}
            </p>
          ))}
          <p className="source-note">
            分数越高表示越适宜；不同玩法沿用各自的品类特征。天气、开放与交通信息都是模拟输入，不是实时评估。
          </p>
        </div>
      )}
      {tab === '出行信息' && (
        <div className="detail-tab-body">
          <div className="transport-row">
            <Ticket />
            <span>
              门票 / 体验<small>参考 ¥{place.price} / 人 · 规划参考价</small>
            </span>
          </div>
          <div className="transport-row">
            <TrainFront />
            <span>
              公共交通 / 景区接驳<small>真实班次、站点和票价：待补充</small>
            </span>
          </div>
          <div className="transport-row">
            <BedDouble />
            <span>
              {place.region}周边住宿
              <small>酒店位置、可住状态和报价：待补充</small>
            </span>
          </div>
          <p className="notice">仅展示信息，不提供购买、预约或下单。</p>
        </div>
      )}
      <p className="source-note">
        <Info size={13} /> 来源：贵州规划参考数据集 · 2026-08-28
        <br />
        开放时间、位置、评分与价格均未核验。
      </p>
      <Button
        className="primary-btn full-width"
        onClick={() => onAdd(place.id)}
      >
        <Plus /> 加入当前行程
      </Button>
    </div>
  );
}
