'use client';
import { score, factorNames, type Place, type Theme } from '@/lib/travel';

export function RecommendationScore({
  place,
  preferences = [],
  scenario = 'normal',
  expanded = false,
}: {
  place: Place;
  preferences?: Theme[];
  scenario?: string;
  expanded?: boolean;
}) {
  const s = score(place, scenario, preferences);
  const content = (
    <div className="recommendation-explanation">
      <p>
        <b>{place.category}模型</b> · {s.attributes.nature}
        <br />
        {s.profile.description}
      </p>
      <div className="recommendation-equation">
        <span>
          出行适宜度 <b>{s.contextTotal.toFixed(1)}</b> × 70%
        </span>
        <span>
          品类体验 <b>{s.categoryTotal.toFixed(1)}</b> × 30%
        </span>
        <strong>推荐指数 {s.total}</strong>
      </div>
      <p className="recommendation-context">
        {s.preferenceNote} · {s.attributes.effort}
      </p>
      <h4>出行适宜度 · 按品类分配权重</h4>
      <div className="factor-list">
        {factorNames.map((name, i) => (
          <div key={name}>
            <span>
              {name}
              <small>权重 {s.profile.weights[i]}%</small>
            </span>
            <progress max={100} value={s.factors[i]} />
            <b>{s.factors[i]}</b>
          </div>
        ))}
      </div>
      <h4>品类体验 · 结合地点的文旅性质</h4>
      <div className="factor-list">
        {s.profile.dimensions.map((name, i) => (
          <div key={name}>
            <span>
              {name}
              <small>权重 {s.profile.specialtyWeights[i]}%</small>
            </span>
            <progress max={100} value={s.attributes.values[i]} />
            <b>{s.attributes.values[i]}</b>
          </div>
        ))}
      </div>
      {s.warnings.map((w) => (
        <p className="score-warning" key={w}>
          {w} 未限制前的加权分为 {s.rawTotal.toFixed(1)}。
        </p>
      ))}
      <p className="score-disclaimer">
        以上因素、品类属性和权重均为可配置
        规划参考；不是官方评价、实时安全判断或行业标准。数据集：2026-08-28。
      </p>
    </div>
  );
  return expanded ? (
    content
  ) : (
    <details className="recommendation-details">
      <summary>
        <b>{s.total}</b> 推荐指数 · {s.label}
        <span>查看依据</span>
      </summary>
      {content}
    </details>
  );
}
