import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import {
  organizePlanningMaterial,
  emptyPlanningDraft,
  planningPostFromUrl,
  planningContext,
  validatePlanningImage,
} from '../lib/planning-input.ts';
import {
  initialData,
  restore,
  places,
  weights,
  score,
  makeTrip,
  makeItem,
  metrics,
  optimize,
  timeline,
  dateAfter,
  splitExpenses,
  parseGuide,
  replan,
  organizeSocialPosts,
  recommendSocialPlaces,
  recommendationProfiles,
  placeAttributes,
  attachTripSources,
  socialPosts,
  socialStories,
  themes,
  planningWarnings,
  suggestedTripDays,
  tripCreationDefaults,
} from '../lib/travel.ts';

const plannerOrigin = 'http://localhost:3000';
test('planning chat merges text, exact demo links and screenshot OCR with source evidence', () => {
  const result = organizePlanningMaterial({
    origin: plannerOrigin,
    text: '甲秀楼、黄果树，3天慢游，2个人，预算1500元\nhttps://www.xiaohongshu.com/explore/xhs-guiyang',
    images: [{ name: '攻略.png', text: '甲 秀 楼\n荔波小\n七孔' }],
  });
  const ids = result.stops.map((stop) => stop.placeId);
  assert.ok(
    ['jiaxiu', 'qingyun', 'batik', 'huangguoshu', 'xiaoqikong'].every((id) =>
      ids.includes(id),
    ),
  );
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(
    result.stops.find((stop) => stop.placeId === 'jiaxiu').sources.length,
    3,
  );
  assert.deepEqual(result.postIds, ['xhs-guiyang']);
  assert.deepEqual(result.constraints, {
    dayCount: 3,
    peopleCount: 2,
    budget: 1500,
    pace: '留白',
  });
  const context = planningContext(result);
  assert.match(context.notes, /截图「攻略.png」/);
  assert.deepEqual(context.constraints, result.constraints);
});

test('planning conversation adds and removes places without mutating earlier replies', () => {
  const first = organizePlanningMaterial({
    text: '甲秀楼和青岩古镇',
    origin: plannerOrigin,
  });
  const second = organizePlanningMaterial(
    { text: '不去甲秀楼，再加黄果树，预算2000', origin: plannerOrigin },
    first,
  );
  assert.deepEqual(
    first.stops.map((stop) => stop.placeId),
    ['jiaxiu', 'qingyan'],
  );
  assert.deepEqual(
    second.stops.map((stop) => stop.placeId),
    ['qingyan', 'huangguoshu'],
  );
  assert.equal(second.constraints.budget, 2000);
  assert.deepEqual(emptyPlanningDraft().stops, []);
});

test('unqualified geographic names ask for activity choice instead of mixing categories', () => {
  const ambiguous = organizePlanningMaterial({
    text: '梵净山和马岭河峡谷',
    origin: plannerOrigin,
  });
  assert.equal(ambiguous.stops.length, 0);
  assert.equal(ambiguous.choices.length, 2);
  const clarified = organizePlanningMaterial(
    { text: '梵净山索道观光，马岭河峡谷漂流', origin: plannerOrigin },
    ambiguous,
  );
  assert.equal(clarified.choices.length, 0);
  assert.deepEqual(
    clarified.stops.map((stop) => stop.placeId),
    ['fanjing-view', 'maling-rafting'],
  );
  const removed = organizePlanningMaterial(
    { text: '不去梵净山', origin: plannerOrigin },
    clarified,
  );
  assert.deepEqual(
    removed.stops.map((stop) => stop.placeId),
    ['maling-rafting'],
  );
});

