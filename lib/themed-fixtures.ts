import type { Place, SocialPost, SocialStory, Theme } from './travel';

// User-provided taxonomy; all coordinates, prices, schedules and scores below are 规划参考.
// Activities, not geographic names, are the unit of classification and route extraction.
export const additionalPlaces: Place[] = [
  {
    id: 'fanjing-view',
    locationId: 'fanjing',
    name: '梵净山 · 索道观光线',
    region: '铜仁',
    category: '山水奇观',
    description:
      '索道接驳后，选择成熟观景段看蘑菇石与云海；不包含徒步登山或金顶攀登。',
    lat: 27.905,
    lng: 108.694,
    duration: 180,
    price: 260,
    indoor: false,
    image: '/images/fanjing-view.jpg',
    hours: [8, 17],
    factors: [88, 76, 100, 80, 96, 90, 80, 92],
    tip: '索道也不等于零步行；按体力选择木栈道长度。索道、天气与观景段开放需另行核实。',
  },
  {
    id: 'fanjing-hike',
    locationId: 'fanjing',
    name: '梵净山 · 徒步登山',
    region: '铜仁',
    category: '野趣户外',
    description:
      '以长距离台阶登山为主题的高体力投入样例，与索道观光作为两个独立玩法。',
    lat: 27.895,
    lng: 108.695,
    duration: 480,
    price: 120,
    indoor: false,
    image: '/images/theme-hiking.jpg',
    hours: [7, 17],
    factors: [75, 85, 100, 75, 94, 85, 80, 90],
    tip: '不是低强度观光。需提前核实路线开放、天气和个人能力，安排合适装备与休息；不依据本页估算开展登山。',
  },
  {
    id: 'maling-view',
    locationId: 'maling',
    name: '马岭河峡谷 · 观景步道',
    region: '黔西南',
    category: '山水奇观',
    description: '沿开放的成熟步道观赏峡谷地缝与瀑布群，只看景，不包含漂流。',
    lat: 25.148,
    lng: 104.936,
    duration: 120,
    price: 80,
    indoor: false,
    image: '/images/maling.jpg',
    hours: [8, 17],
    factors: [90, 87, 100, 85, 92, 88, 75, 90],
    tip: '按体力缩短步道游览段；降雨、水位和步道开放情况需提前核验。',
  },
  {
    id: 'maling-rafting',
    locationId: 'maling',
    name: '马岭河峡谷 · 漂流体验',
    region: '黔西南',
    category: '野趣户外',
    description:
      '需要参与、装备与运营安全核验的峡谷漂流候选；不是观景步道。配图仅为峡谷景观。',
    lat: 25.15,
    lng: 104.936,
    duration: 180,
    price: 220,
    indoor: false,
    image: '/images/maling.jpg',
    hours: [9, 16],
    factors: [72, 88, 100, 78, 88, 84, 75, 90],
    tip: '仅作玩法方向展示，未核验真实运营。须由合格运营方判断适宜性、提供装备与指导，恶劣天气不开展。',
  },
  {
    id: 'siwawa',
    name: '贵阳丝娃娃 · 小吃体验',
    region: '贵阳',
    category: '舌尖黔味',
    description: '薄饼、蔬菜丝与酸汤蘸水，按自己的口味组合一份贵州小吃。',
    lat: 26.565,
    lng: 106.715,
    duration: 60,
    price: 45,
    indoor: true,
    image: '/images/theme-food.jpg',
    hours: [11, 21],
    factors: [100, 87, 100, 92, 91, 95, 85, 98],
    tip: '未核验餐饮供给，照片为丝娃娃菜品参考，不代表此处真实门店。询问辣度、折耳根与过敏原。',
  },
  {
    id: 'changwang',
    name: '贵阳肠旺面 · 早餐体验',
    region: '贵阳',
    category: '舌尖黔味',
    description: '从一碗肠旺面开始，了解贵阳早餐的口味与日常。',
    lat: 26.577,
    lng: 106.714,
    duration: 45,
    price: 25,
    indoor: true,
    hours: [7, 14],
    factors: [100, 82, 100, 91, 90, 94, 80, 96],
    tip: '具体门店、营业时段与配料均待核验；不吃动物内脏可在草稿换成其他餐饮点。',
  },
  {
    id: 'huaxi-noodles',
    name: '花溪十字街 · 牛肉粉体验',
    region: '贵阳',
    category: '舌尖黔味',
    description: '以一碗花溪牛肉粉认识贵州米粉，给午饭留一点从容。',
    lat: 26.435,
    lng: 106.674,
    duration: 60,
    price: 30,
    indoor: true,
    hours: [8, 20],
    factors: [100, 85, 100, 82, 92, 94, 80, 95],
    tip: '餐饮场景为规划参考，不指定或背书真实商家；贵阳市区到花溪需要另留交通时间。',
  },
  {
    id: 'danzhai-batik',
    name: '丹寨 · 苗族蜡染交流体验',
    region: '黔东南',
    category: '多彩民族',
    description: '与苗族手艺人交流蜡染纹样，并在指导下体验手作的未核验场景。',
    lat: 26.199,
    lng: 107.801,
    duration: 120,
    price: 128,
    indoor: true,
    image: '/images/danzhai-batik.jpg',
    hours: [9, 17],
    factors: [100, 95, 100, 80, 92, 94, 90, 98],
    tip: '主理人、地址、场次与价格未接入；不能当作已预约的真实项目。',
    culture: '先听纹样故事再动手，拍摄、传播作品或商用前征求手艺人同意。',
  },
  {
    id: 'kala',
    name: '卡拉村 · 鸟笼编制交流',
    region: '黔东南',
    category: '多彩民族',
    description: '在丹寨卡拉村，向当地手艺人了解鸟笼编制的生活与工艺场景。',
    lat: 26.214,
    lng: 107.805,
    duration: 90,
    price: 80,
    indoor: true,
    hours: [9, 17],
    factors: [100, 94, 100, 78, 90, 92, 90, 98],
    tip: '体验供给为规划参考；请以居民意愿和实际接待安排为准。',
    culture: '村寨是居民的日常生活空间，不擅自进入住家或使用工具。',
  },
  {
    id: 'red-army-mountain',
    name: '红军山 · 烈士陵园',
    region: '遵义',
    category: '红色征程',
    description: '将纪念、阅读与缅怀放进遵义的红色历史行程。',
    lat: 27.7,
    lng: 106.924,
    duration: 90,
    price: 0,
    indoor: false,
    hours: [8, 17],
    factors: [90, 91, 100, 87, 94, 91, 90, 96],
    tip: '遵守纪念场所礼仪，台阶步行按个人体力安排；具体开放规则请核实。',
  },
  {
    id: 'red-army-street',
    name: '遵义红军街 · 红色文化漫步',
    region: '遵义',
    category: '红色征程',
    description:
      '以红色文化与历史解读为主的街区漫步，不将普通购物和餐饮重复归入。',
    lat: 27.688,
    lng: 106.916,
    duration: 60,
    price: 0,
    indoor: false,
    hours: [9, 18],
    factors: [91, 84, 100, 92, 88, 90, 88, 94],
    tip: '此条目仅包含红色文化主题；真实讲解、展陈与开放安排待核验。',
  },
];

