'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  CloudRain,
  Footprints,
  Info,
  Layers,
  Map,
  MapPin,
  Route,
  Ticket,
  X,
} from '@/components/travel-icons';
import {
  departureChecklist,
  huangguoshuScenicStops,
  mountainPaceLabels,
  mountainRouteSummary,
  provinceMarkers,
  rainPlanChanges,
  scenicMarkerMeta,
  scenicStopsForPace,
  type MapScope,
  type MountainPace,
  type ScenicStop,
} from '@/lib/guizhou-map';
import {
  baiduBrowserAk,
  configureBaiduGcj02,
  loadBaiduMap,
} from '@/lib/baidu-map';
import { baiduRouteUrl } from '@/lib/transport';
import { placeById, type DaySettings, type TripItem } from '@/lib/travel';

type MapWeather = 'clear' | 'rain' | 'fog';

type MapPoint = {
  id: string;
  itemId?: string;
  name: string;
  lng: number;
  lat: number;
  marker: string;
};

function normalizedPoints(points: MapPoint[]) {
  const lngs = points.map((point) => point.lng);
  const lats = points.map((point) => point.lat);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const width = Math.max(maxLng - minLng, 0.02);
  const height = Math.max(maxLat - minLat, 0.02);
  return points.map((point) => ({
    ...point,
    x: 10 + ((point.lng - minLng) / width) * 80,
    y: 13 + ((maxLat - point.lat) / height) * 68,
  }));
}

function FallbackMap({
  points,
  selected,
  onSelect,
  weather,
}: {
  points: MapPoint[];
  selected: string | null;
  onSelect: (point: MapPoint) => void;
  weather: MapWeather;
}) {
  const positioned = normalizedPoints(points);
  return (
    <div className={`guizhou-map-fallback weather-${weather}`}>
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <defs>
          <pattern
            id="guizhou-map-grid"
            width="13"
            height="13"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M0 13 13 0M-4 4 4-4M9 17 17 9"
              stroke="#fff"
              strokeWidth="1.8"
            />
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#guizhou-map-grid)" />
        <path d="M-10 72Q20 40 42 59T110 27" className="fallback-river" />
        <polyline
          points={positioned.map((point) => `${point.x},${point.y}`).join(' ')}
          className="fallback-route-halo"
        />
        <polyline
          points={positioned.map((point) => `${point.x},${point.y}`).join(' ')}
          className="fallback-route-line"
        />
      </svg>
      {positioned.map((point) => (
        <button
          type="button"
          key={point.id}
          className={selected === point.id ? 'selected' : ''}
          style={{ left: `${point.x}%`, top: `${point.y}%` }}
          onClick={() => onSelect(point)}
          aria-label={`查看 ${point.name}`}
        >
          <span>{point.marker}</span>
          <small>{point.name}</small>
        </button>
      ))}
      {weather !== 'clear' && (
        <div className="map-weather-layer" aria-hidden="true">
          {weather === 'rain' ? '雨天 · 路面湿滑' : '低能见度 · 观景受限'}
        </div>
      )}
    </div>
  );
}

function ScenicGuide({ stop }: { stop: ScenicStop }) {
  return (
    <div className="scenic-guide-card">
      <span className={`scenic-guide-symbol type-${stop.type}`}>
        {scenicMarkerMeta[stop.type].symbol}
      </span>
      <div>
        <small>{scenicMarkerMeta[stop.type].label}</small>
        <strong>{stop.name}</strong>
        <p>{stop.note}</p>
      </div>
    </div>
  );
}

