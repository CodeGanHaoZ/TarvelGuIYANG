import {
  placeById,
  score,
  clock,
  type Place,
  type Theme,
  type Trip,
  type TripDay,
  type TripItem,
  type TravelerProfile,
  type DaySettings,
} from './travel.ts';
import {
  resolveTransport,
  transportCost,
  transportOptions,
  amapRouteUrl,
  type TransportMode,
  type TransportOption,
} from './transport.ts';

export const travelerProfiles: Record<TravelerProfile, string> = {
  standard: '普通同行',
  family: '亲子家庭',
  senior: '长者同行',
  children: '儿童同行',
};
const profileLimits: Record<
  TravelerProfile,
  { light: number; medium: number; hours: number; speed: number }
> = {
  standard: { light: 5, medium: 9, hours: 9, speed: 1 },
  family: { light: 3.5, medium: 6, hours: 8, speed: 1.2 },
  senior: { light: 3, medium: 5, hours: 7, speed: 1.35 },
  children: { light: 3, medium: 5, hours: 7, speed: 1.3 },
};
const themeTitles: Record<Theme, string> = {
  山水奇观: '自然山水之旅',
  舌尖黔味: '舌尖黔味之旅',
  多彩民族: '民族文化之旅',
  古镇遗韵: '古镇人文之旅',
  野趣户外: '野趣户外之旅',
  红色征程: '红色历史之旅',
};
const walkingByPlace: Record<string, number> = {
  huangguoshu: 5.5,
  tianxing: 4,
  xiaoqikong: 6.5,
  qianling: 3,
  museum: 1.3,
  jiaxiu: 1,
  qingyan: 2.8,
  tunbao: 2.2,
  xijiang: 3.5,
  shuichun: 1,
  zunyi: 1.5,
  'fanjing-view': 3.5,
  'fanjing-hike': 12,
  'maling-view': 3.2,
  'maling-rafting': 1.2,
  'red-army-mountain': 2.5,
  'red-army-street': 1.3,
  daqikong: 3,
  langde: 2.2,
  yaoshan: 2,
};

