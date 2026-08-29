'use client';
import {
  clock,
  money,
  type DaySettings,
  type TravelerProfile,
} from '@/lib/travel';
import { travelerProfiles, type DayPlan } from '@/lib/day-plan';
import {
  CloudSun,
  Users,
  Route,
  Footprints,
  Wallet,
  Sparkles,
  Settings2,
} from '@/components/travel-icons';

export function DayBrief({
  plan,
  onSettings,
  onProfile,
}: {
  plan: DayPlan;
  onSettings: (settings: Partial<DaySettings>) => void;
  onProfile: (profile: TravelerProfile) => void;
}) {
  const { summary: s, settings, profile } = plan;
  const intensity =
    s.intensity === '轻松'
      ? 'light'
      : s.intensity === '适中'
        ? 'moderate'
        : s.intensity === '待规划'
          ? 'empty'
          : 'intense';
  const numberField = (
    name: keyof DaySettings,
    label: string,
    min: number,
    max: number,
    step = 1,
  ) => (
    <label key={name}>
      {label}
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={Number(settings[name])}
        onChange={(e) => {
          if (!e.target.value) return;
          const n = Number(e.target.value);
          if (Number.isFinite(n) && n >= min && n <= max)
            onSettings({ [name]: n });
        }}
      />
    </label>
  );
  return (
    <section className="day-overview" aria-label="行程概览">
      <div className="day-overview-heading">
        <span className="eyebrow">行程概览</span>
        <span className="mini-tag">参考数据 · 非实时</span>
      </div>
      <h3>
        Day {plan.dayNumber} <span>｜</span>
        {plan.title}
      </h3>
      <div className="overview-stats">
        <div className="overview-metric">
          <CloudSun size={18} />
          <span>
            <b>
              {s.low}–{s.high}°C
            </b>
            <small>{s.weather} · 参考天气</small>
          </span>
        </div>
        <div className="overview-metric">
          <Users size={18} />
          <span>
            <b>人流：{s.crowd}</b>
            <small>客流舒适度参考</small>
          </span>
        </div>
        <div className="overview-metric">
          <Route size={18} />
          <span>
            <b>交通：{(s.trafficMinutes / 60).toFixed(1)}h</b>
            <small>含所列酒店往返与接续</small>
          </span>
        </div>
        <div className="overview-metric">
          <Footprints size={18} />
          <span>
            <b>步行：{s.walkingKm}km</b>
            <small>含景区内与换乘步行</small>
          </span>
        </div>
        <div className="overview-metric overview-cost">
          <Wallet size={18} />
          <span>
            <b>
              预计消费：¥{money(s.perPerson)}
              <small>/人</small>
            </b>
            <small>按{plan.people}人分摊 · 未计入实际账本</small>
          </span>
        </div>
      </div>
      <div className="day-evaluation">
        <div>
          <Sparkles size={17} />
          <span>
            AI 评价{' '}
            <b className="evaluation-stars" aria-label={`${s.stars}星，共5星`}>
              {'★'.repeat(s.stars)}
              {'☆'.repeat(5 - s.stars)}
            </b>
            <strong>{s.evaluation}</strong>
          </span>
        </div>
        <div className="intensity-row">
          <span>今日行程强度</span>
          <b className={`intensity-pill ${intensity}`}>
            <i />
            {s.intensity}
          </b>
        </div>
        <p>{s.intensityReason}</p>
      </div>
      <label className="traveler-profile">
        谁和你一起出发？
        <select
          value={profile}
          onChange={(e) => onProfile(e.target.value as TravelerProfile)}
        >
          {Object.entries(travelerProfiles).map(([key, label]) => (
            <option value={key} key={key}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <small className="budget-disclaimer">
        同行类型用于整趟旅行：调整步行估时、强度阈值与“适合你”，不替代个人体力判断。
      </small>
      {s.warnings.length > 0 && (
        <details className="overview-warnings" open>
          <summary>{s.warnings.length} 项安排需要留意</summary>
          <ul>
            {s.warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </details>
      )}
      <details className="day-settings">
        <summary>
          <Settings2 size={15} /> 调整今日安排与费用
        </summary>
        <div className="day-settings-grid">
          <label>
            开始时间
            <input
              type="time"
              value={clock(settings.departure)}
              onChange={(e) => {
                if (/^\d{2}:\d{2}$/.test(e.target.value)) {
                  const [h, m] = e.target.value.split(':').map(Number);
                  onSettings({ departure: h * 60 + m });
                }
              }}
            />
          </label>
          <label>
            情景
            <select
              value={settings.scenario}
              onChange={(e) =>
                onSettings({
                  scenario: e.target.value as DaySettings['scenario'],
                })
              }
            >
              <option value="normal">晴天 / 常规人流</option>
              <option value="rain">下雨</option>
              <option value="crowd">拥挤</option>
              <option value="closed">闭园 / 不营业</option>
            </select>
          </label>
        </div>
        <label className="day-setting-toggle">
          <input
            type="checkbox"
            checked={settings.includeHotel}
            onChange={(e) => onSettings({ includeHotel: e.target.checked })}
          />{' '}
          安排酒店出发与返回
        </label>
        {settings.includeHotel && (
          <div className="day-settings-grid">
            <label className="wide-field">
              住宿位置名称
              <input
                maxLength={100}
                value={settings.hotelName}
                onChange={(e) => onSettings({ hotelName: e.target.value })}
              />
            </label>
            {numberField(
              'hotelLat',
              '纬度（示例，可手动改）',
              -90,
              90,
              0.000001,
            )}
            {numberField(
              'hotelLng',
              '经度（示例，可手动改）',
              -180,
              180,
              0.000001,
            )}
            {numberField('roomPrice', '房费 / 间 / 晚（元）', 0, 10000)}
          </div>
        )}
        <label className="day-setting-toggle">
          <input
            type="checkbox"
            checked={settings.includeMeals}
            onChange={(e) => onSettings({ includeMeals: e.target.checked })}
          />{' '}
          补齐未安排的早餐、午餐和晚餐
        </label>
        {settings.includeMeals && (
          <div className="day-settings-grid">
            {numberField(
              'mealMinutes',
              '配套午 / 晚餐时长（分钟）',
              15,
              120,
              5,
            )}
            {numberField('breakfastPrice', '配套早餐 / 人（元）', 0, 1000)}
            {numberField('lunchPrice', '配套午餐 / 人（元）', 0, 1000)}
            {numberField('dinnerPrice', '配套晚餐 / 人（元）', 0, 1000)}
          </div>
        )}
        <p className="source-note">
          默认住宿是示例位置，修改名称不会自动定位，需同步填写坐标；到地图核对出入口。已列餐饮地点抵扣对应配套餐次，不重复收费。餐饮服务不改变景点主题。
        </p>
        <dl className="day-cost-breakdown">
          <div>
            <dt>已列景点 / 体验 / 餐饮</dt>
            <dd>¥{money(s.costs.places)}</dd>
          </div>
          <div>
            <dt>补充的配套餐饮</dt>
            <dd>¥{money(s.costs.meals)}</dd>
          </div>
          <div>
            <dt>交通分摊</dt>
            <dd>¥{money(Math.round(s.costs.transport))}</dd>
          </div>
          <div>
            <dt>当晚住宿分摊</dt>
            <dd>¥{money(Math.round(s.costs.hotel))}</dd>
          </div>
        </dl>
        <p className="source-note">
          上列均为人均
          规划参考估算；房间按每间2人向上取整，末日不计房费。未含机场 /
          车站往返、园内接驳与停车等未列费用，无真实预订。
        </p>
      </details>
    </section>
  );
}
