'use client';
import { useState } from 'react';
import { itineraryPresets } from '@/lib/itinerary-fixtures';
import {
  createPresetTrip,
  fillEmptyTripWithPreset,
  placeById,
  money,
  type Trip,
} from '@/lib/travel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  CalendarDays,
  MapPin,
  ArrowRight,
  Check,
  Sparkles,
} from '@/components/travel-icons';

export function ItineraryLibrary({
  trip,
  onCreate,
  onFill,
}: {
  trip: Trip;
  onCreate: (trip: Trip) => void;
  onFill: (trip: Trip) => void;
}) {
  const [presetId, setPresetId] = useState(
    itineraryPresets.find((p) => trip.destination.includes(p.destination))
      ?.id ?? itineraryPresets[0].id,
  );
  const [start, setStart] = useState(trip.start);
  const [error, setError] = useState('');
  const preset = itineraryPresets.find((p) => p.id === presetId)!;
  const count = preset.days.reduce((n, d) => n + d.stops.length, 0);
  const cost = preset.days
    .flatMap((d) => d.stops)
    .reduce((n, s) => n + placeById(s.placeId).price, 0);
  const canFill =
    trip.days.length === 3 && trip.days.every((d) => !d.items.length);
  function apply(fill: boolean) {
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(start) ||
      Number.isNaN(new Date(start + 'T12:00:00').getTime())
    ) {
      setError('请选择有效的出发日期。');
      return;
    }
    if (fill) onFill(fillEmptyTripWithPreset(trip, presetId));
    else
      onCreate(
        createPresetTrip(presetId, {
          start,
          people: [...trip.people],
          budget: trip.budget,
        }),
      );
  }
  return (
    <div className="itinerary-library">
      <span className="eyebrow">
        <Sparkles size={16} /> THREE DAYS, WELL SPENT
      </span>
      <h2>三天，慢慢认识贵州。</h2>
      <p>
        选一份完整样例，再按你的喜好修改。行程包含用餐、游览、留白、住宿建议和逐段出行方案。
      </p>
      <div className="preset-options" aria-label="选择三日样例">
        {itineraryPresets.map((p) => (
          <button
            type="button"
            key={p.id}
            aria-pressed={presetId === p.id}
            className={presetId === p.id ? 'active' : ''}
            onClick={() => setPresetId(p.id)}
          >
            <MapPin size={17} />
            <span>
              {p.destination}
              <small>
                3天 · {p.days.reduce((n, d) => n + d.stops.length, 0)}站
              </small>
            </span>
            {presetId === p.id && <Check size={16} />}
          </button>
        ))}
      </div>
      <div className="preset-intro">
        <h3>{preset.title}</h3>
        <p>{preset.intro}</p>
        <div className="preset-facts">
          <span>
            <CalendarDays size={14} /> 3天2晚
          </span>
          <span>
            <MapPin size={14} /> {count}个地点
          </span>
          <span>已列地点约 ¥{money(cost)}/人 · Mock</span>
        </div>
      </div>
      <div className="preset-days">
        {preset.days.map((d, i) => (
          <details key={d.title} open={i === 0}>
            <summary>
              <b>DAY 0{i + 1}</b>
              <span>{d.title}</span>
              <small>{d.stops.length}站</small>
            </summary>
            <p>{d.guide.summary}</p>
            <ol>
              {d.stops.map((s) => (
                <li key={s.placeId}>
                  <time>
                    {String(Math.floor(s.at / 60)).padStart(2, '0')}:
                    {String(s.at % 60).padStart(2, '0')}
                  </time>
                  <span>
                    {placeById(s.placeId).name}
                    <small>{s.activity}</small>
                  </span>
                </li>
              ))}
            </ol>
          </details>
        ))}
      </div>
      <label className="field-label" htmlFor="preset-start">
        <span>新行程出发日期</span>
        <Input
          id="preset-start"
          type="date"
          value={start}
          onChange={(e) => setStart(e.target.value)}
        />
      </label>
      <p className="source-note">
        沿用当前同行人（{trip.people.length}人）和预算 ¥{money(trip.budget)}
        。交通、住宿、自理餐饮另计；样例混合不同主题，不代表预约或实时导航。创建新行程不会修改原行程。
      </p>
      {error && (
        <p role="alert" className="warning-message">
          {error}
        </p>
      )}
      <Button className="primary-btn full-width" onClick={() => apply(false)}>
        创建这份三日行程 <ArrowRight size={18} />
      </Button>
      {canFill && (
        <>
          <Button
            className="outline-btn full-width"
            onClick={() => apply(true)}
          >
            填入当前空白三日行程
          </Button>
          <p className="source-note">
            填入时保留当前每一天的日期、同行人和原笔记，改用所选样例的目的地与混合主题；可撤销。
          </p>
        </>
      )}
    </div>
  );
}