test('unknown and spoofed links never manufacture an unrelated itinerary', () => {
  for (const url of [
    'https://www.xiaohongshu.com/explore/unknown-id',
    'https://www.xiaohongshu.com.attacker.test/explore/xhs-guiyang',
    'http://169.254.169.254/latest/meta-data',
    'https://attacker.test/黄果树',
    'https://user:pass@www.xiaohongshu.com/explore/xhs-guiyang',
  ]) {
    assert.equal(planningPostFromUrl(url, plannerOrigin), undefined);
    const result = organizePlanningMaterial({
      text: url,
      origin: plannerOrigin,
    });
    assert.equal(result.stops.length, 0);
    assert.ok(result.warnings.some((warning) => warning.includes('无法读取')));
  }
  assert.equal(
    planningPostFromUrl(
      plannerOrigin + '/inspiration/hot-nature-video',
      plannerOrigin,
    ).id,
    'hot-nature-video',
  );
  const withText = organizePlanningMaterial({
    text: 'https://xhslink.com/unknown 另外想去甲秀楼',
    origin: plannerOrigin,
  });
  assert.deepEqual(
    withText.stops.map((stop) => stop.placeId),
    ['jiaxiu'],
  );
});

test('image errors and unrecognized content stay actionable and do not invent destinations', () => {
  const result = organizePlanningMaterial({
    text: '',
    origin: plannerOrigin,
    images: [
      { name: '风景.jpg', text: '' },
      { name: '坏图.png', text: '', error: '无法解码' },
    ],
  });
  assert.equal(result.stops.length, 0);
  assert.ok(
    result.warnings.some((warning) => warning.includes('不做地标识别')),
  );
  assert.ok(result.warnings.some((warning) => warning.includes('无法解码')));
  assert.ok(validatePlanningImage({ type: 'image/svg+xml', size: 100 }));
  assert.ok(
    validatePlanningImage({ type: 'image/jpeg', size: 9 * 1024 * 1024 }),
  );
  assert.ok(validatePlanningImage({ type: 'image/png', size: 0 }));
  assert.equal(validatePlanningImage({ type: 'image/png', size: 1024 }), '');
  assert.throws(
    () =>
      organizePlanningMaterial({
        text: 'a'.repeat(4001),
        origin: plannerOrigin,
      }),
    /4,000/,
  );
  assert.deepEqual(
    organizePlanningMaterial({
      text: '12天，20人，预算1000000',
      origin: plannerOrigin,
    }).constraints,
    {},
  );
});

test('confirmed chat content generates editable day routes with the selected places only', () => {
  const draft = organizePlanningMaterial({
    text: '黄果树和天星桥，2人，预算1500元',
    origin: plannerOrigin,
  });
  const ids = draft.stops.map((stop) => stop.placeId);
  const trip = makeTrip(
    {
      ...tripCreationDefaults(ids),
      start: '2026-09-01',
      people: ['我', '同行人1'],
      budget: draft.constraints.budget,
      pace: '均衡',
    },
    ids,
  );
  assert.deepEqual(
    trip.days.flatMap((day) => day.items.map((item) => item.placeId)),
    ids,
  );
  trip.days[0].items.pop();
  assert.equal(draft.stops.length, 2);
});

test('all six theme entries produce nonempty, category-specific daily routes from their defaults', () => {
  for (const theme of themes) {
    const defaults = tripCreationDefaults([], theme);
    const trip = makeTrip({
      ...defaults,
      start: '2026-08-31',
      people: ['我', '小夏'],
      budget: 3000,
      pace: '均衡',
    });
    assert.deepEqual(trip.preferences, [theme]);
    assert.ok(trip.title.includes(theme));
    assert.equal(trip.sourcePostIds, undefined);
    const ids = trip.days.flatMap((day, i) => {
      assert.ok(
        day.items.length,
        `${theme} day ${i + 1} should contain a route`,
      );
      assert.equal(day.date, dateAfter('2026-08-31', i));
      assert.ok(day.title.includes(theme));
      assert.ok(timeline(day.items).every((stop) => !stop.warning));
      return day.items.map((item) => {
        const place = places.find((p) => p.id === item.placeId);
        assert.equal(place.category, theme);
        assert.equal(place.region, defaults.destination);
        return place.id;
      });
    });
    assert.equal(new Set(ids).size, ids.length);
    assert.deepEqual(
      [...ids].sort(),
      places
        .filter(
          (p) => p.category === theme && p.region === defaults.destination,
        )
        .map((p) => p.id)
        .sort(),
    );
    if (theme === '野趣户外') assert.match(trip.notes, /不代表安全许可/);
  }
});