export const additionalAttributes = {
  'fanjing-view': {
    nature: '索道与成熟观景段 · 纯观光',
    values: [97, 90, 75],
    effort: '索道接驳 · 有步行段',
    weatherSensitive: true,
  },
  'fanjing-hike': {
    nature: '台阶徒步登山 · 体力挑战',
    values: [98, 25, 45],
    effort: '高体力投入 · 需装备与评估',
    weatherSensitive: true,
  },
  'maling-view': {
    nature: '峡谷成熟步道 · 纯观光',
    values: [94, 89, 78],
    effort: '按体力选择观景段',
    weatherSensitive: true,
  },
  'maling-rafting': {
    nature: '峡谷漂流 · 待运营核验',
    values: [95, 45, 55],
    effort: '水上挑战 · 需专业指导',
    weatherSensitive: true,
  },
  siwawa: {
    nature: '地方小吃 · 未核验餐饮场景',
    values: [96, 92, 72],
    effort: '坐姿用餐',
  },
  changwang: {
    nature: '地方早餐 · 未核验餐饮场景',
    values: [95, 96, 65],
    effort: '坐姿用餐',
  },
  'huaxi-noodles': {
    nature: '地方米粉 · 未核验餐饮场景',
    values: [96, 94, 72],
    effort: '坐姿用餐',
  },
  'danzhai-batik': {
    nature: '苗族手艺人交流 · 规划参考',
    values: [96, 98, 88],
    effort: '坐姿手作与交流',
  },
  kala: {
    nature: '苗族村寨手艺交流 · 规划参考',
    values: [95, 95, 86],
    effort: '村落慢行与手作',
  },
  'red-army-mountain': {
    nature: '革命烈士纪念地',
    values: [96, 98, 86],
    effort: '有台阶 · 适中步行',
  },
  'red-army-street': {
    nature: '革命历史文化街区',
    values: [88, 92, 82],
    effort: '短程城市步行',
  },
};

