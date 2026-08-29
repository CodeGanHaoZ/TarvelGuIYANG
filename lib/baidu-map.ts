export type BMapPoint = object;

export type BMapMarker = {
  addEventListener: (event: string, listener: () => void) => void;
  setLabel: (label: object) => void;
};

export type BMapMap = {
  addControl: (control: object) => void;
  addOverlay: (overlay: object) => void;
  centerAndZoom: (point: BMapPoint, zoom: number) => void;
  clearOverlays: () => void;
  enableScrollWheelZoom: (enabled?: boolean) => void;
  setViewport: (points: BMapPoint[], options?: object) => void;
};

export type BMapApi = {
  coordType?: unknown;
  Map: new (container: HTMLElement, options?: object) => BMapMap;
  Point: new (lng: number, lat: number) => BMapPoint;
  Size: new (width: number, height: number) => object;
  Marker: new (point: BMapPoint, options?: object) => BMapMarker;
  Label: new (
    text: string,
    options?: object,
  ) => {
    setStyle: (styles: Record<string, string>) => void;
  };
  Polyline: new (points: BMapPoint[], options?: object) => object;
  NavigationControl: new () => object;
};

type BaiduWindow = Window & {
  BMap?: BMapApi;
  BMAP_COORD_GCJ02?: unknown;
};

let baiduMapPromise: Promise<BMapApi> | null = null;

export function baiduBrowserAk() {
  return (
    (
      import.meta as ImportMeta & {
        env?: Record<string, string | undefined>;
      }
    ).env?.VITE_BAIDU_MAP_AK?.trim() || ''
  );
}

export function configureBaiduGcj02(BMap: BMapApi) {
  const browser = window as unknown as BaiduWindow;
  if (browser.BMAP_COORD_GCJ02) BMap.coordType = browser.BMAP_COORD_GCJ02;
}

export function loadBaiduMap(ak: string) {
  const browser = window as unknown as BaiduWindow;
  const callbacks = browser as unknown as Record<string, unknown>;
  if (browser.BMap) return Promise.resolve(browser.BMap);
  if (baiduMapPromise) return baiduMapPromise;
  baiduMapPromise = new Promise<BMapApi>((resolve, reject) => {
    const callback = `__aiQianlvBaiduMapReady_${Date.now()}`;
    const timeout = window.setTimeout(() => {
      delete callbacks[callback];
      baiduMapPromise = null;
      reject(new Error('百度地图加载超时'));
    }, 12000);
    callbacks[callback] = () => {
      window.clearTimeout(timeout);
      delete callbacks[callback];
      if (browser.BMap) resolve(browser.BMap);
      else reject(new Error('百度地图对象不可用'));
    };
    const script = document.createElement('script');
    script.id = 'ai-qianlv-baidu-jsapi';
    script.async = true;
    script.src = `https://api.map.baidu.com/api?v=4.0&ak=${encodeURIComponent(ak)}&callback=${callback}`;
    script.onerror = () => {
      window.clearTimeout(timeout);
      delete callbacks[callback];
      baiduMapPromise = null;
      reject(new Error('百度地图脚本加载失败'));
    };
    document.head.appendChild(script);
  });
  return baiduMapPromise;
}