// Sample in-place activities; no claim of a reserved guide, performance or accessible trail.
const visitActivities: Record<string, string[]> = {
  qianling: [
    '南门核实开放区域，沿平缓步道进入',
    '树林与湖畔观景，不追逐或投喂动物',
    '座椅休息、补水，按体力折返',
  ],
  museum: [
    '核验预约、安检寄存，选定历史展厅',
    '按年代阅读重点展品与文字说明',
    '文创区休息，整理感兴趣的历史线索',
  ],
  jiaxiu: [
    '南明河畔了解甲秀楼的历史背景',
    '沿开放观景区看古建筑和河景',
    '在桥边公共区域拍照，避开通行人流',
  ],
  qingyun: [
    '先看菜单与份量，确定想吃的几家',
    '小份尝试当地小吃，沟通辣度与忌口',
    '饭后慢走，确认返回住宿地的交通',
  ],
  qingyan: [
    '城门外了解军事古镇背景，核对票种',
    '沿开放石板街巷看古建，不额外攀爬',
    '找一处平坦休息点，整理照片后出镇',
  ],
  batik: [
    '在工坊向手艺人了解纹样含义',
    '在指导下体验描样与上蜡，工具操作听从指导',
    '整理作品，确认干燥与取件方式',
  ],
  huangguoshu: [
    '游客中心验票，确认观光车与开放观景段',
    '沿成熟观景线看大瀑布，水帘洞以现场开放为准',
    '休息补水、擦干装备，留时间等景区接驳',
  ],
  tianxing: [
    '查看开放路段，选择适合体力的游览范围',
    '沿水石步道观赏喀斯特景观，不离开栈道',
    '在指定休息区停留，按接驳安排离园',
  ],
  tunbao: [
    '先了解明代军屯背景，辨认石头建筑',
    '沿开放街巷看古建，地戏仅在核实场次后观看',
    '尊重居民生活，向讲解者提问并整理笔记',
  ],
  xijiang: [
    '入口确认接驳，轻装进入村寨',
    '跟随当地讲解了解吊脚楼与苗族日常',
    '经许可拍照，留出坡道休息与返回时间',
  ],
  silver: [
    '听手艺人介绍苗族银饰纹样',
    '在指导下体验允许的基础工序',
    '交流作品与工艺，确认是否可以拍摄传播',
  ],
  sourfish: [
    '核实鱼种、辣度和过敏原，再按人数点单',
    '体验酸汤与配菜，留意份量和饮食忌口',
    '饭后休息补水，不立即赶下一段交通',
  ],
  xiaoqikong: [
    '核验票种与入园方向，按景区安排接驳',
    '在开放栈道看古桥、瀑布和水上森林',
    '中途休息补水，按体力减少步行支线',
  ],
  shuichun: [
    '先由运营方核验开放与参与条件、讲解装备',
    '在专业指导下参与允许的漂流段，不自行下水',
    '更换干衣、补水休息，确认返程接驳',
  ],
  zunyi: [
    '核验预约与开放区域，先看会议历史背景',
    '按展陈顺序阅读史料与人物线索',
    '安静缅怀、整理学习笔记，不喧哗打卡',
  ],
  'fanjing-view': [
    '核实索道、天气与成熟观景段开放',
    '索道接驳后只选适合体力的蘑菇石等观景段',
    '休息后按下行索道安排返回，不改走挑战路线',
  ],
  'fanjing-hike': [
    '运营方核验天气、开放、装备与个人能力',
    '按核定路线和折返时间徒步，中途安排补给',
    '预留足够下撤时间，不凭此演示决定攀登',
  ],
  'maling-view': [
    '入口确认两岸步道开放与水位情况',
    '沿成熟步道看地缝峡谷与瀑布',
    '补水休息，避免靠近湿滑临边',
  ],
  'maling-rafting': [
    '确认合格运营方和适宜参与条件',
    '在指导下使用装备参与已开放漂流',
    '上岸更衣休息，确认接回地点',
  ],
  siwawa: [
    '确认面皮、蘸水配料和个人忌口',
    '按口味卷蔬菜，酸汤与辣椒分开放',
    '小份补点，饭后稍作休息',
  ],
  changwang: [
    '确认是否接受动物内脏，必要时更换餐饮',
    '早餐米面按辣度选择，饮水与休息',
    '轻装出发，确认下一站的开放入口',
  ],
  'huaxi-noodles': [
    '在十字街周边核实实际门店',
    '牛肉粉按份量、辣度与过敏原选择',
    '饭后慢走，准备河岸观景',
  ],
  'danzhai-batik': [
    '先听苗族手艺人讲蜡染的故事',
    '参与允许的描样和基础手作',
    '收尾整理，确认作品带走与传播许可',
  ],
  kala: [
    '经居民同意后了解村寨与鸟笼工艺',
    '向手艺人交流编制过程，不自行使用工具',
    '征询拍照许可，购买与否自行决定',
  ],
  'red-army-mountain': [
    '了解纪念场所礼仪，按体力选择台阶段',
    '安静参观碑刻与纪念设施',
    '在允许的休息区整理历史线索',
  ],
  'red-army-street': [
    '沿街寻找红色文化解读线索',
    '阅读开放展陈，不将普通购物算作参观',
    '整理学习笔记后返回下一站',
  ],
  'huaxi-park': [
    '确认开放河岸，选择平缓的短线',
    '慢看小桥、流水与山体，不下水',
    '座椅休息补水，按体力折返',
  ],
  'guanshan-park': [
    '选择开放湖畔入口与休息点',
    '看湖景与树影，慢行拍照',
    '坐下休息，再前往午餐地点',
  ],
  'guanshan-food': [
    '核实餐馆与菜价，点餐前说明忌口',
    '贵州家常菜小份搭配时蔬',
    '饭后留一点休息，不赶时间',
  ],
  'qingyan-food': [
    '确认真实门店，先问份量与配料',
    '卤猪脚、糕粑稀饭与冰粉按口味搭配',
    '休息后核对离开古镇的交通',
  ],
  'libo-noodles': [
    '早餐店核实开门与配料',
    '米粉与饮水补给，整理景区预约',
    '寄存行李或等候入住',
  ],
  'deng-enming': [
    '核验故居开放与参观规则',
    '阅读人物生平与革命史料',
    '安静交流学习收获，按现场动线离开',
  ],
  'libo-nightmeal': [
    '确认豆花烤鱼的食材与份量',
    '按忌口和辣度用餐',
    '休息并核对次日景区接驳',
  ],
  'xiaoqikong-food': [
    '在东门周边确认实际餐馆与饮水点',
    '午餐与补水，评估下午体力',
    '不适合继续步行时取消下一站',
  ],
  daqikong: [
    '核实天生桥观景段、水位与票种',
    '沿开放步道看峡谷，不进入未开放路线',
    '留时间返回景区出口与候车',
  ],
  yaoshan: [
    '与当地讲解者约定可参观范围',
    '交流瑶族服饰与日常生活',
    '经许可拍照，不进入未受邀的民居',
  ],
  'yaoshan-lunch': [
    '核实农家接待与当日食材',
    '午饭与饮水，避免点过量',
    '休息后再参加手作',
  ],
  'libo-weaving': [
    '听手艺人讲织染纹样的含义',
    '在指导下体验基础织染步骤',
    '整理手作与工具，确认传播许可',
  ],
  'xijiang-dinner': [
    '确认长桌宴接待、菜品与忌口',
    '按自己的习惯用餐，不劝酒',
    '核对夜间回住宿的路线',
  ],
  langde: [
    '先确认村寨接待与讲解安排',
    '交流苗族生活，歌舞仅以实际场次为准',
    '经许可拍照，给居民留出生活空间',
  ],
  'langde-food': [
    '与实际商家确认农家菜内容',
    '腊肉与时蔬按忌口选择',
    '饭后休息，确认回凯里的交通',
  ],
  'danzhai-food': [
    '核实具体门店与返程时间',
    '酸汤与家常菜按人数点餐',
    '整理行李，不压缩进站缓冲',
  ],
};
const fallbackActivities: Record<Theme, string[]> = {
  山水奇观: [
    '入口核验开放与游览范围',
    '沿成熟观景段慢看风景',
    '补水休息并返回开放出口',
  ],
  舌尖黔味: [
    '确认门店、菜单与过敏原',
    '按口味体验特色餐饮',
    '饭后休息、核实下一站交通',
  ],
  多彩民族: [
    '经同意了解当地生活与文化背景',
    '在居民或手艺人指导下互动体验',
    '征询拍摄许可并整理收获',
  ],
  古镇遗韵: [
    '了解古代历史背景与开放范围',
    '慢看古建街巷与史料',
    '尊重居民生活、休息后离开',
  ],
  野趣户外: [
    '由运营方核验开放、装备与个人能力',
    '在指导下参与已开放活动',
    '预留休息、补给与撤回时间',
  ],
  红色征程: [
    '核验预约，了解革命历史背景',
    '安静参观史料与纪念设施',
    '整理学习笔记，遵守场所礼仪',
  ],
};