test('theme creation stays independent from imported content and generic creation', () => {
  const imported = [
    'fanjing-hike',
    'fanjing-view',
    'maling-view',
    'maling-rafting',
  ];
  const fromPost = tripCreationDefaults([...imported, imported[0], 'unknown']);
  assert.equal(fromPost.dayCount, suggestedTripDays(imported));
  assert.equal(fromPost.destination, '贵州');
  assert.deepEqual(fromPost.preferences, ['野趣户外', '山水奇观']);
  const fromTheme = tripCreationDefaults(imported, '红色征程');
  assert.equal(fromTheme.destination, '遵义');
  assert.deepEqual(fromTheme.preferences, ['红色征程']);
  fromTheme.preferences.push('山水奇观');
  assert.deepEqual(tripCreationDefaults([], '红色征程').preferences, [
    '红色征程',
  ]);
  assert.deepEqual(tripCreationDefaults(), {
    destination: '贵州',
    dayCount: 3,
    preferences: [],
  });
});

test('theme route defaults can be customized before generation', () => {
  const options = {
    ...tripCreationDefaults([], '山水奇观'),
    destination: '荔波',
    dayCount: 2,
    start: '2026-09-15',
    people: ['我'],
    budget: 500,
    pace: '留白',
  };
  const trip = makeTrip(options);
  assert.equal(trip.days.length, 2);
  assert.equal(trip.days[0].date, '2026-09-15');
  assert.deepEqual(
    trip.days[0].items.map((item) => item.placeId),
    ['xiaoqikong'],
  );
  assert.equal(trip.pace, '留白');
  assert.equal(trip.budget, 500);
  const changedTheme = makeTrip({ ...options, preferences: ['野趣户外'] });
  assert.deepEqual(
    changedTheme.days[0].items.map((item) => item.placeId),
    ['shuichun'],
  );
  assert.match(changedTheme.notes, /不代表安全许可/);
});

test('featured feed covers all six themes with a video and article without mixing activity categories', () => {
  const featured = socialPosts.filter((post) => post.featured);
  assert.equal(featured.length, 12);
  assert.equal(new Set(places.map((place) => place.id)).size, places.length);
  assert.equal(
    new Set(socialPosts.map((post) => post.id)).size,
    socialPosts.length,
  );
  for (const theme of themes) {
    const entries = featured.filter((post) => post.theme === theme);
    assert.deepEqual(entries.map((post) => post.kind).sort(), [
      'article',
      'video',
    ]);
    for (const post of entries) {
      assert.ok(post.recommendation);
      assert.ok(existsSync(new URL(`../public${post.cover}`, import.meta.url)));
      const draft = organizeSocialPosts([post.id]);
      assert.ok(draft.stops.length);
      for (const stop of draft.stops)
        assert.equal(places.find((p) => p.id === stop.placeId).category, theme);
      const ids = draft.stops.map((stop) => stop.placeId);
      const trip = attachTripSources(
        makeTrip(
          {
            destination: '贵州',
            start: '2026-09-01',
            dayCount: suggestedTripDays(ids),
            people: ['我'],
            budget: 5000,
            pace: '均衡',
            preferences: draft.themes,
          },
          ids,
        ),
        [post.id],
      );
      assert.deepEqual(
        trip.days
          .flatMap((day) => day.items.map((item) => item.placeId))
          .sort(),
        [...ids].sort(),
      );
      assert.deepEqual(trip.sourcePostIds, [post.id]);
      if (post.kind === 'video') {
        assert.ok(
          existsSync(new URL(`../public${post.media}`, import.meta.url)),
        );
        const captions = readFileSync(
          new URL(`../public${post.captions}`, import.meta.url),
          'utf8',
        );
        assert.match(captions, /^WEBVTT/);
        for (const mention of post.mentions)
          assert.ok(captions.includes(`00:${mention.at}.000`));
      }
    }
  }
});