type ContentFixture = {
  id: string;
  theme: Theme;
  kind: 'video' | 'article';
  title: string;
  author: string;
  cover: string;
  likes: string;
  intro: string;
  recommendation: string;
  mentions: SocialPost['mentions'];
  sections: SocialStory['sections'];
  tips: string[];
  sourceUrl?: string;
  embedUrl?: string;
  publishedAt?: string;
  duration?: string;
};

const content: ContentFixture[] = [
  {
    id: 'hot-nature-note',
    theme: '山水奇观',
    kind: 'article',
    title: '只看风景的贵州清单：索道观山，步道观峡谷',
    author: '云朵收集员',
    cover: '/images/fanjing-view.jpg',
    likes: '6,208',
    intro:
      '梵净山索道观光和马岭河观景步道，两种以“看”为主的成熟游览方式；不含登山挑战和漂流。',
    recommendation: '适合优先观景的人，两地相隔较远，短假期可二选一。',
    mentions: [
      {
        placeId: 'fanjing-view',
        quote:
          '梵净山选择索道接驳与成熟观景段，欣赏蘑菇石和云海，不安排徒步登山或金顶攀登。',
      },
      {
        placeId: 'maling-view',
        quote: '马岭河峡谷只走开放观景步道，看地缝与瀑布群，不参加漂流。',
      },
    ],
    sections: [
      {
        title: '梵净山：索道不等于零步行',
        text: '把索道作为减轻长距离爬升的方式，再按体力选择观景段。这个条目明确排除了徒步登山与金顶攀登；索道运行、木栈道与观景点能否到达，仍需核实。',
      },
      {
        title: '马岭河：观景步道不是漂流票',
        text: '本条目只记录成熟游览步道，不包含水上体验。铜仁与黔西南应分天并预留长途交通，也可以只保留一处。季节、水位与开放均会影响体验，不把本页估算作为通行判断。',
      },
    ],
    tips: [
      '低强度是相对路线选择，不保证所有人都轻松。',
      '同名景区的不同玩法有独立地点编号，不会错误合并。',
    ],
  },
  {
    id: 'hot-food-note',
    theme: '舌尖黔味',
    kind: 'article',
    title: '贵阳吃一日：早餐一碗面，午间牛肉粉，夜里逛小吃',
    author: '小满的贵州餐桌',
    cover: '/images/theme-food.jpg',
    likes: '9,415',
    intro:
      '肠旺面、花溪牛肉粉和青云路小吃，按早餐、午餐、晚餐串起贵州味道。封面为丝娃娃菜品示意。',
    recommendation: '适合喜欢地方小吃的人，地点可按忌口和交通删减。',
    mentions: [
      {
        placeId: 'changwang',
        quote: '早餐从贵阳肠旺面开始，不吃内脏可换成其他早餐。',
      },
      {
        placeId: 'huaxi-noodles',
        quote: '午间去花溪十字街尝牛肉粉，预留市区到花溪的交通。',
      },
      {
        placeId: 'qingyun',
        quote: '晚间回到青云路美食街，丝娃娃、豆腐圆子与冰粉按口味选择。',
      },
    ],
    sections: [
      {
        title: '先写下忌口，再做选择',
        text: '辣度、折耳根、动物内脏和过敏原，都是路线里的真实约束。这份站内编辑笔记不指定商家，不提供卫生或过敏安全认证；不合适的一餐可以直接删除。',
      },
      {
        title: '吃饭是地点，也是时间',
        text: '早餐、午餐和夜间小吃不必每站都吃满。地图中的坐标、营业和价格仅作规划参考，真实门店与交通须核实。生成草稿后可以调整停留，或将花溪留到另一日。',
      },
    ],
    tips: [
      '餐饮场景归美食，不因位于某个村寨就重复归入文化。',
      '保留一到两餐也能生成独立行程。',
    ],
  },
  {
    id: 'hot-culture-note',
    theme: '多彩民族',
    kind: 'article',
    title: '丹寨手作慢一日：听蜡染故事，再看卡拉鸟笼',
    author: '蓝染小巷',
    cover: '/images/danzhai-batik.jpg',
    likes: '4,892',
    intro:
      '把与苗族手艺人的交流放在前面。蜡染与鸟笼编制是两个独立文化体验；封面为丹寨蜡染场景参考，具体体验供给为规划参考。',
    recommendation: '同在丹寨周边，适合喜欢手艺、交流与慢节奏的人。',
    mentions: [
      {
        placeId: 'danzhai-batik',
        quote:
          '先在丹寨与苗族手艺人交流纹样，再在指导下体验蜡染；场次为未核验样例。',
      },
      {
        placeId: 'kala',
        quote: '到卡拉村了解鸟笼编制与日常生活，以居民自愿接待为前提。',
      },
    ],
    sections: [
      {
        title: '不是拍完就走的文化体验',
        text: '听制作者讲材料、纹样与生活，再决定是否体验。这里的两项内容都以少数民族居民或手艺人直接互动为核心，所以与古镇观光分开归类。',
      },
      {
        title: '让手作保留原本的语境',
        text: '接待时间、工坊、主理人与价格均未核验。尊重居民作息，不擅自使用工具或传播作品。你可以只选一项，把其余时间留给交流，不用把体验排得过满。',
      },
    ],
    tips: [
      '拍摄人物和传播纹样、作品前先取得同意。',
      '未核验场次不能作为真实预约凭证。',
    ],
  },
  {
    id: 'hot-heritage-note',
    theme: '古镇遗韵',
    kind: 'article',
    title: '青岩到天龙屯堡：两日读懂石墙与军屯故事',
    author: '石巷慢行者',
    cover: '/images/qingyan.jpg',
    likes: '7,032',
    intro:
      '一站看明清古镇，一站听屯堡历史与地戏。按汉族古代军政文化整理，不归入民族村寨体验。',
    recommendation: '适合古建与历史爱好者，贵阳和安顺分别留出游览时间。',
    mentions: [
      {
        placeId: 'qingyan',
        quote:
          '青岩古镇看石墙、老街与军事要塞历史，不把用餐算作同一个文化项目。',
      },
      {
        placeId: 'tunbao',
        quote: '天龙屯堡了解明代军屯、石头建筑与地戏，属于古镇遗韵。',
      },
    ],
    sections: [
      {
        title: '古镇和村寨，各有自己的故事',
        text: '这份笔记关注古代军政、城镇与屯堡生活的历史沉淀。青岩与天龙屯堡不因为有民俗展示，就被自动归入少数民族活态互动。分类依据是具体内容与游览目的。',
      },
      {
        title: '两地分开留白',
        text: '贵阳与安顺之间需要交通，规划建议分日停留。地戏演出是待核验的场次信息，不能保证抵达即有演出；没有合适场次时仍可按开放范围参观历史建筑。',
      },
    ],
    tips: [
      '只参观开放区域，尊重当地居民生活。',
      '餐饮、革命旧址等不同目的应单独建条目。',
    ],
  },
  {
    id: 'hot-outdoor-note',
    theme: '野趣户外',
    kind: 'article',
    title: '想动起来？登山与漂流，先选适合自己的那一种',
    author: '山野慢慢走',
    cover: '/images/maling.jpg',
    likes: '5,716',
    intro:
      '梵净山徒步、马岭河漂流、水春河漂流是三个户外方向，不是必须全走的连续路线。封面仅展示峡谷景观。',
    recommendation:
      '适合先评估体力与运营条件再选择的人，短假期建议只保留一种体验。',
    mentions: [
      {
        placeId: 'fanjing-hike',
        quote:
          '梵净山徒步登山需要较高体力投入，独立留出时间，不与索道观光混为一项。',
      },
      {
        placeId: 'maling-rafting',
        quote:
          '马岭河选的是漂流玩法，必须核验运营、安全指导与装备，不是观景步道。',
      },
      {
        placeId: 'shuichun',
        quote:
          '水春河漂流是另一个区域的户外候选，可与前两项择一，不依据本页估算承诺开漂。',
      },
    ],
    sections: [
      {
        title: '先删掉不适合的，再生成',
        text: '这三项需要不同程度的体力、装备或勇气，也分布在不同区域。草稿会保留每项玩法，你可以删除不合适的方向。没有经验或条件不明时，不因热度高就参加。',
      },
      {
        title: '高分不能代替安全核验',
        text: '漂流需合格运营方提供装备与指导，登山需核实路线、天气和个人能力。闭园会使模拟指数归零，降雨会压低户外建议；这些规则仍不构成真实安全许可，也不指导进入未开发路线。',
      },
    ],
    tips: [
      '户外活动须先核实年龄、健康与能力等实际限制。',
      '同地的观光与挑战保留独立编号，合并内容时不会互相替代。',
    ],
  },
  {
    id: 'hot-red-note',
    theme: '红色征程',
    kind: 'article',
    title: '遵义一日历史笔记：会址、红军街与红军山',
    author: '行走的历史笔记',
    cover: '/images/theme-history.jpg',
    likes: '6,451',
    intro:
      '把重要会议的历史解读、街区红色文化与烈士纪念放在同一天，留时间阅读与缅怀。',
    recommendation: '同在遵义城区，适合以革命历史学习为核心的慢行计划。',
    mentions: [
      {
        placeId: 'zunyi',
        quote: '从遵义会议会址开始了解历史转折，具体展陈和讲解请提前核实。',
      },
      {
        placeId: 'red-army-street',
        quote: '沿红军街继续红色文化主题漫步，此条目不包含购物和餐饮。',
      },
      {
        placeId: 'red-army-mountain',
        quote: '最后去红军山缅怀先烈，台阶与停留按自身条件安排。',
      },
    ],
    sections: [
      {
        title: '先读懂，再继续走',
        text: '会址、街区与陵园承担不同的参访内容，但都围绕革命历史。它们因此归入红色征程，不与古代古镇或民族村寨混在同一类。',
      },
      {
        title: '给纪念地一段安静时间',
        text: '在展陈前停留、阅读，在纪念地遵守礼仪。本页按同城点位生成路线，真实预约、闭馆日、交通和开放规则仍需核验。可以删去一站，把时间留给讲解。',
      },
    ],
    tips: [
      '保持纪念场所秩序，按现场要求拍摄。',
      '不将站内编辑笔记当作官方史料或讲解。',
    ],
  },
];

