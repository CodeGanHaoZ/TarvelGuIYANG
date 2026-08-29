import type { DaySettings, Place, TripItem } from './travel.ts';
import { placeById } from './travel.ts';

export type MapScope = 'province' | 'scenic';
export type MountainPace = 'easy' | 'standard' | 'deep';
export type ScenicMarkerType =
  | 'entrance'
  | 'shuttle'
  | 'walk'
  | 'viewpoint'
  | 'facility'
  | 'medical'
  | 'escalator';

export type ScenicStop = {
  id: string;
  name: string;
  type: ScenicMarkerType;
  lng: number;
  lat: number;
  note: string;
  distanceKm: number;
  minutes: number;
  climbM: number;
  stairs: '少' | '部分' | '较多';
  restPoints: number;
  rainRisk: '低' | '中' | '高';
  paces: MountainPace[];
};

export const scenicMarkerMeta: Record<
  ScenicMarkerType,
  { label: string; symbol: string }
> = {
  entrance: { label: '检票入口', symbol: '入' },
  shuttle: { label: '观光车站', symbol: '车' },
  walk: { label: '山地步道', symbol: '阶' },
  viewpoint: { label: '观景 / 摄影点', symbol: '景' },
  facility: { label: '卫生间 / 餐饮', symbol: '服' },
  medical: { label: '医疗 / 求助', symbol: '医' },
  escalator: { label: '扶梯 / 省力设施', symbol: '梯' },
};

/**
 * Demonstration-only internal wayfinding data. It must not be treated as an
 * official park GIS layer, live shuttle location, or proof that a path is open.
 */
export const huangguoshuScenicStops: ScenicStop[] = [
  {
    id: 'visitor-center',
    name: '黄果树游客中心',
    type: 'entrance',
    lng: 105.6731,
    lat: 25.9898,
    note: '先核验身份证件、入园时段和观光车票，再进入景区接驳系统。',
    distanceKm: 0,
    minutes: 10,
    climbM: 0,
    stairs: '少',
    restPoints: 1,
    rainRisk: '低',
    paces: ['easy', 'standard', 'deep'],
  },
  {
    id: 'shuttle-main',
    name: '大瀑布接驳候车点',
    type: 'shuttle',
    lng: 105.6704,
    lat: 25.993,
    note: '候车与停运时间必须以现场广播、电子屏和工作人员指引为准。',
    distanceKm: 0.3,
    minutes: 15,
    climbM: 12,
    stairs: '少',
    restPoints: 1,
    rainRisk: '低',
    paces: ['easy', 'standard', 'deep'],
  },
  {
    id: 'main-view',
    name: '大瀑布核心观景段',
    type: 'viewpoint',
    lng: 105.667,
    lat: 25.9921,
    note: '建议先完成核心观瀑；雨天留意水雾、湿滑与临时单向通行。',
    distanceKm: 0.8,
    minutes: 35,
    climbM: 55,
    stairs: '部分',
    restPoints: 1,
    rainRisk: '中',
    paces: ['easy', 'standard', 'deep'],
  },
  {
    id: 'water-curtain',
    name: '水帘洞步道入口',
    type: 'walk',
    lng: 105.6655,
    lat: 25.9915,
    note: '洞内和临瀑步道可能因水量、维护或安全原因临时调整，现场开放优先。',
    distanceKm: 1.1,
    minutes: 45,
    climbM: 92,
    stairs: '较多',
    restPoints: 0,
    rainRisk: '高',
    paces: ['standard', 'deep'],
  },
  {
    id: 'escalator',
    name: '返程扶梯选择点',
    type: 'escalator',
    lng: 105.6685,
    lat: 25.9906,
    note: '老人、儿童或膝盖不适时优先选择省力设施；运行和收费以现场为准。',
    distanceKm: 0.4,
    minutes: 12,
    climbM: 18,
    stairs: '少',
    restPoints: 1,
    rainRisk: '低',
    paces: ['easy', 'standard', 'deep'],
  },
  {
    id: 'toilet-service',
    name: '服务与卫生间参考点',
    type: 'facility',
    lng: 105.6714,
    lat: 25.9911,
    note: '地图仅提示应关注的设施类型，准确位置以景区现场导览为准。',
    distanceKm: 0.2,
    minutes: 8,
    climbM: 6,
    stairs: '少',
    restPoints: 1,
    rainRisk: '低',
    paces: ['easy', 'standard', 'deep'],
  },
  {
    id: 'medical',
    name: '医疗与紧急求助参考点',
    type: 'medical',
    lng: 105.6724,
    lat: 25.9904,
    note: '出现不适应就近联系工作人员或拨打景区已核验的官方求助电话。',
    distanceKm: 0.1,
    minutes: 5,
    climbM: 0,
    stairs: '少',
    restPoints: 1,
    rainRisk: '低',
    paces: ['easy', 'standard', 'deep'],
  },
];

