import type { PlanningContext } from './planning-input.ts';
import {
  attachTripSources,
  makeTrip,
  tripCreationDefaults,
  type Trip,
} from './travel.ts';

function localDate(date = new Date()) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
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
  const ids = [...new Set(placeIds)];
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
      notes: [trip.notes, context?.notes].filter(Boolean).join('\n\n'),
    },
    sourcePostIds,
  );
}