export function visitDetails(place: Place, duration: number) {
  const labels =
    visitActivities[place.id] ?? fallbackActivities[place.category];
  const first = Math.max(5, Math.round((duration * 0.2) / 5) * 5);
  const last = Math.max(5, Math.round((duration * 0.2) / 5) * 5);
  return labels.map((label, i) => ({
    label,
    minutes: [first, Math.max(5, duration - first - last), last][i],
  }));
}
export function placeWalkingKm(place: Place, duration = place.duration) {
  const base =
    walkingByPlace[place.id] ??
    (place.category === '舌尖黔味' ? 0.2 : place.indoor ? 0.6 : 1.8);
  return (
    Math.round(
      base * Math.min(1.6, Math.max(0.4, duration / place.duration)) * 10,
    ) / 10
  );
}
export type GoScore = {
  total: number;
  label: string;
  level: 'good' | 'medium' | 'low';
  factors: { name: string; value: number; note: string }[];
  warnings: string[];
};
export function goScore(
  place: Place,
  options: {
    preferences?: Theme[];
    profile?: TravelerProfile;
    scenario?: string;
    start?: number;
    end?: number;
    duration?: number;
    travelMinutes?: number;
  } = {},
): GoScore {
  const {
    preferences = [],
    profile = 'standard',
    scenario = 'normal',
    start,
    end,
    duration = place.duration,
    travelMinutes = 0,
  } = options;
  const base = score(place, scenario, preferences);
  const walk = placeWalkingKm(place, duration),
    limit = profileLimits[profile];
  const fit = Math.max(
    15,
    Math.round(
      base.factors[7] -
        (walk > limit.medium ? 35 : walk > limit.light ? 16 : 0) -
        (profile !== 'standard' && place.category === '野趣户外' ? 25 : 0),
    ),
  );
  const time =
    end !== undefined &&
    (end > place.hours[1] * 60 || (start ?? 0) >= place.hours[1] * 60)
      ? 20
      : duration < place.duration * 0.7
        ? 60
        : 94;
  const traffic = Math.max(
    25,
    Math.round(base.factors[3] - Math.max(0, travelMinutes - 45) / 4),
  );
  let total = Math.round(
    base.total * 0.65 + fit * 0.15 + time * 0.12 + traffic * 0.08,
  );
  const warnings = [...base.warnings];
  if (base.total === 0) total = 0;
  if (time === 20) {
    total = Math.min(45, total);
    warnings.push('计划结束时间超出模拟开放时段，请调整顺序或停留。');
  }
  if (profile !== 'standard' && place.category === '野趣户外') {
    total = Math.min(total, 60);
    warnings.push(
      '此玩法有体力或装备要求，不默认适合长者或儿童；先核实参与条件。',
    );
  }
  if (scenario === 'rain' && place.category === '野趣户外')
    total = Math.min(total, 35);
  return {
    total,
    label:
      total >= 88
        ? '强烈推荐'
        : total >= 75
          ? '值得前往'
          : total >= 60
            ? '按需选择'
            : '建议调整',
    level: total >= 88 ? 'good' : total >= 60 ? 'medium' : 'low',
    warnings,
    factors: [
      {
        name: '天气',
        value: base.factors[0],
        note: '当前模拟天气下的适宜程度，高分表示较适宜。',
      },
      {
        name: '人流',
        value: base.factors[1],
        note: '人流舒适度，高分表示较少拥挤；不是实时客流。',
      },
      {
        name: '适合你',
        value: fit,
        note: `按${travelerProfiles[profile]}与所选主题计算，未判断个人健康状况。`,
      },
      { name: '交通', value: traffic, note: '结合到达本地点的交通耗时估算。' },
      {
        name: '时间',
        value: time,
        note: '结合停留长度与模拟营业时段；不是预约可用性。',
      },
    ],
  };
}

