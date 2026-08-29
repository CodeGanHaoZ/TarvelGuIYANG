import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import {
  organizePlanningMaterial,
  emptyPlanningDraft,
  planningPostFromUrl,
  planningContext,
  resolvePlanningChoice,
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
  createPresetTrip,
  fillEmptyTripWithPreset,
  previousDayConnection,
  placeById,
  copyTripWithNewIds,
  placeMedia,
} from '../lib/travel.ts';
import { createTripFromPlanningMaterial } from '../lib/planning-trip.ts';
import {
  itineraryPresets,
  itineraryPlaces,
} from '../lib/itinerary-fixtures.ts';
import {
  transportOptions,
  selectTransport,
  resolveTransport,
  amapRouteUrl,
  transportCost,
} from '../lib/transport.ts';
import {
  buildDayPlan,
  goScore,
  chooseDayTransport,
  replaceDayPlace,
  dayPlanMarkdown,
  transportForProfile,
} from '../lib/day-plan.ts';

function dailyTestTrip(ids = ['qianling', 'museum']) {
  const trip = initialData().trips[0];
  trip.days[0] = {
    id: 'test-day',
    date: '2026-09-01',
    title: '测试日',
    items: ids.map(makeItem),
  };
  return trip;
}

test('daily plans enrich all six themes and legacy days without changing chosen POIs', () => {
  for (const theme of themes) {
    const trip = makeTrip({
      ...tripCreationDefaults([], theme),
      start: '2026-09-01',
      people: ['我', '家人'],
      budget: 8000,
      pace: '均衡',
    });
    const before = JSON.stringify(trip);
    trip.days.forEach((day, index) => {
      const plan = buildDayPlan(trip, index);
      assert.ok(plan.visits.length);
      assert.equal(plan.visits.length, day.items.length);
      assert.ok(plan.visits.every((v) => v.place.category === theme));
      assert.equal(plan.events[0].kind, 'hotel');
      assert.equal(plan.events.at(-1).kind, 'hotel');
      assert.equal(plan.segments.length, day.items.length + 1);
      for (const meal of ['breakfast', 'lunch', 'dinner'])
        assert.equal(
          plan.events.filter((e) => e.meal === meal).length,
          1,
          `${theme} ${index} ${meal}`,
        );
      assert.ok(plan.events.every((e) => e.end >= e.start));
      assert.equal(
        new Set(plan.events.map((e) => e.key)).size,
        plan.events.length,
      );
      for (const visit of plan.visits) {
        assert.equal(visit.details.length, 3);
        assert.equal(
          visit.details.reduce((n, s) => n + s.minutes, 0),
          visit.item.duration,
        );
        assert.equal(visit.goScore.factors.length, 5);
      }
    });
    assert.equal(JSON.stringify(trip), before);
  }
  const legacy = dailyTestTrip(['tunbao']);
  const plan = buildDayPlan(legacy, 0);
  assert.ok(plan.events.length >= 9);
  assert.equal(plan.visits[0].place.id, 'tunbao');
  assert.ok(!legacy.days[0].settings && !legacy.days[0].guide);
});

test('three-day preset summaries include complete services and consistent per-person totals', () => {
  for (const preset of itineraryPresets) {
    const trip = createPresetTrip(preset.id, {
      start: '2026-09-01',
      people: ['我', '家人'],
      budget: 6000,
    });
    trip.days.forEach((_day, index) => {
      const plan = buildDayPlan(trip, index);
      assert.equal(
        plan.summary.trafficMinutes,
        plan.segments.reduce((n, s) => n + s.option.minutes, 0),
      );
      assert.equal(
        plan.summary.perPerson,
        Math.round(
          Object.values(plan.summary.costs).reduce((a, b) => a + b, 0),
        ),
      );
      assert.ok(
        Number.isFinite(plan.summary.walkingKm) && plan.summary.walkingKm >= 0,
      );
      assert.equal(plan.summary.costs.hotel, index === 2 ? 0 : 120);
      for (const meal of ['breakfast', 'lunch', 'dinner'])
        assert.equal(
          plan.events.filter((e) => e.meal === meal).length,
          1,
          `${preset.id} day${index} ${meal}`,
        );
    });
  }
});

