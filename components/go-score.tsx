import type { GoScore } from '@/lib/day-plan';
import {
  CloudSun,
  Users,
  UserRound,
  Route,
  Clock,
} from '@/components/travel-icons';
const icons = [CloudSun, Users, UserRound, Route, Clock];

export function GoScoreCard({
  score,
  placeName,
}: {
  score: GoScore;
  placeName: string;
}) {
  return (
    <section
      className={`go-score-card ${score.level}`}
      aria-label={`${placeName} GoScore`}
    >
      <div className="go-score-heading">
        <span>
          GoScore{' '}
          <b>
            {score.total}
            <small>分</small>
          </b>
        </span>
        <strong>
          <i />
          {score.label}
        </strong>
        <small>Mock</small>
      </div>
      <div className="go-score-factors">
        {score.factors.map((factor, i) => {
          const Icon = icons[i];
          return (
            <div key={factor.name} title={factor.note}>
              <span>
                <Icon size={14} />
                {factor.name}
              </span>
              <b>{factor.value}</b>
              <div className="factor-meter">
                <i style={{ width: `${factor.value}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
