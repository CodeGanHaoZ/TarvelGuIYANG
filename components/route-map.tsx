'use client';
/* oxlint-disable jsx-a11y/prefer-tag-over-role -- SVG point groups require role + keyboard handling; HTML buttons are not valid SVG children. */
import { useState } from 'react';
import { type TripItem, placeById, metrics } from '@/lib/travel';
import {
  MapPin,
  Plus,
  Minus,
  LocateFixed,
  Layers,
  Route,
} from '@/components/travel-icons';
export function RouteMap({
  items,
  selected,
  onSelect,
  dayIndex,
  label,
  previous,
  summaryOverride,
}: {
  items: TripItem[];
  selected: string | null;
  onSelect: (id: string) => void;
  dayIndex: number;
  label?: string;
  previous?: TripItem;
  summaryOverride?: { km: number; minutes: number };
}) {
  const [zoom, setZoom] = useState(1),
    [labels, setLabels] = useState(true),
    [offset, setOffset] = useState({ x: 0, y: 0 });
  const [drag, setDrag] = useState<{ x: number; y: number } | null>(null);
  const coords = items.map((i) => placeById(i.placeId));
  const lngs = coords.map((p) => p.lng),
    lats = coords.map((p) => p.lat);
  const minLng = Math.min(...lngs),
    maxLng = Math.max(...lngs),
    minLat = Math.min(...lats),
    maxLat = Math.max(...lats);
  const width = Math.max(maxLng - minLng, 0.03),
    height = Math.max(maxLat - minLat, 0.03);
  const points = coords.map((p) => ({
    x: 90 + ((p.lng - minLng) / width) * 410,
    y: 110 + ((maxLat - p.lat) / height) * 320,
  }));
  const summary = summaryOverride ?? metrics(items, previous);
  const colors = ['#dc7357', '#3f9387', '#79629f', '#b68e39'];
  const color = colors[dayIndex % colors.length];
  return (
    <div className="route-map">
      <div className="map-topline">
        <span className="map-badge">
          <MapPin size={14} />
          {label || `${coords[0]?.region || '贵州'} · 第 ${dayIndex + 1} 天`}
        </span>
        <span className="map-mock">地理示意图 · 非导航</span>
      </div>
      <svg
        viewBox="0 0 600 560"
        className="map-canvas"
        aria-label="行程点位地图，可点击地点与时间轴联动"
        onPointerDown={(e) => {
          if (
            e.target === e.currentTarget ||
            (e.target as Element).tagName === 'rect'
          )
            setDrag({ x: e.clientX - offset.x, y: e.clientY - offset.y });
        }}
        onPointerMove={(e) => {
          if (drag) setOffset({ x: e.clientX - drag.x, y: e.clientY - drag.y });
        }}
        onPointerUp={() => setDrag(null)}
        onPointerLeave={() => setDrag(null)}
      >
        <defs>
          <pattern
            id="map-grid"
            width="64"
            height="64"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(-18)"
          >
            <rect width="64" height="64" fill="#f1f3e9" />
            <path d="M0 0H64V64" fill="none" stroke="#fff" strokeWidth="8" />
            <path
              d="M0 32H64M32 0V64"
              fill="none"
              stroke="#e4e8da"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="600" height="560" fill="url(#map-grid)" />
        <g
          style={{
            transform: `translate(${offset.x}px,${offset.y}px) scale(${zoom})`,
            transformOrigin: '300px 280px',
          }}
        >
          <path
            d="M-30 130Q160 70 150 210T290 330T640 415"
            stroke="#c5e1dd"
            fill="none"
            strokeWidth="25"
          />
          <path
            d="M-30 130Q160 70 150 210T290 330T640 415"
            stroke="#deeeeb"
            fill="none"
            strokeWidth="10"
          />
          <path
            d="M-20 430L190 270L360 225L630 90M120 -20L230 140L430 440L400 600"
            fill="none"
            stroke="#dfd9bb"
            strokeWidth="13"
          />
          <path
            d="M-20 430L190 270L360 225L630 90M120 -20L230 140L430 440L400 600"
            fill="none"
            stroke="#fff9e7"
            strokeWidth="9"
          />
          <text x="385" y="120" className="map-region">
            {coords[0]?.region || '贵州'}
          </text>
          <text x="340" y="460" className="map-river">
            贵州 · 山水之间
          </text>
          <polyline
            points={points.map((p) => `${p.x},${p.y}`).join(' ')}
            fill="none"
            stroke="white"
            strokeWidth="8"
            strokeLinejoin="round"
          />
          <polyline
            points={points.map((p) => `${p.x},${p.y}`).join(' ')}
            fill="none"
            stroke={color}
            strokeWidth="4"
            strokeLinejoin="round"
            strokeDasharray="8 4"
          />
          {points.map((point, i) => (
            <g
              key={items[i].id}
              transform={`translate(${point.x} ${point.y})`}
              className="map-marker"
              role="button"
              tabIndex={0}
              aria-label={`地点 ${i + 1} ${coords[i].name}`}
              onClick={() => onSelect(items[i].id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelect(items[i].id);
                }
              }}
            >
              <circle r="26" fill="transparent" />
              {selected === items[i].id && (
                <circle r="29" fill={color} opacity=".18" />
              )}
              <circle
                r="19"
                fill={selected === items[i].id ? '#283a31' : color}
                stroke="white"
                strokeWidth="4"
              />
              <text
                y="5"
                textAnchor="middle"
                fill="white"
                fontSize="14"
                fontWeight="700"
              >
                {i + 1}
              </text>
              {labels && (
                <>
                  <rect
                    x={point.x > 400 ? -155 : 25}
                    y="-17"
                    width="130"
                    height="34"
                    rx="9"
                    fill="white"
                    stroke="#e5e8df"
                  />
                  <text
                    x={point.x > 400 ? -90 : 90}
                    y="4"
                    textAnchor="middle"
                    className="map-place-label"
                  >
                    {coords[i].name}
                  </text>
                </>
              )}
            </g>
          ))}
        </g>
      </svg>
      <div className="map-controls">
        <button
          aria-label="放大地图"
          onClick={() => setZoom((z) => Math.min(2, z + 0.2))}
        >
          <Plus size={18} />
        </button>
        <button
          aria-label="缩小地图"
          onClick={() => setZoom((z) => Math.max(0.6, z - 0.2))}
        >
          <Minus size={18} />
        </button>
        <button
          aria-label="重置地图视角"
          onClick={() => {
            setZoom(1);
            setOffset({ x: 0, y: 0 });
          }}
        >
          <LocateFixed size={18} />
        </button>
        <button
          aria-label="切换地点名称"
          aria-pressed={labels}
          onClick={() => setLabels(!labels)}
        >
          <Layers size={18} />
        </button>
      </div>
      <div className="map-summary">
        <span>
          <span className="route-dot" style={{ background: color }} /> 今日路线
        </span>
        <span>{items.length} 个地点</span>
        <span>
          <Route size={13} /> {summary.km.toFixed(1)} km · {summary.minutes}{' '}
          分钟
        </span>
      </div>
      <div className="map-attribution">
        {summaryOverride
          ? '汇总含所列酒店往返 / 跨城接续；连线仅示意景点，不是实际导航'
          : previous
            ? '汇总含跨城接续，连线仅示意当日地点 · 非导航'
            : '点位坐标与道路为演示近似 · 交通为模型估算'}
      </div>
    </div>
  );
}