export type PlanEvent = {
  key: string;
  kind: 'hotel' | 'meal' | 'rest' | 'transport' | 'visit';
  title: string;
  detail: string;
  start: number;
  end: number;
  costPerPerson?: number;
  segmentKey?: string;
  visitId?: string;
  meal?: 'breakfast' | 'lunch' | 'dinner';
};
export type DaySegment = {
  key: string;
  from: Place;
  to: Place;
  fromId: string;
  toId: string;
  departure: number;
  option: TransportOption;
  crossDay: boolean;
  boundary: 'outbound' | 'return' | null;
};
export type DayVisit = {
  item: TripItem;
  place: Place;
  start: number;
  end: number;
  warning: boolean;
  goScore: GoScore;
  details: ReturnType<typeof visitDetails>;
  eventsBefore: PlanEvent[];
  breaks: PlanEvent[];
  meal?: PlanEvent['meal'];
  transit: {
    minutes: number;
    km: number;
    mode: string;
    option: TransportOption;
  } | null;
};
export type DayPlan = {
  date: string;
  dayNumber: number;
  title: string;
  people: number;
  profile: TravelerProfile;
  settings: Required<DaySettings>;
  events: PlanEvent[];
  visits: DayVisit[];
  afterEvents: PlanEvent[];
  segments: DaySegment[];
  summary: {
    low: number;
    high: number;
    weather: string;
    crowd: string;
    trafficMinutes: number;
    trafficKm: number;
    walkingKm: number;
    visitMinutes: number;
    totalMinutes: number;
    perPerson: number;
    costs: { places: number; meals: number; transport: number; hotel: number };
    intensity: '轻松' | '适中' | '特种兵' | '待规划';
    intensityReason: string;
    stars: number;
    evaluation: string;
    warnings: string[];
  };
};
const hotelBases: Record<string, { lat: number; lng: number; name: string }> = {
  贵阳: { lat: 26.588, lng: 106.714, name: '贵阳喷水池周边 · 示例酒店' },
  安顺: { lat: 26.246, lng: 105.946, name: '安顺市区 · 示例酒店' },
  荔波: { lat: 25.413, lng: 107.883, name: '荔波县城 · 示例酒店' },
  黔东南: { lat: 26.571, lng: 107.981, name: '凯里市区 · 示例酒店' },
  遵义: { lat: 27.686, lng: 106.917, name: '遵义老城 · 示例酒店' },
  铜仁: { lat: 27.864, lng: 108.714, name: '梵净山周边 · 示例酒店' },
  黔西南: { lat: 25.091, lng: 104.904, name: '兴义市区 · 示例酒店' },
};
export function daySettings(day: TripDay): Required<DaySettings> {
  const first = day.items[0] && placeById(day.items[0].placeId);
  const base = hotelBases[first?.region ?? '贵阳'] ?? hotelBases.贵阳;
  return {
    departure: 8 * 60,
    scenario: 'normal',
    hotelName: base.name,
    hotelLat: base.lat,
    hotelLng: base.lng,
    roomPrice: 240,
    mealMinutes: 45,
    lunchPrice: 60,
    dinnerPrice: 70,
    breakfastPrice: 20,
    includeMeals: true,
    includeHotel: true,
    transportModes: {},
    ...day.settings,
  };
}
function hotelPlace(day: TripDay, settings: Required<DaySettings>): Place {
  const anchor = day.items[0]
    ? placeById(day.items[0].placeId)
    : placeById('jiaxiu');
  return {
    ...anchor,
    id: `hotel:${day.id}:${settings.hotelLat},${settings.hotelLng}`,
    name: settings.hotelName,
    lat: settings.hotelLat,
    lng: settings.hotelLng,
    duration: 0,
    price: 0,
    hours: [0, 24],
    indoor: true,
    description: '仅用于演示往返路线，非真实酒店供给。',
  };
}
export function transportForProfile(
  option: TransportOption,
  profile: TravelerProfile,
): TransportOption {
  if (option.id !== 'walk' || profile === 'standard') return option;
  const minutes = Math.ceil(option.minutes * profileLimits[profile].speed);
  return {
    ...option,
    minutes,
    walking: minutes,
    steps: option.steps.map((step, i) =>
      i === 0 ? { ...step, minutes } : step,
    ),
    note: option.note + ' 已按所选同行类型放慢步速。',
  };
}