test('extending, reordering, deleting and adding stops recomputes downstream times', () => {
  const trip = dailyTestTrip();
  trip.days[0].settings = {
    includeHotel: false,
    includeMeals: false,
    departure: 540,
  };
  const before = buildDayPlan(trip, 0);
  const extended = structuredClone(trip);
  extended.days[0].items[0].duration += 30;
  const after = buildDayPlan(extended, 0);
  assert.equal(after.visits[1].start, before.visits[1].start + 30);
  assert.equal(after.visits[1].end, before.visits[1].end + 30);
  assert.equal(trip.days[0].items[0].duration, before.visits[0].item.duration);
  extended.days[0].items.reverse();
  assert.equal(buildDayPlan(extended, 0).visits[0].place.id, 'museum');
  extended.days[0].items.pop();
  assert.equal(buildDayPlan(extended, 0).segments.length, 0);
  extended.days[0].items.push(makeItem('jiaxiu'));
  assert.equal(buildDayPlan(extended, 0).segments.length, 1);
});

test('replacement preserves position and clears route choices bound to the old location', () => {
  const trip = dailyTestTrip(),
    day = trip.days[0];
  const [first, second] = day.items;
  first.plan = { earliestStart: 540, activity: '原活动', tips: ['原提示'] };
  day.settings = {
    transportModes: { [`${first.id}>${second.id}`]: 'transit' },
  };
  second.transport = { fromId: first.id, mode: 'transit' };
  const before = JSON.stringify(day);
  const replaced = replaceDayPlace(day, first.id, 'huaxi-park');
  assert.equal(replaced.items[0].id, first.id);
  assert.equal(replaced.items[0].placeId, 'huaxi-park');
  assert.equal(replaced.items[0].plan.earliestStart, 540);
  assert.equal(replaced.items[0].duration, placeById('huaxi-park').duration);
  assert.equal(replaced.items[1].transport, undefined);
  assert.deepEqual(replaced.settings.transportModes, {});
  assert.equal(JSON.stringify(day), before);
  assert.equal(replaceDayPlace(day, first.id, 'museum'), day);
  assert.equal(replaceDayPlace(day, first.id, 'not-a-place'), day);
});

test('hotel and intermediate traffic choices update the same timing and summary model', () => {
  const trip = dailyTestTrip();
  const before = buildDayPlan(trip, 0);
  const between = before.segments.find(
    (s) => s.from.id === 'qianling' && s.to.id === 'museum',
  );
  trip.days[0] = chooseDayTransport(trip.days[0], between, 'transit');
  const after = buildDayPlan(trip, 0);
  assert.equal(
    after.segments.find((s) => s.key === between.key).option.id,
    'transit',
  );
  assert.equal(
    after.summary.trafficMinutes - before.summary.trafficMinutes,
    74 - between.option.minutes,
  );
  const home = after.segments.at(-1);
  assert.equal(home.boundary, 'return');
  assert.match(home.to.id, /^hotel:/);
  assert.ok(
    new URL(amapRouteUrl(home.from, home.to, 'drive')).searchParams
      .get('to')
      .includes(home.to.name),
  );
  assert.equal(chooseDayTransport(trip.days[0], home, 'rail'), trip.days[0]);
});

test('GoScore exposes five factors without endorsing closed or late visits', () => {
  const place = placeById('huangguoshu');
  assert.deepEqual(
    goScore(place).factors.map((f) => f.name),
    ['天气', '人流', '适合你', '交通', '时段适配'],
  );
  for (const scenario of ['normal', 'rain', 'crowd', 'closed']) {
    const result = goScore(place, { scenario });
    assert.ok(result.total >= 0 && result.total <= 100);
    assert.ok(
      result.factors.every((f) => f.value >= 0 && f.value <= 100 && f.note),
    );
  }
  assert.equal(goScore(place, { scenario: 'closed' }).total, 0);
  const late = goScore(place, { start: 1200, end: 1380 });
  assert.ok(late.total <= 45 && late.warnings.length);
  assert.equal(late.factors[4].value, 20);
  assert.ok(
    goScore(placeById('fanjing-hike'), { scenario: 'rain' }).total <= 35,
  );
});