test('same geographic location keeps sightseeing and outdoor activities separate through extraction and planning', () => {
  const draft = organizeSocialPosts(['hot-nature-note', 'hot-outdoor-note']);
  const ids = draft.stops.map((stop) => stop.placeId);
  for (const pair of [
    ['fanjing-view', 'fanjing-hike'],
    ['maling-view', 'maling-rafting'],
  ]) {
    const [view, activity] = pair.map((id) => places.find((p) => p.id === id));
    assert.equal(view.locationId, activity.locationId);
    assert.equal(view.category, '山水奇观');
    assert.equal(activity.category, '野趣户外');
    assert.ok(pair.every((id) => ids.includes(id)));
  }
  assert.ok(
    planningWarnings(ids).some((warning) => warning.includes('同地不同玩法')),
  );
  assert.equal(suggestedTripDays(ids), 5);
  const trip = makeTrip(
    {
      destination: '贵州',
      start: '2026-09-01',
      dayCount: 5,
      people: ['我'],
      budget: 5000,
      pace: '均衡',
      preferences: draft.themes,
    },
    ids,
  );
  assert.equal(trip.days.flatMap((day) => day.items).length, ids.length);
  for (const day of trip.days) {
    const locations = day.items
      .map((item) => places.find((p) => p.id === item.placeId).locationId)
      .filter(Boolean);
    assert.equal(new Set(locations).size, locations.length);
  }
  assert.deepEqual(
    places
      .filter((p) => ['qingyan', 'tunbao'].includes(p.id))
      .map((p) => p.category),
    ['古镇遗韵', '古镇遗韵'],
  );
  assert.equal(places.find((p) => p.id === 'sourfish').category, '舌尖黔味');
  assert.equal(places.find((p) => p.id === 'xijiang').category, '多彩民族');
});

test('renamed themes migrate existing trips and feed preferences without losing source material', () => {
  const data = initialData();
  data.trips[0].preferences = ['自然景观', '身体力行', '经典路线'];
  data.feed[0].trip.preferences = ['民族文化', '美食体验', '红色旅游'];
  data.savedPostIds = ['dy-guizhou', 'xhs-miao'];
  const migrated = restore(JSON.stringify(data));
  assert.deepEqual(migrated.trips[0].preferences, [
    '山水奇观',
    '野趣户外',
    '古镇遗韵',
  ]);
  assert.deepEqual(migrated.feed[0].trip.preferences, [
    '多彩民族',
    '舌尖黔味',
    '红色征程',
  ]);
  assert.deepEqual(migrated.savedPostIds, data.savedPostIds);
  assert.deepEqual(migrated.trips[0].days, data.trips[0].days);
});

test('social extraction merges overlapping posts while retaining ordered source evidence', () => {
  const result = organizeSocialPosts([
    'dy-guizhou',
    'xhs-guiyang',
    'dy-guizhou',
  ]);
  assert.deepEqual(result.postIds, ['dy-guizhou', 'xhs-guiyang']);
  assert.deepEqual(
    result.stops.map((s) => s.placeId),
    ['xiaoqikong', 'xijiang', 'jiaxiu', 'qingyun', 'batik'],
  );
  assert.deepEqual(
    result.stops
      .find((s) => s.placeId === 'jiaxiu')
      .sources.map((s) => s.postId),
    ['dy-guizhou', 'xhs-guiyang'],
  );
  assert.equal(result.stops[0].sources[0].at, '00:00');
  result.stops[0].sources[0].quote = 'changed locally';
  assert.notEqual(
    organizeSocialPosts(['dy-guizhou']).stops[0].sources[0].quote,
    'changed locally',
  );
});

