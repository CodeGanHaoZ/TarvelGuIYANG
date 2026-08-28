'use client';
import { useEffect, useRef, useState } from 'react';
import {
  themes,
  makeTrip,
  dateAfter,
  type Theme,
  type Trip,
  placeById,
  travelRegions,
  suggestedTripDays,
} from '@/lib/travel';
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  MapPin,
  Users,
  Check,
  Circle,
  LoaderCircle,
  Mountain,
} from '@/components/travel-icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
export function TripWizard({
  onCreate,
  imported = [],
}: {
  onCreate: (t: Trip) => void;
  imported?: string[];
}) {
  const [step, setStep] = useState(0),
    [destination, setDestination] = useState(() => {
      const regions = [...new Set(imported.map((id) => placeById(id).region))];
      return regions.length === 1 ? regions[0] : '贵州';
    }),
    [start, setStart] = useState('2026-08-29'),
    [days, setDays] = useState(() => {
      if (!imported.length) return 3;
      return suggestedTripDays(imported);
    }),
    [people, setPeople] = useState('我、小夏'),
    [budget, setBudget] = useState(3000),
    [preferences, setPreferences] = useState<Theme[]>(() => [
      ...new Set(imported.map((id) => placeById(id).category)),
    ]),
    [pace, setPace] = useState('均衡'),
    [error, setError] = useState(''),
    [building, setBuilding] = useState(-1);
  const [month, setMonth] = useState(7);
  const [year, setYear] = useState(2026);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  function changeMonth(delta: number) {
    const d = new Date(year, month + delta, 1);
    setMonth(d.getMonth());
    setYear(d.getFullYear());
  }
  function validate() {
    setError('');
    if (
      step === 0 &&
      (!start ||
        !Number.isInteger(days) ||
        days < 1 ||
        days > 7 ||
        !['贵州', ...travelRegions, '苗寨'].some((r) =>
          destination.includes(r),
        ))
    ) {
      setError('请输入贵州范围内的目的地，选择出发日期和 1—7 天行程。');
      return false;
    }
    if (
      step === 1 &&
      (!people.trim() ||
        !Number.isFinite(budget) ||
        budget < 100 ||
        budget > 100000)
    ) {
      setError('请填写同行人，预算范围为 ¥100—100,000。');
      return false;
    }
    return true;
  }
  async function generate() {
    if (!validate()) return;
    const names = [
      ...new Set(
        people
          .split(/[、,，\n]/)
          .map((p) => p.trim())
          .filter(Boolean),
      ),
    ];
    if (!names.length || names.length > 8) {
      setStep(1);
      setError('请填写 1—8 位有效同行人姓名。');
      return;
    }
    for (let i = 0; i < 4; i++) {
      setBuilding(i);
      await new Promise((r) => setTimeout(r, 450));
      if (!mounted.current) return;
    }
    const trip = makeTrip(
      {
        destination,
        start,
        dayCount: days,
        people: names,
        preferences,
        pace,
        budget,
      },
      imported,
    );
    onCreate(trip);
  }
  if (building >= 0)
    return (
      <div className="wizard building">
        <span className="hero-kicker">
          <Sparkles size={18} /> 黔驴正在规划 · Mock
        </span>
        <h2>把心动，排进每一天。</h2>
        <p>正在使用本地规则匹配地点和节奏，无真实 AI 请求。</p>
        <div className="building-list">
          {[
            '创建你的旅行',
            '匹配旅行偏好',
            '把地点放进地图',
            '连接每天的故事',
          ].map((s, i) => (
            <div className={i > building ? 'pending' : ''} key={s}>
              <span className="feature-icon">
                <Mountain />
              </span>
              <span>
                <b>{s}</b>
                <small>
                  {
                    [
                      '设置日期与同行人',
                      '保留你偏爱的体验',
                      '按区域分组，减少跨城奔波',
                      '计算模拟交通与停留时间',
                    ][i]
                  }
                </small>
              </span>
              {i < building ? (
                <Check />
              ) : i === building ? (
                <LoaderCircle className="spin" />
              ) : (
                <Circle />
              )}
            </div>
          ))}
        </div>
        <Progress value={(building + 1) * 25} aria-label="行程生成进度" />
      </div>
    );
  const firstDay = new Date(year, month, 1).getDay(),
    daysInMonth = new Date(year, month + 1, 0).getDate();
  return (
    <div className="wizard">
      <div className="wizard-progress">
        <button
          className="icon-btn"
          disabled={!step}
          aria-label="上一步"
          onClick={() => {
            setStep((s) => s - 1);
            setError('');
          }}
        >
          <ArrowLeft size={18} />
        </button>
        <Progress value={((step + 1) / 3) * 100} aria-label="创建步骤" />
        <small>0{step + 1} / 03</small>
      </div>
      <span className="eyebrow">MAKE IT YOURS</span>
      <h2>
        {
          [
            '想去哪里，什么时候出发？',
            '和谁一起，花多少刚好？',
            '这一次，按你的节奏。',
          ][step]
        }
      </h2>
      <p>
        {
          [
            '先选一段时间，把其余交给黔驴。',
            '预算与同行人，会成为规划的参考。',
            '没有标准答案，喜欢的都可以选。',
          ][step]
        }
      </p>
      {imported.length > 0 && (
        <div className="notice">
          已带入 {imported.length} 个地点：
          {imported.map((id) => placeById(id).name).join('、')}
        </div>
      )}
      {step === 0 && (
        <>
          <label className="field-label" htmlFor="trip-wizard-field-1">
            <span>
              <MapPin size={15} />
              目的地 / 一句话需求
            </span>
            <Input
              id="trip-wizard-field-1"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="例如：贵阳，想慢慢看山水"
            />
          </label>
          <div className="field-grid">
            <label className="field-label" htmlFor="trip-wizard-field-2">
              <span>出发日期</span>
              <Input
                id="trip-wizard-field-2"
                type="date"
                value={start}
                onChange={(e) => setStart(e.target.value)}
              />
            </label>
            <label className="field-label" htmlFor="trip-wizard-field-3">
              <span>旅行天数</span>
              <Input
                id="trip-wizard-field-3"
                type="number"
                min={1}
                max={7}
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
              />
            </label>
          </div>
          <div className="calendar">
            <div>
              <button
                className="icon-btn"
                aria-label="上个月"
                onClick={() => changeMonth(-1)}
              >
                <ArrowLeft size={16} />
              </button>
              <b>
                {year} 年 {month + 1} 月
              </b>
              <button
                className="icon-btn"
                aria-label="下个月"
                onClick={() => changeMonth(1)}
              >
                <ArrowRight size={16} />
              </button>
            </div>
            <div className="calendar-grid">
              {'日一二三四五六'.split('').map((w) => (
                <span key={w}>{w}</span>
              ))}
              {Array.from({ length: firstDay }, (_, i) => (
                <span key={'empty' + i} />
              ))}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`;
                const chosen =
                  date >= start && date <= dateAfter(start, days - 1);
                return (
                  <button
                    key={date}
                    aria-label={`选择 ${date}`}
                    aria-pressed={chosen}
                    className={
                      date === start ? 'selected' : chosen ? 'in-range' : ''
                    }
                    onClick={() => setStart(date)}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
      {step === 1 && (
        <>
          <div className="onboarding-icon">
            <Users size={36} />
          </div>
          <label className="field-label" htmlFor="trip-wizard-field-4">
            <span>同行人，用顿号或逗号分隔</span>
            <Input
              id="trip-wizard-field-4"
              value={people}
              onChange={(e) => setPeople(e.target.value)}
              placeholder="我、小夏"
              maxLength={100}
            />
          </label>
          <div className="pill-group">
            {[
              '我',
              '我、小夏',
              '我、家人一、家人二',
              '我、朋友一、朋友二、朋友三',
            ].map((p, i) => (
              <button
                key={p}
                className={'pill ' + (people === p ? 'selected' : '')}
                onClick={() => setPeople(p)}
              >
                {['独自旅行', '两人同行', '家庭出游', '朋友结伴'][i]}
              </button>
            ))}
          </div>
          <label className="field-label" htmlFor="trip-wizard-field-5">
            <span>整趟旅行总预算（元）</span>
            <Input
              id="trip-wizard-field-5"
              type="number"
              min={100}
              max={100000}
              step={100}
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
            />
          </label>
          <p className="notice">
            预算为全体同行人合计。演示价格不含真实订单，后续可在费用页记录实际开销。
          </p>
        </>
      )}
      {step === 2 && (
        <>
          <h3 className="form-subheading">想遇见什么？</h3>
          <div className="preference-grid">
            {themes.map((t, i) => (
              <button
                key={t}
                className={
                  'preference ' + (preferences.includes(t) ? 'selected' : '')
                }
                aria-pressed={preferences.includes(t)}
                onClick={() =>
                  setPreferences((v) =>
                    v.includes(t) ? v.filter((x) => x !== t) : [...v, t],
                  )
                }
              >
                <span className="preference-number">0{i + 1}</span>
                {t}
                {preferences.includes(t) && <Check size={16} />}
              </button>
            ))}
          </div>
          <h3 className="form-subheading">给旅行多少留白？</h3>
          <div className="pace-options">
            {[
              ['留白', '少一点安排，多一点随心'],
              ['均衡', '风景与休息都刚刚好'],
              ['紧凑', '想看更多，不怕走远'],
            ].map(([p, s]) => (
              <button
                key={p}
                className={pace === p ? 'selected' : ''}
                onClick={() => setPace(p)}
              >
                <b>{p}</b>
                <small>{s}</small>
              </button>
            ))}
          </div>
          <div className="notice">
            <Sparkles size={16} />
            未选主题时，展示贵州经典样例。规则规划会按区域分组；请留意生成后的营业时间冲突提示。
          </div>
        </>
      )}
      {error && (
        <p role="alert" className="error-message">
          {error}
        </p>
      )}
      <Button
        className="primary-btn full-width wizard-next"
        onClick={() => {
          if (step < 2) {
            if (validate()) setStep(step + 1);
          } else void generate();
        }}
      >
        {step === 2 ? (
          <>
            <Sparkles /> 为我生成每日行程
          </>
        ) : (
          <>
            继续 <ArrowRight />
          </>
        )}
      </Button>
    </div>
  );
}
