'use client';
import { useState } from 'react';
import { clock, money } from '@/lib/travel';
import {
  baiduRouteUrl,
  railQueryUrl,
  transportOptions,
  transportCost,
  type TransportMode,
} from '@/lib/transport';
import { transportForProfile, type DayPlan } from '@/lib/day-plan';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  Check,
  Clock,
  Footprints,
  Route,
  TrainFront,
  Wallet,
  ArrowUpRight,
  Info,
} from '@/components/travel-icons';

export function TransportPlanner({
  plan,
  initialTo,
  onChoose,
}: {
  plan: DayPlan;
  initialTo?: string;
  onChoose: (key: string, mode: TransportMode) => void;
}) {
  const { segments, people } = plan;
  const [target, setTarget] = useState(initialTo ?? segments[0]?.key ?? '');
  const [mode, setMode] = useState<TransportMode | 'all'>('all');
  const [sort, setSort] = useState('time');
  const [applied, setApplied] = useState('');
  const segment = segments.find((s) => s.key === target) ?? segments[0];
  if (!segment)
    return (
      <div className="transport-planner">
        <h2>添加地点，开始规划交通</h2>
        <p>添加地点并开启酒店往返，或添加两个游览地点，即可对比出行方案。</p>
      </div>
    );
  const a = segment.from,
    b = segment.to;
  const selected = segment.option;
  const options = transportOptions(a, b)
    .map((option) => transportForProfile(option, plan.profile))
    .filter((o) => mode === 'all' || o.id === mode)
    .sort((x, y) => {
      if (x.available !== y.available) return x.available ? -1 : 1;
      if (sort === 'cost')
        return (
          (transportCost(x, people)?.[0] ?? Infinity) -
          (transportCost(y, people)?.[0] ?? Infinity)
        );
      if (sort === 'transfers')
        return x.transfers - y.transfers || x.minutes - y.minutes;
      if (sort === 'walking')
        return x.walking - y.walking || x.minutes - y.minutes;
      return x.minutes - y.minutes;
    });
  const departure = segment.departure;
  return (
    <div className="transport-planner">
      <span className="eyebrow">
        <Route size={16} /> GETTING THERE
      </span>
      <h2>下一站，怎么去？</h2>
      <p>对比时间、费用与换乘，把合适的方案放进行程。</p>
      <label className="field-label" htmlFor="transport-segment">
        <span>查询路段 · {plan.date}</span>
        <select
          id="transport-segment"
          value={segment.key}
          onChange={(e) => {
            setTarget(e.target.value);
            setApplied('');
          }}
        >
          {segments.map((s, i) => (
            <option value={s.key} key={s.key}>
              {s.crossDay
                ? '跨日接续'
                : s.boundary === 'return'
                  ? '返回酒店'
                  : `路段 ${i + 1}`}
              ：{s.from.name} → {s.to.name}
            </option>
          ))}
        </select>
      </label>
      <div className="transport-endpoints">
        <div>
          <i className="origin-dot" />
          <span>
            <small>从</small>
            {a.name}
          </span>
        </div>
        <div>
          <i className="destination-dot" />
          <span>
            <small>到</small>
            {b.name}
          </span>
        </div>
      </div>
      <div className="transport-departure">
        <Clock size={14} /> 计划 {clock(departure)} 出发 · {people}人
        {segment.crossDay && ' · 上日住宿 / 尾站接续'}
      </div>
      <div className="transport-tabs" aria-label="交通方式">
        {(
          [
            ['all', '全部方案'],
            ['transit', '公交地铁'],
            ['drive', '驾车打车'],
            ['walk', '步行'],
            ['rail', '高铁接驳'],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            aria-pressed={mode === value}
            className={mode === value ? 'active' : ''}
            onClick={() => setMode(value)}
          >
            {label}
          </button>
        ))}
      </div>
      <label className="transport-sort">
        方案排序
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="time">时间短</option>
          <option value="cost">费用低</option>
          <option value="transfers">换乘少</option>
          <option value="walking">步行少</option>
        </select>
        <small>按本地估算比较</small>
      </label>
      <div className="transport-disclosure">
        <Info size={17} />
        <p>
          下方数值是
          规划参考，不是实时查询结果。百度地图按钮会带入起终点和交通方式；坐标为示意，务必在地图核对出入口和实际门店。地图结果不会自动回填。
        </p>
      </div>
      <div className="transport-options">
        {options.map((option) => {
          const cost = transportCost(option, people);
          const active = selected.id === option.id && option.available;
          return (
            <article
              className={'transport-option ' + (active ? 'selected' : '')}
              key={option.id}
            >
              <div className="transport-option-heading">
                <div>
                  <h3>{option.label}</h3>
                  <p>{option.summary}</p>
                </div>
                {active && (
                  <span className="route-selected">
                    <Check size={13} /> 已选
                  </span>
                )}
              </div>
              {option.available ? (
                <>
                  <div className="transport-numbers">
                    <b>
                      {option.minutes}
                      <small>分钟</small>
                    </b>
                    <span>
                      {option.km} km<small>近似路程</small>
                    </span>
                    <span>
                      {cost ? `¥${money(cost[0])}–${money(cost[1])}` : '待查'}
                      <small>{people}人合计 · 估算</small>
                    </span>
                  </div>
                  <div className="transport-details">
                    <span>
                      <Footprints size={13} /> 步行约{option.walking}分钟
                    </span>
                    <span>
                      <TrainFront size={13} /> {option.transfers}次换乘
                    </span>
                    <span>约 {clock(departure + option.minutes)} 到达</span>
                  </div>
                  <ol className="transport-steps">
                    {option.steps.map((step, i) => (
                      <li key={step.title}>
                        <i>{i + 1}</i>
                        <div>
                          <b>{step.title}</b>
                          <p>{step.detail}</p>
                        </div>
                        <time>
                          {step.minutes > 0 ? `${step.minutes}分` : '到达'}
                        </time>
                      </li>
                    ))}
                  </ol>
                </>
              ) : (
                <p className="transport-unavailable">
                  路线、时间、费用待查询；不把未知数据当作可用方案。
                </p>
              )}
              <p className="source-note">{option.note}</p>
              {option.sources.length > 0 && (
                <details className="transport-sources">
                  <summary>查看线路资料来源</summary>
                  {option.sources.map((s) => (
                    <a
                      href={s.url}
                      key={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {s.title} <ArrowUpRight size={12} />
                    </a>
                  ))}
                </details>
              )}
              <div className="transport-option-actions">
                <Button
                  className={active ? 'outline-btn' : 'primary-btn'}
                  disabled={!option.available || active}
                  onClick={() => {
                    onChoose(segment.key, option.id);
                    setApplied(
                      `已选择${option.label}，时间轴与交通汇总已更新。`,
                    );
                  }}
                >
                  {active
                    ? '已用于此路段'
                    : option.available
                      ? '用于此路段'
                      : '待核验，暂不可应用'}
                  {active ? <Check size={15} /> : <ArrowRight size={15} />}
                </Button>
                <a
                  className="outline-btn"
                  href={baiduRouteUrl(
                    a,
                    b,
                    option.id,
                    sort === 'transfers'
                      ? 'transfers'
                      : sort === 'walking'
                        ? 'walking'
                        : 'recommended',
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  去百度地图查询 <ArrowUpRight size={15} />
                </a>
              </div>
            </article>
          );
        })}
        {!options.length && (
          <div className="transport-empty">
            <Route size={26} />
            <h3>此路段暂无这种方式的可靠样例</h3>
            <p>
              {mode === 'walk'
                ? '较远路程不生成步行方案；山路与封闭路段不能用直线推断。'
                : '未核验该路段的铁路与接驳，不生成未核验班次。'}
            </p>
            <a
              className="outline-btn"
              href={baiduRouteUrl(a, b, mode === 'all' ? 'drive' : mode)}
              target="_blank"
              rel="noopener noreferrer"
            >
              去百度地图核实路线 <ArrowUpRight size={15} />
            </a>
          </div>
        )}
      </div>
      {(a.region !== b.region || mode === 'rail') && (
        <a
          className="rail-query"
          href={railQueryUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <TrainFront size={19} />
          <span>
            在铁路12306核实班次
            <small>
              查询日期 {plan.date} · 以实际车站、票价和余票为准，需手动选择日期
            </small>
          </span>
          <ArrowUpRight size={17} />
        </a>
      )}
      <output className="transport-applied" aria-live="polite">
        {applied}
      </output>
      <p className="source-note">
        <Wallet size={13} />{' '}
        交通选择会本机保存，不会下单、扣款或把估算记入实际支出。
      </p>
    </div>
  );
}
