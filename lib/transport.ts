import type { Place, TripItem } from './travel';

export type TransportMode = 'walk' | 'transit' | 'drive' | 'rail';
export type TransportChoice = { fromId: string; mode: TransportMode };
export type TransportStep = { title: string; detail: string; minutes: number };
export type TransportOption = {
  id: TransportMode;
  label: string;
  summary: string;
  available: boolean;
  minutes: number;
  km: number;
  walking: number;
  transfers: number;
  cost: [number, number] | null;
  costUnit: '人' | '车';
  steps: TransportStep[];
  note: string;
  sources: { title: string; url: string }[];
};
export const transportSources = {
  metro: {
    title: '贵州省交通运输厅 · 3号线与换乘信息',
    url: 'https://jt.guizhou.gov.cn/xwzx1/hydt/202312/t20231214_83351222.html',
  },
  museum: {
    title: '贵州省博物馆 · 官方公共交通指引',
    url: 'https://gzmuseum.com/gbgg/202605/1336.html',
  },
  xijiang: {
    title: '西江景区 · 官方交通指引',
    url: 'https://www.xjqhmz.com/news/detail?id=914816047763267585&type=news-notice',
  },
  baidu: {
    title: '百度地图 · 地图调起 API',
    url: 'https://lbs.baidu.com/docs/webapi?title=mapadjustment/uri/web',
  },
};
export const railQueryUrl = 'https://www.12306.cn/index/';

/** Only a geometric estimate; no road network or live traffic is queried here. */
export function roadDistance(
  a: Pick<Place, 'lat' | 'lng'>,
  b: Pick<Place, 'lat' | 'lng'>,
) {
  const rad = (n: number) => (n * Math.PI) / 180;
  const h =
    Math.sin(rad(b.lat - a.lat) / 2) ** 2 +
    Math.cos(rad(a.lat)) *
      Math.cos(rad(b.lat)) *
      Math.sin(rad(b.lng - a.lng) / 2) ** 2;
  return (
    6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(Math.max(0, 1 - h))) * 1.45
  );
}

export function baiduRouteUrl(
  a: Place,
  b: Place,
  mode: TransportMode,
  policy: 'recommended' | 'transfers' | 'walking' = 'recommended',
) {
  // Both endpoints are explicit. Never request the user's current position.
  const params = new URLSearchParams({
    origin: `latlng:${a.lat},${a.lng}|name:${a.name}`,
    destination: `latlng:${b.lat},${b.lng}|name:${b.name}`,
    mode:
      mode === 'drive'
        ? 'driving'
        : mode === 'walk'
          ? 'walking'
          : 'transit',
    region: a.region === b.region ? a.region : '贵州',
    output: 'html',
    coord_type: 'gcj02',
    src: 'webapp.openai.ai_qianlv',
  });
  if (mode === 'transit' && policy !== 'recommended')
    params.set('sy', policy === 'transfers' ? '1' : '4');
  return `https://api.map.baidu.com/direction?${params}`;
}

/** Backward-compatible AMap deep-link used by existing exports and tests. */
export function amapRouteUrl(
  a: Place,
  b: Place,
  mode: TransportMode,
  policy: 'recommended' | 'transfers' | 'walking' = 'recommended',
) {
  const params = new URLSearchParams({
    from: `${a.lng},${a.lat},${a.name}`,
    to: `${b.lng},${b.lat},${b.name}`,
    mode: mode === 'drive' ? 'car' : mode === 'walk' ? 'walk' : 'bus',
  });
  if (mode === 'transit' && policy !== 'recommended')
    params.set('policy', policy === 'transfers' ? '1' : '0');
  return `https://uri.amap.com/navigation?${params}`;
}