test('social recommendations stay in selected regions, respect preferences and exclude chosen stops', () => {
  const ids = ['jiaxiu', 'qingyun'];
  const recommendations = recommendSocialPlaces(ids, ['多彩民族']);
  assert.ok(recommendations.length > 0);
  for (const recommendation of recommendations) {
    const p = places.find((p) => p.id === recommendation.placeId);
    assert.equal(p.region, '贵阳');
    assert.equal(p.category, '多彩民族');
    assert.ok(!ids.includes(p.id));
  }
  assert.deepEqual(recommendSocialPlaces([], ['山水奇观']), []);
  assert.deepEqual(recommendSocialPlaces(ids, ['红色征程']), []);
});

test('customized social draft carries edits into a separately editable trip', () => {
  const draft = organizeSocialPosts(['xhs-guiyang']);
  const edited = [
    'museum',
    ...draft.stops.filter((s) => s.placeId === 'qingyun').map((s) => s.placeId),
  ];
  const trip = makeTrip(
    {
      destination: '贵阳',
      start: '2026-09-01',
      dayCount: 1,
      people: ['我'],
      budget: 1000,
      pace: '均衡',
      preferences: [],
    },
    edited,
  );
  assert.deepEqual(
    trip.days[0].items.map((i) => i.placeId),
    ['museum', 'qingyun'],
  );
  trip.days[0].items.reverse();
  assert.deepEqual(
    organizeSocialPosts(['xhs-guiyang']).stops.map((s) => s.placeId),
    ['jiaxiu', 'qingyun', 'batik'],
  );
});

test('empty or unknown social selections cannot create a fabricated route', () => {
  assert.throws(() => organizeSocialPosts([]), /选择/);
  assert.throws(() => organizeSocialPosts(['missing']), /选择/);
});

test('low budget filters unaffordable mock experiences and explains omissions', () => {
  const t = makeTrip({
    destination: '贵州',
    start: '2026-08-29',
    dayCount: 3,
    people: ['我', '朋友'],
    budget: 100,
    pace: '均衡',
    preferences: [],
  });
  const cost = t.days
    .flatMap((d) => d.items)
    .reduce(
      (sum, item) => sum + places.find((p) => p.id === item.placeId).price * 2,
      0,
    );
  assert.ok(cost <= 100);
  assert.match(t.notes, /超出预算/);
});

test('invalid persisted dates or participants are rejected', () => {
  const d = initialData();
  d.trips[0].days[0].date = '2026-99-99';
  assert.equal(restore(JSON.stringify(d)), null);
  const other = initialData();
  other.trips[0].people = [''];
  assert.equal(restore(JSON.stringify(other)), null);
});

test('category recommendation combines eight travel factors with place-specific cultural traits', () => {
  assert.equal(
    weights.reduce((a, b) => a + b, 0),
    100,
  );
  for (const p of places) {
    const result = score(p);
    assert.equal(
      result.profile.weights.reduce((sum, value) => sum + value, 0),
      100,
    );
    const context =
      result.factors.reduce((s, v, i) => s + v * result.profile.weights[i], 0) /
      100;
    const specialty =
      placeAttributes[p.id].values.reduce(
        (s, v, i) => s + v * result.profile.specialtyWeights[i],
        0,
      ) / 100;
    assert.equal(result.total, Math.round(context * 0.7 + specialty * 0.3));
    assert.ok(result.total >= 0 && result.total <= 100);
  }
  assert.ok(score(places[0], 'rain').total < score(places[0]).total);
  assert.equal(score(places.find((p) => p.id === 'museum')).total, 90);
  assert.equal(score(places.find((p) => p.id === 'qingyun')).total, 86);
  assert.ok(
    recommendationProfiles['山水奇观'].weights[0] >
      recommendationProfiles['舌尖黔味'].weights[0],
  );
});

