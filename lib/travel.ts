export type Theme =
  | '美食体验'
  | '自然景观'
  | '身体力行'
  | '民族文化'
  | '经典路线'
  | '红色旅游';
export const themes: Theme[] = [
  '美食体验',
  '自然景观',
  '身体力行',
  '民族文化',
  '经典路线',
  '红色旅游',
];
export type Place = {
  id: string;
  name: string;
  region: string;
  category: Theme;
  description: string;
  lat: number;
  lng: number;
  duration: number;
  price: number;
  indoor: boolean;
  image?: string;
  hours: [number, number];
  factors: number[];
  tip: string;
  culture?: string;
};
export type TripItem = { id: string; placeId: string; duration: number };
export type TripDay = {
  id: string;
  date: string;
  title: string;
  items: TripItem[];
};
export type Trip = {
  id: string;
  title: string;
  destination: string;
  start: string;
  budget: number;
  people: string[];
  preferences: Theme[];
  pace: string;
  days: TripDay[];
  notes: string;
  sourcePostIds?: string[];
};
export type Expense = {
  id: string;
  tripId: string;
  title: string;
  amount: number;
  payer: string;
};
export type SharedTrip = {
  id: string;
  title: string;
  author: string;
  description: string;
  trip: Trip;
  saved: boolean;
  requested: boolean;
  image: string;
};
export type AppData = {
  version: 1;
  trips: Trip[];
  activeTripId: string;
  savedPlaces: string[];
  savedPostIds: string[];
  expenses: Expense[];
  feed: SharedTrip[];
  theme: string;
  iconSet: string;
  profile: string;
  offlineReady: boolean;
};
export const weights = [25, 20, 15, 10, 10, 10, 5, 5];
export const factorNames = [
  '天气',
  '拥挤度',
  '开放情况',
  '交通',
  '基础评分',
  '季节适宜',
  '特别活动',
  '偏好匹配',
];
export const places: Place[] = [
  {
    id: 'qianling',
    name: '黔灵山公园',
    region: '贵阳',
    category: '自然景观',
    description: '把第一段时光，留给城市里的森林。',
    lat: 26.603,
    lng: 106.688,
    duration: 120,
    price: 5,
    indoor: false,
    hours: [7, 19],
    factors: [94, 86, 100, 92, 90, 94, 80, 90],
    tip: '建议上午游览，预留休息时间。野生动物保持距离，不投喂。',
  },
  {
    id: 'museum',
    name: '贵州省博物馆',
    region: '贵阳',
    category: '民族文化',
    description: '从一件苗绣开始，读懂多彩贵州。',
    lat: 26.646,
    lng: 106.648,
    duration: 100,
    price: 0,
    indoor: true,
    hours: [9, 17],
    factors: [100, 82, 100, 88, 91, 96, 88, 96],
    tip: '室内展览适合作为雨天备选。真实开放与预约请以官方信息为准。',
    culture: '了解服饰、银饰与纹样的文化语境；展品拍摄规则以现场要求为准。',
  },
  {
    id: 'jiaxiu',
    name: '甲秀楼',
    region: '贵阳',
    category: '经典路线',
    description: '沿着南明河，慢慢走进贵阳的旧时光。',
    lat: 26.569,
    lng: 106.721,
    duration: 60,
    price: 0,
    indoor: false,
    image: '/images/jiaxiu.jpg',
    hours: [8, 22],
    factors: [93, 80, 100, 88, 89, 92, 75, 85],
    tip: '傍晚光线适合拍照，河边散步可与青云路美食串联。',
  },
  {
    id: 'qingyun',
    name: '青云路美食街',
    region: '贵阳',
    category: '美食体验',
    description: '丝娃娃、豆腐圆子与酸汤，都是贵州的相遇。',
    lat: 26.561,
    lng: 106.714,
    duration: 90,
    price: 85,
    indoor: false,
    hours: [10, 23],
    factors: [90, 80, 100, 85, 88, 92, 95, 98],
    tip: '先询问辣度与折耳根偏好；食物过敏信息请向商家确认。',
  },
  {
    id: 'qingyan',
    name: '青岩古镇',
    region: '贵阳',
    category: '民族文化',
    description: '石板路与老院子，藏着小镇的日常。',
    lat: 26.331,
    lng: 106.683,
    duration: 120,
    price: 60,
    indoor: false,
    hours: [8, 18],
    factors: [92, 80, 100, 84, 90, 90, 80, 94],
    tip: '石板路雨天湿滑，穿防滑鞋。预留跨城区交通时间。',
  },
  {
    id: 'batik',
    name: '贵阳蜡染体验工坊',
    region: '贵阳',
    category: '民族文化',
    description: '以蜡为笔、以蓝为墨，带走一段手作时光。',
    lat: 26.573,
    lng: 106.711,
    duration: 90,
    price: 128,
    indoor: true,
    hours: [9, 18],
    factors: [100, 98, 100, 92, 90, 96, 90, 100],
    tip: '这是虚构的体验供给，用于演示。真实主理人、地址与场次待核验。',
    culture: '体验前了解纹样含义；人物拍摄、图样传播与商用应先征得授权。',
  },
  {
    id: 'huangguoshu',
    name: '黄果树瀑布',
    region: '安顺',
    category: '自然景观',
    description: '听见水声，也看见山河的力量。',
    lat: 25.992,
    lng: 105.666,
    duration: 180,
    price: 160,
    indoor: false,
    image: '/images/huangguoshu.jpg',
    hours: [7, 18],
    factors: [95, 82, 100, 88, 96, 94, 80, 95],
    tip: '模拟建议 08:30—09:30 入园。步道湿滑，真实天气与开放情况待核验。',
  },
  {
    id: 'tianxing',
    name: '天星桥景区',
    region: '安顺',
    category: '自然景观',
    description: '沿水而行，寻找石与树交织的奇境。',
    lat: 25.975,
    lng: 105.677,
    duration: 120,
    price: 0,
    indoor: false,
    hours: [7, 18],
    factors: [92, 85, 100, 86, 92, 94, 80, 92],
    tip: '部分道路有台阶；请结合体力选择游览长度。',
  },
  {
    id: 'tunbao',
    name: '天龙屯堡',
    region: '安顺',
    category: '民族文化',
    description: '从老街到地戏，听一段延续至今的故事。',
    lat: 26.418,
    lng: 106.243,
    duration: 120,
    price: 60,
    indoor: false,
    hours: [8, 18],
    factors: [92, 94, 100, 84, 88, 90, 90, 96],
    tip: '地戏场次待核验，请勿将演示排期当作真实演出安排。',
    culture: '尊重当地服饰与民俗，不擅自进入居民院落；拍摄人物请先询问。',
  },
  {
    id: 'xijiang',
    name: '西江千户苗寨',
    region: '黔东南',
    category: '民族文化',
    description: '在群山与万家灯火里，遇见苗乡。',
    lat: 26.496,
    lng: 108.171,
    duration: 180,
    price: 110,
    indoor: false,
    image: '/images/xijiang.jpg',
    hours: [8, 22],
    factors: [92, 75, 100, 80, 92, 93, 90, 99],
    tip: '预留上坡与接驳时间。夜景观景点可能拥挤，建议错峰。',
    culture: '苗寨是居民的家园。拍摄人物、服饰与仪式前，请征得同意。',
  },
  {
    id: 'silver',
    name: '苗乡银饰体验',
    region: '黔东南',
    category: '民族文化',
    description: '一锤一錾，读懂银饰背后的手艺。',
    lat: 26.501,
    lng: 108.164,
    duration: 90,
    price: 168,
    indoor: true,
    hours: [9, 18],
    factors: [100, 95, 100, 85, 90, 92, 90, 100],
    tip: '虚构工坊样例，无真实预约。儿童体验需成人与工坊指导。',
    culture: '银饰纹样承载文化意义，作品与影像传播应尊重制作者权利。',
  },
  {
    id: 'sourfish',
    name: '苗家酸汤鱼体验',
    region: '黔东南',
    category: '美食体验',
    description: '一锅红酸汤，让味蕾也来一次旅行。',
    lat: 26.498,
    lng: 108.173,
    duration: 75,
    price: 95,
    indoor: true,
    hours: [11, 21],
    factors: [100, 90, 100, 90, 92, 90, 85, 98],
    tip: '餐厅为演示供给。用餐前询问鱼类、辣椒及其他过敏原。',
  },
  {
    id: 'xiaoqikong',
    name: '荔波小七孔',
    region: '荔波',
    category: '自然景观',
    description: '一抹翡翠，藏在山水之间。',
    lat: 25.257,
    lng: 107.748,
    duration: 240,
    price: 170,
    indoor: false,
    image: '/images/xiaoqikong.jpg',
    hours: [8, 18],
    factors: [95, 83, 100, 86, 95, 95, 80, 92],
    tip: '建议整段半日游览，预留接驳时间；强降雨时以景区公告为准。',
  },
  {
    id: 'shuichun',
    name: '水春河户外体验',
    region: '荔波',
    category: '身体力行',
    description: '沿河亲近自然，也给勇气留一点空间。',
    lat: 25.429,
    lng: 107.916,
    duration: 150,
    price: 200,
    indoor: false,
    hours: [9, 17],
    factors: [85, 90, 100, 82, 90, 88, 80, 90],
    tip: '仅作体验方向展示。水上项目需合格运营方与安全评估，恶劣天气不开展。',
  },
  {
    id: 'zunyi',
    name: '遵义会议会址',
    region: '遵义',
    category: '红色旅游',
    description: '沿历史的足迹，读懂这座城的记忆。',
    lat: 27.687,
    lng: 106.917,
    duration: 120,
    price: 0,
    indoor: true,
    hours: [9, 17],
    factors: [100, 84, 100, 90, 95, 90, 90, 92],
    tip: '预约、闭馆日与展陈安排待接入官方信息，请提前核实。',
  },
];
export const placeById = (id: string): Place =>
  places.find((p) => p.id === id) ?? places[0];
