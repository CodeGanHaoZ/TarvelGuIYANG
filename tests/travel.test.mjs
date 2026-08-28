import test from 'node:test';
import assert from 'node:assert/strict';
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
} from '../lib/travel.ts';

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
  const recommendations = recommendSocialPlaces(ids, ['民族文化']);
  assert.ok(recommendations.length > 0);
  for (const recommendation of recommendations) {
    const p = places.find((p) => p.id === recommendation.placeId);
    assert.equal(p.region, '贵阳');
    assert.equal(p.category, '民族文化');
    assert.ok(!ids.includes(p.id));
  }
  assert.deepEqual(recommendSocialPlaces([], ['自然景观']), []);
  assert.deepEqual(recommendSocialPlaces(ids, ['红色旅游']), []);
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

test('eight weighted score dimensions produce the expected rounded value', () => {
  assert.equal(
    weights.reduce((a, b) => a + b, 0),
    100,
  );
  for (const p of places) {
    const result = score(p);
    assert.equal(
      result.total,
      Math.round(p.factors.reduce((s, v, i) => s + v * weights[i], 0) / 100),
    );
    assert.ok(result.total >= 0 && result.total <= 100);
  }
  assert.ok(score(places[0], 'rain').total < score(places[0]).total);
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
    preferences: ['民族文化'],
  });
  assert.equal(t.days.length, 3);
  assert.equal(t.days[1].date, '2026-09-01');
  for (const day of t.days) {
    assert.ok(day.items.length <= 2);
    for (const item of day.items) {
      const p = places.find((x) => x.id === item.placeId);
      assert.equal(p.region, '贵阳');
      assert.equal(p.category, '民族文化');
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
  assert.equal(changed.items[0].placeId, 'batik');
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