export function GuizhouRouteMap({
  items,
  selected,
  onSelect,
  dayIndex,
  summary,
  scenario,
  onScenarioChange,
  onApplyRain,
  onTransport,
}: {
  items: TripItem[];
  selected: string | null;
  onSelect: (id: string) => void;
  dayIndex: number;
  summary: { km: number; minutes: number };
  scenario: Required<DaySettings>['scenario'];
  onScenarioChange: (scenario: Required<DaySettings>['scenario']) => void;
  onApplyRain: () => void;
  onTransport: () => void;
}) {
  const [scope, setScope] = useState<MapScope>('province');
  const [pace, setPace] = useState<MountainPace>('standard');
  const [weatherChoice, setWeatherChoice] = useState<MapWeather>('clear');
  const [selectedScenic, setSelectedScenic] = useState('visitor-center');
  const [mapState, setMapState] = useState<
    'preview' | 'loading' | 'ready' | 'error'
  >('preview');
  const [showChanges, setShowChanges] = useState(false);
  const [tourMode, setTourMode] = useState(false);
  const [tourIndex, setTourIndex] = useState(0);
  const [checklistOpen, setChecklistOpen] = useState(false);
  const mapElement = useRef<HTMLDivElement>(null);
  const baiduAk = baiduBrowserAk();
  const markers = useMemo(() => provinceMarkers(items), [items]);
  const hasHuangguoshu = items.some((item) => item.placeId === 'huangguoshu');
  const activeScope =
    !hasHuangguoshu && scope === 'scenic' ? 'province' : scope;
  const weather: MapWeather = scenario === 'rain' ? 'rain' : weatherChoice;
  const scenicScenario = weather === 'rain' ? 'rain' : scenario;
  const scenicStops = useMemo(
    () => scenicStopsForPace(pace, scenicScenario),
    [pace, scenicScenario],
  );
  const mountain = useMemo(
    () => mountainRouteSummary(pace, scenicScenario),
    [pace, scenicScenario],
  );
  const checklist = departureChecklist(
    items.map((item) => item.placeId),
    scenicScenario,
  );
  const changes = rainPlanChanges(items).changes;
  const provincePoints: MapPoint[] = useMemo(
    () =>
      markers.map((entry) => ({
        id: entry.itemId,
        itemId: entry.itemId,
        name: entry.place.name,
        lng: entry.place.lng,
        lat: entry.place.lat,
        marker: String(entry.sequence),
      })),
    [markers],
  );
  const scenicPoints: MapPoint[] = useMemo(
    () =>
      scenicStops.map((stop) => ({
        id: stop.id,
        name: stop.name,
        lng: stop.lng,
        lat: stop.lat,
        marker: scenicMarkerMeta[stop.type].symbol,
      })),
    [scenicStops],
  );
  const activeSelectedScenic = scenicStops.some(
    (stop) => stop.id === selectedScenic,
  )
    ? selectedScenic
    : scenicStops[0]?.id || 'visitor-center';
  const points = activeScope === 'province' ? provincePoints : scenicPoints;
  const currentPoint =
    activeScope === 'province'
      ? provincePoints.find((point) => point.itemId === selected) ||
        provincePoints[0]
      : scenicPoints.find((point) => point.id === activeSelectedScenic) ||
        scenicPoints[0];
  const currentScenic = huangguoshuScenicStops.find(
    (stop) => stop.id === activeSelectedScenic,
  );
  const tourStop = scenicStops[Math.min(tourIndex, scenicStops.length - 1)];

  const handlePoint = useCallback(
    (point: MapPoint) => {
      if (activeScope === 'province' && point.itemId) onSelect(point.itemId);
      else setSelectedScenic(point.id);
    },
    [activeScope, onSelect],
  );

  useEffect(() => {
    if (!baiduAk || !mapElement.current || !points.length) return;
    let active = true;
    loadBaiduMap(baiduAk)
      .then((BMap) => {
        if (!active || !mapElement.current) return;
        configureBaiduGcj02(BMap);
        const map = new BMap.Map(mapElement.current, { enableMapClick: false });
        const baiduPoints = points.map(
          (point) => new BMap.Point(point.lng, point.lat),
        );
        map.centerAndZoom(baiduPoints[0], activeScope === 'province' ? 8 : 15);
        map.enableScrollWheelZoom(true);
        map.addControl(new BMap.NavigationControl());
        map.clearOverlays();
        if (baiduPoints.length > 1) {
          map.addOverlay(
            new BMap.Polyline(baiduPoints, {
              strokeColor: weather === 'rain' ? '#356d86' : '#d14b36',
              strokeWeight: 5,
              strokeOpacity: 0.82,
            }),
          );
        }
        points.forEach((point, index) => {
          const marker = new BMap.Marker(baiduPoints[index]);
          const activePoint = point.id === currentPoint?.id;
          const label = new BMap.Label(`${point.marker} · ${point.name}`, {
            offset: new BMap.Size(18, -18),
          });
          label.setStyle({
            border: activePoint ? '2px solid #d14b36' : '1px solid #dfe3d8',
            borderRadius: '8px',
            color: '#263128',
            fontSize: '12px',
            fontWeight: activePoint ? '700' : '500',
            padding: '6px 8px',
            background: '#fffffff2',
            boxShadow: '0 4px 14px #2731261f',
          });
          marker.setLabel(label);
          marker.addEventListener('click', () => handlePoint(point));
          map.addOverlay(marker);
        });
        map.setViewport(baiduPoints, { margins: [60, 85, 100, 55] });
        setMapState('ready');
      })
      .catch(() => {
        if (active) setMapState('error');
      });
    return () => {
      active = false;
    };
  }, [activeScope, baiduAk, currentPoint?.id, handlePoint, points, weather]);

  function chooseWeather(next: MapWeather) {
    setWeatherChoice(next);
    setShowChanges(next !== 'clear');
    if (next === 'rain') onScenarioChange('rain');
    if (next === 'clear') onScenarioChange('normal');
  }

  function startTour() {
    const start = Math.max(
      0,
      scenicStops.findIndex((stop) => stop.id === activeSelectedScenic),
    );
    setTourIndex(start);
    setTourMode(true);
  }

  return (
    <section className="guizhou-route-map" aria-label="贵州两级交互行程地图">
      <div className="guizhou-map-head">
        <div>
          <span className="eyebrow">BAIDU MAP · GUIZHOU GUIDE</span>
          <strong>
            {activeScope === 'province'
              ? `第 ${dayIndex + 1} 天 · 省域行程`
              : '黄果树 · 景区内部导览'}
          </strong>
        </div>
        <span className={`baidu-map-state state-${mapState}`}>
          {mapState === 'ready'
            ? '百度地图已加载'
            : mapState === 'loading'
              ? '正在加载地图'
              : mapState === 'error'
                ? '百度地图加载失败'
                : '可操作导览底板'}
        </span>
      </div>

      <div className="map-scope-tabs" role="tablist" aria-label="地图层级">
        <button
          type="button"
          className={activeScope === 'province' ? 'active' : ''}
          onClick={() => setScope('province')}
        >
          <Map size={16} /> 省域行程
        </button>
        <button
          type="button"
          className={activeScope === 'scenic' ? 'active' : ''}
          disabled={!hasHuangguoshu}
          onClick={() => setScope('scenic')}
        >
          <Layers size={16} /> 景区内部
        </button>
      </div>

      <div className="map-weather-tabs" aria-label="天气导览方案">
        {(
          [
            ['clear', '晴天'],
            ['rain', '雨天'],
            ['fog', '低能见度'],
          ] as const
        ).map(([value, label]) => (
          <button
            type="button"
            key={value}
            className={weather === value ? 'active' : ''}
            onClick={() => chooseWeather(value)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="baidu-map-stage">
        <div
          ref={mapElement}
          className={`baidu-map-live ${mapState === 'ready' ? 'visible' : ''}`}
        />
        {mapState !== 'ready' && points.length > 0 && (
          <FallbackMap
            points={points}
            selected={currentPoint?.id || null}
            onSelect={handlePoint}
            weather={weather}
          />
        )}
        {!points.length && (
          <div className="guizhou-map-empty">
            <MapPin size={30} />
            <p>添加地点后，这里会显示编号路线。</p>
          </div>
        )}
        {!baiduAk && (
          <details className="baidu-ak-hint">
            <summary>
              <Info size={13} /> 接入真实百度底图
            </summary>
            <p>
              在站点环境变量配置浏览器端 <code>VITE_BAIDU_MAP_AK</code>，并为 AK
              设置域名白名单。路线调起按钮仍可直接使用。
            </p>
          </details>
        )}
      </div>

      <div className="map-marker-legend">
        {activeScope === 'province' ? (
          <>
            <span>
              <i className="legend-dot route-point" /> 行程地点
            </span>
            <span>
              <i className="legend-dot risk-point" /> 跨区域接续
            </span>
          </>
        ) : (
          Object.entries(scenicMarkerMeta).map(([key, meta]) => (
            <span key={key}>
              <i>{meta.symbol}</i>
              {meta.label}
            </span>
          ))
        )}
      </div>

      {activeScope === 'province' ? (
        <div className="province-map-guide">
          <div>
            <small>今日跨景区交通</small>
            <strong>
              {summary.km.toFixed(1)} km · {summary.minutes} 分钟
            </strong>
            <p>贵州跨景区时优先看真实驾车时间；当前摘要仍是计划估算。</p>
          </div>
          <button type="button" onClick={onTransport}>
            <Route size={16} /> 查询出行方案
          </button>
          {currentPoint?.itemId &&
            items.length > 1 &&
            (() => {
              const index = items.findIndex(
                (item) => item.id === currentPoint.itemId,
              );
              if (index <= 0) return null;
              const from = placeById(items[index - 1].placeId);
              const to = placeById(items[index].placeId);
              return (
                <a
                  href={baiduRouteUrl(from, to, 'drive')}
                  target="_blank"
                  rel="noreferrer"
                >
                  在百度地图打开 {from.name} → {to.name}{' '}
                  <ArrowRight size={14} />
                </a>
              );
            })()}
        </div>
      ) : (
        <>
          <div className="mountain-pace-row" aria-label="景区游览强度">
            {Object.entries(mountainPaceLabels).map(([value, content]) => (
              <button
                type="button"
                key={value}
                className={pace === value ? 'active' : ''}
                onClick={() => setPace(value as MountainPace)}
              >
                <strong>{content.label}</strong>
                <small>{content.description}</small>
              </button>
            ))}
          </div>
          <div className="mountain-time">
            <span>
              <Footprints size={15} />
              <b>{mountain.walkingKm} km</b>
              <small>山地步行</small>
            </span>
            <span>
              <Route size={15} />
              <b>{mountain.minutes} 分钟</b>
              <small>山地时间</small>
            </span>
            <span>
              <ArrowRight size={15} />
              <b>{mountain.climbM} m</b>
              <small>累计爬升</small>
            </span>
            <span>
              <MapPin size={15} />
              <b>{mountain.restPoints} 处</b>
              <small>休息参考点</small>
            </span>
          </div>
          <p className="mountain-warning">
            <Info size={13} /> {mountain.rainWarning}
          </p>
          {currentScenic && <ScenicGuide stop={currentScenic} />}
          <button type="button" className="start-tour-btn" onClick={startTour}>
            <MapPin size={16} /> 开始游览指引
          </button>
        </>
      )}

      {weather !== 'clear' && (
        <div className={`weather-replan weather-${weather}`}>
          <CloudRain size={21} />
          <div>
            <strong>
              {weather === 'rain'
                ? '雨天方案：核心瀑布提前'
                : '低能见度方案：减少观景依赖'}
            </strong>
            <p>
              {weather === 'rain'
                ? '自动避开高湿滑路段，并为接驳与慢行增加缓冲。'
                : '优先文化、室内与低风险点位；能见度改善后再恢复观景段。'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowChanges((value) => !value)}
          >
            查看变化
          </button>
          {showChanges && (
            <ul>
              {changes.map((change) => (
                <li key={change}>
                  <Check size={13} />
                  {change}
                </li>
              ))}
            </ul>
          )}
          <div className="weather-replan-actions">
            <button
              type="button"
              className="apply"
              onClick={() => {
                onApplyRain();
                setWeatherChoice('rain');
              }}
            >
              应用建议
            </button>
            <button type="button" onClick={() => chooseWeather('clear')}>
              保持原计划
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        className="departure-check-toggle"
        aria-expanded={checklistOpen}
        onClick={() => setChecklistOpen((value) => !value)}
      >
        <span>
          <Ticket size={16} /> 出发前检查{' '}
          <small>
            {checklist.filter((item) => item.state === 'warning').length}{' '}
            项待核验
          </small>
        </span>
        <ChevronDown size={16} />
      </button>
      {checklistOpen && (
        <div className="departure-checklist">
          {checklist.map((item) => (
            <p key={item.id} className={`state-${item.state}`}>
              <span>
                {item.state === 'done'
                  ? '✓'
                  : item.state === 'warning'
                    ? '!'
                    : 'i'}
              </span>
              {item.text}
            </p>
          ))}
          <small>预约、开放、票务和接驳信息须以官方系统与景区现场为准。</small>
        </div>
      )}

      {tourMode && tourStop && (
        <dialog open className="live-tour-panel" aria-label="实时游览指引">
          <button
            type="button"
            className="tour-close"
            onClick={() => setTourMode(false)}
            aria-label="退出游览指引"
          >
            <X size={18} />
          </button>
          <span className="eyebrow">
            LIVE TOUR · {tourIndex + 1}/{scenicStops.length}
          </span>
          <strong>下一站 · {tourStop.name}</strong>
          <p>{tourStop.note}</p>
          <div>
            <span>步行 {tourStop.distanceKm} km</span>
            <span>约 {tourStop.minutes} 分钟</span>
            <span>爬升 {tourStop.climbM} m</span>
          </div>
          <small>最近接驳 / 设施位置只作导览参考，请同时听从现场指引。</small>
          <div className="tour-actions">
            <button
              type="button"
              disabled={tourIndex === 0}
              onClick={() => setTourIndex((value) => Math.max(0, value - 1))}
            >
              <ArrowLeft size={15} /> 上一站
            </button>
            <button
              type="button"
              onClick={() => {
                const next = Math.min(scenicStops.length - 1, tourIndex + 1);
                setTourIndex(next);
                setSelectedScenic(scenicStops[next].id);
              }}
            >
              下一站 <ArrowRight size={15} />
            </button>
          </div>
        </dialog>
      )}
    </section>
  );
}
