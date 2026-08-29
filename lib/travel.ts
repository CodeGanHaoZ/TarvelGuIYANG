import {
  additionalPlaces,
  additionalAttributes,
  featuredPosts,
  featuredStories,
} from './themed-fixtures.ts';
import {
  itineraryPlaces,
  itineraryAttributes,
  itineraryPresets,
  type DayGuide,
} from './itinerary-fixtures.ts';
import {
  roadDistance,
  resolveTransport,
  type TransportChoice,
} from './transport.ts';

export type Theme =
  | '舌尖黔味'
  | '山水奇观'
  | '野趣户外'
  | '多彩民族'
  | '古镇遗韵'
  | '红色征程';
export const themes: Theme[] = [
  '山水奇观',
  '舌尖黔味',
  '多彩民族',
  '古镇遗韵',
  '野趣户外',
  '红色征程',
];
export const themeInfo: Record<
  Theme,
  { subtitle: string; verb: string; definition: string; boundary: string }
> = {
  山水奇观: {
    subtitle: '纯观光',
    verb: '看',
    definition: '以观赏自然景观为主，选择成熟观景台、索道与栈道游览。',
    boundary: '不含漂流、攀岩、探洞或徒步登山；索道观光也需按体力选择步行段。',
  },
  舌尖黔味: {
    subtitle: '美食',
    verb: '吃',
    definition: '贵州特色餐饮、小吃、酒文化及饮食场景。',
    boundary: '苗寨长桌宴的用餐归美食；村寨文化互动另归多彩民族，不重复归类。',
  },
  多彩民族: {
    subtitle: '文化体验',
    verb: '感',
    definition: '与少数民族居民或手艺人直接互动，了解建筑、歌舞、手艺与生活。',
    boundary: '少数民族活态文化，不把明清古镇、汉族屯堡或普通展馆混入此类。',
  },
  古镇遗韵: {
    subtitle: '历史人文',
    verb: '访',
    definition: '明清古镇、军事屯堡、商埠古道与古代历史人文遗存。',
    boundary: '聚焦古代军政与汉文化历史；不归入少数民族活态文化或革命纪念。',
  },
  野趣户外: {
    subtitle: '身体力行',
    verb: '动',
    definition: '需要亲身参与和体力投入的登山、漂流、攀岩等户外体验。',
    boundary:
      '按具体玩法拆分；不能将观景步道等同漂流，也不能将索道观光等同徒步登山。',
  },
  红色征程: {
    subtitle: '历史缅怀',
    verb: '忆',
    definition: '红军长征、革命历史相关的纪念地、旧址与纪念馆。',
    boundary: '聚焦革命历史，与古代历史人文、民族村寨文化分开。',
  },
};
const legacyThemes: Record<string, Theme> = {
  自然景观: '山水奇观',
  美食体验: '舌尖黔味',
  民族文化: '多彩民族',
  经典路线: '古镇遗韵',
  身体力行: '野趣户外',
  红色旅游: '红色征程',
};
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
  /** Different activities at one location remain distinct bookable/plannable candidates. */
  locationId?: string;
};
export type TripItem = {
  id: string;
  placeId: string;
  duration: number;
  plan?: { earliestStart: number; activity: string; tips: string[] };
  transport?: TransportChoice;
};
export type TripDay = {
  id: string;
  date: string;
  title: string;
  items: TripItem[];
  guide?: DayGuide;
  settings?: DaySettings;
};
export type TravelerProfile = 'standard' | 'family' | 'senior' | 'children';
export type DaySettings = {
  departure?: number;
  scenario?: 'normal' | 'rain' | 'crowd' | 'closed';
  hotelName?: string;
  hotelLat?: number;
  hotelLng?: number;
  roomPrice?: number;
  mealMinutes?: number;
  lunchPrice?: number;
  dinnerPrice?: number;
  breakfastPrice?: number;
  includeMeals?: boolean;
  includeHotel?: boolean;
  transportModes?: Record<string, import('./transport').TransportMode>;
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
  travelerProfile?: TravelerProfile;
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
    category: '山水奇观',
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
    category: '古镇遗韵',
    description: '历史人文展陈样例，不作为少数民族活态互动体验。',
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
    category: '古镇遗韵',
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
    category: '舌尖黔味',
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
    category: '古镇遗韵',
    description: '沿着明清军事要塞的石墙与老街，读一段贵州古镇史。',
    image: '/images/qingyan.jpg',
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
    category: '多彩民族',
    description: '与苗族手艺人交流纹样并动手蜡染的未核验体验场景。',
    lat: 26.573,
    lng: 106.711,
    duration: 90,
    price: 128,
    indoor: true,
    hours: [9, 18],
    factors: [100, 98, 100, 92, 90, 96, 90, 100],
    tip: '这是未核验的体验供给。真实主理人、地址与场次待核验。',
    culture: '体验前了解纹样含义；人物拍摄、图样传播与商用应先征得授权。',
  },
  {
    id: 'huangguoshu',
    name: '黄果树瀑布',
    region: '安顺',
    category: '山水奇观',
    description: '听见水声，也看见山河的力量。',
    lat: 25.992,
    lng: 105.666,
    duration: 180,
    price: 160,
    indoor: false,
    image: '/images/huangguoshu.jpg',
    hours: [7, 18],
    factors: [95, 82, 100, 88, 96, 94, 80, 95],
    tip: '建议 08:30—09:30 入园。步道湿滑，真实天气与开放情况待核验。',
  },
  {
    id: 'tianxing',
    name: '天星桥景区',
    region: '安顺',
    category: '山水奇观',
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
    category: '古镇遗韵',
    description: '从明代军屯、石头建筑与地戏，了解屯堡的汉文化历史。',
    lat: 26.418,
    lng: 106.243,
    duration: 120,
    price: 60,
    indoor: false,
    hours: [8, 18],
    factors: [92, 94, 100, 84, 88, 90, 90, 96],
    tip: '地戏场次待核验，请勿将参考排期当作真实演出安排。',
    culture: '尊重当地服饰与民俗，不擅自进入居民院落；拍摄人物请先询问。',
  },
  {
    id: 'xijiang',
    name: '西江千户苗寨',
    region: '黔东南',
    category: '多彩民族',
    description: '在苗族居民讲解、歌舞交流与吊脚楼生活中，认识苗乡。',
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
    category: '多彩民族',
    description: '一锤一錾，读懂银饰背后的手艺。',
    lat: 26.501,
    lng: 108.164,
    duration: 90,
    price: 168,
    indoor: true,
    hours: [9, 18],
    factors: [100, 95, 100, 85, 90, 92, 90, 100],
    tip: '未核验工坊样例，无真实预约。儿童体验需成人与工坊指导。',
    culture: '银饰纹样承载文化意义，作品与影像传播应尊重制作者权利。',
  },
  {
    id: 'sourfish',
    name: '苗家酸汤鱼体验',
    region: '黔东南',
    category: '舌尖黔味',
    description: '一锅红酸汤，让味蕾也来一次旅行。',
    lat: 26.498,
    lng: 108.173,
    duration: 75,
    price: 95,
    indoor: true,
    hours: [11, 21],
    factors: [100, 90, 100, 90, 92, 90, 85, 98],
    tip: '餐厅为参考供给。用餐前询问鱼类、辣椒及其他过敏原。',
  },
  {
    id: 'xiaoqikong',
    name: '荔波小七孔',
    region: '荔波',
    category: '山水奇观',
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
    name: '水春河漂流',
    region: '荔波',
    category: '野趣户外',
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
    category: '红色征程',
    description: '沿历史的足迹，读懂这座城的记忆。',
    lat: 27.687,
    lng: 106.917,
    duration: 120,
    price: 0,
    indoor: true,
    image: '/images/theme-history.jpg',
    hours: [9, 17],
    factors: [100, 84, 100, 90, 95, 90, 90, 92],
    tip: '预约、闭馆日与展陈安排待接入官方信息，请提前核实。',
  },
  ...additionalPlaces,
  ...itineraryPlaces,
];
export const travelRegions = [...new Set(places.map((p) => p.region))];
export const placeById = (id: string): Place =>
  places.find((p) => p.id === id) ?? places[0];
