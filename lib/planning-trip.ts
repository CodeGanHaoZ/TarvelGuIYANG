import type { PlanningContext } from './planning-input.ts';
import {
  attachTripSources,
  makeTrip,
  tripCreationDefaults,
  places,
  socialPosts,
  type SocialPost,
  type Trip,
} from './travel.ts';

function localDate(date = new Date()) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

// Video captions often mention the food concept without naming a mappable POI.
// Add only local fixture food nodes for regions already present in the source.
function enrichVideoStops(placeIds: string[], sourcePostIds: string[]) {
  const videos = sourcePostIds
    .map((id) => socialPosts.find((post) => post.id === id))
    .filter((post): post is SocialPost => post?.kind === 'video');
  if (!videos.length) return placeIds;
  const text = videos.map((post) => `${post.title} ${post.intro}`).join('');
  const next = [...new Set(placeIds)];
  const add = (id: string) => {
    if (!next.includes(id) && places.some((place) => place.id === id))
      next.push(id);
  };
  if (/小七孔|荔波/.test(text)) {
    add('xiaoqikong-food');
    add('libo-nightmeal');
  }
  if (/西江|千户苗寨|苗寨/.test(text)) add('xijiang-dinner');
  return next;
}

/**
 * Turn confirmed planning material into the same editable Trip model used by
 * the itinerary page. Defaults are explicit so a valid submission can open
 * the route immediately without making the user repeat a three-step wizard.
 */
export function createTripFromPlanningMaterial(
  placeIds: string[],
  sourcePostIds: string[] = [],
  context?: PlanningContext,
  start = localDate(),
): Trip {
  const originalIds = [...new Set(placeIds)];
  const ids = enrichVideoStops(originalIds, sourcePostIds);
  const videoEnriched = ids.length > originalIds.length;
  if (!ids.length)
    throw new Error('还没有可规划的地点，请补充具体景点或攻略内容。');

  const defaults = tripCreationDefaults(ids);
  const peopleCount = context?.constraints.peopleCount ?? 1;
  const trip = makeTrip(
    {
      ...defaults,
      start,
      dayCount: context?.constraints.dayCount ?? defaults.dayCount,
      people: Array.from({ length: peopleCount }, (_, index) =>
        index === 0 ? '我' : `同行人${index}`,
      ),
      budget: context?.constraints.budget ?? 3000,
      pace: context?.constraints.pace ?? '均衡',
    },
    ids,
  );
  if (!trip.days.some((day) => day.items.length))
    throw new Error('没有识别到可用地点，请补充具体景点名称后重试。');

  return attachTripSources(
    {
      ...trip,
      notes: [
        trip.notes,
        videoEnriched
          ? '已根据公开视频中出现的区域补充同区域餐饮节点；门店、营业和价格仍需现场核验。'
          : '',
        context?.notes,
      ]
        .filter(Boolean)
        .join('\n\n'),
    },
    sourcePostIds,
  );
}
