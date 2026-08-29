import { clock, money } from '@/lib/travel';
import type { PlanEvent } from '@/lib/day-plan';
import {
  BedDouble,
  Utensils,
  Clock,
  Route,
  ChevronRight,
} from '@/components/travel-icons';

export function DayEvent({
  event,
  onTransport,
}: {
  event: PlanEvent;
  onTransport: (key: string) => void;
}) {
  const Icon =
    event.kind === 'hotel'
      ? BedDouble
      : event.kind === 'meal'
        ? Utensils
        : event.kind === 'transport'
          ? Route
          : Clock;
  const duration = event.end > event.start ? event.end - event.start : 0;
  const metric =
    event.kind === 'transport' && duration
      ? `预计 ${Math.round(duration / 60)} 分钟`
      : event.costPerPerson !== undefined
        ? `人均 ¥${money(event.costPerPerson)}`
        : undefined;
  const content = (
    <>
      <span className="event-time-column">
        <time>{clock(event.start)}</time>
        {duration > 0 && <small>{clock(event.end)}</small>}
      </span>
      <span className="event-icon">
        <Icon size={18} />
      </span>
      <span className="event-copy">
        <b>
          {event.kind === 'visit' ? '📍 ' : ''}
          {event.title}
        </b>
        <small>{event.detail}</small>
        {metric && <em>{metric}</em>}
      </span>
      {event.kind === 'transport' && (
        <span className="event-query">
          出行方案
          <ChevronRight size={14} />
        </span>
      )}
    </>
  );
  return event.kind === 'transport' ? (
    <button
      className="day-event transport-event"
      onClick={() => onTransport(event.segmentKey!)}
      aria-label={`查询${event.title}的出行方案`}
    >
      {content}
    </button>
  ) : (
    <div className={`day-event ${event.kind}-event`}>{content}</div>
  );
}
