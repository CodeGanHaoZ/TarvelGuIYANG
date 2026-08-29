'use client';
/* oxlint-disable jsx-a11y/prefer-tag-over-role -- SVG point groups require role + keyboard handling; HTML buttons are not valid SVG children. */
import { useEffect, useRef, useState } from 'react';
import { type TripItem, type Place, placeById, places, metrics, score } from '@/lib/travel';
import {
  MapPin,
  Plus,
  Minus,
  LocateFixed,
  Layers,
  Route,
} from '@/components/travel-icons';

// 生成带序号/字符的圆形 SVG 图标（用于天地图 T.Icon）
function numberedIcon(bg: string, text: string, size = 38) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><circle cx="${size/2}" cy="${size/2}" r="${size/2 - 3}" fill="${bg}" stroke="#fff" stroke-width="3"/><text x="${size/2}" y="${size/2 + size*0.15}" text-anchor="middle" fill="#fff" font-size="${Math.round(size*0.4)}" font-weight="700" font-family="system-ui,sans-serif">${text}</text></svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

export function RouteMap({
  items,
  selected,
  onSelect,
  dayIndex,
  label,
  previous,
  summaryOverride,
  onAddPlace,
  hotel,
}: {
  items: TripItem[];
  selected: string | null;
  onSelect: (id: string) => void;
  dayIndex: number;
  label?: string;
  previous?: TripItem;
  summaryOverride?: { km: number; minutes: number };
  onAddPlace?: (id: string) => void;
  hotel?: Pick<Place, 'name' | 'lat' | 'lng'>;
}) {
  const tiandituRef = useRef<HTMLDivElement>(null);
  const tiandituMapRef = useRef<any>(null);
  const realMapRef = useRef<HTMLDivElement>(null);
  const realMapInstanceRef = useRef<any>(null);
  const [zoom, setZoom] = useState(1),
    [labels, setLabels] = useState(true),
    [offset, setOffset] = useState({ x: 0, y: 0 });
  const [provider, setProvider] = useState<'tianditu' | 'baidu' | 'amap'>('tianditu');
  const [exploreId, setExploreId] = useState<string | null>(null);
  const [realMapReady, setRealMapReady] = useState(false);
  const [realMapError, setRealMapError] = useState(false);
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
  const region = coords[0]?.region;
  const hotelPoint = hotel
    ? { x: 90 + ((hotel.lng - minLng) / width) * 410, y: 110 + ((maxLat - hotel.lat) / height) * 320 }
    : null;
  const routeIds = new Set(items.map((item) => item.placeId));
  const nearby = places
    .filter((place) => place.region === region && !routeIds.has(place.id))
    .slice(0, 12);
  const nearbyPoints = nearby.map((p) => ({
    place: p,
    x: 90 + ((p.lng - minLng) / width) * 410,
    y: 110 + ((maxLat - p.lat) / height) * 320,
  }));
  const mapTarget = coords[0];
  const mapUrl = mapTarget
    ? provider === 'baidu'
      ? `https://api.map.baidu.com/marker?location=${mapTarget.lat},${mapTarget.lng}&title=${encodeURIComponent(mapTarget.name)}&content=${encodeURIComponent(region || '贵州')}&output=html`
      : `https://uri.amap.com/marker?position=${mapTarget.lng},${mapTarget.lat}&name=${encodeURIComponent(mapTarget.name)}&src=ai-qianlv`
    : '#';
  const explored = exploreId ? placeById(exploreId) : null;
  const baiduAk = (import.meta as ImportMeta & { env?: Record<string, string> }).env?.VITE_BAIDU_MAP_AK;
  const tiandituKey =
    (import.meta as ImportMeta & { env?: Record<string, string> }).env?.VITE_TIANDITU_MAP_KEY ||
    '768f017350f96d1ae53a702859c4388b';

  useEffect(() => {
    if (provider !== 'baidu' || !baiduAk || !realMapRef.current || !coords.length) {
      setRealMapReady(false);
      return;
    }
    let cancelled = false;
    const mount = () => {
      const BMapGL = (window as unknown as { BMapGL?: any }).BMapGL;
      if (!BMapGL || !realMapRef.current || cancelled) return;
      try {
        const map = new BMapGL.Map(realMapRef.current);
        const center = new BMapGL.Point(coords[0].lng, coords[0].lat);
        map.centerAndZoom(center, coords.length > 1 ? 7 : 12);
        map.enableScrollWheelZoom(true);
        const routePoints = coords.map((place) => new BMapGL.Point(place.lng, place.lat));
        if (routePoints.length > 1) map.addOverlay(new BMapGL.Polyline(routePoints, { strokeColor: color, strokeWeight: 5, strokeOpacity: 0.85 }));
        coords.forEach((place, index) => {
          const marker = new BMapGL.Marker(routePoints[index]);
          marker.addEventListener('click', () => onSelect(items[index].id));
          map.addOverlay(marker);
          const label = new BMapGL.Label(String(index + 1), { offset: new BMapGL.Size(-5, -28) });
          label.setStyle({ color: '#fff', background: color, border: '0', borderRadius: '12px', padding: '3px 7px', fontWeight: '700' });
          map.addOverlay(label);
          label.setPosition(routePoints[index]);
        });
        nearby.forEach((place) => {
          const point = new BMapGL.Point(place.lng, place.lat);
          const marker = new BMapGL.Marker(point);
          marker.addEventListener('click', () => setExploreId(place.id));
          map.addOverlay(marker);
        });
        if (hotel) {
          const hotelMarker = new BMapGL.Marker(new BMapGL.Point(hotel.lng, hotel.lat));
          hotelMarker.addEventListener('click', () => setExploreId(null));
          map.addOverlay(hotelMarker);
        }
        if (!cancelled) setRealMapReady(true);
      } catch {
        if (!cancelled) setRealMapError(true);
      }
    };
    if ((window as unknown as { BMapGL?: any }).BMapGL) mount();
    else {
      const existing = document.querySelector('script[data-qianlv-baidu]');
      if (existing) existing.addEventListener('load', mount, { once: true });
      else {
        const script = document.createElement('script');
        script.dataset.qianlvBaidu = 'true';
        script.src = `https://api.map.baidu.com/api?v=1.0&type=webgl&ak=${encodeURIComponent(baiduAk)}`;
        script.async = true;
        script.onload = mount;
        script.onerror = () => setRealMapError(true);
        document.head.appendChild(script);
      }
    }
    return () => {
      cancelled = true;
      setRealMapReady(false);
    };
  }, [provider, baiduAk, items, hotel, nearby, coords, color, onSelect]);

  // 天地图：动态加载 SDK 并渲染真实地图（参考 LiFalxdMap.vue 的接入方式）
  useEffect(() => {
    if (provider !== 'tianditu' || !tiandituKey || !tiandituRef.current || !coords.length) {
      setRealMapReady(false);
      return;
    }
    let cancelled = false;
    const mount = () => {
      const T = (window as unknown as { T?: any }).T;
      if (!T || !tiandituRef.current || cancelled) return;
      try {
        const map = new T.Map(tiandituRef.current);
        tiandituMapRef.current = map;
        map.centerAndZoom(
          new T.LngLat(coords[0].lng, coords[0].lat),
          coords.length > 1 ? 8 : 12,
        );
        // 桌面：滚轮缩放 + 鼠标拖拽；移动端：触摸拖拽 + 双指缩放
        map.enableScrollWheelZoom();
        map.enableDrag();
        if (typeof map.enableTouchZoom === 'function') map.enableTouchZoom();
        if (typeof map.enableDoubleClickZoom === 'function') map.enableDoubleClickZoom();
        if (typeof map.enableKeyboard === 'function') map.enableKeyboard();
        const routePoints = coords.map((place) => new T.LngLat(place.lng, place.lat));
        if (routePoints.length > 1) {
          map.addOverLay(new T.Polyline(routePoints, { color, weight: 5, opacity: 0.85 }));
        }
        coords.forEach((place, index) => {
          const size = 38;
          const marker = new T.Marker(routePoints[index], {
            icon: new T.Icon({
              iconUrl: numberedIcon(color, String(index + 1), size),
              iconSize: new T.Point(size, size),
              iconAnchor: new T.Point(size / 2, size / 2),
            }),
          });
          marker.addEventListener('click', () => onSelect(items[index].id));
          map.addOverLay(marker);
        });
        nearby.forEach((place) => {
          const size = 30;
          const marker = new T.Marker(new T.LngLat(place.lng, place.lat), {
            icon: new T.Icon({
              iconUrl: numberedIcon('#7d8c80', '+', size),
              iconSize: new T.Point(size, size),
              iconAnchor: new T.Point(size / 2, size / 2),
            }),
          });
          marker.addEventListener('click', () => setExploreId(place.id));
          map.addOverLay(marker);
        });
        if (hotel) {
          const size = 32;
          const hotelMarker = new T.Marker(new T.LngLat(hotel.lng, hotel.lat), {
            icon: new T.Icon({
              iconUrl: numberedIcon('#b68e39', '住', size),
              iconSize: new T.Point(size, size),
              iconAnchor: new T.Point(size / 2, size / 2),
            }),
          });
          hotelMarker.addEventListener('click', () => setExploreId(null));
          map.addOverLay(hotelMarker);
        }
        // 多点位时自动调整视野完整展示路线
        if (routePoints.length > 1) {
          const viewPoints = hotel
            ? [...routePoints, new T.LngLat(hotel.lng, hotel.lat)]
            : routePoints;
          map.setViewport(viewPoints);
        }
        // 只隐藏天地图版权/logo 控件（精确类名，避免影响事件层导致拖拽失效）
        setTimeout(() => {
          if (cancelled || !tiandituRef.current) return;
          tiandituRef.current
            .querySelectorAll('.tdt-control-copyright, .tdt-copyright-container, .tdt-control-attribution, a[href*="tianditu.gov.cn"]')
            .forEach((el) => {
              (el as HTMLElement).style.display = 'none';
            });
        }, 200);
        if (!cancelled) {
          setRealMapReady(true);
          // 容器从不可见→可见后必须 checkResize 重算尺寸，否则 marker 投影坐标错误导致缩放/拖拽后位置错位
          setTimeout(() => {
            if (!cancelled && map && typeof map.checkResize === 'function') {
              map.checkResize();
            }
          }, 50);
        }
      } catch {
        if (!cancelled) setRealMapError(true);
      }
    };
    if ((window as unknown as { T?: any }).T) mount();
    else {
      const existing = document.querySelector('script[data-qianlv-tianditu]');
      if (existing) existing.addEventListener('load', mount, { once: true });
      else {
        const script = document.createElement('script');
        script.dataset.qianlvTianditu = 'true';
        script.src = `https://api.tianditu.gov.cn/api?v=4.0&tk=${encodeURIComponent(tiandituKey)}`;
        script.async = true;
        // crossorigin 让跨域脚本报错时暴露真实错误详情（否则只显示 Script error）
        script.crossOrigin = 'anonymous';
        script.onload = mount;
        script.onerror = () => setRealMapError(true);
        document.head.appendChild(script);
      }
    }
    return () => {
      cancelled = true;
      setRealMapReady(false);
      tiandituMapRef.current = null;
    };
  }, [provider, tiandituKey, items, hotel, nearby, coords, color, onSelect]);

  // 容器尺寸变化时（窗口 resize、手机旋转、布局切换）重算地图尺寸，防止 marker 位置错位
  useEffect(() => {
    if (provider !== 'tianditu' || !realMapReady || !tiandituRef.current) return;
    const el = tiandituRef.current;
    const resize = () => {
      const map = tiandituMapRef.current;
      if (map && typeof map.checkResize === 'function') {
        map.checkResize();
      }
    };
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    window.addEventListener('resize', resize);
    window.addEventListener('orientationchange', resize);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', resize);
      window.removeEventListener('orientationchange', resize);
    };
  }, [provider, realMapReady]);
  return (
    <div className="route-map">
      <div className="map-topline">
        <span className="map-badge">
          <MapPin size={14} />
          {label || `${coords[0]?.region || '贵州'} · 第 ${dayIndex + 1} 天`}
        </span>
      </div>
      {provider === 'tianditu' && tiandituKey && <div ref={tiandituRef} className={'tianditu-map-canvas' + (realMapReady ? ' is-ready' : '')} aria-label="天地图路线与地点标记" />}
      {provider === 'baidu' && baiduAk && <div ref={realMapRef} className={'baidu-map-canvas' + (realMapReady ? ' is-ready' : '')} aria-label="百度地图路线与地点标记" />}
      {!realMapReady && <svg
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
          {hotelPoint && (
            <g transform={`translate(${hotelPoint.x} ${hotelPoint.y})`} className="map-hotel-marker">
              <circle r="15" fill="#fff8e8" stroke="#b68e39" strokeWidth="2" />
              <text y="5" textAnchor="middle" fill="#8b6924" fontSize="13">住</text>
              <title>{hotel?.name}</title>
            </g>
          )}
          <polyline
            points={points.map((p) => `${p.x},${p.y}`).join(' ')}
            fill="none"
            stroke={color}
            strokeWidth="4"
            strokeLinejoin="round"
            strokeDasharray="8 4"
          />
          {nearbyPoints.map(({ place, x, y }) => (
            <g
              key={`nearby-${place.id}`}
              transform={`translate(${x} ${y})`}
              className="map-marker map-marker-nearby"
              role="button"
              tabIndex={0}
              aria-label={`探索地点 ${place.name}`}
              onClick={() => setExploreId(place.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setExploreId(place.id);
                }
              }}
            >
              <circle r="14" fill="white" stroke="#7d8c80" strokeWidth="2" />
              <text y="5" textAnchor="middle" fill="#4f6759" fontSize="13" fontWeight="700">+</text>
            </g>
          ))}
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
      </svg>}
      <div className={'map-controls' + (provider === 'tianditu' && realMapReady ? ' is-hidden' : '')}>
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
        {realMapReady
          ? (provider === 'tianditu' ? '天地图 SDK 已加载；路线和标记来自当前行程，地点信息仍以现场与官方公告为准' : '百度地图 SDK 已加载；路线和标记来自当前行程，地点信息仍以现场与官方公告为准')
          : realMapError
            ? '地图 SDK 加载失败，已回退到本地交互地图；可继续使用标记和路线编辑'
            : summaryOverride
          ? '汇总含所列酒店往返 / 跨城接续；连线仅示意景点，不是实际导航'
          : previous
            ? '汇总含跨城接续，连线仅示意当日地点 · 非导航'
            : '点位坐标与道路为近似示意 · 交通为估算'}
      </div>
      {explored && (
        <div className="map-explore-card">
          <div>
            <span className="map-explore-kicker">周边推荐 · {explored.category}</span>
            <strong>{explored.name}</strong>
            <p>{explored.description}</p>
            <small>GoScore {score(explored, 'normal').total} · 约 {explored.duration} 分钟 · ¥{explored.price}/人</small>
          </div>
          <div className="map-explore-actions">
            {onAddPlace && !routeIds.has(explored.id) && <button onClick={() => onAddPlace(explored.id)}>加入行程</button>}
            <button aria-label="关闭地点卡片" onClick={() => setExploreId(null)}>关闭</button>
          </div>
        </div>
      )}
    </div>
  );
}
