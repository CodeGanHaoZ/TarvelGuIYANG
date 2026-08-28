import {
  placeById,
  timeline,
  money,
  type TripDay,
  type TripItem,
} from '@/lib/travel';
import { transportCost } from '@/lib/transport';
import { BedDouble, Utensils, CheckCircle2 } from '@/components/travel-icons';

export function DayBrief({
  day,
  previous,
  people,
}: {
  day: TripDay;
  previous?: TripItem;
  people: number;
}) {
  if (!day.items.length) return null;
  const admission = day.items.reduce(
    (sum, i) => sum + placeById(i.placeId).price * people,
    0,
  );
  const traffic = timeline(day.items, previous).reduce(
    (sum, row) => {
      const cost = row.transit
        ? transportCost(row.transit.option, people)
        : null;
      return cost ? [sum[0] + cost[0], sum[1] + cost[1]] : sum;
    },
    [0, 0],
  );
  const rooms = Math.ceil(people / 2);
  const stay = day.guide?.stayCost;
  return (
    <section className="day-brief" aria-label="当天安排与预算">
      <h3>今天这样玩</h3>
      <p>
        {day.guide?.summary ?? '按顺序游览，每站均可修改停留、调换顺序或删除。'}
      </p>
      <div className="day-budget">
        <div>
          <small>已列门票 / 餐饮 / 体验</small>
          <b>¥{money(admission)}</b>
        </div>
        <div>
          <small>已选交通 · {people}人</small>
          <b>
            ¥{money(traffic[0])}–{money(traffic[1])}
          </b>
        </div>
        {stay && (
          <div>
            <small>住宿 · {stay[1] ? `${rooms}间房参考` : '今日返程'}</small>
            <b>
              {stay[1] ? `¥${stay[0] * rooms}–${stay[1] * rooms}` : '不计住宿'}
            </b>
          </div>
        )}
      </div>
      <small className="budget-disclaimer">
        均为
        Mock；未列餐费、到达/返程、住宿往返、园内车及停车等另计；不写入实际费用账本。
      </small>
      {day.guide && (
        <details className="day-practical">
          <summary>用餐、住宿与出发前准备</summary>
          <div>
            <Utensils size={17} />
            <p>
              <b>怎么吃</b>
              {day.guide.meals}
            </p>
          </div>
          <div>
            <BedDouble size={17} />
            <p>
              <b>住哪里</b>
              {day.guide.stay}
            </p>
          </div>
          <div>
            <CheckCircle2 size={17} />
            <p>
              <b>提前确认</b>
              {day.guide.preparation.join(' ')}
            </p>
          </div>
        </details>
      )}
      {day.items.some((item) => item.placeId === 'museum') &&
        new Date(day.date + 'T12:00:00').getDay() === 1 && (
          <p className="warning-message">
            今天是周一，请重点核对省博物馆闭馆/节假日开放公告；可调整到其他日期或更换地点。
          </p>
        )}
    </section>
  );
}