test('closure and weather-sensitive activities cannot be recommended by unrelated high factors', () => {
  for (const p of places) {
    const closed = score(p, 'closed');
    assert.equal(closed.total, 0);
    assert.equal(closed.label, '暂缓选择');
    assert.ok(closed.warnings.length);
  }
  const water = places.find((p) => p.id === 'shuichun');
  assert.ok(score(water, 'rain').total <= 35);
  const waterfall = places.find((p) => p.id === 'huangguoshu');
  assert.ok(score(waterfall, 'rain').total <= 60);
  const indoor = places.find((p) => p.id === 'museum');
  assert.equal(score(indoor, 'rain').total, score(indoor).total);
});

test('preference contribution changes scores without rewriting place fixtures', () => {
  const food = places.find((p) => p.id === 'qingyun');
  const before = [...food.factors];
  const matched = score(food, 'normal', ['舌尖黔味']);
  const unmatched = score(food, 'normal', ['山水奇观']);
  assert.ok(matched.total > score(food).total);
  assert.ok(score(food).total > unmatched.total);
  assert.deepEqual(food.factors, before);
});

test('saved source materials migrate without losing older trips and survive persistence', () => {
  const old = initialData();
  delete old.savedPostIds;
  const migrated = restore(JSON.stringify(old));
  assert.deepEqual(migrated.savedPostIds, []);
  assert.deepEqual(migrated.trips, old.trips);
  migrated.savedPostIds = ['dy-guizhou'];
  migrated.trips[0] = attachTripSources(migrated.trips[0], [
    'dy-guizhou',
    'xhs-guiyang',
    'dy-guizhou',
    'unknown',
  ]);
  const roundtrip = restore(JSON.stringify(migrated));
  assert.deepEqual(roundtrip.savedPostIds, ['dy-guizhou']);
  assert.deepEqual(roundtrip.trips[0].sourcePostIds, [
    'dy-guizhou',
    'xhs-guiyang',
  ]);
  assert.equal(old.trips[0].sourcePostIds, undefined);
  migrated.savedPostIds = ['unknown'];
  assert.equal(restore(JSON.stringify(migrated)), null);
});