test('family, elder and child profiles adjust intensity, fit and walking time', () => {
  const trip = dailyTestTrip(['fanjing-hike']);
  const normal = buildDayPlan(trip, 0);
  for (const profile of ['family', 'senior', 'children']) {
    const plan = buildDayPlan({ ...trip, travelerProfile: profile }, 0);
    assert.equal(plan.summary.intensity, '特种兵');
    assert.ok(
      plan.visits[0].goScore.factors[2].value <
        normal.visits[0].goScore.factors[2].value,
    );
    assert.ok(plan.summary.stars <= 3);
    assert.ok(plan.summary.warnings.some((w) => w.includes('参与条件')));
    const option = transportOptions(
      placeById('jiaxiu'),
      placeById('qingyun'),
    ).find((o) => o.id === 'walk');
    const adapted = transportForProfile(option, profile);
    assert.ok(adapted.minutes > option.minutes);
    assert.equal(
      adapted.minutes,
      adapted.steps.reduce((sum, step) => sum + step.minutes, 0),
    );
  }
});

test('food POIs replace support meals and disabled services are not charged', () => {
  const trip = dailyTestTrip(['changwang', 'guanshan-food', 'qingyun']);
  trip.days[0].items.forEach(
    (item, i) =>
      (item.plan = {
        earliestStart: [480, 720, 1080][i],
        activity: '用餐',
        tips: [],
      }),
  );
  const plan = buildDayPlan(trip, 0);
  assert.equal(plan.summary.costs.meals, 0);
  assert.equal(plan.events.filter((e) => e.kind === 'meal').length, 0);
  assert.equal(
    plan.summary.costs.places,
    trip.days[0].items.reduce((sum, i) => sum + placeById(i.placeId).price, 0),
  );
  trip.days[0].settings = { includeHotel: false, includeMeals: false };
  const off = buildDayPlan(trip, 0);
  assert.ok(off.events.every((e) => e.kind !== 'hotel' && e.kind !== 'meal'));
  assert.equal(off.summary.costs.hotel, 0);
});

test('room costs divide per person and last day excludes another night', () => {
  const trip = dailyTestTrip(['tunbao']);
  trip.people = ['A', 'B', 'C'];
  trip.days[0].settings = { roomPrice: 300 };
  assert.equal(buildDayPlan(trip, 0).summary.costs.hotel, 200);
  trip.days = trip.days.slice(0, 1);
  assert.equal(buildDayPlan(trip, 0).summary.costs.hotel, 0);
});

test('cross-day transfers start at the previous hotel and lunch precedes late sightseeing', () => {
  const trip = dailyTestTrip(['qingyan']);
  trip.days[1] = {
    id: 'far-day',
    date: '2026-09-02',
    title: '跨城',
    items: [makeItem('xiaoqikong')],
  };
  const previous = buildDayPlan(trip, 0),
    next = buildDayPlan(trip, 1);
  assert.equal(next.segments[0].from.id, previous.segments.at(-1).to.id);
  assert.equal(next.segments[0].crossDay, true);
  assert.ok(
    next.events.find((e) => e.meal === 'lunch').end <= next.visits[0].start,
  );
});

test('day settings roundtrip and corrupt optional data is rejected without breaking legacy storage', () => {
  const data = initialData();
  data.trips[0].travelerProfile = 'family';
  data.trips[0].days[0].settings = {
    departure: 450,
    includeHotel: false,
    includeMeals: true,
    mealMinutes: 50,
    hotelLat: 26.5,
    hotelLng: 106.7,
  };
  const restored = restore(JSON.stringify(data));
  assert.equal(restored.trips[0].travelerProfile, 'family');
  assert.equal(restored.trips[0].days[0].settings.departure, 450);
  assert.ok(restore(JSON.stringify(initialData())));
  for (const bad of [
    { departure: -1 },
    { departure: 1440 },
    { hotelLat: 91 },
    { roomPrice: -1 },
    { includeHotel: 'false' },
    { scenario: 'storm' },
    { mealMinutes: 1 },
    { transportModes: { 'a>b': 'plane' } },
    null,
    [],
  ]) {
    const corrupted = structuredClone(data);
    corrupted.trips[0].days[0].settings = bad;
    assert.equal(restore(JSON.stringify(corrupted)), null, JSON.stringify(bad));
  }
});

