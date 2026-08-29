import { places, socialPosts, type Theme } from './travel.ts';

export type PlanningConstraints = {
  dayCount?: number;
  peopleCount?: number;
  budget?: number;
  pace?: string;
};
export type PlanningContext = {
  notes: string;
  constraints: PlanningConstraints;
};
export type PlanningDraft = {
  stops: { placeId: string; sources: string[] }[];
  postIds: string[];
  warnings: string[];
  choices: { name: string; ids: string[] }[];
  constraints: PlanningConstraints;
};
export type ImageText = { name: string; text: string; error?: string };
export const emptyPlanningDraft = (): PlanningDraft => ({
  stops: [],
  postIds: [],
  warnings: [],
  choices: [],
  constraints: {},
});

const aliases: Record<string, string[]> = {
  qianling: ['黔灵山'],
  huangguoshu: ['黄果树'],
  tianxing: ['天星桥'],
  xiaoqikong: ['小七孔'],
  qingyun: ['青云路', '青云市集'],
  sourfish: ['酸汤鱼'],
  siwawa: ['丝娃娃'],
  changwang: ['肠旺面'],
  'huaxi-noodles': ['花溪牛肉粉'],
  batik: ['贵阳蜡染'],
  xijiang: ['西江苗寨', '西江千户苗寨'],
  silver: ['苗乡银饰'],
  'danzhai-batik': ['丹寨蜡染', '丹寨苗族蜡染'],
  kala: ['卡拉村'],
  museum: ['贵州博物馆', '省博物馆'],
  qingyan: ['青岩古镇'],
  tunbao: ['天龙屯堡'],
  shuichun: ['水春河漂流'],
  'fanjing-view': ['梵净山索道', '索道游梵净山'],
  'fanjing-hike': ['梵净山徒步', '徒步梵净山', '梵净山8000级'],
  'maling-view': ['马岭河峡谷观景', '马岭河观景步道'],
  'maling-rafting': ['马岭河峡谷漂流', '马岭河漂流'],
  zunyi: ['遵义会址'],
  'red-army-mountain': ['红军山'],
  'red-army-street': ['遵义红军街'],
};
const activityChoices = [
  { name: '梵净山', ids: ['fanjing-view', 'fanjing-hike'] },
  { name: '马岭河峡谷', ids: ['maling-view', 'maling-rafting'] },
];
const compact = (value: string) =>
  value.normalize('NFKC').replace(/[\s·()（）+]/g, '');