const publicVideoContent = [
  {
    id: 'hot-nature-video',
    theme: '山水奇观' as Theme,
    bvid: 'BV1n6421f7ei',
    title:
      '贵州VLOG｜6天5夜，美食景点两不误：小七孔、黄果树、千户苗寨与贵阳味道',
    author: '逢坂鱼鱼',
    cover:
      'https://i1.hdslb.com/bfs/archive/8faae609bf0c84abf8de0b92b2db3f5ec311870d.jpg',
    publishedAt: '2024-07-15',
    duration: '10:17',
    intro:
      '原视频同时记录小七孔、黄果树、西江千户苗寨、甲秀楼，以及烙锅、酸汤牛肉、冰浆和丝娃娃等贵州味道。',
    recommendation:
      '适合从一条综合旅行记录中同时提取山水、民族村寨、城市散步与用餐候选。',
    mentions: [
      { placeId: 'xiaoqikong', quote: '来源标题明确提到荔波小七孔。' },
      { placeId: 'huangguoshu', quote: '来源标题明确提到黄果树瀑布。' },
      { placeId: 'xijiang', quote: '来源标题明确提到千户苗寨写真。' },
      { placeId: 'jiaxiu', quote: '来源标题明确提到甲秀楼。' },
      {
        placeId: 'sourfish',
        quote: '来源标题明确提到酸汤牛肉；规划时以酸汤类用餐候选承接，可替换。',
      },
      { placeId: 'siwawa', quote: '来源标题明确提到丝娃娃。' },
    ],
  },
  {
    id: 'hot-food-video',
    theme: '舌尖黔味' as Theme,
    bvid: 'BV1oVLQzbEJg',
    title: '贵州四天三晚｜烙锅、糯米饭、肠旺面，也去甲秀楼、黄果树和小七孔',
    author: '雪小叮',
    cover:
      'https://i0.hdslb.com/bfs/archive/66c41cbafa2464d8b2d911f5f63e5a360d6f6e1d.jpg',
    publishedAt: '2025-04-26',
    duration: '07:41',
    intro:
      '原视频按四天记录贵阳、安顺与荔波：城市建筑、瀑布、山水公园与多餐贵州美食交替出现。',
    recommendation:
      '适合希望把“吃什么”与“去哪看”一起排进日程的人，餐饮不再只是行程备注。',
    mentions: [
      { placeId: 'jiaxiu', quote: '来源简介 Day 1 明确提到甲秀楼。' },
      {
        placeId: 'huangguoshu',
        quote: '来源简介 Day 2 明确提到黄果树瀑布。',
      },
      {
        placeId: 'xiaoqikong',
        quote: '来源简介 Day 3 明确提到荔波小七孔。',
      },
      { placeId: 'qianling', quote: '来源简介 Day 4 明确提到黔灵山公园。' },
      { placeId: 'changwang', quote: '来源标题与简介明确提到肠旺面。' },
    ],
  },
  {
    id: 'hot-culture-video',
    theme: '多彩民族' as Theme,
    bvid: 'BV1se41197nE',
    title: '贵阳4天3夜｜肇兴侗寨、蜡染与苗族服装，也有酸汤、烙锅和城市漫步',
    author: '思然missy',
    cover:
      'https://i2.hdslb.com/bfs/archive/0fcffaf5bdcc49dd9682264f12bba13b6a6f71c5.jpg',
    publishedAt: '2023-10-28',
    duration: '09:53',
    intro:
      '原视频把侗寨、蜡染、苗族服装、甲秀楼与多种贵州小吃放在同一趟四天三夜旅行中。',
    recommendation:
      '适合文化互动与美食并重的旅行；未在地点库中精确对应的内容不会被强行生成。',
    mentions: [
      { placeId: 'jiaxiu', quote: '来源标题明确提到甲秀楼与 city walk。' },
      {
        placeId: 'batik',
        quote: '来源标题明确提到蜡染；具体工坊需自行核验后替换。',
      },
      { placeId: 'sourfish', quote: '来源标题明确提到酸汤鱼。' },
      {
        placeId: 'qingyun',
        quote: '来源标题列出多种贵州小吃；青云路作为可替换的市区用餐落点。',
      },
    ],
  },
  {
    id: 'hot-heritage-video',
    theme: '古镇遗韵' as Theme,
    bvid: 'BV11ouszXEXB',
    title: '贵州5天4夜｜黄果树、青岩古镇、小七孔与贵州味道',
    author: '奇奇的解忧杂货铺',
    cover:
      'https://i2.hdslb.com/bfs/archive/fb6943b8e842cdde5a6ee96d9cbb9038904d49ab.jpg',
    publishedAt: '2025-07-16',
    duration: '10:28',
    intro:
      '原视频同时记录黄果树、小七孔、青岩古镇及贵州火锅和小吃，景色、人文与饮食都有完整段落。',
    recommendation:
      '适合自然与古镇兼顾的五日路线，并为景区步行强度留出调整空间。',
    mentions: [
      {
        placeId: 'huangguoshu',
        quote: '来源标题与简介明确提到黄果树瀑布。',
      },
      { placeId: 'qingyan', quote: '来源标题与简介明确提到青岩古镇。' },
      {
        placeId: 'xiaoqikong',
        quote: '来源标题与简介明确提到荔波小七孔。',
      },
      {
        placeId: 'qingyun',
        quote: '来源简介提到贵州火锅与小吃；青云路作为可替换的市区用餐落点。',
      },
    ],
  },
  {
    id: 'hot-outdoor-video',
    theme: '野趣户外' as Theme,
    bvid: 'BV1e2ebzVEpa',
    title: '贵州自由行攻略｜小七孔、黄果树、漂流与贵阳美食交通',
    author: 'YaCherry',
    cover:
      'https://i1.hdslb.com/bfs/archive/818681ca5c37b6c7b9ddf32d813b916d2ef8e336.jpg',
    publishedAt: '2025-08-22',
    duration: '06:34',
    intro:
      '原视频把小七孔、黄果树、漂流、贵阳美食与交通放在同一份自由行攻略中，内容维度完整。',
    recommendation:
      '适合想把观光与户外体验组合的人；漂流项目须在确认运营方和具体河段后再加入。',
    mentions: [
      { placeId: 'xiaoqikong', quote: '来源标题明确提到小七孔。' },
      { placeId: 'huangguoshu', quote: '来源标题明确提到黄果树。' },
      {
        placeId: 'qingyun',
        quote: '来源标题明确提到贵阳美食；青云路作为可替换的市区用餐落点。',
      },
      {
        placeId: 'shuichun',
        quote:
          '来源标题提到漂流但未写明河段；水春河只作为待核验、可删除的户外候选。',
      },
    ],
  },
  {
    id: 'hot-red-video',
    theme: '多彩民族' as Theme,
    bvid: 'BV1BmxLzdEfK',
    title: '贵州美景美食｜小七孔、千户苗寨、黄果树、蜡染与红酸汤火锅',
    author: '蓼汀非花溆',
    cover:
      'https://i1.hdslb.com/bfs/archive/0a5c797f4cb4b6117338b9fdc10f3db6365eb3a6.jpg',
    publishedAt: '2025-10-06',
    duration: '16:07',
    intro:
      '原视频同时覆盖自然景观、苗寨与蜡染、贵阳市区、博物馆，以及红酸汤火锅和贵州米粉。',
    recommendation:
      '适合从一条内容里生成山水、文化、城市和美食都完整的多日行程。',
    mentions: [
      {
        placeId: 'huangguoshu',
        quote: '来源标题与简介明确提到黄果树瀑布。',
      },
      {
        placeId: 'xiaoqikong',
        quote: '来源标题与简介明确提到荔波小七孔。',
      },
      { placeId: 'xijiang', quote: '来源标题与简介明确提到千户苗寨。' },
      {
        placeId: 'batik',
        quote: '来源标题与简介明确提到蜡染、扎染体验；具体工坊需核验。',
      },
      { placeId: 'qingyun', quote: '来源标题明确提到青云市集。' },
      { placeId: 'sourfish', quote: '来源标题明确提到红酸汤火锅。' },
    ],
  },
].map(
  (entry): ContentFixture => ({
    ...entry,
    kind: 'video',
    likes: '',
    sourceUrl: `https://www.bilibili.com/video/${entry.bvid}/`,
    embedUrl: `https://player.bilibili.com/player.html?bvid=${entry.bvid}&page=1&high_quality=1&danmaku=0`,
    sections: [
      {
        title: '一条视频里，同时有景色、在地体验与味道',
        text: entry.intro,
      },
      {
        title: '从公开内容生成可修改的行程',
        text: `${entry.recommendation} 应用只提取来源页能够说明、且地点库能够对应的内容；短视频转场不代表实际距离，跨区域内容会分日安排。`,
      },
    ],
    tips: [
      '播放器与视频版权归原平台及原作者，页面只嵌入公开内容。',
      '票务、开放、营业和交通需要按真实日期再次核验。',
    ],
  }),
);