export function transportOptions(a: Place, b: Place): TransportOption[] {
  const km = Math.round(roadDistance(a, b) * 10) / 10;
  const driveMinutes = Math.max(
    8,
    Math.round((km / (km > 30 ? 50 : 22)) * 60) + 5,
  );
  const fare = Math.max(12, Math.round(km * (km > 60 ? 3.2 : 2.5)));
  const drive: TransportOption = {
    id: 'drive',
    label: '驾车 / 打车',
    available: true,
    km,
    summary: km > 30 ? '公路直达 · 提前确认接单与接驳' : '点对点接送 · 少换乘',
    minutes: driveMinutes,
    walking: 5,
    transfers: 0,
    cost: [fare, Math.round(fare * 1.35)],
    costUnit: '车',
    steps: [
      {
        title: `${a.name} · 上车`,
        detail: '在地图确认可上车的出入口；景区内部可能不允许社会车辆进入。',
        minutes: 5,
      },
      {
        title: '公路行驶',
        detail:
          '道路、转弯和拥堵情况请打开百度地图查询；此处不生成未核验道路名称。',
        minutes: driveMinutes - 5,
      },
      {
        title: `${b.name} · 下车`,
        detail: '核对落客点、入口和实际门店，额外园内接驳未包含。',
        minutes: 0,
      },
    ],
    note: '时间按近似距离与假定车速估算；费用为打车/包车估算区间，不是报价。自驾油费、停车和高速费另计。每车按最多4位乘客估算。',
    sources: [],
  };
  const options: TransportOption[] = [drive];
  if (km <= 5 && a.region === b.region) {
    const walking = Math.max(3, Math.ceil((km / 4) * 60));
    options.push({
      id: 'walk',
      label: '步行',
      available: true,
      km,
      summary: km <= 1.5 ? '短途慢走 · 无车费' : '距离较长 · 按体力选择',
      minutes: walking,
      walking,
      transfers: 0,
      cost: [0, 0],
      costUnit: '人',
      steps: [
        {
          title: `${a.name} → ${b.name}`,
          detail: '按地图确认合法开放的步行路线，留意坡度、过街与封闭路段。',
          minutes: walking,
        },
      ],
      note: '仅按4 km/h估算，不证明两点间有可通行步道；不支持用直线穿越山林、河流或景区禁行区。',
      sources: [],
    });
  }
  const museumRoute =
    (a.id === 'qianling' && b.id === 'museum') ||
    (a.id === 'museum' && b.id === 'qianling');
  if (museumRoute) {
    const forward = a.id === 'qianling';
    const legs = forward
      ? [
          {
            title: '3号线 · 黔灵山公园 → 北京路',
            detail: '往洛湾方向；到北京路后按站内换乘指引前往1号线。',
            minutes: 6,
          },
          {
            title: '北京路站内换乘',
            detail: '从3号线换乘1号线，预留步行、候车时间。',
            minutes: 10,
          },
          {
            title: '1号线 · 北京路 → 国际生态会议中心',
            detail: '往窦官方向；博物馆官方指引为国际生态会议中心站B出口。',
            minutes: 28,
          },
        ]
      : [
          {
            title: '1号线 · 国际生态会议中心 → 北京路',
            detail: '往小孟工业园方向，按站内指引前往3号线。',
            minutes: 28,
          },
          {
            title: '北京路站内换乘',
            detail: '从1号线换乘3号线，预留步行、候车时间。',
            minutes: 10,
          },
          {
            title: '3号线 · 北京路 → 黔灵山公园',
            detail: '往桐木岭（省委党校）方向；出站步行前往公园开放入口。',
            minutes: 6,
          },
        ];
    options.push({
      id: 'transit',
      label: '公交 / 地铁',
      available: true,
      km,
      summary: forward ? '3号线 → 北京路 → 1号线' : '1号线 → 北京路 → 3号线',
      minutes: 74,
      walking: 26,
      transfers: 1,
      cost: [4, 8],
      costUnit: '人',
      steps: [
        {
          title: '步行到地铁站、安检与候车',
          detail: '出入口位置与步行时间需在地图确认。',
          minutes: 16,
        },
        ...legs,
        {
          title: `步行到${b.name}`,
          detail: '使用当天开放的入口；到站不等于已经入园。',
          minutes: 14,
        },
      ],
      note: '站点及换乘关系根据官方资料整理（查阅2026-08-29）；逐段时长、票价仍是 规划参考，未查询首末班或实时运营状态。',
      sources: [transportSources.metro, transportSources.museum],
    });
  } else {
    options.push({
      id: 'transit',
      label: '公交 / 地铁',
      available: false,
      km,
      summary: '尚无已核验的本地班线，去百度地图查询',
      minutes: 0,
      walking: 0,
      transfers: 0,
      cost: null,
      costUnit: '人',
      steps: [],
      note: '暂无公交线路号、换乘站或发车时间。查询到可用路线后，请按实际交通时间调整行程。',
      sources: [],
    });
  }
  if (
    (a.region === '贵阳' && b.region === '黔东南') ||
    (a.region === '黔东南' && b.region === '贵阳')
  ) {
    const forward = a.region === '贵阳';
    const fromStation = forward ? '贵阳北' : '凯里南',
      toStation = forward ? '凯里南' : '贵阳北';
    const hubs = {
      贵阳北: { lat: 26.622, lng: 106.678 },
      凯里南: { lat: 26.516, lng: 107.895 },
    };
    const access = Math.max(
      20,
      Math.ceil((roadDistance(a, hubs[fromStation]) / 35) * 60),
    );
    const exit = Math.max(
      20,
      Math.ceil((roadDistance(hubs[toStation], b) / 35) * 60),
    );
    options.push({
      id: 'rail',
      label: '高铁 + 接驳',
      available: true,
      km,
      summary: `${fromStation} → ${toStation} → 目的地接驳`,
      minutes: access + 40 + 55 + 15 + exit,
      walking: 20,
      transfers: 2,
      cost: [90, 220],
      costUnit: '人',
      steps: [
        {
          title: `前往${fromStation}站`,
          detail: '按实际酒店/景区位置选择公交或合规出租车。',
          minutes: access,
        },
        {
          title: '进站安检与候车',
          detail: '建议预留40分钟；具体检票口和停止检票时间按车站公告。',
          minutes: 40,
        },
        {
          title: `${fromStation} → ${toStation}`,
          detail: '到12306选择实际日期、车次与席别；这里没有票额或预订。',
          minutes: 55,
        },
        {
          title: '出站与换乘',
          detail: '预留步行、找车和等待时间。',
          minutes: 15,
        },
        {
          title: `前往${b.name}`,
          detail:
            '景区官方提示可查询凯里南—西江直通车/出租车；其他地点需另核接驳。',
          minutes: exit,
        },
      ],
      note: '仅提供铁路枢纽与接驳思路，不代表当天存在指定班次。全部时长和含接驳费用为规划参考；真实日期、票价和余票请在12306查询。',
      sources: [transportSources.xijiang],
    });
  }
  return options;
}