test('copying plans remaps hotel and stop bindings and preserves settings', () => {
  const trip = dailyTestTrip();
  const plan = buildDayPlan(trip, 0);
  trip.days[0] = chooseDayTransport(trip.days[0], plan.segments[0], 'drive');
  trip.days[0] = chooseDayTransport(trip.days[0], plan.segments[1], 'transit');
  trip.days[0] = chooseDayTransport(
    trip.days[0],
    plan.segments.at(-1),
    'drive',
  );
  trip.travelerProfile = 'senior';
  const copy = copyTripWithNewIds(trip),
    cloned = buildDayPlan(copy, 0);
  assert.notEqual(copy.days[0].id, trip.days[0].id);
  assert.equal(copy.travelerProfile, 'senior');
  for (const segment of cloned.segments)
    assert.equal(
      copy.days[0].settings.transportModes[segment.key],
      segment.option.id,
    );
  assert.equal(cloned.segments[1].option.id, 'transit');
});

test('empty days stay empty and exported guides use the visible detailed plan', () => {
  const empty = dailyTestTrip([]),
    blank = buildDayPlan(empty, 0);
  assert.equal(blank.events.length, 0);
  assert.equal(blank.summary.stars, 0);
  assert.equal(blank.summary.perPerson, 0);
  assert.equal(blank.summary.intensity, '待规划');
  const trip = dailyTestTrip(['tunbao']),
    plan = buildDayPlan(trip, 0);
  const text = dayPlanMarkdown(plan);
  assert.match(text, /今日行程强度/);
  assert.match(text, /GoScore/);
  assert.match(text, /早餐/);
  assert.match(text, /午餐/);
  assert.match(text, /晚餐/);
  assert.match(text, /返回/);
  assert.match(text, /去高德查询/);
  assert.ok(text.includes(`¥${plan.summary.perPerson}/人`));
});

test('three-day regional presets have detailed, feasible days and independently editable fixtures', () => {
  const before = JSON.stringify(itineraryPresets);
  for (const preset of itineraryPresets) {
    const trip = createPresetTrip(preset.id, {
      start: '2026-08-31',
      people: ['我', '同行人'],
      budget: 3000,
    });
    assert.equal(trip.days.length, 3);
    assert.equal(trip.days[2].date, '2026-09-02');
    for (const day of trip.days) {
      assert.ok(day.items.length >= 3);
      assert.ok(day.guide.summary && day.guide.meals && day.guide.stay);
      assert.ok(day.guide.preparation.length >= 2);
      const scheduled = timeline(day.items);
      assert.ok(
        scheduled.every((stop) => !stop.warning),
        `${preset.id}: ${day.title}`,
      );
      assert.ok(scheduled.at(-1).end <= 22 * 60);
      for (const [i, stop] of scheduled.entries()) {
        assert.equal(stop.place.region, preset.destination);
        assert.ok(stop.item.plan.activity.length > 10);
        assert.ok(stop.item.plan.tips.length);
        assert.ok(stop.start >= stop.item.plan.earliestStart);
        if (i)
          assert.ok(stop.start >= scheduled[i - 1].end + stop.transit.minutes);
      }
    }
    assert.equal(
      new Set(trip.days.flatMap((day) => day.items.map((item) => item.id)))
        .size,
      trip.days.flatMap((day) => day.items).length,
    );
    trip.days[0].guide.preparation.push('local edit');
    trip.days[0].items[0].plan.tips.push('local edit');
  }
  assert.equal(JSON.stringify(itineraryPresets), before);
  for (const place of itineraryPlaces) {
    assert.equal(placeById(place.id), place);
    assert.ok(score(place).total >= 0 && score(place).total <= 100);
  }
});

test('detailed presets are the default for eligible three-day routes but never alter imported selections', () => {
  const options = {
    destination: '荔波',
    start: '2026-08-29',
    dayCount: 3,
    people: ['我'],
    budget: 3000,
    preferences: [],
    pace: '均衡',
  };
  const trip = makeTrip(options);
  assert.ok(
    trip.days.every(
      (day) => day.items.length >= 3 && day.items.every((item) => item.plan),
    ),
  );
  const imported = ['xiaoqikong', 'daqikong', 'yaoshan'];
  const custom = makeTrip(options, imported);
  assert.ok(custom.days.every((day) => day.items.length === 1));
  assert.deepEqual(
    custom.days.flatMap((day) => day.items.map((item) => item.placeId)),
    imported,
  );
  const shortage = makeTrip(options, ['xiaoqikong']);
  assert.equal(shortage.days.flatMap((day) => day.items).length, 1);
  assert.match(shortage.notes, /候选地点或预算不足/);
});

