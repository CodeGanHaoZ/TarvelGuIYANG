'use client';
/* oxlint-disable next/no-img-element -- Self-hosted demo photos use fixed CSS dimensions; no Next image service is required by this Vite app. */
import { useState } from 'react';
import {
  type Place,
  score,
  factorNames,
  type Theme,
  money,
  places,
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
} from '@/components/travel-icons';
import { Button } from '@/components/ui/button';
import { RecommendationScore } from '@/components/recommendation-score';
export function PlaceDetail({
  place,
  onAdd,
  onSave,
  saved,
  compact = false,
  preferences = [],
}: {
  place: Place;
  onAdd: (id: string) => void;
  onSave: (id: string) => void;
  saved: boolean;
  compact?: boolean;
  preferences?: Theme[];
}) {
  const [tab, setTab] = useState('推荐');
  const [scenario, setScenario] = useState('normal');
  const s = score(place, scenario, preferences);
  return (
    <div className={'place-detail ' + (compact ? 'compact' : '')}>
      <div className="detail-title-row">
        <div>
          <span className="eyebrow">在地探索 / {place.region}</span>
          <h2>{place.name}</h2>
          <p>
            <MapPin size={13} />
            {place.region} · {place.category}
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
      <div className="score-panel">
        <div>
          <div className="score-caption">
            品类推荐指数
          </div>
          <strong>
            {s.total}
            <small>/100</small>
          </strong>
          <p>
            {s.label} · {s.attributes.nature}
          </p>
        </div>
        <div className="score-overview">
          {s.factors.slice(0, 4).map((f, i) => (
            <div key={i}>
              <span>{factorNames[i]}</span>
              <b>{f}</b>
              <div className="mini-meter">
                <i style={{ width: f + '%' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <label className="score-scenario">
        情景
        <select value={scenario} onChange={(e) => setScenario(e.target.value)}>
          <option value="normal">常规场景</option>
          <option value="rain">降雨</option>
          <option value="crowd">拥挤</option>
          <option value="closed">闭园 / 不营业</option>
        </select>
        <span>仅调整当前评分预览</span>
      </label>
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
        {['推荐', '评分依据', '出行信息'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={tab === t ? 'active' : ''}
          >
            {t}
          </button>
        ))}
      </div>
      {tab === '推荐' && (
        <div className="detail-tab-body">
          <p>{place.description}</p>
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
                      {score(p, 'normal', preferences).total}
                    </small>
                  </span>
                  <Plus size={17} />
                </button>
              ))}
          </div>
        </div>
      )}
      {tab === '评分依据' && (
        <div className="detail-tab-body">
          <RecommendationScore
            place={place}
            preferences={preferences}
            scenario={scenario}
            expanded
          />
        </div>
      )}
      {tab === '出行信息' && (
        <div className="detail-tab-body">
          <div className="transport-row">
            <Ticket />
            <span>
              门票 / 体验<small>参考 ¥{place.price} / 人</small>
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
        <Info size={13} /> 来源：贵州数据集 · 2026-08-28
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