export const uid = () =>
  globalThis.crypto?.randomUUID?.() ??
  `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;
export const recommendationProfiles: Record<
  Theme,
  {
    weights: number[];
    dimensions: string[];
    specialtyWeights: number[];
    description: string;
  }
> = {
  自然景观: {
    weights: [25, 15, 15, 10, 10, 15, 5, 5],
    dimensions: ['景观丰富度', '季节体验', '步道友好度'],
    specialtyWeights: [40, 35, 25],
    description: '优先看天气、季节与景观体验，兼顾步道和停留条件。',
  },
  美食体验: {
    weights: [5, 15, 15, 10, 25, 5, 5, 20],
    dimensions: ['地方风味', '价格友好度', '饮食适配'],
    specialtyWeights: [45, 25, 30],
    description:
      '优先看地方风味与个人口味，天气占比较低。饮食过敏仍需向商家核验。',
  },
  身体力行: {
    weights: [30, 10, 20, 10, 10, 10, 5, 5],
    dimensions: ['参与体验', '体力友好度', '装备便利'],
    specialtyWeights: [35, 40, 25],
    description: '优先看天气、可开展条件和体力要求，不能用高热度替代运营核验。',
  },
  民族文化: {
    weights: [5, 10, 15, 10, 20, 10, 15, 15],
    dimensions: ['文化内容', '互动参与', '讲解条件'],
    specialtyWeights: [45, 30, 25],
    description: '优先看文化内容、讲解和互动参与，尊重居民与传承人的意愿。',
  },
  经典路线: {
    weights: [15, 15, 15, 15, 15, 10, 5, 10],
    dimensions: ['地标价值', '路线串联', '停留弹性'],
    specialtyWeights: [40, 35, 25],
    description: '优先看地标特色、交通串联与时间弹性，适合纳入城市路线。',
  },
  红色旅游: {
    weights: [5, 10, 20, 10, 20, 5, 15, 15],
    dimensions: ['史料展示', '学习价值', '讲解条件'],
    specialtyWeights: [40, 35, 25],
    description: '优先看史料展示、学习内容、开放预约与讲解条件。',
  },
};
export const placeAttributes: Record<
  string,
  {
    nature: string;
    values: number[];
    effort: string;
    weatherSensitive?: boolean;
  }
> = {
  qianling: {
    nature: '城市森林公园',
    values: [89, 88, 82],
    effort: '有坡道 · 适中步行',
  },
  museum: { nature: '室内历史展陈', values: [96, 72, 92], effort: '室内慢行' },
  jiaxiu: { nature: '城市历史地标', values: [92, 95, 96], effort: '短程漫步' },
  qingyun: {
    nature: '开放式美食街区',
    values: [94, 85, 68],
    effort: '城市步行',
  },
  qingyan: {
    nature: '历史古镇',
    values: [91, 82, 76],
    effort: '石板路 · 适中步行',
  },
  batik: {
    nature: '室内非遗手作 · 虚构工坊',
    values: [92, 98, 88],
    effort: '坐姿手作',
  },
  huangguoshu: {
    nature: '瀑布山水景区',
    values: [98, 94, 70],
    effort: '台阶较多',
    weatherSensitive: true,
  },
  tianxing: {
    nature: '喀斯特水石步道',
    values: [93, 90, 65],
    effort: '台阶较多',
    weatherSensitive: true,
  },
  tunbao: {
    nature: '历史聚落与民俗',
    values: [94, 79, 78],
    effort: '村落步行',
  },
  xijiang: {
    nature: '居民生活型苗寨',
    values: [96, 86, 79],
    effort: '坡道与接驳',
  },
  silver: {
    nature: '室内银饰手作 · 虚构工坊',
    values: [94, 96, 87],
    effort: '手作操作',
  },
  sourfish: {
    nature: '地方餐饮 · 虚构供给',
    values: [96, 78, 65],
    effort: '室内用餐',
  },
  xiaoqikong: {
    nature: '水系森林景区',
    values: [98, 94, 76],
    effort: '较长步道与接驳',
    weatherSensitive: true,
  },
  shuichun: {
    nature: '水上户外体验 · 待核验',
    values: [92, 52, 60],
    effort: '体力要求较高',
    weatherSensitive: true,
  },
  zunyi: {
    nature: '红色历史纪念场馆',
    values: [97, 96, 90],
    effort: '室内慢行',
  },
};
export function score(
  p: Place,
  scenario = 'normal',
  preferences: Theme[] = [],
) {
  const profile = recommendationProfiles[p.category];
  const attributes = placeAttributes[p.id];
  const factors = [...p.factors];
  factors[7] = preferences.length
    ? preferences.includes(p.category)
      ? 98
      : 45
    : 80;
  if (scenario === 'rain' && !p.indoor) factors[0] = 30;
  if (scenario === 'crowd') factors[1] = 35;
  if (scenario === 'closed') factors[2] = 0;
  const contextTotal =
    factors.reduce(
      (s, n, i) => s + Math.max(0, Math.min(100, n)) * profile.weights[i],
      0,
    ) / 100;
  const categoryTotal =
    attributes.values.reduce(
      (s, n, i) => s + n * profile.specialtyWeights[i],
      0,
    ) / 100;
  const rawTotal = contextTotal * 0.7 + categoryTotal * 0.3;
  const warnings: string[] = [];
  let total = Math.round(rawTotal);
  if (factors[2] === 0) {
    total = 0;
    warnings.push('模拟闭园：不推荐安排，其他高分不能抵消未开放。');
  } else if (
    scenario === 'rain' &&
    p.category === '身体力行' &&
    attributes.weatherSensitive
  ) {
    total = Math.min(total, 35);
    warnings.push('模拟降雨：水上户外项目暂缓，需核验运营方与天气条件。');
  } else if (scenario === 'rain' && attributes.weatherSensitive) {
    total = Math.min(total, 60);
    warnings.push('模拟降雨：水系景区降级推荐，步道与开放情况需核验。');
  }
  return {
    factors,
    total,
    contextTotal,
    categoryTotal,
    rawTotal,
    profile,
    attributes,
    warnings,
    label:
      total >= 85
        ? '优先考虑'
        : total >= 70
          ? '值得考虑'
          : total >= 50
            ? '需权衡'
            : '暂缓选择',
    preferenceNote: preferences.length
      ? preferences.includes(p.category)
        ? '符合当前主题偏好'
        : '非当前优先主题'
      : '未设置偏好，按中性 80 分计算',
  };
}
export const money = (n: number) =>
  new Intl.NumberFormat('zh-CN', { maximumFractionDigits: 2 }).format(n);
export function dateAfter(start: string, days: number) {
  const d = new Date(start + 'T12:00:00');
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
export function dateLabel(date: string) {
  return new Intl.DateTimeFormat('zh-CN', {
    month: 'numeric',
    day: 'numeric',
    weekday: 'short',
  }).format(new Date(date + 'T12:00:00'));
}
export const makeItem = (id: string): TripItem => ({
  id: uid(),
  placeId: id,
  duration: placeById(id).duration,
});
const templates = [
  ['qianling', 'museum', 'jiaxiu', 'qingyun'],
  ['huangguoshu', 'tianxing'],
  ['xijiang', 'silver', 'sourfish'],
];
export function makeTrip(
  options: {
    destination: string;
    start: string;
    dayCount: number;
    people: string[];
    preferences: Theme[];
    pace: string;
    budget: number;
  },
  imported: string[] = [],
): Trip {
  const destination = options.destination.trim() || '贵州';
  const region =
    ['贵阳', '安顺', '黔东南', '荔波', '遵义'].find((r) =>
      destination.includes(r),
    ) ?? (destination.includes('苗寨') ? '黔东南' : undefined);
  const pool = places.filter(
    (p) =>
      (!region || p.region === region) &&
      (!options.preferences.length || options.preferences.includes(p.category)),
  );
  const selected = imported.length
    ? [...new Set(imported)].filter((id) => places.some((p) => p.id === id))
    : pool.map((p) => p.id);
  const count = Math.max(1, Math.min(7, Math.floor(options.dayCount)));
  let remaining = [...selected];
  let remainingBudget = options.budget;
  let budgetSkipped = 0;
  const days: TripDay[] = Array.from({ length: count }, (_, i) => {
    let ids: string[];
    if (
      !imported.length &&
      !region &&
      options.preferences.length === 0 &&
      i < 3
    ) {
      ids = templates[i].slice(0, options.pace === '留白' ? 2 : 4);
      remaining = remaining.filter((id) => !ids.includes(id));
    } else {
      const first = remaining[0];
      const group = first
        ? remaining.filter(
            (id) => placeById(id).region === placeById(first).region,
          )
        : [];
      ids = group.slice(
        0,
        options.pace === '留白' ? 2 : options.pace === '紧凑' ? 4 : 3,
      );
      remaining = remaining.filter((id) => !ids.includes(id));
    }
    if (!imported.length)
      ids = ids.filter((id) => {
        const cost = placeById(id).price * options.people.length;
        if (cost > remainingBudget) {
          budgetSkipped++;
          return false;
        }
        remainingBudget -= cost;
        return true;
      });
    return {
      id: uid(),
      date: dateAfter(options.start, i),
      title: ids.length
        ? `${placeById(ids[0]).region} · ${i === 0 ? '初见山水' : '慢慢相遇'}`
        : '自由探索 · 留一点空白',
      items: ids.map(makeItem),
    };
  });
  return {
    id: uid(),
    title: `${destination}${count}日 · 山水与烟火`,
    ...options,
    destination,
    days,
    notes: [
      imported.length && remaining.length
        ? `另有 ${remaining.length} 个地点未排入，请在添加地点中补充或延长旅行。`
        : '',
      budgetSkipped
        ? `有 ${budgetSkipped} 个地点因模拟门票/体验费用超出预算未排入。预算未计入交通和住宿，请继续核验。`
        : '',
    ]
      .filter(Boolean)
      .join('\n'),
  };
}
export function initialData(): AppData {
  const trip = makeTrip({
    destination: '贵州',
    start: '2026-08-29',
    dayCount: 3,
    people: ['我', '小夏'],
    preferences: [],
    pace: '均衡',
    budget: 3000,
  });
  trip.title = '山水之间，慢游贵州';
  const sample = makeTrip({
    destination: '黔东南',
    start: '2026-09-04',
    dayCount: 2,
    people: ['阿禾'],
    preferences: ['民族文化', '美食体验'],
    pace: '留白',
    budget: 1800,
  });
  return {
    version: 1,
    trips: [trip],
    activeTripId: trip.id,
    savedPlaces: ['xiaoqikong'],
    savedPostIds: [],
    expenses: [
      {
        id: uid(),
        tripId: trip.id,
        title: '贵阳住宿 · 两晚',
        amount: 680,
        payer: '我',
      },
      {
        id: uid(),
        tripId: trip.id,
        title: '第一晚的贵州味道',
        amount: 180,
        payer: '小夏',
      },
    ],
    feed: [
      {
        id: 'feed-1',
        title: '去苗寨，过两天慢一点的生活',
        author: '阿禾',
        description:
          '喜欢手作、喜欢散步，也喜欢和同频的人一起吃酸汤。找一位旅行搭子，松弛出发。',
        trip: sample,
        saved: false,
        requested: false,
        image: '/images/xijiang.jpg',
      },
      {
        id: 'feed-2',
        title: '三天，把贵州的山水装进行囊',
        author: '山间来信',
        description: '从城市森林走到瀑布，把热闹和留白都安排进旅程。',
        trip: structuredClone(trip),
        saved: false,
        requested: false,
        image: '/images/xiaoqikong.jpg',
      },
    ],
    theme: 'coral',
    iconSet: 'line',
    profile: '旅行家',
    offlineReady: false,
  };
}
export function distance(a: Place, b: Place) {
  const rad = (n: number) => (n * Math.PI) / 180;
  const dlat = rad(b.lat - a.lat),
    dlng = rad(b.lng - a.lng);
  const h =
    Math.sin(dlat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dlng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h)) * 1.45;
}
export function leg(a: Place, b: Place) {
  const km = distance(a, b);
  return {
    km: Math.round(km * 10) / 10,
    minutes: Math.max(5, Math.round((km / (km > 30 ? 55 : 25)) * 60)),
    mode: km > 30 ? '城际交通' : '市内交通',
  };
}
export function metrics(items: TripItem[]) {
  return items.reduce(
    (out, item, i) => {
      if (i) {
        const l = leg(placeById(items[i - 1].placeId), placeById(item.placeId));
        out.km += l.km;
        out.minutes += l.minutes;
      }
      return out;
    },
    { km: 0, minutes: 0 },
  );
}
export function timeline(items: TripItem[]) {
  let time = 8 * 60 + 30;
  return items.map((item, i) => {
    const p = placeById(item.placeId);
    const transit = i ? leg(placeById(items[i - 1].placeId), p) : null;
    if (transit) time += transit.minutes;
    time = Math.max(time, p.hours[0] * 60);
    const start = time;
    time += item.duration;
    return {
      item,
      place: p,
      start,
      end: time,
      transit,
      warning: time > p.hours[1] * 60,
    };
  });
}
export const clock = (m: number) =>
  `${String(Math.floor(m / 60) % 24).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}${m >= 1440 ? ' (+1天)' : ''}`;
export function optimize(items: TripItem[]): TripItem[] {
  if (items.length < 3) return [...items];
  let best = [...items];
  let bestCost = metrics(best).minutes;
  const visit = (prefix: TripItem[], rest: TripItem[]) => {
    if (!rest.length) {
      const cost = metrics(prefix).minutes;
      if (cost < bestCost) {
        best = prefix;
        bestCost = cost;
      }
      return;
    }
    rest.forEach((item, i) =>
      visit(
        [...prefix, item],
        rest.filter((_, j) => i !== j),
      ),
    );
  };
  if (items.length <= 7) visit([items[0]], items.slice(1));
  else {
    const rest = items.slice(1),
      route = [items[0]];
    while (rest.length) {
      rest.sort(
        (a, b) =>
          distance(placeById(route.at(-1)!.placeId), placeById(a.placeId)) -
          distance(placeById(route.at(-1)!.placeId), placeById(b.placeId)),
      );
      route.push(rest.shift()!);
    }
    if (metrics(route).minutes < bestCost) best = route;
  }
  return best;
}
export function splitExpenses(expenses: Expense[], people: string[]) {
  const totalCents = expenses.reduce(
    (s, e) => s + Math.round(e.amount * 100),
    0,
  );
  const share = Math.floor(totalCents / people.length);
  const balances = people.map((name, i) => ({
    name,
    paid: expenses
      .filter((e) => e.payer === name)
      .reduce((s, e) => s + Math.round(e.amount * 100), 0),
    owed: share + (i < totalCents % people.length ? 1 : 0),
  }));
  const creditors = balances
    .map((b) => ({ name: b.name, amount: b.paid - b.owed }))
    .filter((b) => b.amount > 0);
  const debtors = balances
    .map((b) => ({ name: b.name, amount: b.owed - b.paid }))
    .filter((b) => b.amount > 0);
  const transfers: { from: string; to: string; amount: number }[] = [];
  for (const d of debtors)
    for (const c of creditors) {
      const amount = Math.min(d.amount, c.amount);
      if (amount) {
        transfers.push({ from: d.name, to: c.name, amount: amount / 100 });
        d.amount -= amount;
        c.amount -= amount;
      }
    }
  return {
    total: totalCents / 100,
    balances: balances.map((b) => ({
      ...b,
      paid: b.paid / 100,
      owed: b.owed / 100,
    })),
    transfers,
  };
}
export type SocialPost = {
  id: string;
  platform: '抖音' | '小红书';
  kind: 'video' | 'article';
  title: string;
  author: string;
  cover: string;
  likes: string;
  tags: string[];
  intro: string;
  mentions: { placeId: string; quote: string; at?: string }[];
  media?: string;
  captions?: string;
  duration?: string;
};
/** All creators, engagement counts, copy and media are fictional demo fixtures. */
export const socialPosts: SocialPost[] = [
  {
    id: 'dy-guizhou',
    platform: '抖音',
    kind: 'video',
    title: '把贵州的三种心动，装进一段旅行',
    author: '阿禾的山野日记',
    cover: '/images/xiaoqikong.jpg',
    likes: '2.8万',
    tags: ['山水漫游', '贵州三站'],
    intro:
      '从小七孔的绿，到苗寨的灯，再到甲秀楼的晚风。这份跨城灵感，请留出交通时间，别赶在一天走完。',
    media: '/videos/guizhou-demo.mp4',
    captions: '/videos/guizhou-demo.vtt',
    duration: '00:09',
    mentions: [
      {
        placeId: 'xiaoqikong',
        at: '00:00',
        quote: '第一站荔波小七孔，把半天交给山水。',
      },
      {
        placeId: 'xijiang',
        at: '00:03',
        quote: '第二站西江千户苗寨，等一盏灯亮起来。',
      },
      {
        placeId: 'jiaxiu',
        at: '00:06',
        quote: '最后来到甲秀楼，沿南明河慢慢走。',
      },
    ],
  },
  {
    id: 'xhs-guiyang',
    platform: '小红书',
    kind: 'article',
    title: '贵阳慢游日记｜从河边晚风到一口烟火气',
    author: '小满在路上',
    cover: '/images/jiaxiu.jpg',
    likes: '3,216',
    tags: ['城市漫步', '美食体验'],
    intro:
      '不赶路的一天，留给贵阳的老城与小店。这是一份可以随时删改的路线草稿，营业时间和预约请出发前再确认。',
    mentions: [
      {
        placeId: 'jiaxiu',
        quote: '从甲秀楼开始，沿南明河散步，给拍照留点时间。',
      },
      {
        placeId: 'qingyun',
        quote: '再去青云路美食街，按自己的口味挑一两样小吃。',
      },
      {
        placeId: 'batik',
        quote: '想加点手作，就把贵阳蜡染体验工坊放进备选。工坊为虚构样例。',
      },
    ],
  },
  {
    id: 'dy-waterfall',
    platform: '抖音',
    kind: 'video',
    title: '听，山水在说话｜黄果树与小七孔',
    author: '山间放映室',
    cover: '/images/huangguoshu.jpg',
    likes: '1.6万',
    tags: ['瀑布', '自然景观'],
    intro:
      '两处山水、两段慢时光。安顺与荔波之间需要单独安排交通，不是一条当日步行路线。',
    media: '/videos/waterfall-demo.mp4',
    captions: '/videos/waterfall-demo.vtt',
    duration: '00:06',
    mentions: [
      {
        placeId: 'huangguoshu',
        at: '00:00',
        quote: '黄果树瀑布，留出充足游览与接驳时间。',
      },
      {
        placeId: 'xiaoqikong',
        at: '00:03',
        quote: '下一段旅行去荔波小七孔，慢慢看水。',
      },
    ],
  },
  {
    id: 'xhs-miao',
    platform: '小红书',
    kind: 'article',
    title: '苗寨不止夜景，还有值得慢下来的手艺',
    author: '蓝染小巷',
    cover: '/images/xijiang.jpg',
    likes: '5,082',
    tags: ['民族文化', '在地体验'],
    intro:
      '把拍照之外的时间留给文化与餐桌。体验项目和店铺均为演示样例，没有真实预约入口。',
    mentions: [
      {
        placeId: 'xijiang',
        quote: '西江千户苗寨先走一走，拍摄居民前记得征求同意。',
      },
      {
        placeId: 'silver',
        quote: '苗乡银饰体验，看看纹样背后的故事。此工坊为虚构供给。',
      },
      {
        placeId: 'sourfish',
        quote: '最后留一餐给苗家酸汤鱼体验，辣度和过敏原先问清。',
      },
    ],
  },
  {
    id: 'xhs-anshun',
    platform: '小红书',
    kind: 'article',
    title: '安顺两日灵感｜瀑布、石桥与屯堡故事',
    author: '一颗旅行松果',
    cover: '/images/huangguoshu.jpg',
    likes: '2,469',
    tags: ['自然景观', '人文慢游'],
    intro:
      '自然与人文各留一段时间。以下只是内容示例，具体排期交给你的偏好、体力与天气。',
    mentions: [
      {
        placeId: 'huangguoshu',
        quote: '先去黄果树瀑布，雨具和防滑鞋提前准备。',
      },
      { placeId: 'tianxing', quote: '天星桥景区按体力选择步行长度。' },
      {
        placeId: 'tunbao',
        quote: '另留一天给天龙屯堡，演出场次需要实际核验。',
      },
    ],
  },
];
export function organizeSocialPosts(postIds: string[]) {
  const selected = [...new Set(postIds)]
    .map((id) => socialPosts.find((p) => p.id === id))
    .filter((p): p is SocialPost => Boolean(p));
  if (!selected.length) throw new Error('请先选择至少一篇演示内容。');
  const stops: {
    placeId: string;
    sources: { postId: string; quote: string; at?: string }[];
  }[] = [];
  for (const post of selected)
    for (const mention of post.mentions) {
      if (!places.some((p) => p.id === mention.placeId)) continue;
      let stop = stops.find((s) => s.placeId === mention.placeId);
      if (!stop) {
        stop = { placeId: mention.placeId, sources: [] };
        stops.push(stop);
      }
      stop.sources.push({
        postId: post.id,
        quote: mention.quote,
        at: mention.at,
      });
    }
  return {
    stops,
    postIds: selected.map((p) => p.id),
    regions: [...new Set(stops.map((s) => placeById(s.placeId).region))],
  };
}
export const socialStories: Record<
  string,
  {
    readTime: string;
    sections: { title: string; text: string }[];
    tips: string[];
  }
> = {
  'dy-guizhou': {
    readTime: '9 秒视频 · 2 分钟阅读',
    sections: [
      {
        title: '三种心动，不必一天赶完',
        text: '这一段视频把山水、苗寨与城市放在一起，表达的是旅行的节奏，不是导航顺序。小七孔适合慢慢看水，西江留给村落与夜色，甲秀楼则是城市散步的一站。跨区域移动需要另外预留时间。',
      },
      {
        title: '把镜头里的地点变成候选清单',
        text: '点击下方地点可以展开推荐依据。先保留最心动的两三处，再用 AI 整理建立草稿。它会按样例分镜提取地点，重复出现的内容合并，同时保留原文和时间码。',
      },
      {
        title: '你的旅行，可以与视频不同',
        text: '喜欢自然就多留半天给山水；更爱文化可以补充展馆或手作。日期、总预算和同行节奏都由你决定，视频只是灵感，不要求照单全收。',
      },
    ],
    tips: [
      '跨区域交通需另行核验并分天安排。',
      '拍摄居民与文化活动前征得同意。',
      '收藏此内容，日后可以从素材库再次规划。',
    ],
  },
  'xhs-guiyang': {
    readTime: '3 分钟阅读',
    sections: [
      {
        title: '01｜一段河边的留白',
        text: '把甲秀楼作为城市散步的起点，给建筑、河面和街边日常留一些时间。这里不必排满打卡任务，拍完照片，也可以沿河慢慢走。文案是虚构笔记，开放情况以实际核验为准。',
      },
      {
        title: '02｜把口味也写进攻略',
        text: '青云路美食街可以作为吃饭的候选，不需要把每家都尝遍。先决定辣度、折耳根和食物过敏限制，再选择合适的小吃。演示中的“饮食适配”分数不是对商家卫生或过敏原的认证。',
      },
      {
        title: '03｜想慢下来，就加一点手作',
        text: '把蜡染体验作为可选项，而不是必须完成的第三站。这里的工坊为虚构供给，真实主理人、地址、场次和价格都待核验。你可以在草稿中删去它，换成室内展馆或自由活动。',
      },
    ],
    tips: [
      '这是地点组合建议，非真实营业或预约保证。',
      '预算先分配餐饮与体验，再补交通住宿。',
      '可以只保留一个地点，重新搭配自己的路线。',
    ],
  },
  'dy-waterfall': {
    readTime: '6 秒视频 · 2 分钟阅读',
    sections: [
      {
        title: '两段水声，两次停留',
        text: '黄果树的瀑布与小七孔的水色是两种不同的自然体验。两地分属不同区域，这段合成视频不代表它们就在彼此旁边，更不是当日步行路线。',
      },
      {
        title: '自然景观，要看当天条件',
        text: '水系景区的天气与步道状况比视频里的观感更重要。推荐指数使用自然景观模型，天气、季节和步道体验会参与计算。模拟降雨时会下调建议，真实出行仍需查看景区公告。',
      },
      {
        title: '先选最想去的一处',
        text: '短假期可以只保留一个区域，再添加附近的人文地点。长假期可保留两处，并在创建旅行时增加天数。调整不会改变原视频内容，生成的是你的独立行程。',
      },
    ],
    tips: [
      '雨具与防滑装备按实际情况准备。',
      '不要把演示评分当作安全许可。',
      '留出接驳和休息时间，避免按视频节奏赶路。',
    ],
  },
  'xhs-miao': {
    readTime: '3 分钟阅读',
    sections: [
      {
        title: '先把苗寨当成一处生活空间',
        text: '西江千户苗寨不只是背景和夜景，也是居民的家园。散步时留意公共空间与私人院落的边界，人物、服饰与仪式的拍摄都应先询问。',
      },
      {
        title: '手艺的价值，在过程里',
        text: '银饰体验可以让旅行多一段参与感。样例关注文化内容、互动参与和讲解条件，不把“贵”或“热门”等同于文化价值。此处工坊为虚构示例，不提供真实预约。',
      },
      {
        title: '一餐与一段空闲，都可以留下',
        text: '酸汤鱼体验是餐饮候选，先确认口味与过敏原。若当天体验较多，可以删掉一项，保留一段自由时间。不同同行人的兴趣可以在下一步的主题与节奏中重新选择。',
      },
    ],
    tips: [
      '尊重居民作息与私人空间。',
      '工坊、餐厅和价格都是 Mock。',
      '文化体验评分不代表对群体或文化优劣的评价。',
    ],
  },
  'xhs-anshun': {
    readTime: '3 分钟阅读',
    sections: [
      {
        title: '第一段：给自然足够的时间',
        text: '黄果树与天星桥可以成为安顺路线的自然景观候选。是否安排在同一天，要结合体力、接驳和实际开放情况；演示不会替你判断真实道路是否可通行。',
      },
      {
        title: '第二段：从山水转向故事',
        text: '天龙屯堡适合作为另一段文化探索。与自然景区不同，它的模型更重视文化内容、互动与讲解条件。地戏场次只是待核验信息，不能依据样例作出行程承诺。',
      },
      {
        title: '把“完整攻略”变成“适合我的攻略”',
        text: '想少走路，可以从草稿中移除一段步道；喜欢历史，可以多留时间给文化地点。收藏这篇笔记后，后续可以重复使用，不必一次把所有决定做完。',
      },
    ],
    tips: [
      '可先保留三处地点，再按预算和天数删减。',
      '开放和活动排期需要实际确认。',
      '不同品类的指数均为个人选择辅助，不是绝对排名。',
    ],
  },
};
export const storageKey = 'qianlv-demo-v1';
export function attachTripSources(trip: Trip, postIds: string[]): Trip {
  return {
    ...trip,
    sourcePostIds: [...new Set(postIds)].filter((id) =>
      socialPosts.some((p) => p.id === id),
    ),
  };
}
export function recommendSocialPlaces(
  routeIds: string[],
  preferences: Theme[] = [],
) {
  const known = places.filter((p) => routeIds.includes(p.id));
  const regions = new Set(known.map((p) => p.region));
  return places
    .filter(
      (p) =>
        !routeIds.includes(p.id) &&
        regions.has(p.region) &&
        (!preferences.length || preferences.includes(p.category)),
    )
    .sort(
      (a, b) =>
        score(b, 'normal', preferences).total -
        score(a, 'normal', preferences).total,
    )
    .slice(0, 4)
    .map((p) => ({
      placeId: p.id,
      reason: `${p.region}同区域 · ${placeAttributes[p.id].nature} · 模拟推荐指数 ${score(p, 'normal', preferences).total}`,
    }));
}
export async function parseGuide(input: string): Promise<string[]> {
  await new Promise((r) => setTimeout(r, 850));
  const text = input.trim();
  if (!text) throw new Error('请先粘贴链接，或输入想去的地点。');
  if (/https?:\/\//i.test(text)) {
    const raw = text.match(/https?:\/\/[^\s]+/i)?.[0];
    let host = '';
    try {
      host = new URL(raw!).hostname;
    } catch {
      throw new Error('链接格式不正确，请检查后重试。');
    }
    if (
      !['xiaohongshu.com', 'xhslink.com', 'douyin.com'].some(
        (d) => host === d || host.endsWith('.' + d),
      )
    )
      throw new Error('暂不支持这个来源。可以输入地点名称，或手动搜索添加。');
    return ['qianling', 'museum', 'jiaxiu', 'qingyun'];
  }
  const matches = places
    .filter(
      (p) =>
        text.includes(p.name) ||
        text.includes(p.name.replace('景区', '').replace('体验', '')),
    )
    .map((p) => p.id);
  if (!matches.length)
    throw new Error(
      '没有识别到地点。试试“甲秀楼、黔灵山公园”，或使用手动搜索。',
    );
  return matches;
}
export function replan(
  items: TripItem[],
  event: string,
): { items: TripItem[]; reason: string } {
  if (event === 'crowd') {
    const optimized = optimize([...items].reverse());
    return {
      items: optimized,
      reason: '模拟拥堵：调整访问顺序以避开原定到达窗口。道路实况尚未接入。',
    };
  }
  const outdoor = items.find((i) => !placeById(i.placeId).indoor);
  if (!outdoor)
    return {
      items: [...items],
      reason: '当天均为室内地点，无需替换。仍请核对真实开放情况。',
    };
  const source = placeById(outdoor.placeId);
  const indoor = places
    .filter(
      (p) =>
        p.indoor &&
        p.region === source.region &&
        !items.some((i) => i.placeId === p.id),
    )
    .sort((a, b) => distance(source, a) - distance(source, b))[0];
  if (!indoor)
    return {
      items: items.filter((i) => i.id !== outdoor.id),
      reason: `${source.name} 暂缓游览。附近无可用室内候选，保留空闲时间，请手动补充。`,
    };
  return {
    items: items.map((i) => (i.id === outdoor.id ? makeItem(indoor.id) : i)),
    reason: `将「${source.name}」替换为「${indoor.name}」，保留在地文化体验。原地点仍可从探索页重新加入；场次与价格待核验。`,
  };
}
export function restore(raw: string): AppData | null {
  try {
    const d = JSON.parse(raw) as AppData;
    if (d.savedPostIds === undefined) d.savedPostIds = [];
    if (
      d.version !== 1 ||
      !Array.isArray(d.trips) ||
      !d.trips.length ||
      !d.trips.some((t) => t.id === d.activeTripId) ||
      !Array.isArray(d.feed) ||
      !Array.isArray(d.expenses) ||
      !Array.isArray(d.savedPlaces) ||
      !Array.isArray(d.savedPostIds) ||
      d.savedPostIds.some((id) => !socialPosts.some((p) => p.id === id)) ||
      typeof d.profile !== 'string' ||
      !['coral', 'ocean', 'forest', 'lavender', 'mono'].includes(d.theme) ||
      !['line', 'solid', 'emoji'].includes(d.iconSet) ||
      d.savedPlaces.some((id) => !places.some((p) => p.id === id)) ||
      d.feed.some(
        (f) =>
          typeof f.author !== 'string' ||
          typeof f.description !== 'string' ||
          typeof f.image !== 'string',
      )
    )
      return null;
    for (const t of [...d.trips, ...d.feed.map((f) => f.trip)]) {
      if (
        typeof t.title !== 'string' ||
        !Array.isArray(t.people) ||
        !t.people.length ||
        t.people.some((p) => typeof p !== 'string' || !p.trim()) ||
        !Array.isArray(t.preferences) ||
        !Number.isFinite(t.budget) ||
        t.budget <= 0 ||
        typeof t.start !== 'string' ||
        typeof t.destination !== 'string' ||
        !t.days?.length ||
        typeof t.notes !== 'string' ||
        (t.sourcePostIds !== undefined &&
          (!Array.isArray(t.sourcePostIds) ||
            t.sourcePostIds.some(
              (id) => !socialPosts.some((p) => p.id === id),
            )))
      )
        return null;
      for (const day of t.days) {
        if (
          !/^\d{4}-\d{2}-\d{2}$/.test(day.date) ||
          Number.isNaN(new Date(day.date + 'T12:00:00').getTime()) ||
          !Array.isArray(day.items) ||
          day.items.some(
            (i) =>
              !places.some((p) => p.id === i.placeId) ||
              !Number.isFinite(i.duration) ||
              i.duration < 15,
          )
        )
          return null;
      }
    }
    if (
      d.expenses.some(
        (e) =>
          !Number.isFinite(e.amount) ||
          e.amount <= 0 ||
          typeof e.title !== 'string',
      )
    )
      return null;
    return d;
  } catch {
    return null;
  }
}