test('filling an empty trip preserves dates and notes and refuses to overwrite a nonempty day', () => {
  const original = initialData().trips[0];
  assert.throws(
    () => fillEmptyTripWithPreset(original, 'libo-three'),
    /不会被覆盖/,
  );
  const empty = {
    ...original,
    notes: '保留我的原笔记',
    days: original.days.map((day) => ({ ...day, items: [] })),
  };
  const before = JSON.stringify(empty);
  const filled = fillEmptyTripWithPreset(empty, 'libo-three');
  assert.equal(filled.id, empty.id);
  assert.equal(filled.destination, '荔波');
  assert.deepEqual(filled.people, empty.people);
  assert.equal(filled.budget, empty.budget);
  assert.deepEqual(
    filled.days.map((d) => [d.id, d.date]),
    empty.days.map((d) => [d.id, d.date]),
  );
  assert.ok(filled.days.every((d) => d.items.length >= 3));
  assert.match(filled.notes, /保留我的原笔记/);
  assert.equal(JSON.stringify(empty), before);
  assert.throws(() => createPresetTrip('invalid', empty), /未找到/);
});

test('transport estimates have consistent steps, unit costs and honest unavailable modes', () => {
  const [a, b] = ['qianling', 'museum'].map(placeById);
  const metro = transportOptions(a, b).find((o) => o.id === 'transit');
  assert.equal(metro.available, true);
  assert.equal(metro.transfers, 1);
  assert.match(metro.summary, /北京路/);
  assert.equal(metro.sources.length, 2);
  for (const pair of [
    [a, b],
    [b, a],
    [a, placeById('xijiang')],
    [placeById('jiaxiu'), placeById('qingyun')],
  ]) {
    for (const option of transportOptions(...pair).filter((o) => o.available)) {
      assert.equal(
        option.minutes,
        option.steps.reduce((sum, step) => sum + step.minutes, 0),
      );
      assert.ok(option.minutes > 0);
      assert.ok(option.km >= 0);
      assert.ok(option.cost[1] >= option.cost[0]);
    }
  }
  const drive = transportOptions(a, b).find((o) => o.id === 'drive');
  assert.deepEqual(
    transportCost(drive, 5),
    drive.cost.map((n) => n * 2),
  );
  assert.deepEqual(
    transportCost(metro, 3),
    metro.cost.map((n) => n * 3),
  );
  const unknown = transportOptions(
    placeById('xiaoqikong'),
    placeById('yaoshan'),
  );
  assert.equal(unknown.find((o) => o.id === 'transit').available, false);
  assert.equal(unknown.find((o) => o.id === 'transit').cost, null);
  assert.ok(
    !transportOptions(a, placeById('xijiang')).some((o) => o.id === 'walk'),
  );
});

test('choosing transport updates timeline and summaries and only binds to that exact leg', () => {
  const items = ['qianling', 'museum', 'jiaxiu'].map(makeItem);
  const before = JSON.stringify(items);
  const updated = selectTransport(
    items,
    items[1].id,
    items[0],
    'transit',
    placeById,
  );
  const rows = timeline(updated);
  assert.equal(rows[1].transit.option.id, 'transit');
  assert.equal(rows[1].transit.minutes, 74);
  assert.equal(
    metrics(updated).minutes,
    rows.reduce((sum, row) => sum + (row.transit?.minutes ?? 0), 0),
  );
  assert.ok(rows[2].start >= rows[1].end + rows[2].transit.minutes);
  assert.equal(JSON.stringify(items), before);
  const reordered = [updated[2], updated[1]];
  assert.notEqual(timeline(reordered)[1].transit.option.id, 'transit');
  assert.equal(
    selectTransport(items, items[2].id, items[0], 'drive', placeById),
    items,
  );
  const unknown = ['xiaoqikong', 'yaoshan'].map(makeItem);
  assert.equal(
    selectTransport(unknown, unknown[1].id, unknown[0], 'transit', placeById),
    unknown,
  );
  assert.ok(
    resolveTransport(placeById('museum'), placeById('jiaxiu')).available,
  );
});