const featuredContent = [
  ...publicVideoContent,
  ...content.filter((entry) => entry.kind === 'article'),
];

export const featuredPosts: SocialPost[] = featuredContent.map((entry) => ({
  id: entry.id,
  platform: entry.kind === 'video' ? 'B站' : '站内',
  kind: entry.kind,
  theme: entry.theme,
  featured: true,
  title: entry.title,
  author: entry.kind === 'video' ? entry.author : 'AI 黔驴编辑部',
  cover: entry.cover,
  likes: entry.kind === 'video' ? '' : entry.likes,
  intro: entry.intro,
  tags: [entry.theme, '贵州旅行'],
  recommendation: entry.recommendation,
  mentions: entry.mentions,
  ...(entry.sourceUrl
    ? {
        sourceUrl: entry.sourceUrl,
        embedUrl: entry.embedUrl,
        publishedAt: entry.publishedAt,
        duration: entry.duration,
      }
    : {}),
}));

export const featuredStories: Record<string, SocialStory> = Object.fromEntries(
  featuredContent.map((entry) => [
    entry.id,
    {
      readTime:
        entry.kind === 'video'
          ? `${entry.duration} 原视频 · 2 分钟阅读`
          : '3 分钟阅读',
      sections: entry.sections,
      tips: entry.tips,
    },
  ]),
);
