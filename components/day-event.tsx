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
  const content = (
    <>
      <span className="event-icon">
        <Icon size={18} />
      </span>
      <span className="event-copy">
        <time>
          {clock(event.start)}
          {event.end > event.start ? ` — ${clock(event.end)}` : ''}
        </time>
        <b>{event.title}</b>
        <small>{event.detail}</small>
        {event.costPerPerson !== undefined && (
          <em>预计 ¥{money(event.costPerPerson)}/人</em>
        )}
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