/** Derive all services without inserting synthetic food/hotels into the user's themed POI list. */
export function buildDayPlan(trip: Trip, index: number): DayPlan {
  const day = trip.days[index],
    settings = daySettings(day),
    profile = trip.travelerProfile ?? 'standard';
  const people = trip.people.length;
  const events: PlanEvent[] = [],
    segments: DaySegment[] = [],
    visits: DayVisit[] = [];
  const hotel = hotelPlace(day, settings);
  let time = settings.departure;
  let previous = settings.includeHotel ? hotel : undefined;
  let previousId = previous?.id ?? '';
  // A different-region previous day needs an explicit transfer, even when today's hotel is elsewhere.
  const lastDay = trip.days[index - 1]?.items.at(-1);
  const prior =
    lastDay &&
    day.items[0] &&
    placeById(lastDay.placeId).region !== placeById(day.items[0].placeId).region
      ? lastDay
      : undefined;
  if (prior) {
    const priorDay = trip.days[index - 1],
      priorSettings = daySettings(priorDay);
    previous = priorSettings.includeHotel
      ? hotelPlace(priorDay, priorSettings)
      : placeById(prior.placeId);
    previousId = priorSettings.includeHotel
      ? `${previous.id}:return`
      : prior.id;
  }
  const doneMeals = new Set<string>();
  let serviceCost = 0;
  const add = (event: PlanEvent) => {
    events.push(event);
    return event;
  };
  const waitUntil = (until: number, title = '自由休息与缓冲') => {
    if (until <= time) return;
    add({
      key: `rest:${events.length}`,
      kind: 'rest',
      title,
      detail: '可在当前位置周边休息、补水；不额外添加景点或未核验交通。',
      start: time,
      end: until,
    });
    time = until;
  };
  const meal = (which: 'breakfast' | 'lunch' | 'dinner', inline = false) => {
    if (!settings.includeMeals || doneMeals.has(which)) return undefined;
    const amount =
      which === 'breakfast'
        ? settings.breakfastPrice
        : which === 'lunch'
          ? settings.lunchPrice
          : settings.dinnerPrice;
    const event = add({
      key: `meal:${which}`,
      kind: 'meal',
      meal: which,
      title:
        which === 'breakfast'
          ? '酒店周边早餐'
          : which === 'lunch'
            ? '午餐与休息'
            : '晚餐与休息',
      detail: `${inline ? '长时游览中途在允许的补给点' : '当前地点周边'}安排，具体门店待确认。先询问辣度、过敏原和份量；餐饮不计作主题景点。`,
      start: time,
      end: time + (which === 'breakfast' ? 30 : settings.mealMinutes),
      costPerPerson: amount,
    });
    doneMeals.add(which);
    serviceCost += amount;
    time = event.end;
    return event;
  };
  const travel = (
    to: Place,
    toId: string,
    boundary: DaySegment['boundary'],
    choice?: TripItem['transport'],
  ) => {
    if (!previous || (previous.id === to.id && previousId === toId))
      return null;
    const key = `${previousId}>${toId}`;
    const mode = settings.transportModes[key];
    let option = resolveTransport(
      previous,
      to,
      mode ? { fromId: previousId, mode } : choice,
      previousId,
    );
    option = transportForProfile(option, profile);
    segments.push({
      key,
      from: previous,
      to,
      fromId: previousId,
      toId,
      departure: time,
      option,
      crossDay: !!prior && visits.length === 0,
      boundary,
    });
    add({
      key: `transport:${key}`,
      kind: 'transport',
      title: `${previous.name} → ${to.name}`,
      detail: `${option.label} · 约${option.km} km · ${option.summary}`,
      start: time,
      end: time + option.minutes,
      segmentKey: key,
    });
    time += option.minutes;
    return {
      minutes: option.minutes,
      km: option.km,
      mode: option.label,
      option,
    };
  };
  if (day.items.length) {
    if (settings.includeHotel || prior)
      add({
        key: 'hotel:start',
        kind: 'hotel',
        title: prior ? `跨城出发 · ${previous!.name}` : settings.hotelName,
        detail: prior
          ? '从上日住宿或最后停留地接续，到达后按今日酒店返程。核对真实住宿和接驳。'
          : '整理行李、核对预约。住宿名称和坐标为示例，可在今日安排中修改。',
        start: time,
        end: time,
      });
    const first = placeById(day.items[0].placeId);
    if (
      !(
        first.category === '舌尖黔味' &&
        Math.max(
          settings.departure,
          first.hours[0] * 60,
          day.items[0].plan?.earliestStart ?? 0,
        ) <
          10 * 60
      )
    )
      meal('breakfast');
  }
  for (let i = 0; i < day.items.length; i++) {
    const item = day.items[i],
      place = placeById(item.placeId),
      before = events.length;
    let mealKind: 'breakfast' | 'lunch' | 'dinner' | undefined;
    const planned = Math.max(
      time,
      item.plan?.earliestStart ?? 0,
      place.hours[0] * 60,
    );
    if (place.category === '舌尖黔味') {
      mealKind =
        planned < 10 * 60
          ? 'breakfast'
          : planned < 16 * 60
            ? 'lunch'
            : 'dinner';
      if (doneMeals.has(mealKind)) mealKind = undefined;
      if (mealKind === 'dinner' && !doneMeals.has('lunch')) {
        waitUntil(Math.max(time, 12 * 60));
        meal('lunch');
      }
    } else {
      if (!doneMeals.has('lunch') && time >= 12 * 60) meal('lunch');
      if (!doneMeals.has('dinner') && time >= 18 * 60) meal('dinner');
    }
    const transit = travel(
      place,
      item.id,
      i === 0 ? 'outbound' : null,
      item.transport,
    );
    const earliest = Math.max(
      place.hours[0] * 60,
      item.plan?.earliestStart ?? 0,
    );
    // Check arrival, not only departure: a long drive must not defer lunch until after sightseeing.
    if (settings.includeMeals && place.category !== '舌尖黔味') {
      if (time >= 12 * 60 && !doneMeals.has('lunch')) meal('lunch');
      if (time >= 18 * 60 && !doneMeals.has('dinner')) meal('dinner');
    }
    // Consume long gaps with useful services, keeping the meal out of transit time.
    if (
      settings.includeMeals &&
      earliest >= 14 * 60 &&
      !doneMeals.has('lunch') &&
      mealKind !== 'lunch'
    ) {
      waitUntil(Math.max(time, 12 * 60));
      meal('lunch');
    }
    waitUntil(earliest, '游览前休息 / 等待开放');
    const start = time,
      breaks: PlanEvent[] = [];
    if (mealKind) doneMeals.add(mealKind);
    if (
      settings.includeMeals &&
      !doneMeals.has('lunch') &&
      start < 13 * 60 &&
      start + item.duration > 14 * 60
    ) {
      time = Math.max(start + 30, 12 * 60 + 30);
      const pause = meal('lunch', true);
      if (pause) breaks.push(pause);
      time = start + item.duration + settings.mealMinutes;
    } else time += item.duration;
    const end = time;
    const result = goScore(place, {
      preferences: trip.preferences,
      profile,
      scenario: settings.scenario,
      start,
      end,
      duration: item.duration,
      travelMinutes: transit?.minutes,
    });
    const visitEvent: PlanEvent = {
      key: `visit:${item.id}`,
      kind: 'visit',
      visitId: item.id,
      ...(mealKind ? { meal: mealKind } : {}),
      title: place.name,
      detail: item.plan?.activity ?? place.description,
      start,
      end,
    };
    // Place the long visit before its in-visit lunch in the export chronology.
    if (breaks.length)
      events.splice(events.length - breaks.length, 0, visitEvent);
    else add(visitEvent);
    visits.push({
      item,
      place,
      start,
      end,
      warning: end > place.hours[1] * 60,
      goScore: result,
      details: visitDetails(place, item.duration),
      eventsBefore: events
        .slice(i === 0 ? 0 : before)
        .filter((e) => e.kind !== 'visit' && !breaks.includes(e)),
      breaks,
      meal: mealKind,
      transit,
    });
    previous = place;
    previousId = item.id;
  }
  const afterStart = events.length;
  if (day.items.length) {
    if (settings.includeMeals && !doneMeals.has('lunch')) {
      waitUntil(Math.max(time, 12 * 60));
      meal('lunch');
    }
    if (settings.includeMeals && !doneMeals.has('dinner')) {
      waitUntil(Math.max(time, 18 * 60));
      meal('dinner');
    }
    if (settings.includeHotel) {
      travel(hotel, `${hotel.id}:return`, 'return');
      add({
        key: 'hotel:return',
        kind: 'hotel',
        title: `返回 ${settings.hotelName}`,
        detail:
          index === trip.days.length - 1
            ? '回酒店取行李或休息；继续住宿可自行预订，车站/机场返程需另查。'
            : '整理次日预约与衣物，按体力决定是否继续活动。没有预订或实际订单。',
        start: time,
        end: time,
      });
    }
  }
  const transportAmount = segments.reduce((sum, segment) => {
    const cost = transportCost(segment.option, people);
    return sum + (cost ? (cost[0] + cost[1]) / 2 : 0);
  }, 0);
  const placeAmount = day.items.reduce(
    (sum, item) => sum + placeById(item.placeId).price,
    0,
  );
  const hotelAmount =
    day.items.length && settings.includeHotel && index < trip.days.length - 1
      ? (settings.roomPrice * Math.ceil(people / 2)) / people
      : 0;
  const walkingKm =
    Math.round(
      (day.items.reduce(
        (sum, item) =>
          sum + placeWalkingKm(placeById(item.placeId), item.duration),
        0,
      ) +
        segments.reduce(
          (sum, segment) =>
            sum +
            (segment.option.id === 'walk'
              ? segment.option.km
              : (segment.option.walking / 60) * 3),
          0,
        )) *
        10,
    ) / 10;
  const trafficMinutes = segments.reduce((sum, s) => sum + s.option.minutes, 0);
  const visitMinutes = day.items.reduce((sum, i) => sum + i.duration, 0);
  const activeHours = (visitMinutes + trafficMinutes) / 60,
    limits = profileLimits[profile];
  const challenge = day.items.some(
    (item) => placeById(item.placeId).category === '野趣户外',
  );
  const intensity = !day.items.length
    ? '待规划'
    : walkingKm > limits.medium ||
        activeHours > limits.hours ||
        (challenge && profile !== 'standard')
      ? '特种兵'
      : walkingKm > limits.light ||
          activeHours > limits.hours * 0.65 ||
          challenge
        ? '适中'
        : '轻松';
  const warnings = visits.flatMap((v) => v.goScore.warnings);
  if (events.some((e) => e.meal === 'lunch' && e.start >= 14 * 60 + 30))
    warnings.push('午餐安排偏晚，请提早出发、缩短交通或调整顺序。');
  if (events.some((e) => e.meal === 'dinner' && e.start >= 20 * 60))
    warnings.push('晚餐安排偏晚，请删减活动或提前用餐。');
  if (intensity === '特种兵')
    warnings.push(
      `对${travelerProfiles[profile]}而言负荷较高，建议删减地点、缩短步行段或增加休息，不代表健康/安全评估。`,
    );
  if (day.items.length && time >= 21 * 60)
    warnings.push('结束较晚，请减少活动并重新核对返程和交通末班。');
  if (
    visits.some((v) => v.place.id === 'museum') &&
    new Date(day.date + 'T12:00:00').getDay() === 1
  )
    warnings.push('今天是周一，请重点核对省博闭馆及节假日公告。');
  const average = visits.length
    ? Math.round(
        visits.reduce((s, v) => s + v.goScore.total, 0) / visits.length,
      )
    : 0;
  const stars = !visits.length
    ? 0
    : settings.scenario === 'closed'
      ? 1
      : Math.min(
          intensity === '特种兵' || warnings.length ? 3 : 5,
          average >= 88 ? 5 : average >= 78 ? 4 : average >= 60 ? 3 : 2,
        );
  const season = Number(day.date.slice(5, 7));
  const low = [0, 3, 5, 9, 13, 17, 20, 22, 22, 19, 14, 9, 5][season] ?? 22;
  const pressure = visits.length
    ? visits.reduce((s, v) => s + v.goScore.factors[1].value, 0) / visits.length
    : 0;
  const categories = [
    ...new Set(day.items.map((i) => placeById(i.placeId).category)),
  ];
  return {
    date: day.date,
    dayNumber: index + 1,
    title: categories.length === 1 ? themeTitles[categories[0]] : day.title,
    profile,
    people,
    settings,
    visits,
    events,
    segments,
    afterEvents: events.slice(afterStart),
    summary: {
      low: settings.scenario === 'rain' ? low - 2 : low,
      high: settings.scenario === 'rain' ? low + 3 : low + 6,
      weather: settings.scenario === 'rain' ? '小雨' : '晴间多云',
      crowd: !visits.length
        ? '待规划'
        : pressure >= 88
          ? '较少'
          : pressure >= 65
            ? '中等'
            : '较多',
      trafficMinutes,
      trafficKm: segments.reduce((s, seg) => s + seg.option.km, 0),
      walkingKm,
      visitMinutes,
      totalMinutes: day.items.length ? time - settings.departure : 0,
      perPerson: Math.round(
        placeAmount + serviceCost + transportAmount / people + hotelAmount,
      ),
      costs: {
        places: placeAmount,
        meals: serviceCost,
        transport: transportAmount / people,
        hotel: hotelAmount,
      },
      intensity,
      intensityReason: `游览${(visitMinutes / 60).toFixed(1)}h · 交通${(trafficMinutes / 60).toFixed(1)}h · 步行约${walkingKm}km。按${travelerProfiles[profile]}的模拟阈值评估，含景区内步行。`,
      stars,
      evaluation: !visits.length
        ? '添加地点后生成评价'
        : stars === 5
          ? '非常适合出游'
          : stars === 4
            ? '适合出游，保留休息'
            : '建议调整后出行',
      warnings: [...new Set(warnings)],
    },
  };
}