test('every source record has full content and all referenced places can be scored', () => {
  for (const post of socialPosts) {
    assert.ok(socialStories[post.id].sections.length >= 2);
    assert.ok(socialStories[post.id].tips.length > 0);
    for (const mention of post.mentions)
      assert.ok(
        Number.isFinite(
          score(places.find((p) => p.id === mention.placeId)).total,
        ),
      );
  }
});
test('date arithmetic crosses month and year boundaries without UTC shifts', () => {
  assert.equal(dateAfter('2026-08-31', 1), '2026-09-01');
  assert.equal(dateAfter('2026-12-31', 1), '2027-01-01');
});
test('trip creation respects region, selected preferences and requested day count', () => {
  const t = makeTrip({
    destination: '贵阳',
    start: '2026-08-31',
    dayCount: 3,
    people: ['我'],
    budget: 2000,
    pace: '留白',
    preferences: ['多彩民族'],
  });
  assert.equal(t.days.length, 3);
  assert.equal(t.days[1].date, '2026-09-01');
  for (const day of t.days) {
    assert.ok(day.items.length <= 2);
    for (const item of day.items) {
      const p = places.find((x) => x.id === item.placeId);
      assert.equal(p.region, '贵阳');
      assert.equal(p.category, '多彩民族');
    }
  }
  const ids = t.days.flatMap((d) => d.items.map((i) => i.placeId));
  assert.equal(ids.length, new Set(ids).size);
});
test('imported destinations are deduplicated and preserve only valid IDs', () => {
  const t = makeTrip(
    {
      destination: '贵州',
      start: '2026-08-29',
      dayCount: 2,
      people: ['我'],
      budget: 3000,
      pace: '均衡',
      preferences: [],
    },
    ['jiaxiu', 'jiaxiu', 'museum', 'bad-id'],
  );
  assert.deepEqual(
    t.days.flatMap((d) => d.items.map((i) => i.placeId)).sort(),
    ['jiaxiu', 'museum'],
  );
});
test('optimization keeps the first stop, all IDs, and never increases modeled travel', () => {
  const items = ['qianling', 'qingyan', 'museum', 'qingyun', 'jiaxiu'].map(
    makeItem,
  );
  const original = JSON.stringify(items);
  const result = optimize(items);
  assert.equal(result[0].id, items[0].id);
  assert.deepEqual(
    result.map((i) => i.id).sort(),
    items.map((i) => i.id).sort(),
  );
  assert.ok(metrics(result).minutes <= metrics(items).minutes);
  assert.equal(JSON.stringify(items), original);
  assert.deepEqual(optimize([]), []);
});
test('large route optimization terminates with each stop exactly once', () => {
  const items = places.slice(0, 10).map((p) => makeItem(p.id));
  const result = optimize(items);
  assert.equal(result.length, 10);
  assert.equal(new Set(result.map((i) => i.id)).size, 10);
  assert.ok(metrics(result).minutes <= metrics(items).minutes);
});
test('timeline accounts for opening hours, transit, duration and conflicts', () => {
  const items = [makeItem('museum'), { ...makeItem('qingyan'), duration: 600 }];
  const rows = timeline(items);
  assert.equal(rows[0].start, 9 * 60);
  assert.equal(rows[0].end, 9 * 60 + 100);
  assert.ok(rows[1].start >= rows[0].end + rows[1].transit.minutes);
  assert.equal(rows[1].warning, true);
});
test('budget settlement handles unequal payments and exact cents', () => {
  const expenses = [
    { id: 'a', tripId: 't', title: '餐饮', amount: 100, payer: '我' },
  ];
  const r = splitExpenses(expenses, ['我', '甲', '乙']);
  assert.equal(r.total, 100);
  assert.deepEqual(
    r.balances.map((b) => b.owed),
    [33.34, 33.33, 33.33],
  );
  assert.deepEqual(r.transfers, [
    { from: '甲', to: '我', amount: 33.33 },
    { from: '乙', to: '我', amount: 33.33 },
  ]);
  assert.equal(splitExpenses([], ['我']).transfers.length, 0);
});
test('rain replacement stays in region and avoids duplicated indoor places', () => {
  const items = ['qianling', 'museum', 'jiaxiu'].map(makeItem);
  const changed = replan(items, 'rain');
  const replacement = places.find((p) => p.id === changed.items[0].placeId);
  assert.equal(replacement.indoor, true);
  assert.equal(replacement.region, '贵阳');
  assert.ok(!items.some((item) => item.placeId === replacement.id));
  assert.equal(new Set(changed.items.map((i) => i.placeId)).size, 3);
  assert.equal(items[0].placeId, 'qianling');
});
test('closures with no indoor alternative leave honest free time', () => {
  const result = replan([makeItem('huangguoshu')], 'closed');
  assert.equal(result.items.length, 0);
  assert.match(result.reason, /无可用室内候选/);
  const indoor = [makeItem('museum')];
  assert.deepEqual(replan(indoor, 'rain').items, indoor);
});
test('local persistence roundtrips and rejects corrupt or unknown data', () => {
  const d = initialData();
  assert.deepEqual(restore(JSON.stringify(d)), d);
  assert.equal(restore('{'), null);
  assert.equal(restore('{"version":2}'), null);
  d.trips[0].days[0].items[0].placeId = 'unknown';
  assert.equal(restore(JSON.stringify(d)), null);
});
test('link mock handles supported domain, text extraction and manual fallback', async () => {
  assert.ok(
    (await parseGuide('https://www.xiaohongshu.com/explore/demo')).length > 0,
  );
  assert.deepEqual(await parseGuide('想去甲秀楼，甲秀楼和贵州省博物馆'), [
    'museum',
    'jiaxiu',
  ]);
  await assert.rejects(
    parseGuide('https://xiaohongshu.com.attacker.test/a'),
    /暂不支持/,
  );
  await assert.rejects(parseGuide('没有认识的地点'), /没有识别到/);
  await assert.rejects(parseGuide(''), /请先粘贴/);
});