test('cross-city day connections account for transfer time instead of teleporting between days', () => {
  const trip = makeTrip(
    {
      destination: '贵州',
      start: '2026-08-29',
      dayCount: 2,
      people: ['我'],
      preferences: [],
      pace: '均衡',
      budget: 3000,
    },
    ['jiaxiu', 'xijiang'],
  );
  const previous = previousDayConnection(trip, 1);
  assert.equal(previous.id, trip.days[0].items[0].id);
  const items = selectTransport(
    trip.days[1].items,
    trip.days[1].items[0].id,
    previous,
    'rail',
    placeById,
  );
  const rows = timeline(items, previous);
  assert.equal(rows[0].transit.option.id, 'rail');
  assert.ok(rows[0].start >= 8 * 60 + 30 + rows[0].transit.minutes);
  assert.equal(metrics(items, previous).minutes, rows[0].transit.minutes);
  assert.equal(previousDayConnection(trip, 0), undefined);
});

test('map queries encode complete explicit endpoints and valid mode and policy without a key', () => {
  const a = { ...placeById('qianling'), name: '起点 & # 甲' },
    b = placeById('museum');
  const url = new URL(amapRouteUrl(a, b, 'transit', 'transfers'));
  assert.equal(url.origin, 'https://uri.amap.com');
  assert.equal(url.pathname, '/navigation');
  assert.equal(url.searchParams.get('from'), `${a.lng},${a.lat},${a.name}`);
  assert.equal(url.searchParams.get('to'), `${b.lng},${b.lat},${b.name}`);
  assert.equal(url.searchParams.get('mode'), 'bus');
  assert.equal(url.searchParams.get('policy'), '1');
  assert.equal(url.searchParams.has('key'), false);
  assert.equal(
    new URL(amapRouteUrl(a, b, 'walk')).searchParams.get('mode'),
    'walk',
  );
  assert.equal(
    new URL(amapRouteUrl(a, b, 'drive')).searchParams.get('mode'),
    'car',
  );
});

test('copying a shared itinerary remaps incoming route choices to the new item IDs', () => {
  const trip = initialData().trips[0];
  trip.days[0].items = ['qianling', 'museum'].map(makeItem);
  const day = trip.days[0];
  day.items = selectTransport(
    day.items,
    day.items[1].id,
    day.items[0],
    'transit',
    placeById,
  );
  const before = JSON.stringify(trip);
  const copy = copyTripWithNewIds(trip);
  assert.notEqual(copy.id, trip.id);
  assert.notEqual(copy.days[0].items[0].id, day.items[0].id);
  assert.equal(
    copy.days[0].items[1].transport.fromId,
    copy.days[0].items[0].id,
  );
  assert.equal(timeline(copy.days[0].items)[1].transit.option.id, 'transit');
  assert.equal(JSON.stringify(trip), before);
});

test('detailed plans and mode selections survive persistence; corrupt optional fields are rejected', () => {
  const data = initialData();
  const day = data.trips[0].days[0];
  day.items = selectTransport(
    day.items,
    day.items[1].id,
    day.items[0],
    'drive',
    placeById,
  );
  assert.deepEqual(restore(JSON.stringify(data)), data);
  const invalidTime = structuredClone(data);
  invalidTime.trips[0].days[0].items[0].plan.earliestStart = -10;
  assert.equal(restore(JSON.stringify(invalidTime)), null);
  const invalidTransport = structuredClone(data);
  invalidTransport.trips[0].days[0].items[1].transport.mode = 'magic';
  assert.equal(restore(JSON.stringify(invalidTransport)), null);
  const invalidGuide = structuredClone(data);
  invalidGuide.trips[0].days[0].guide.preparation = 'not an array';
  assert.equal(restore(JSON.stringify(invalidGuide)), null);
  const legacy = structuredClone(data);
  legacy.trips[0].days.forEach((d) => {
    delete d.guide;
    d.items.forEach((i) => {
      delete i.plan;
      delete i.transport;
    });
  });
  assert.deepEqual(restore(JSON.stringify(legacy)), legacy);
});

