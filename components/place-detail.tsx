'use client';
/* oxlint-disable next/no-img-element -- Self-hosted demo photos use fixed CSS dimensions; no Next image service is required by this Vite app. */
import { useState } from 'react';
import {
  type Place,
  score,
  weights,
  factorNames,
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
export function PlaceDetail({
  place,
  onAdd,
  onSave,
  saved,
  compact = false,
}: {
  place: Place;
  onAdd: (id: string) => void;
  onSave: (id: string) => void;
  saved: boolean;
  compact?: boolean;
}) {
  const [tab, setTab] = useState('推荐');
  const s = score(place);
  return (
    <div className={'place-detail ' + (compact ? 'compact' : '')}>
      <div className="detail-title-row">
        <div>
          <span className="eyebrow">在地探索 / {place.region}</span>
          <h2>{place.name}</h2>
          <p>
            <MapPin size={13} />
            {place.region} · {place.category}{' '}
            <span className="mini-tag">Mock</span>
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
            今日游玩指数 <span>模拟</span>
          </div>
          <strong>
            {s.total}
            <small>/100</small>
          </strong>
          <p>
            {s.total >= 90 ? '非常推荐' : '值得一去'} ·{' '}
            {place.indoor ? '室内体验' : '户外探索'}
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
                      {p.category} · {p.duration} 分钟
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
          <p>
            按 PRD
            八项权重计算，五项出行维度展开显示。以下所有数值来自本地样例，不是实时判断。
          </p>
          <div className="factor-list">
            {factorNames.map((name, i) => (
              <div key={name}>
                <span>
                  {name}
                  <small>权重 {weights[i]}%</small>
                </span>
                <progress max={100} value={s.factors[i]} />
                <b>{s.factors[i]}</b>
              </div>
            ))}
          </div>
        </div>
      )}
      {tab === '出行信息' && (
        <div className="detail-tab-body">
          <div className="transport-row">
            <Ticket />
            <span>
              门票 / 体验<small>参考 ¥{place.price} / 人 · Mock 样例价</small>
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
        <Info size={13} /> 来源：贵州 Demo 数据集 · 2026-08-28
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