export function chooseDayTransport(
  day: TripDay,
  segment: DaySegment,
  mode: TransportMode,
): TripDay {
  if (
    !transportOptions(segment.from, segment.to).some(
      (option) => option.id === mode && option.available,
    )
  )
    return day;
  return {
    ...day,
    settings: {
      ...day.settings,
      transportModes: { ...day.settings?.transportModes, [segment.key]: mode },
    },
  };
}
export function replaceDayPlace(
  day: TripDay,
  itemId: string,
  placeId: string,
): TripDay {
  const found = day.items.find((item) => item.id === itemId);
  const place = placeById(placeId);
  if (
    !found ||
    place.id !== placeId ||
    day.items.some((item) => item.id !== itemId && item.placeId === placeId)
  )
    return day;
  const items = day.items.map((item) =>
    item.id === itemId
      ? {
          id: item.id,
          placeId,
          duration: place.duration,
          ...(item.plan
            ? {
                plan: {
                  earliestStart: item.plan.earliestStart,
                  activity: place.description,
                  tips: [place.tip],
                },
              }
            : {}),
        }
      : item,
  );
  const transportModes = Object.fromEntries(
    Object.entries(day.settings?.transportModes ?? {}).filter(
      ([key]) => !key.split('>').includes(itemId),
    ),
  );
  // Choices bound to this stop's old location must not follow the new one.
  return {
    ...day,
    items: items.map((item) =>
      item.transport?.fromId === itemId
        ? { ...item, transport: undefined }
        : item,
    ),
    settings: { ...day.settings, transportModes },
  };
}