const urlPattern = /https?:\/\/[^\s<>"，。；！）)]+/gi;

/** Resolve only exact fixture links. Never fetch user URLs or invent places for unknown URLs. */
export function planningPostFromUrl(raw: string, origin: string) {
  try {
    const url = new URL(raw);
    if (
      !['http:', 'https:'].includes(url.protocol) ||
      url.username ||
      url.password
    )
      return undefined;
    const host = url.hostname;
    const path = decodeURIComponent(url.pathname).replace(/\/$/, '');
    if (
      url.origin === new URL(origin).origin ||
      url.origin === 'https://ai-qianlv-guizhou.glossy-tern-3827.chatgpt.site'
    ) {
      const id = path.match(/^\/inspiration\/([^/]+)$/)?.[1];
      return socialPosts.find((post) => post.id === id);
    }
    const platform =
      host === 'xiaohongshu.com' || host === 'www.xiaohongshu.com'
        ? '小红书'
        : host === 'douyin.com' || host === 'www.douyin.com'
          ? '抖音'
          : undefined;
    if (!platform) return undefined;
    const id = path.match(/^\/(?:explore|video)\/([^/]+)$/)?.[1];
    return socialPosts.find(
      (post) => post.platform === platform && post.id === id,
    );
  } catch {
    return undefined;
  }
}

function readConstraints(text: string, previous: PlanningConstraints) {
  const numbers: Record<string, number> = {
    一: 1,
    二: 2,
    两: 2,
    三: 3,
    四: 4,
    五: 5,
    六: 6,
    七: 7,
    八: 8,
  };
  const value = (s: string) => numbers[s] ?? Number(s);
  const day = text.match(/(\d+|[一二两三四五六七八])\s*天/)?.[1];
  const people = text.match(/(\d+|[一二两三四五六七八])\s*(?:个)?人/)?.[1];
  const budget = text.match(
    /(?:总预算|预算)\s*(?:为|是|约)?\s*[¥￥]?\s*(\d+)(?:\s*元)?/,
  )?.[1];
  return {
    ...previous,
    ...(day && value(day) >= 1 && value(day) <= 7
      ? { dayCount: value(day) }
      : {}),
    ...(people && value(people) >= 1 && value(people) <= 8
      ? { peopleCount: value(people) }
      : {}),
    ...(budget && Number(budget) >= 100 && Number(budget) <= 100000
      ? { budget: Number(budget) }
      : {}),
    ...(/留白|轻松|慢游/.test(text)
      ? { pace: '留白' }
      : /紧凑|特种兵/.test(text)
        ? { pace: '紧凑' }
        : {}),
  };
}

export function organizePlanningMaterial(
  material: { text: string; images?: ImageText[]; origin: string },
  previous: PlanningDraft = emptyPlanningDraft(),
): PlanningDraft {
  if (material.text.length > 4000)
    throw new Error('文字请控制在 4,000 字以内，可以分次发送。');
  const draft: PlanningDraft = {
    stops: previous.stops.map((stop) => ({
      ...stop,
      sources: [...stop.sources],
    })),
    postIds: [...previous.postIds],
    choices: previous.choices.map((choice) => ({
      ...choice,
      ids: [...choice.ids],
    })),
    constraints: readConstraints(material.text, previous.constraints),
    warnings: [],
  };
  const add = (id: string, source: string) => {
    let stop = draft.stops.find((s) => s.placeId === id);
    if (!stop) {
      stop = { placeId: id, sources: [] };
      draft.stops.push(stop);
    }
    if (!stop.sources.includes(source)) stop.sources.push(source);
  };
  const sources = [
    { name: '你输入的文字', text: material.text, commands: true },
    ...(material.images ?? []).map((image) => ({
      name: `截图「${image.name.slice(0, 80)}」`,
      text: image.text.slice(0, 8000),
      commands: false,
    })),
  ];
  for (const image of material.images ?? []) {
    if (image.error) draft.warnings.push(`${image.name}：${image.error}`);
    else if (!image.text.trim())
      draft.warnings.push(
        `${image.name}：未识别到文字，请补充地点名称。风景照片暂不做地标识别。`,
      );
  }
  for (const source of sources) {
    for (const raw of source.text.match(urlPattern) ?? []) {
      const post = planningPostFromUrl(raw, material.origin);
      if (post) {
        if (!draft.postIds.includes(post.id)) draft.postIds.push(post.id);
        for (const mention of post.mentions)
          add(mention.placeId, `灵感内容《${post.title}》`);
      } else
        draft.warnings.push(
          '有链接暂时无法读取。请粘贴正文或添加攻略截图；已识别的其他内容仍可规划。',
        );
    }
    const withoutUrls = source.text.replace(urlPattern, '');
    const plain = source.commands
      ? withoutUrls
      : withoutUrls.replace(/(?<=[\u3400-\u9fff])\s+(?=[\u3400-\u9fff])/g, '');
    for (const clause of plain.split(/[，,。；;！!？?\n]/)) {
      const text = compact(clause);
      const remove =
        source.commands && /不想去|不去|不要|删除|移除|取消|去掉/.test(text);
      const mentions = places
        .flatMap((place) => {
          const indexes = [place.name, ...(aliases[place.id] ?? [])]
            .map((alias) => text.indexOf(compact(alias)))
            .filter((i) => i >= 0);
          return indexes.length ? [{ place, index: Math.min(...indexes) }] : [];
        })
        .sort((a, b) => a.index - b.index);
      for (const { place } of mentions) {
        if (remove)
          draft.stops = draft.stops.filter((s) => s.placeId !== place.id);
        else add(place.id, `${source.name}：提到「${place.name}」`);
      }
      for (const choice of activityChoices) {
        if (!text.includes(choice.name)) continue;
        const explicit = mentions.some((m) => choice.ids.includes(m.place.id));
        if (remove && !explicit)
          draft.stops = draft.stops.filter(
            (s) => !choice.ids.includes(s.placeId),
          );
        if (remove || explicit)
          draft.choices = draft.choices.filter((c) => c.name !== choice.name);
        else if (!draft.choices.some((c) => c.name === choice.name))
          draft.choices.push(choice);
      }
    }
  }
  if (!draft.stops.length && !draft.choices.length)
    draft.warnings.push(
      '还没有可规划的地点。请补充具体景点名，例如“黄果树瀑布、天星桥”，或点击示例试一试。',
    );
  draft.warnings = [...new Set(draft.warnings)];
  return draft;
}

export function planningThemes(draft: PlanningDraft): Theme[] {
  return [
    ...new Set(
      draft.stops.flatMap((stop) => {
        const place = places.find((p) => p.id === stop.placeId);
        return place ? [place.category] : [];
      }),
    ),
  ];
}

export function planningContext(draft: PlanningDraft): PlanningContext {
  return {
    constraints: { ...draft.constraints },
    notes: [
      '来自首页 AI 对话框的规划素材（本地规则整理；请核验 OCR 与实际出行信息）：',
      ...draft.stops.map(
        (stop) =>
          `${places.find((p) => p.id === stop.placeId)?.name}：${stop.sources.join('；')}`,
      ),
    ]
      .join('\n')
      .slice(0, 3500),
  };
}

export function validatePlanningImage(file: { type: string; size: number }) {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type))
    return '请使用 JPG、PNG 或 WebP 图片。';
  if (!file.size || file.size > 8 * 1024 * 1024)
    return '单张图片须大于 0 且不超过 8 MB。';
  return '';
}