const plannerOrigin = 'http://localhost:3000';
test('planning chat merges text, exact public-video links and screenshot OCR with source evidence', () => {
  const result = organizePlanningMaterial({
    origin: plannerOrigin,
    text: '甲秀楼、黄果树，3天慢游，2个人，预算1500元\nhttps://www.bilibili.com/video/BV1oVLQzbEJg/',
    images: [{ name: '攻略.png', text: '甲 秀 楼\n荔波小\n七孔' }],
  });
  const ids = result.stops.map((stop) => stop.placeId);
  assert.ok(
    ['jiaxiu', 'huangguoshu', 'xiaoqikong', 'qianling', 'changwang'].every(
      (id) => ids.includes(id),
    ),
  );
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(
    result.stops.find((stop) => stop.placeId === 'jiaxiu').sources.length,
    3,
  );
  assert.deepEqual(result.postIds, ['hot-food-video']);
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

test('the last activity choice produces a standardized itinerary without another confirmation', () => {
  const ambiguous = organizePlanningMaterial({
    text: '梵净山和马岭河峡谷，2天，2人',
    origin: plannerOrigin,
  });
  const withView = resolvePlanningChoice(ambiguous, '梵净山', 'fanjing-view');
  assert.equal(withView.choices.length, 1);
  const confirmed = resolvePlanningChoice(
    withView,
    '马岭河峡谷',
    'maling-rafting',
  );
  assert.equal(confirmed.choices.length, 0);
  assert.deepEqual(
    confirmed.stops.map((stop) => stop.placeId),
    ['fanjing-view', 'maling-rafting'],
  );

  const trip = createTripFromPlanningMaterial(
    confirmed.stops.map((stop) => stop.placeId),
    confirmed.postIds,
    planningContext(confirmed),
    '2026-09-01',
  );
  assert.equal(trip.days.length, 2);
  for (let index = 0; index < trip.days.length; index++) {
    const plan = buildDayPlan(trip, index);
    assert.ok(plan.summary.evaluation);
    assert.ok(plan.events.length);
    assert.ok(plan.visits.every((visit) => visit.goScore.factors.length === 5));
  }
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

test('valid planning input creates a complete trip model without a second wizard', () => {
  const draft = organizePlanningMaterial({
    text: '黄果树和天星桥，3天，2人，预算1500元，轻松一点',
    origin: plannerOrigin,
  });
  const ids = draft.stops.map((stop) => stop.placeId);
  const trip = createTripFromPlanningMaterial(
    ids,
    draft.postIds,
    planningContext(draft),
    '2026-09-01',
  );

  assert.equal(trip.start, '2026-09-01');
  assert.equal(trip.days.length, 3);
  assert.deepEqual(trip.people, ['我', '同行人1']);
  assert.equal(trip.budget, 1500);
  assert.equal(trip.pace, '留白');
  assert.deepEqual(
    trip.days.flatMap((day) => day.items.map((item) => item.placeId)),
    ids,
  );
  assert.match(trip.notes, /来自首页 AI 对话框/);
});

test('planning material without a confirmed place never creates an empty trip', () => {
  assert.throws(
    () => createTripFromPlanningMaterial([], [], undefined, '2026-09-01'),
    /还没有可规划的地点/,
  );
  assert.throws(
    () =>
      createTripFromPlanningMaterial(
        ['not-a-place'],
        [],
        undefined,
        '2026-09-01',
      ),
    /没有识别到可用地点/,
  );
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

test('featured feed combines six sourced multi-theme videos with six themed editorial guides', () => {
  const featured = socialPosts.filter((post) => post.featured);
  assert.equal(featured.length, 12);
  assert.equal(new Set(places.map((place) => place.id)).size, places.length);
  assert.equal(
    new Set(socialPosts.map((post) => post.id)).size,
    socialPosts.length,
  );
  const videos = featured.filter((post) => post.kind === 'video');
  const articles = featured.filter((post) => post.kind === 'article');
  assert.equal(videos.length, 6);
  assert.deepEqual(
    articles.map((post) => post.theme).sort((a, b) => a.localeCompare(b)),
    [...themes].sort((a, b) => a.localeCompare(b)),
  );
  for (const post of featured) {
    assert.ok(post.recommendation);
    if (post.kind === 'article')
      assert.ok(existsSync(new URL(`../public${post.cover}`, import.meta.url)));
    const draft = organizeSocialPosts([post.id]);
    assert.ok(draft.stops.length);
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
      trip.days.flatMap((day) => day.items.map((item) => item.placeId)).sort(),
      [...ids].sort(),
    );
    assert.deepEqual(trip.sourcePostIds, [post.id]);
    for (const [dayIndex, day] of trip.days.entries()) {
      if (!day.items.length) continue;
      const plan = buildDayPlan(trip, dayIndex);
      assert.ok(plan.title);
      assert.ok(plan.summary.low < plan.summary.high);
      assert.ok(plan.summary.perPerson >= 0);
      assert.ok(['轻松', '适中', '特种兵'].includes(plan.summary.intensity));
      assert.equal(plan.events[0].kind, 'hotel');
      assert.equal(plan.events.at(-1).kind, 'hotel');
      assert.equal(plan.visits.length, day.items.length);
      assert.ok(
        plan.visits.every((visit) => visit.goScore.factors.length === 5),
      );
      assert.ok(plan.events.some((event) => event.meal === 'lunch'));
      assert.ok(plan.events.some((event) => event.meal === 'dinner'));
    }
    if (post.kind === 'video') {
      const source = new URL(post.sourceUrl);
      const embed = new URL(post.embedUrl);
      assert.equal(source.hostname, 'www.bilibili.com');
      assert.equal(embed.hostname, 'player.bilibili.com');
      const bvid = source.pathname.split('/').filter(Boolean).at(-1);
      assert.equal(embed.searchParams.get('bvid'), bvid);
      assert.ok(post.author);
      assert.match(post.publishedAt, /^20\d{2}-\d{2}-\d{2}$/);
      const categories = new Set(
        draft.stops.map(
          (stop) => places.find((place) => place.id === stop.placeId).category,
        ),
      );
      assert.ok(categories.has('舌尖黔味'));
      assert.ok([...categories].some((category) => category !== '舌尖黔味'));
    }
  }
});

test('place details only surface images and sourced videos that mention that place', () => {
  const media = placeMedia('huangguoshu');
  assert.ok(media.images.length);
  assert.equal(
    new Set(media.images.map((image) => image.src)).size,
    media.images.length,
  );
  assert.ok(media.videos.length);
  for (const video of media.videos) {
    assert.ok(video.embedUrl.startsWith('https://player.bilibili.com/'));
    assert.ok(video.sourceUrl.startsWith('https://www.bilibili.com/video/'));
    assert.ok(
      video.mentions.some((mention) => mention.placeId === 'huangguoshu'),
    );
  }
  assert.deepEqual(placeMedia('not-a-place'), { images: [], videos: [] });
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
  data.savedPostIds = ['hot-nature-video', 'hot-culture-note'];
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
    'hot-nature-video',
    'hot-food-video',
    'hot-nature-video',
  ]);
  assert.deepEqual(result.postIds, ['hot-nature-video', 'hot-food-video']);
  assert.deepEqual(
    result.stops.map((s) => s.placeId),
    [
      'xiaoqikong',
      'huangguoshu',
      'xijiang',
      'jiaxiu',
      'sourfish',
      'siwawa',
      'qianling',
      'changwang',
    ],
  );
  assert.deepEqual(
    result.stops
      .find((s) => s.placeId === 'jiaxiu')
      .sources.map((s) => s.postId),
    ['hot-nature-video', 'hot-food-video'],
  );
  result.stops[0].sources[0].quote = 'changed locally';
  assert.notEqual(
    organizeSocialPosts(['hot-nature-video']).stops[0].sources[0].quote,
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
  const draft = organizeSocialPosts(['hot-food-note']);
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
    organizeSocialPosts(['hot-food-note']).stops.map((s) => s.placeId),
    ['changwang', 'huaxi-noodles', 'qingyun'],
  );
});

test('empty or unknown social selections cannot create a fabricated route', () => {
  assert.throws(() => organizeSocialPosts([]), /选择/);
  assert.throws(() => organizeSocialPosts(['missing']), /选择/);
});

test('low budget filters unaffordable estimated experiences and explains omissions', () => {
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
  migrated.savedPostIds = ['hot-nature-video'];
  migrated.trips[0] = attachTripSources(migrated.trips[0], [
    'hot-nature-video',
    'hot-food-video',
    'hot-nature-video',
    'unknown',
  ]);
  const roundtrip = restore(JSON.stringify(migrated));
  assert.deepEqual(roundtrip.savedPostIds, ['hot-nature-video']);
  assert.deepEqual(roundtrip.trips[0].sourcePostIds, [
    'hot-nature-video',
    'hot-food-video',
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
test('link handler supports source domains, text extraction and manual fallback', async () => {
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