export function planningWarnings(ids: string[]) {
  const selected = places.filter((p) => ids.includes(p.id));
  const locations = [
    ...new Set(selected.map((p) => p.locationId).filter(Boolean)),
  ];
  const warnings = locations.flatMap((location) => {
    const activities = selected.filter((p) => p.locationId === location);
    return activities.length > 1
      ? [
          `${activities.map((p) => p.name).join(' / ')} 是同地不同玩法，可二选一；都保留时会分天安排。`,
        ]
      : [];
  });
  if (selected.some((p) => p.category === '野趣户外'))
    warnings.push(
      '户外挑战需先核验天气、开放、运营与个人能力；推荐指数不代表安全许可。',
    );
  return warnings;
}
function selectDayPlaces(ids: string[], pace: string) {
  const selected: string[] = [];
  let minutes = 0;
  for (const id of ids) {
    const place = placeById(id);
    const transit = selected.length
      ? leg(placeById(selected.at(-1)!), place).minutes
      : 0;
    const sameLocation =
      place.locationId &&
      selected.some((p) => placeById(p).locationId === place.locationId);
    if (
      selected.length &&
      (sameLocation ||
        minutes + transit + place.duration > 480 ||
        selected.length >= (pace === '留白' ? 2 : pace === '紧凑' ? 4 : 3))
    )
      break;
    selected.push(id);
    minutes += transit + place.duration;
  }
  return selected;
}
export function suggestedTripDays(ids: string[], pace = '均衡') {
  let remaining = [...new Set(ids)].filter((id) =>
    places.some((p) => p.id === id),
  );
  let days = 0;
  while (remaining.length) {
    const region = placeById(remaining[0]).region;
    const group = remaining.filter((id) => placeById(id).region === region);
    const selected = selectDayPlaces(group, pace);
    remaining = remaining.filter((id) => !selected.includes(id));
    days++;
  }
  return Math.max(1, Math.min(7, days));
}
const themeDestinations: Record<Theme, string> = {
  山水奇观: '安顺',
  舌尖黔味: '贵阳',
  多彩民族: '黔东南',
  古镇遗韵: '贵阳',
  野趣户外: '荔波',
  红色征程: '遵义',
};
export function tripCreationDefaults(imported: string[] = [], theme?: Theme) {
  const candidates = theme
    ? places.filter(
        (p) => p.category === theme && p.region === themeDestinations[theme],
      )
    : [...new Set(imported)].flatMap((id) => {
        const place = places.find((p) => p.id === id);
        return place ? [place] : [];
      });
  const regions = [...new Set(candidates.map((p) => p.region))];
  return {
    destination: regions.length === 1 ? regions[0] : '贵州',
    dayCount: candidates.length
      ? suggestedTripDays(candidates.map((p) => p.id))
      : 3,
    preferences: theme
      ? [theme]
      : [...new Set(candidates.map((p) => p.category))],
  };
}
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
  山水奇观: {
    weights: [25, 15, 15, 10, 10, 15, 5, 5],
    dimensions: ['景观丰富度', '季节体验', '步道友好度'],
    specialtyWeights: [40, 35, 25],
    description: '优先看天气、季节与景观体验，兼顾步道和停留条件。',
  },
  舌尖黔味: {
    weights: [5, 15, 15, 10, 25, 5, 5, 20],
    dimensions: ['地方风味', '价格友好度', '饮食适配'],
    specialtyWeights: [45, 25, 30],
    description:
      '优先看地方风味与个人口味，天气占比较低。饮食过敏仍需向商家核验。',
  },
  野趣户外: {
    weights: [30, 10, 20, 10, 10, 10, 5, 5],
    dimensions: ['参与体验', '体力友好度', '装备便利'],
    specialtyWeights: [35, 40, 25],
    description: '优先看天气、可开展条件和体力要求，不能用高热度替代运营核验。',
  },
  多彩民族: {
    weights: [5, 10, 15, 10, 20, 10, 15, 15],
    dimensions: ['文化内容', '互动参与', '讲解条件'],
    specialtyWeights: [45, 30, 25],
    description: '优先看文化内容、讲解和互动参与，尊重居民与传承人的意愿。',
  },
  古镇遗韵: {
    weights: [15, 15, 15, 15, 15, 10, 5, 10],
    dimensions: ['历史遗存', '古建与街巷', '历史解读'],
    specialtyWeights: [40, 35, 25],
    description:
      '优先看古代历史遗存、古建街巷与历史解读，不与民族活态文化或革命历史混类。',
  },
  红色征程: {
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
  ...additionalAttributes,
  ...itineraryAttributes,
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
    nature: '室内非遗手作 · 未核验工坊',
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
    nature: '室内银饰手作 · 未核验工坊',
    values: [94, 96, 87],
    effort: '手作操作',
  },
  sourfish: {
    nature: '地方餐饮 · 未核验供给',
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
    warnings.push('闭园：不推荐安排，其他高分不能抵消未开放。');
  } else if (
    scenario === 'rain' &&
    p.category === '野趣户外' &&
    attributes.weatherSensitive
  ) {
    total = Math.min(total, 35);
    warnings.push('降雨：户外挑战项目暂缓，需核验运营方、体力与天气条件。');
  } else if (scenario === 'rain' && attributes.weatherSensitive) {
    total = Math.min(total, 60);
    warnings.push('降雨：天气敏感景观降级推荐，步道与开放情况需核验。');
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
export function createPresetTrip(
  presetId: string,
  options: { start: string; people: string[]; budget: number },
): Trip {
  const preset = itineraryPresets.find((p) => p.id === presetId);
  if (!preset) throw new Error('未找到这份三日样例。');
  const days: TripDay[] = preset.days.map((d, index) => ({
    id: uid(),
    date: dateAfter(options.start, index),
    title: d.title,
    guide: structuredClone(d.guide),
    items: d.stops.map((s) => ({
      ...makeItem(s.placeId),
      duration: s.duration,
      plan: { earliestStart: s.at, activity: s.activity, tips: [...s.tips] },
    })),
  }));
  const admission = days
    .flatMap((d) => d.items)
    .reduce(
      (sum, i) => sum + placeById(i.placeId).price * options.people.length,
      0,
    );
  return {
    id: uid(),
    title: preset.title,
    destination: preset.destination,
    start: options.start,
    people: [...options.people],
    budget: options.budget,
    preferences: [],
    pace: '均衡',
    days,
    notes: `三日详细样例：${preset.intro}\n门票、餐饮、开放、住宿和交通金额均为规划参考；没有完成任何预订。每天从首站开始，住宿往返及到达/返程交通另查。\n${admission > options.budget ? '注意：已列地点的费用超出预算，请删减后再出发。' : '当前预算还需覆盖交通、住宿及未列出的自理餐饮。'}`,
  };
}
export function fillEmptyTripWithPreset(trip: Trip, presetId: string): Trip {
  if (trip.days.length !== 3 || trip.days.some((d) => d.items.length))
    throw new Error('仅可填入完全空白的三日行程，已有内容不会被覆盖。');
  const sample = createPresetTrip(presetId, trip);
  return {
    ...sample,
    id: trip.id,
    sourcePostIds: trip.sourcePostIds,
    days: sample.days.map((day, i) => ({
      ...day,
      id: trip.days[i].id,
      date: trip.days[i].date,
    })),
    notes: [trip.notes, sample.notes].filter(Boolean).join('\n\n'),
  };
}
export function copyTripWithNewIds(trip: Trip): Trip {
  const copy = structuredClone(trip);
  const ids = new Map(
    copy.days.flatMap((day) =>
      day.items.map((item) => [item.id, uid()] as const),
    ),
  );
  copy.id = uid();
  const dayIds = new Map(copy.days.map((day) => [day.id, uid()]));
  const remapEndpoint = (endpoint: string) => {
    if (ids.has(endpoint)) return ids.get(endpoint)!;
    for (const [oldId, newId] of dayIds) {
      if (endpoint.startsWith(`hotel:${oldId}:`))
        return endpoint.replace(`hotel:${oldId}:`, `hotel:${newId}:`);
    }
    return endpoint;
  };
  copy.days = copy.days.map((day) => ({
    ...day,
    id: dayIds.get(day.id)!,
    ...(day.settings
      ? {
          settings: {
            ...day.settings,
            transportModes: Object.fromEntries(
              Object.entries(day.settings.transportModes ?? {}).map(
                ([key, mode]) => [
                  key.split('>').map(remapEndpoint).join('>'),
                  mode,
                ],
              ),
            ),
          },
        }
      : {}),
    items: day.items.map((item) => {
      const next = { ...item, id: ids.get(item.id)! };
      if (item.transport && ids.has(item.transport.fromId))
        next.transport = {
          ...item.transport,
          fromId: ids.get(item.transport.fromId)!,
        };
      else delete next.transport;
      return next;
    }),
  }));
  return copy;
}

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
    travelRegions.find((r) => destination.includes(r)) ??
    (destination.includes('苗寨') ? '黔东南' : undefined);
  // Detailed regional defaults, without adding unselected places to imported/theme-only plans.
  if (
    options.dayCount === 3 &&
    !imported.length &&
    !options.preferences.length &&
    options.pace === '均衡'
  ) {
    const preset = itineraryPresets.find(
      (p) => p.destination === (region ?? '贵阳'),
    );
    if (preset) {
      const cost = preset.days
        .flatMap((d) => d.stops)
        .reduce(
          (sum, s) => sum + placeById(s.placeId).price * options.people.length,
          0,
        );
      if (cost <= options.budget) return createPresetTrip(preset.id, options);
    }
  }
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
      ids = selectDayPlaces(group, options.pace);
      // Reserve candidates for later days instead of consuming every stop on day one.
      // When there are fewer places than days, keep the shortage honest; never invent imports.
      ids = ids.slice(0, Math.max(1, remaining.length - (count - i - 1)));
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
        ? `${placeById(ids[0]).region} · ${options.preferences.length === 1 ? options.preferences[0] : i === 0 ? '初见山水' : '慢慢相遇'}`
        : '自由探索 · 留一点空白',
      items: ids.map(makeItem),
      guide: ids.length
        ? {
            summary: `按${placeById(ids[0]).region}同区域安排，地点不足时可从三日样例中另建行程，或手动添加。`,
            meals:
              '已选餐饮随地点计费；其余三餐请在当天住宿或游览区域安排，费用另计。',
            stay:
              i < count - 1
                ? `建议在${placeById(ids.at(-1)!).region}选择住宿，确认下一日交通后再预订。`
                : '返程日：预留取行李、到车站和安检时间，班次需自行核实。',
            stayCost: i < count - 1 ? [180, 320] : [0, 0],
            preparation: [
              '交通与开放时段为估算，出发前打开地图核对。',
              ...planningWarnings(ids),
            ],
          }
        : undefined,
    };
  });
  return {
    id: uid(),
    title: `${destination}${count}日 · ${options.preferences.length === 1 ? options.preferences[0] : '山水与烟火'}`,
    ...options,
    destination,
    days,
    notes: [
      ...planningWarnings(selected),
      imported.length && remaining.length
        ? `另有 ${remaining.length} 个地点未排入，请在添加地点中补充或延长旅行。`
        : '',
      budgetSkipped
        ? `有 ${budgetSkipped} 个地点因门票/体验费用超出预算未排入。预算未计入交通和住宿，请继续核验。`
        : '',
      days.some((d) => !d.items.length)
        ? '部分日期因候选地点或预算不足留白。未自动添加未选地点；可以补充地点或另建详细三日样例。'
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
    preferences: ['多彩民族', '舌尖黔味'],
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
  return roadDistance(a, b);
}
export function leg(
  a: Place,
  b: Place,
  choice?: TransportChoice,
  fromId?: string,
) {
  const option = resolveTransport(a, b, choice, fromId);
  return {
    km: option.km,
    minutes: option.minutes,
    mode: option.label,
    option,
  };
}
export function previousDayConnection(
  trip: Trip,
  dayIndex: number,
): TripItem | undefined {
  const from = trip.days[dayIndex - 1]?.items.at(-1),
    to = trip.days[dayIndex]?.items[0];
  return from &&
    to &&
    placeById(from.placeId).region !== placeById(to.placeId).region
    ? from
    : undefined;
}
export function metrics(items: TripItem[], previous?: TripItem) {
  return items.reduce(
    (out, item, i) => {
      const from = items[i - 1] ?? previous;
      if (from) {
        const l = leg(
          placeById(from.placeId),
          placeById(item.placeId),
          item.transport,
          from.id,
        );
        out.km += l.km;
        out.minutes += l.minutes;
      }
      return out;
    },
    { km: 0, minutes: 0 },
  );
}
export function timeline(items: TripItem[], previous?: TripItem) {
  let time = 8 * 60 + 30;
  return items.map((item, i) => {
    const p = placeById(item.placeId);
    const from = items[i - 1] ?? previous;
    const transit = from
      ? leg(placeById(from.placeId), p, item.transport, from.id)
      : null;
    if (transit) time += transit.minutes;
    const arrival = time;
    time = Math.max(time, p.hours[0] * 60, item.plan?.earliestStart ?? 0);
    const start = time;
    time += item.duration;
    return {
      item,
      place: p,
      start,
      end: time,
      transit,
      wait: start - arrival,
      warning: time > p.hours[1] * 60,
    };
  });
}
export const clock = (m: number) =>
  `${String(Math.floor(m / 60) % 24).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}${m >= 1440 ? ' (+1天)' : ''}`;
export function optimize(items: TripItem[], previous?: TripItem): TripItem[] {
  if (items.length < 3) return [...items];
  let best = [...items];
  let bestCost = metrics(best, previous).minutes;
  const visit = (prefix: TripItem[], rest: TripItem[]) => {
    if (!rest.length) {
      const cost = metrics(prefix, previous).minutes;
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
    if (metrics(route, previous).minutes < bestCost) best = route;
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
  platform: 'B站' | '站内';
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
  sourceUrl?: string;
  embedUrl?: string;
  publishedAt?: string;
  duration?: string;
  theme?: Theme;
  featured?: boolean;
  recommendation?: string;
};
export type SocialStory = {
  readTime: string;
  sections: { title: string; text: string }[];
  tips: string[];
};
/** Public videos are embedded from their original pages; editorial articles are maintained in-app. */
export const socialPosts: SocialPost[] = [...featuredPosts];
export function placeMedia(placeId: string) {
  const place = places.find((item) => item.id === placeId);
  const related = socialPosts.filter((post) =>
    post.mentions.some((mention) => mention.placeId === placeId),
  );
  const images = [
    ...(place?.image
      ? [{ src: place.image, source: `${place.name}地点素材` }]
      : []),
    ...related.map((post) => ({
      src: post.cover,
      source: `相关内容《${post.title}》`,
    })),
  ].filter(
    (image, index, all) =>
      image.src && all.findIndex((item) => item.src === image.src) === index,
  );
  return {
    images,
    videos: related.filter(
      (post) => post.kind === 'video' && post.embedUrl && post.sourceUrl,
    ),
  };
}

export type PlaceVisitInfo = {
  introduction: string;
  openingText: string;
  openingStatus: 'official' | 'reference';
  address?: string;
  phones: string[];
  officialUrl?: string;
  ticketUrl?: string;
  ticketNote: string;
  ticketLinkLabel?: string;
  sourceTitle?: string;
  verifiedAt?: string;
  mapUrl: string;
};

const placeIntroductions: Partial<Record<string, string>> = {
  qianling:
    '黔灵山公园把山林、湖泊、寺庙与城市生活连在一起。适合从山门步道慢慢上行，在黔灵湖与林荫路之间安排一段轻松散步；园内野生猕猴较多，请保持距离、不投喂，也不要展示食物。',
  museum:
    '贵州省博物馆适合用一座馆建立对贵州历史、考古与多民族文化的整体认识。室内展陈适合作为雨天或亲子行程，建议先看常设展，再按兴趣选择专题展，给重点展厅预留充足阅读时间。',
  jiaxiu:
    '甲秀楼坐落在南明河上，是认识贵阳城市文脉的一处轻量停靠点。白天适合观察楼阁、石桥与河岸空间，傍晚可连同翠微园、南明河步道和周边街区一起慢游。',
  huangguoshu:
    '黄果树以瀑布群为核心看点，主瀑、水帘洞与多段观瀑步道带来不同距离和角度的水景。景区范围较大，游览时要把接驳、排队与湿滑步道计入时间，雨季尤其需要关注当日开放提示。',
  xijiang:
    '西江千户苗寨沿山谷层叠展开，吊脚楼、风雨桥、田园与夜景共同构成村寨景观。这里也是居民持续生活的社区，建议把观景台之外的时间留给村寨步行、文化讲解与合规的手工体验，并在拍摄人物前先征得同意。',
  xiaoqikong:
    '荔波小七孔以碧水、古桥、瀑布与水上森林串成一条山水游线。经典游览会经过小七孔古桥、拉雅瀑布、六十八级跌水瀑布等区域，景点之间通常需要观光车衔接，建议按入园时段预留半天。',
};

const verifiedPlaceVisitInfo: Partial<
  Record<string, Omit<PlaceVisitInfo, 'introduction' | 'mapUrl'>>
> = {
  museum: {
    openingText:
      '2026 年暑期 09:00–18:00，周六延长至 21:00；周一闭馆（8 月 31 日后以常规公告为准）',
    openingStatus: 'official',
    address: '贵阳市观山湖区林城东路 107 号',
    phones: ['0851-84811809', '0851-84811830'],
    officialUrl: 'https://www.gzmuseum.com/',
    ticketUrl: 'https://gzmuseum.com/gbgg/202606/1406.html',
    ticketNote: '免费参观，须通过官方微信公众号或小程序预约。',
    ticketLinkLabel: '查看官方开放与预约公告',
    sourceTitle: '贵州省博物馆官方公告',
    verifiedAt: '2026-08-29',
  },
  xiaoqikong: {
    openingText: '08:00 开始入园；16:00 停止售票；16:30 停止入园',
    openingStatus: 'official',
    phones: ['0854-3516115', '0854-3516116'],
    officialUrl: 'https://www.liboxiaoqikong.com/',
    ticketUrl: 'https://www.gzstv.com/a/55fd2986cf6c4f168ffc1786a7f47901',
    ticketNote: '须按预约时段入园，票种、优惠与当日余票以景区官方平台为准。',
    ticketLinkLabel: '查看官方开放与预约通告',
    sourceTitle: '荔波樟江风景名胜区管理处通告',
    verifiedAt: '2026-08-29',
  },
  xijiang: {
    openingText: '开放与预约时段以景区官方当日公告为准',
    openingStatus: 'official',
    phones: ['400-153-8866'],
    officialUrl: 'https://www.xjqhmz.com/',
    ticketUrl:
      'https://www.xjqhmz.com/news/detail?id=695976352326721538&type=news-notice',
    ticketNote:
      '官方购票渠道为“西江千户苗寨景区”微信公众号，观光车票另行购买。',
    ticketLinkLabel: '查看官方票务说明',
    sourceTitle: '西江千户苗寨官方网站',
    verifiedAt: '2026-08-29',
  },
};

function hourLabel(hour: number) {
  return `${String(hour).padStart(2, '0')}:00`;
}

export function placeVisitInfo(place: Place): PlaceVisitInfo {
  const verified = verifiedPlaceVisitInfo[place.id];
  const mapParams = new URLSearchParams({
    location: `${place.lat},${place.lng}`,
    title: place.name,
    content: `${place.region} · ${place.category}`,
    output: 'html',
    coord_type: 'gcj02',
    src: 'webapp.openai.ai_qianlv',
  });
  return {
    introduction:
      placeIntroductions[place.id] ??
      `${place.description} 这里以“${place.category}”体验为主，建议结合停留时长、体力与当日现场信息安排访问。`,
    openingText: `${hourLabel(place.hours[0])}–${hourLabel(place.hours[1])}（规划参考，以现场公告为准）`,
    openingStatus: 'reference',
    phones: [],
    ticketNote:
      place.price > 0
        ? `参考 ¥${money(place.price)} / 人；官方票种、优惠与预约入口待核验。`
        : '参考为免费或免门票地点；预约要求与收费项目以官方公告为准。',
    mapUrl: `https://api.map.baidu.com/marker?${mapParams.toString()}`,
    ...verified,
  };
}
export function organizeSocialPosts(postIds: string[]) {
  const selected = [...new Set(postIds)]
    .map((id) => socialPosts.find((p) => p.id === id))
    .filter((p): p is SocialPost => Boolean(p));
  if (!selected.length) throw new Error('请先选择至少一篇内容。');
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
    themes: [...new Set(stops.map((s) => placeById(s.placeId).category))],
  };
}
export const socialStories: Record<string, SocialStory> = {
  ...featuredStories,
};
export const storageKey = 'qianlv-v1';
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
      reason: `${p.region}同区域 · ${placeAttributes[p.id].nature} · 推荐指数 ${score(p, 'normal', preferences).total}`,
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
      reason: '拥堵：调整访问顺序以避开原定到达窗口。道路实况尚未接入。',
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
        (t.travelerProfile !== undefined &&
          !['standard', 'family', 'senior', 'children'].includes(
            t.travelerProfile,
          )) ||
        (t.sourcePostIds !== undefined &&
          (!Array.isArray(t.sourcePostIds) ||
            t.sourcePostIds.some(
              (id) => !socialPosts.some((p) => p.id === id),
            )))
      )
        return null;
      t.preferences = [
        ...new Set(t.preferences.map((p) => legacyThemes[p] ?? p)),
      ];
      if (t.preferences.some((p) => !themes.includes(p))) return null;
      for (const day of t.days) {
        if (day.settings !== undefined && !validDaySettings(day.settings))
          return null;
        if (
          day.guide !== undefined &&
          (!day.guide ||
            typeof day.guide.summary !== 'string' ||
            typeof day.guide.meals !== 'string' ||
            typeof day.guide.stay !== 'string' ||
            !Array.isArray(day.guide.stayCost) ||
            day.guide.stayCost.length !== 2 ||
            day.guide.stayCost.some(
              (value) => !Number.isFinite(value) || value < 0,
            ) ||
            day.guide.stayCost[1] < day.guide.stayCost[0] ||
            !Array.isArray(day.guide.preparation) ||
            day.guide.preparation.some((value) => typeof value !== 'string'))
        )
          return null;
        if (
          !/^\d{4}-\d{2}-\d{2}$/.test(day.date) ||
          Number.isNaN(new Date(day.date + 'T12:00:00').getTime()) ||
          !Array.isArray(day.items) ||
          day.items.some(
            (i) =>
              !places.some((p) => p.id === i.placeId) ||
              !Number.isFinite(i.duration) ||
              i.duration < 15 ||
              (i.plan !== undefined &&
                (!i.plan ||
                  !Number.isInteger(i.plan.earliestStart) ||
                  i.plan.earliestStart < 0 ||
                  i.plan.earliestStart > 1439 ||
                  typeof i.plan.activity !== 'string' ||
                  !Array.isArray(i.plan.tips) ||
                  i.plan.tips.some((tip) => typeof tip !== 'string'))) ||
              (i.transport !== undefined &&
                (!i.transport ||
                  typeof i.transport.fromId !== 'string' ||
                  !['walk', 'transit', 'drive', 'rail'].includes(
                    i.transport.mode,
                  ))),
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

function validDaySettings(settings: DaySettings): boolean {
  if (!settings || typeof settings !== 'object' || Array.isArray(settings))
    return false;
  const ranges: Partial<Record<keyof DaySettings, [number, number]>> = {
    departure: [0, 1439],
    hotelLat: [-90, 90],
    hotelLng: [-180, 180],
    roomPrice: [0, 10000],
    mealMinutes: [15, 120],
    lunchPrice: [0, 1000],
    dinnerPrice: [0, 1000],
    breakfastPrice: [0, 1000],
  };
  for (const [key, range] of Object.entries(ranges)) {
    const value = settings[key as keyof DaySettings];
    if (
      value !== undefined &&
      (typeof value !== 'number' ||
        !Number.isFinite(value) ||
        value < range[0] ||
        value > range[1])
    )
      return false;
  }
  if (settings.departure !== undefined && !Number.isInteger(settings.departure))
    return false;
  if (
    settings.mealMinutes !== undefined &&
    !Number.isInteger(settings.mealMinutes)
  )
    return false;
  if (
    settings.hotelName !== undefined &&
    (typeof settings.hotelName !== 'string' || settings.hotelName.length > 100)
  )
    return false;
  if (
    settings.scenario !== undefined &&
    !['normal', 'rain', 'crowd', 'closed'].includes(settings.scenario)
  )
    return false;
  if (
    settings.includeMeals !== undefined &&
    typeof settings.includeMeals !== 'boolean'
  )
    return false;
  if (
    settings.includeHotel !== undefined &&
    typeof settings.includeHotel !== 'boolean'
  )
    return false;
  if (
    settings.transportModes !== undefined &&
    (!settings.transportModes ||
      typeof settings.transportModes !== 'object' ||
      Array.isArray(settings.transportModes) ||
      Object.entries(settings.transportModes).some(
        ([key, value]) =>
          key.split('>').length !== 2 ||
          !['walk', 'transit', 'drive', 'rail'].includes(value),
      ))
  )
    return false;
  return true;
}