export const mountainPaceLabels: Record<
  MountainPace,
  { label: string; description: string }
> = {
  easy: { label: '轻松', description: '接驳与省力设施优先' },
  standard: { label: '标准', description: '核心景观与适量步行' },
  deep: { label: '深度', description: '完整步道与摄影停留' },
};

export function scenicStopsForPace(
  pace: MountainPace,
  scenario: Required<DaySettings>['scenario'] = 'normal',
) {
  return huangguoshuScenicStops.filter(
    (stop) =>
      stop.paces.includes(pace) &&
      !(scenario === 'rain' && stop.rainRisk === '高'),
  );
}

export function mountainRouteSummary(
  pace: MountainPace,
  scenario: Required<DaySettings>['scenario'] = 'normal',
) {
  const stops = scenicStopsForPace(pace, scenario);
  const walkingKm = stops.reduce((sum, stop) => sum + stop.distanceKm, 0);
  const minutes = stops.reduce((sum, stop) => sum + stop.minutes, 0);
  const climbM = stops.reduce((sum, stop) => sum + stop.climbM, 0);
  return {
    stops,
    walkingKm: Math.round(walkingKm * 10) / 10,
    minutes: scenario === 'rain' ? Math.ceil(minutes * 1.18) : minutes,
    climbM,
    stairs: stops.some((stop) => stop.stairs === '较多') ? '较多' : '适量',
    restPoints: stops.reduce((sum, stop) => sum + stop.restPoints, 0),
    rainWarning:
      scenario === 'rain'
        ? '已避开高风险临瀑步道，山地时间按湿滑条件上调 18%。'
        : '晴天方案仍需以景区当天开放与现场安全提示为准。',
  };
}

export type ProvinceMarker = {
  id: string;
  itemId: string;
  place: Place;
  sequence: number;
  risk: 'same-region' | 'cross-region';
};

export function provinceMarkers(items: TripItem[]): ProvinceMarker[] {
  return items.map((item, index) => {
    const place = placeById(item.placeId);
    const previous = index > 0 ? placeById(items[index - 1].placeId) : null;
    return {
      id: place.id,
      itemId: item.id,
      place,
      sequence: index + 1,
      risk:
        previous && previous.region !== place.region
          ? 'cross-region'
          : 'same-region',
    };
  });
}

export function departureChecklist(placeIds: string[], scenario: string) {
  const hasHuangguoshu = placeIds.includes('huangguoshu');
  return [
    {
      id: 'ticket',
      state: hasHuangguoshu ? 'warning' : 'info',
      text: hasHuangguoshu
        ? '门票与入园时段待绑定官方票务结果'
        : '核对各地点预约状态',
    },
    {
      id: 'identity',
      state: 'done',
      text: '身份证件清单已加入出发提醒',
    },
    {
      id: 'shuttle',
      state: hasHuangguoshu ? 'warning' : 'info',
      text: hasHuangguoshu ? '观光车票与末班时间待核验' : '核对景区内部接驳',
    },
    {
      id: 'weather',
      state: scenario === 'rain' ? 'warning' : 'info',
      text:
        scenario === 'rain'
          ? '雨天方案已启用，准备雨衣和防滑鞋'
          : '出发前再次核对天气与能见度',
    },
  ] as const;
}

export function rainPlanChanges(items: TripItem[]) {
  const firstHuangguoshu = items.findIndex(
    (item) => item.placeId === 'huangguoshu',
  );
  const reordered = [...items];
  if (firstHuangguoshu > 0) {
    const [core] = reordered.splice(firstHuangguoshu, 1);
    reordered.unshift(core);
  }
  const next = reordered.map((item) => {
    if (item.placeId === 'huangguoshu')
      return { ...item, duration: Math.min(item.duration, 150) };
    if (item.placeId === 'tianxing')
      return { ...item, duration: Math.min(item.duration, 90) };
    return item;
  });
  return {
    items: next,
    changes: [
      '瀑布核心段提前到上午优先完成',
      '水帘洞等高湿滑路段改为现场确认后再进入',
      '天星桥长线缩短，给接驳与湿滑步行留出缓冲',
      '观光车末班、预约时段与返回酒店时间需要再次核验',
    ],
  };
}