/** The downloadable guide uses the exact same derived plan as the visible timeline. */
export function dayPlanMarkdown(plan: DayPlan): string {
  const s = plan.summary;
  return (
    `## Day ${plan.dayNumber}｜${plan.title} · ${plan.date}\n\n${s.weather} ${s.low}–${s.high}°C · 人流${s.crowd} · 交通${s.trafficMinutes}分钟 · 步行${s.walkingKm}km · 预计¥${s.perPerson}/人\n\n今日行程强度：${s.intensity}（${travelerProfiles[plan.profile]}）\nAI评价：${'★'.repeat(s.stars)} ${s.evaluation} · 全部为规划参考\n\n` +
    plan.events
      .map((event) => {
        let text = `- ${clock(event.start)}${event.end > event.start ? `–${clock(event.end)}` : ''} **${event.title}**：${event.detail}${event.costPerPerson !== undefined ? `；¥${event.costPerPerson}/人` : ''}`;
        const visit = plan.visits.find((v) => v.item.id === event.visitId);
        if (visit)
          text += `\n  GoScore ${visit.goScore.total}分 · ${visit.goScore.label}；${visit.goScore.factors.map((f) => `${f.name} ${f.value}`).join(' / ')}\n${visit.details.map((d) => `  - ${d.label}（${d.minutes}分钟）`).join('\n')}\n  ${visit.goScore.warnings.join('；')}`;
        const segment = plan.segments.find(
          (seg) => seg.key === event.segmentKey,
        );
        if (segment)
          text += `\n  ${segment.option.steps.map((step) => `${step.title}：${step.detail}（${step.minutes}分钟）`).join('；')}\n  [去高德查询](${amapRouteUrl(segment.from, segment.to, segment.option.id)})`;
        return text;
      })
      .join('\n\n') +
    `\n\n注意：${s.warnings.join('；') || '出发前核实开放、预约、天气与实际路线。'}\n费用含已列地点、配套餐饮、所选交通与当晚住宿估算；末日不计房费。未含机场/车站往返、园内接驳与停车，非实时价格或订单。`
  );
}