export function resolveTransport(
  a: Place,
  b: Place,
  choice?: TransportChoice,
  fromId?: string,
) {
  const options = transportOptions(a, b);
  const selected =
    choice && choice.fromId === fromId
      ? options.find((o) => o.id === choice.mode && o.available)
      : undefined;
  return (
    selected ??
    (roadDistance(a, b) <= 1.5
      ? options.find((o) => o.id === 'walk')
      : undefined) ??
    options[0]
  );
}

export function selectTransport(
  items: TripItem[],
  toId: string,
  from: TripItem,
  mode: TransportMode,
  lookup: (id: string) => Place,
) {
  const toIndex = items.findIndex((item) => item.id === toId);
  if (toIndex < 0 || (toIndex > 0 && items[toIndex - 1].id !== from.id))
    return items;
  const to = items[toIndex];
  if (
    !transportOptions(lookup(from.placeId), lookup(to.placeId)).some(
      (o) => o.id === mode && o.available,
    )
  )
    return items;
  return items.map((item) =>
    item.id === toId ? { ...item, transport: { fromId: from.id, mode } } : item,
  );
}

export function transportCost(
  option: TransportOption,
  people: number,
): [number, number] | null {
  if (!option.cost) return null;
  const multiplier = option.costUnit === '车' ? Math.ceil(people / 4) : people;
  return [option.cost[0] * multiplier, option.cost[1] * multiplier];
}
