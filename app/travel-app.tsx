'use client';
/* oxlint-disable next/no-img-element -- Self-hosted demo photos use fixed CSS dimensions; keep the Vite demo independent of an image transformation service. */
import { useEffect, useRef, useState } from 'react';
import {
  IconContext,
  Mountain,
  Compass,
  Map,
  Heart,
  UserRound,
  Sparkles,
  ArrowUpRight,
  ArrowRight,
  Link2,
  MapPin,
  CloudSun,
  Plus,
  Check,
  ChevronRight,
  Search,
  CalendarDays,
  Users,
  Wallet,
  Clock,
  Route,
  Share2,
  Download,
  CloudRain,
  GripVertical,
  Trash2,
  Bookmark,
  Copy,
  Send,
  Settings2,
  WifiOff,
  LoaderCircle,
  Info,
  ArrowUp,
  ArrowDown,
  Undo2,
  Utensils,
  TreePine,
  Footprints,
  Landmark,
  Flag,
  NotebookPen,
} from '@/components/travel-icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { GuizhouRouteMap } from '@/components/guizhou-route-map';
import type { PlanningContext } from '@/lib/planning-input';
import { createTripFromPlanningMaterial } from '@/lib/planning-trip';
import { PlaceDetail } from '@/components/place-detail';
import { TripWizard } from '@/components/trip-wizard';
import { ItineraryLibrary } from '@/components/itinerary-library';
import { TransportPlanner } from '@/components/transport-planner';
import { DayBrief } from '@/components/day-brief';
import { DayEvent } from '@/components/day-event';
import { GoScoreCard } from '@/components/go-score';
import {
  buildDayPlan,
  chooseDayTransport,
  replaceDayPlace,
  dayPlanMarkdown,
} from '@/lib/day-plan';
import { HomeCarousel } from '@/components/home-carousel';
import { SocialInspiration } from '@/components/social-inspiration';
import { rainPlanChanges } from '@/lib/guizhou-map';
import {
  initialData,
  restore,
  places,
  placeById,
  score,
  themes,
  themeInfo,
  makeItem,
  previousDayConnection,
  copyTripWithNewIds,
  clock,
  optimize,
  splitExpenses,
  parseGuide,
  replan,
  money,
  dateLabel,
  uid,
  storageKey,
  attachTripSources,
  socialPosts,
  type AppData,
  type Trip,
  type TripItem,
  type SharedTrip,
  type Theme,
  type TripDay,
} from '@/lib/travel';
type Page = 'home' | 'trip' | 'discover' | 'profile';
type Modal =
  | 'create'
  | 'import'
  | 'detail'
  | 'add'
  | 'replace'
  | 'optimize'
  | 'weather'
  | 'expense'
  | 'publish'
  | 'assistant'
  | 'export'
  | 'presets'
  | 'transport'
  | null;
const categoryIcons = [TreePine, Utensils, Landmark, Route, Footprints, Flag];
const themeImages: Record<Theme, string> = {
  舌尖黔味: '/images/theme-food.jpg',
  山水奇观: '/images/xiaoqikong.jpg',
  野趣户外: '/images/theme-hiking.jpg',
  多彩民族: '/images/xijiang.jpg',
  古镇遗韵: '/images/qingyan.jpg',
  红色征程: '/images/theme-history.jpg',
};
const pageLabels: Record<Page, string> = {
  home: '旅行灵感',
  trip: '我的行程',
  discover: '发现 · 约伴',
  profile: '我的旅行空间',
};
function downloadFile(name: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
export default function TravelApp() {
  const [data, setData] = useState<AppData>(initialData),
    [ready, setReady] = useState(false),
    [page, setPage] = useState<Page>('home'),
    [modal, setModal] = useState<Modal>(null),
    [dayIndex, setDayIndex] = useState(0),
    [tripTab, setTripTab] = useState('行程'),
    [selected, setSelected] = useState<string | null>(null),
    [detailId, setDetailId] = useState('xiaoqikong'),
    [link, setLink] = useState(''),
    [query, setQuery] = useState(''),
    [filter, setFilter] = useState('全部'),
    [guide, setGuide] = useState<string[]>([]),
    [imported, setImported] = useState<string[]>([]),
    [importedSourceIds, setImportedSourceIds] = useState<string[]>([]),
    [creationTheme, setCreationTheme] = useState<Theme | undefined>(),
    [creationContext, setCreationContext] = useState<
      PlanningContext | undefined
    >(),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [toast, setToast] = useState(''),
    [online, setOnline] = useState(true),
    [lastTrip, setLastTrip] = useState<Trip | null>(null),
    [event, setEvent] = useState('rain'),
    [expenseTitle, setExpenseTitle] = useState(''),
    [expenseAmount, setExpenseAmount] = useState(''),
    [payer, setPayer] = useState('我'),
    [publishText, setPublishText] = useState(
      '喜欢山水和在地文化，期待和同频的人一起出发。',
    ),
    [assistantInput, setAssistantInput] = useState(''),
    [answer, setAnswer] = useState(''),
    [dragId, setDragId] = useState<string | null>(null);
  const [transportTo, setTransportTo] = useState<string | undefined>();
  const [replaceTarget, setReplaceTarget] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const trip =
    data.trips.find((t) => t.id === data.activeTripId) || data.trips[0];
  const day = trip.days[Math.min(dayIndex, trip.days.length - 1)];
  const selectedItem = day.items.find((i) => i.id === selected) || day.items[0];
  const previous = previousDayConnection(trip, dayIndex);
  const dayPlan = buildDayPlan(trip, Math.min(dayIndex, trip.days.length - 1));
  const dayMetrics = {
    km: dayPlan.summary.trafficKm,
    minutes: dayPlan.summary.trafficMinutes,
  };
  const scheduled = dayPlan.visits;
  const optimizationCandidate =
    modal === 'optimize' ? optimize(day.items, previous) : day.items;
  const candidatePlan =
    modal === 'optimize'
      ? buildDayPlan(
          {
            ...trip,
            days: trip.days.map((d) =>
              d.id === day.id ? { ...d, items: optimizationCandidate } : d,
            ),
          },
          dayIndex,
        )
      : dayPlan;
  const improvesRoute =
    candidatePlan.summary.trafficMinutes <= dayPlan.summary.trafficMinutes;
  const optimizedItems = improvesRoute ? optimizationCandidate : day.items;
  const optimizedPlan = improvesRoute ? candidatePlan : dayPlan;
  const optimizedMetrics = {
    km: optimizedPlan.summary.trafficKm,
    minutes: optimizedPlan.summary.trafficMinutes,
  };
  const expenses = data.expenses.filter((e) => e.tripId === trip.id);
  const settlement = splitExpenses(expenses, trip.people);
  const filteredPlaces = places.filter(
    (p) =>
      (filter === '全部' || p.category === filter) &&
      (p.name + p.region + p.description).includes(query.trim()),
  );
  function notify(message: string) {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 4500);
  }
  useEffect(() => {
    let mounted = true;
    queueMicrotask(() => {
      if (!mounted) return;
      try {
        const raw = localStorage.getItem(storageKey);
        if (raw) {
          const restored = restore(raw);
          if (restored) setData(restored);
          else notify('本地数据格式已变化，已恢复初始数据。');
        }
      } catch {
        notify('浏览器存储不可用，本次内容仅保留在当前页面。');
      }
      setReady(true);
      setOnline(navigator.onLine);
    });
    const on = () => {
      setOnline(true);
      notify('网络已恢复。本机编辑仍保留，云端同步尚未接入。');
    };
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      mounted = false;
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);
  useEffect(() => {
    if (ready) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(data));
      } catch {
        queueMicrotask(() =>
          notify('本地保存失败：存储空间不足或不可用。请导出备份。'),
        );
      }
    }
  }, [data, ready]);
  useEffect(() => {
    document.documentElement.dataset.theme = data.theme;
    document.documentElement.dataset.iconSet = data.iconSet;
  }, [data.theme, data.iconSet]);
  function go(target: Page) {
    setPage(target);
    setFilter('全部');
    setQuery('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (
      target === 'trip' &&
      !['概览', '行程', '探索', '费用', '游记'].includes(tripTab)
    )
      setTripTab('行程');
  }
  function open(
    which: Modal,
    sources: string[] = [],
    theme?: Theme,
    context?: PlanningContext,
  ) {
    if (which === 'create') {
      setImportedSourceIds(sources);
      setCreationTheme(theme);
      setCreationContext(context);
    }
    setError('');
    setModal(which);
  }
  function updateTrip(next: Trip, undo = true) {
    if (undo) setLastTrip(structuredClone(trip));
    setData((d) => ({
      ...d,
      trips: d.trips.map((t) => (t.id === next.id ? next : t)),
    }));
  }
  function updateItems(items: TripItem[]) {
    updateTrip({
      ...trip,
      days: trip.days.map((d) => (d.id === day.id ? { ...d, items } : d)),
    });
  }
  function updateDay(next: TripDay) {
    updateTrip({
      ...trip,
      days: trip.days.map((d) => (d.id === next.id ? next : d)),
    });
  }
  function startReplace(item: TripItem) {
    setReplaceTarget(item.id);
    setQuery('');
    setFilter(placeById(item.placeId).category);
    open('replace');
  }
  function showTransport(toId?: string) {
    setTransportTo(toId);
    open('transport');
  }
  function addPlace(id: string) {
    if (day.items.some((i) => i.placeId === id)) {
      notify('这个地点已在当天行程里。');
      return;
    }
    updateItems([...day.items, makeItem(id)]);
    notify(`已将「${placeById(id).name}」加入第 ${dayIndex + 1} 天`);
  }
  function toggleSave(id: string) {
    setData((d) => ({
      ...d,
      savedPlaces: d.savedPlaces.includes(id)
        ? d.savedPlaces.filter((x) => x !== id)
        : [...d.savedPlaces, id],
    }));
  }
  function selectItem(id: string, scroll = false) {
    setSelected(id);
    if (scroll)
      document
        .getElementById('item-' + id)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  function showPlace(id: string) {
    setDetailId(id);
    open('detail');
  }
  function changeDay(i: number) {
    setDayIndex(i);
    setSelected(null);
  }
  function moveItem(id: string, delta: number) {
    const list = [...day.items];
    const i = list.findIndex((x) => x.id === id);
    const j = i + delta;
    if (j < 0 || j >= list.length) return;
    [list[i], list[j]] = [list[j], list[i]];
    updateItems(list);
  }
  function onDrop(id: string) {
    if (!dragId || id === dragId) return;
    const list = [...day.items];
    const from = list.findIndex((i) => i.id === dragId),
      to = list.findIndex((i) => i.id === id);
    if (from < 0 || to < 0) return;
    const [item] = list.splice(from, 1);
    list.splice(to, 0, item);
    updateItems(list);
    setDragId(null);
  }
  async function parse() {
    setBusy(true);
    setError('');
    setGuide([]);
    try {
      setGuide(await parseGuide(link));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  function createTrip(t: Trip) {
    setData((d) => ({ ...d, trips: [...d.trips, t], activeTripId: t.id }));
    setDayIndex(0);
    setSelected(null);
    setLastTrip(null);
    setImported([]);
    setImportedSourceIds([]);
    setCreationTheme(undefined);
    setCreationContext(undefined);
    setModal(null);
    setTripTab('行程');
    go('trip');
    notify(
      t.sourcePostIds?.length
        ? '视频 / 贴文已转化为标准行程：概览、时间轴和 GoScore 均可继续调整。'
        : '你的旅行已生成，所有地点都可以继续调整。',
    );
  }
  function activateTrip(id: string) {
    setData((d) => ({ ...d, activeTripId: id }));
    setDayIndex(0);
    setSelected(null);
    setLastTrip(null);
    setTripTab('行程');
    go('trip');
  }
  function copyShared(post: SharedTrip) {
    const t = copyTripWithNewIds(post.trip);
    t.title = post.title + ' · 我的副本';
    t.people = ['我'];
    createTrip(t);
  }
  async function enableOffline() {
    setBusy(true);
    try {
      if (!('serviceWorker' in navigator))
        throw new Error('当前浏览器不支持离线缓存，请导出行程。');
      await navigator.serviceWorker.register('/sw.js');
      const reg = await navigator.serviceWorker.ready;
      const resources = performance
        .getEntriesByType('resource')
        .map((r) => r.name)
        .filter(
          (u) =>
            u.startsWith(location.origin) &&
            !u.includes('__') &&
            !u.includes('@vite'),
        );
      const urls = [
        ...new Set([
          '/',
          ...places.flatMap((p) => (p.image ? [p.image] : [])),
          ...resources,
        ]),
      ];
      await new Promise<void>((resolve, reject) => {
        const channel = new MessageChannel();
        const timer = setTimeout(
          () => reject(new Error('离线缓存超时，请重试或导出行程。')),
          25000,
        );
        channel.port1.onmessage = (e) => {
          clearTimeout(timer);
          if (e.data.ok) resolve();
          else reject(new Error('部分资源缓存失败，请联网后重试。'));
        };
        reg.active?.postMessage({ type: 'CACHE_URLS', urls }, [channel.port2]);
      });
      setData((d) => ({ ...d, offlineReady: true }));
      notify('当前页面资源已缓存；生产版本可离线打开，行程编辑保存在本机。');
    } catch (e) {
      notify((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  function exportTrip() {
    downloadFile(
      trip.title + '.json',
      JSON.stringify({ format: 'qianlv-trip-v1', trip, expenses }, null, 2),
      'application/json',
    );
    notify('已导出行程 JSON 备份。');
  }
  function exportGuide() {
    const text =
      `# ${trip.title}\n\n> AI 黔驴行程建议。评分、交通、价格均为规划参考，出发前请核验。\n\n日期：${trip.start} 起\n同行：${trip.people.join('、')}\n总预算：¥${trip.budget}\n\n` +
      trip.days
        .map((_d, dayNumber) => dayPlanMarkdown(buildDayPlan(trip, dayNumber)))
        .join('\n\n') +
      `\n\n## 我的旅行笔记\n\n${trip.notes}\n` +
      (trip.sourcePostIds?.length
        ? '\n## 规划素材来源\n\n' +
          trip.sourcePostIds
            .map(
              (id) =>
                `- ${socialPosts.find((p) => p.id === id)?.title}（${socialPosts.find((p) => p.id === id)?.sourceUrl ? '原作者公开内容' : '站内编辑整理'}）`,
            )
            .join('\n')
        : '');
    downloadFile(trip.title + '.md', text, 'text/markdown;charset=utf-8');
    notify('已导出可分享的 Markdown 攻略。');
  }
  const navEntries: { id: Page; label: string; Icon: typeof Compass }[] = [
    { id: 'home', label: '首页', Icon: Compass },
    { id: 'discover', label: '发现', Icon: Heart },
    { id: 'trip', label: '行程', Icon: Map },
    { id: 'profile', label: '我的', Icon: UserRound },
  ];
  const card = (id: string) => {
    const p = placeById(id);
    const C = categoryIcons[themes.indexOf(p.category)];
    return (
      <article className="destination-card" key={id}>
        <button className="destination-main" onClick={() => showPlace(id)}>
          <div
            className={
              'destination-image ' + (!p.image ? 'scenic-placeholder' : '')
            }
          >
            {p.image ? (
              <img src={p.image} alt={p.name} loading="lazy" />
            ) : (
              <div className="place-symbol">
                <C size={45} />
                <span>{p.region} · 在地探索</span>
              </div>
            )}
            <span className="image-tag">{p.category}</span>
            <span className="score-tag">
              <b>{score(p, 'normal', trip.preferences).total}</b> 推荐指数 ·
              规划参考
            </span>
          </div>
          <div className="destination-info">
            <h3>
              {p.name}
              <ArrowUpRight size={19} />
            </h3>
            <p>{p.description}</p>
          </div>
        </button>
        <div className="card-bottom">
          <span>
            <Clock size={13} />
            {p.duration} 分钟
          </span>
          <button
            className={
              'icon-btn ' + (data.savedPlaces.includes(id) ? 'saved' : '')
            }
            aria-label={
              (data.savedPlaces.includes(id) ? '取消收藏' : '收藏') + p.name
            }
            onClick={() => toggleSave(id)}
          >
            <Bookmark size={17} />
          </button>
          <button className="text-btn" onClick={() => addPlace(id)}>
            <Plus size={15} />
            加入行程
          </button>
        </div>
      </article>
    );
  };
  return (
    <IconContext.Provider value={data.iconSet}>
      <div className="app-shell">
        <aside className="sidebar">
          <button className="brand brand-button" onClick={() => go('home')}>
            <span className="brand-icon">
              <Mountain />
            </span>
            <span>
              AI 黔驴<small>GUIZHOU, YOUR WAY</small>
            </span>
          </button>
          <p className="sidebar-caption">每一程，都有新发现</p>
          <nav aria-label="主导航">
            {navEntries.map(({ id, label, Icon }) => (
              <button
                key={id}
                className={'nav-item ' + (page === id ? 'active' : '')}
                aria-current={page === id ? 'page' : undefined}
                onClick={() => go(id)}
              >
                <Icon size={20} />
                {id === 'trip'
                  ? '我的行程'
                  : id === 'discover'
                    ? '发现 · 约伴'
                    : label}
                {page === id && <span className="nav-dot" />}
              </button>
            ))}
          </nav>
          <div className="sidebar-divider" />
          <div className="sidebar-caption">
            我的旅行
            <button
              className="icon-btn"
              aria-label="新建旅行"
              onClick={() => {
                setImported([]);
                open('create');
              }}
            >
              <Plus size={16} />
            </button>
          </div>
          <div className="sidebar-trips">
            {data.trips.slice(-4).map((t) => (
              <button
                className={
                  'sidebar-trip ' + (t.id === trip.id ? 'current' : '')
                }
                key={t.id}
                onClick={() => activateTrip(t.id)}
              >
                <span className="trip-dot" />
                <span>
                  {t.title}
                  <small>
                    {t.start.slice(5).replace('-', '/')} 起 · {t.days.length} 天
                  </small>
                </span>
                <ChevronRight size={14} />
              </button>
            ))}
          </div>
          <div className="side-bottom">
            <Mountain />
            <b>山水有相逢，黔行有故事</b>
            <p>把想去的地方，变成走得通的行程。</p>
          </div>
          <button className="user-row" onClick={() => go('profile')}>
            <span className="avatar">旅</span>
            <span>
              你好，{data.profile}
              <small>开始你的贵州故事</small>
            </span>
            <Settings2 size={16} />
          </button>
        </aside>
        <div className="main-shell">
          <header className="topbar">
            <span className="desktop-breadcrumb">
              探索贵州 ／ {pageLabels[page]}
            </span>
            <button className="mobile-brand" onClick={() => go('home')}>
              <Mountain size={22} /> AI 黔驴
            </button>
            <div>
              <span className="mock-badge">AI 黔驴 · 贵州智能行程</span>
              <span className="save-state">
                {online ? <Check size={14} /> : <WifiOff size={14} />}{' '}
                {ready
                  ? online
                    ? '本机已保存'
                    : '离线 · 本地编辑'
                  : '正在读取'}
              </span>
              <button
                className="icon-btn"
                aria-label="打开旅行助手"
                onClick={() => open('assistant')}
              >
                <Sparkles size={18} />
              </button>
            </div>
          </header>
          {page === 'home' && (
            <main className="home-page">
              <div className="page-heading">
                <div>
                  <div className="eyebrow">HELLO, EXPLORER</div>
                  <h1>下一站，去贵州。</h1>
                  <p>山水与烟火之间，找到属于你的旅行节奏。</p>
                </div>
                <span className="location-pill">
                  <MapPin size={15} /> 贵州，中国
                </span>
              </div>
              <section className="hero">
                <div className="hero-content">
                  <span className="hero-kicker">
                    <Sparkles size={16} /> 你的 AI 在地旅行搭子
                  </span>
                  <h2>
                    把心动的风景，
                    <br />
                    变成出发的理由。
                  </h2>
                  <p>
                    从一篇笔记、一段视频开始，
                    <br />
                    让黔驴陪你走一程有山水、有故事的贵州。
                  </p>
                  <div className="hero-actions">
                    <Button
                      className="primary-btn"
                      onClick={() => {
                        setImported([]);
                        open('create');
                      }}
                    >
                      <Sparkles /> AI 创建旅行 <ArrowUpRight />
                    </Button>
                    <Button
                      variant="ghost"
                      className="text-btn"
                      onClick={() => go('trip')}
                    >
                      查看我的行程 <ArrowRight />
                    </Button>
                    <Button
                      variant="ghost"
                      className="text-btn"
                      onClick={() => open('presets')}
                    >
                      <CalendarDays size={17} /> 详细三日样例
                    </Button>
                  </div>
                  <div className="hero-foot">
                    地图规划　·　今日游玩指数　·　在地文化体验
                  </div>
                </div>
                <button
                  className="hero-image"
                  onClick={() => showPlace('xiaoqikong')}
                >
                  <img src="/images/xiaoqikong.jpg" alt="荔波小七孔山水" />
                  <span className="photo-label">
                    <MapPin size={18} />
                    <span>
                      把日子，交给山水<small>荔波 · 小七孔</small>
                    </span>
                    <ArrowUpRight size={22} />
                  </span>
                </button>
              </section>
              <SocialInspiration
                savedPostIds={data.savedPostIds}
                onChangeSavedPosts={(ids) =>
                  setData((d) => ({ ...d, savedPostIds: ids }))
                }
                onCustomize={(ids, sourceIds, context) => {
                  try {
                    createTrip(
                      createTripFromPlanningMaterial(ids, sourceIds, context),
                    );
                  } catch (cause) {
                    notify(
                      cause instanceof Error
                        ? cause.message
                        : '暂时无法生成行程，请补充具体地点后重试。',
                    );
                  }
                }}
              />
              <HomeCarousel
                title="今天，值得去哪里？"
                subtitle="AI 精选 · 不只看评分，更看今天适不适合你。"
                actions={
                  <button
                    className="text-btn"
                    onClick={() => {
                      go('discover');
                      setTripTab('探索');
                    }}
                  >
                    探索更多 <ArrowRight size={16} />
                  </button>
                }
              >
                {[
                  'xiaoqikong',
                  'xijiang',
                  'jiaxiu',
                  'huangguoshu',
                  'museum',
                  'qingyan',
                  'zunyi',
                ].map(card)}
              </HomeCarousel>
              <section
                className="theme-discovery"
                aria-labelledby="theme-discovery-title"
              >
                <div className="section-heading">
                  <div>
                    <h2 id="theme-discovery-title">六种方式，遇见贵州</h2>
                    <p>点击喜欢的主题，生成你的专属行程路线。</p>
                  </div>
                </div>
                <div className="theme-image-grid">
                  {themes.map((t, i) => {
                    const C = categoryIcons[i];
                    return (
                      <button
                        className="theme-image-card"
                        key={t}
                        aria-label={`${t} · ${themeInfo[t].subtitle}，创建主题行程`}
                        title={
                          themeInfo[t].definition + ' ' + themeInfo[t].boundary
                        }
                        onClick={() => {
                          setImported([]);
                          open('create', [], t);
                        }}
                      >
                        <img src={themeImages[t]} alt="" loading="lazy" />
                        <span className="theme-image-label">
                          <C size={24} />
                          <b>{t}</b>
                          <small>{themeInfo[t].subtitle}</small>
                        </span>
                        <ArrowUpRight size={16} aria-hidden="true" />
                      </button>
                    );
                  })}
                </div>
              </section>
              <DataFootnote />
            </main>
          )}
          {page === 'trip' && (
            <main className="trip-page">
              <div className="trip-header">
                <div>
                  <div className="eyebrow">YOUR NEXT LITTLE ADVENTURE</div>
                  <h1>{trip.title}</h1>
                  <div className="trip-meta">
                    <span>
                      <CalendarDays size={14} />
                      {trip.start.slice(5).replace('-', '/')} —{' '}
                      {trip.days.at(-1)!.date.slice(5).replace('-', '/')}
                    </span>
                    <span>
                      <Users size={14} />
                      {trip.people.length} 人同行
                    </span>
                    <span>{trip.pace}节奏</span>
                  </div>
                </div>
                <div className="trip-actions">
                  <Button
                    className="outline-btn"
                    onClick={() => open('presets')}
                  >
                    <CalendarDays size={16} /> 三日样例
                  </Button>
                  <button
                    className="outline-btn"
                    onClick={() => open('export')}
                  >
                    <Download size={16} />
                    <span>导出</span>
                  </button>
                  <Button className="dark-btn" onClick={() => open('publish')}>
                    <Share2 size={16} /> 发布约伴
                  </Button>
                </div>
              </div>
              <div className="trip-tabs">
                <div className="tab-row">
                  {['概览', '行程', '探索', '费用', '游记'].map((t) => (
                    <button
                      key={t}
                      className={tripTab === t ? 'active' : ''}
                      onClick={() => setTripTab(t)}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <button
                  className="text-btn"
                  disabled={!lastTrip || lastTrip.id !== trip.id}
                  onClick={() => {
                    if (lastTrip) {
                      updateTrip(lastTrip, false);
                      setLastTrip(null);
                      notify('已撤销上一步行程修改。');
                    }
                  }}
                >
                  <Undo2 size={15} />
                  撤销
                </button>
              </div>
              {tripTab === '行程' && (
                <div className="planner-grid">
                  <section className="timeline-pane">
                    <div className="day-pills">
                      {trip.days.map((d, i) => (
                        <button
                          key={d.id}
                          className={i === dayIndex ? 'active' : ''}
                          onClick={() => changeDay(i)}
                        >
                          <b>DAY {String(i + 1).padStart(2, '0')}</b>
                          <span>{d.date.slice(5).replace('-', '/')}</span>
                        </button>
                      ))}
                    </div>
                    <DayBrief
                      plan={dayPlan}
                      onSettings={(settings) =>
                        updateDay({
                          ...day,
                          settings: { ...day.settings, ...settings },
                        })
                      }
                      onProfile={(travelerProfile) =>
                        updateTrip({ ...trip, travelerProfile })
                      }
                    />
                    <div className="day-heading">
                      <div>
                        <h2>{dateLabel(day.date)}</h2>
                        <p>{day.title}</p>
                      </div>
                      <button
                        className="text-btn accent-text"
                        onClick={() => open('optimize')}
                        disabled={day.items.length < 3}
                      >
                        <Route size={15} />
                        优化路线
                      </button>
                    </div>
                    <div className="route-stats">
                      <span>
                        <MapPin size={13} />
                        {day.items.length} 个地点
                      </span>
                      <span>
                        <Route size={13} />
                        {dayMetrics.km.toFixed(1)} km
                      </span>
                      <span>
                        <Clock size={13} />
                        {dayMetrics.minutes} 分钟交通
                      </span>
                      <small>估算</small>
                    </div>
                    <div className="day-route-tools">
                      <button
                        className="outline-btn"
                        disabled={!dayPlan.segments.length}
                        onClick={() => showTransport()}
                      >
                        <Route size={16} /> 交通方案与线路查询{' '}
                        <ArrowUpRight size={15} />
                      </button>
                      <button
                        className="text-btn"
                        onClick={() => open('presets')}
                      >
                        <Sparkles size={15} /> 换一份三日灵感
                      </button>
                    </div>
                    {dayPlan.segments.some((segment) => segment.crossDay) && (
                      <p className="cross-day-note">
                        已计入上日住宿 /
                        尾站到今日首站的跨城接续，出发时间随今日安排更新；实际接驳与班次仍需核验。
                      </p>
                    )}
                    <button
                      className="weather-banner"
                      onClick={() => open('weather')}
                    >
                      <span className="feature-icon">
                        <CloudSun />
                      </span>
                      <span>
                        <b>天气会变，好心情不变</b>
                        <small>天气 / 拥堵 / 闭园变化，看看黔驴怎么调整</small>
                      </span>
                      <ChevronRight size={18} />
                    </button>
                    {scheduled.some((t) => t.warning) && (
                      <p className="warning-message">
                        <Info size={16} />
                        部分地点超出营业时间，请减少停留或调整顺序。
                      </p>
                    )}
                    <div className="timeline-list">
                      {scheduled.map(
                        (
                          {
                            item,
                            place: p,
                            start,
                            end,
                            warning,
                            eventsBefore,
                            breaks,
                            details,
                            goScore: currentScore,
                            meal,
                          },
                          i,
                        ) => (
                          <div
                            key={item.id}
                            id={'item-' + item.id}
                            className="timeline-node"
                            draggable
                            onDragStart={() => setDragId(item.id)}
                            onDragEnd={() => setDragId(null)}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={() => onDrop(item.id)}
                          >
                            {eventsBefore.map((event) => (
                              <DayEvent
                                event={event}
                                key={event.key}
                                onTransport={showTransport}
                              />
                            ))}
                            <div
                              className={
                                'timeline-card ' +
                                (selectedItem?.id === item.id ? 'selected' : '')
                              }
                            >
                              <div className="stop-number">{i + 1}</div>
                              <button
                                className="stop-main"
                                onClick={() => selectItem(item.id)}
                              >
                                <div className="stop-copy">
                                  <span className="stop-time">
                                    {clock(start)} — {clock(end)}
                                  </span>
                                  <h3>{p.name}</h3>
                                  <p>{item.plan?.activity ?? p.description}</p>
                                  <span className="stop-tags">
                                    <span className="mini-tag">
                                      {p.category}
                                    </span>
                                    {meal && (
                                      <span className="mini-tag">
                                        {meal === 'breakfast'
                                          ? '早餐'
                                          : meal === 'lunch'
                                            ? '午餐'
                                            : '晚餐'}
                                      </span>
                                    )}
                                    <span className="score-inline">
                                      <Clock size={13} /> 游玩 {item.duration}{' '}
                                      分钟
                                    </span>
                                  </span>
                                </div>
                                {p.image ? (
                                  <img src={p.image} alt={p.name} />
                                ) : (
                                  <div className="stop-icon">
                                    <Mountain size={33} />
                                    <small>{p.region}</small>
                                  </div>
                                )}
                              </button>
                              <GoScoreCard
                                score={currentScore}
                                placeName={p.name}
                              />
                              <ol className="visit-steps">
                                {details.map((step, n) => (
                                  <li key={step.label}>
                                    <i>{n + 1}</i>
                                    <span>{step.label}</span>
                                    <small>{step.minutes}分</small>
                                  </li>
                                ))}
                              </ol>
                              {breaks.map((event) => (
                                <DayEvent
                                  event={event}
                                  key={event.key}
                                  onTransport={showTransport}
                                />
                              ))}
                              <details className="stop-practical">
                                <summary>游玩提示与时间安排</summary>
                                <p>{p.tip}</p>
                                {item.plan?.tips.map((tip) => (
                                  <p key={tip}>{tip}</p>
                                ))}
                                <p>
                                  开放 {p.hours[0]}:00—{p.hours[1]}:00 ·
                                  参考费用 ¥{money(p.price)}/人 · 出发前核验
                                </p>
                                <label>
                                  不早于此时间开始{' '}
                                  <input
                                    type="time"
                                    aria-label={p.name + '建议开始时间'}
                                    value={clock(
                                      item.plan?.earliestStart ??
                                        p.hours[0] * 60,
                                    )}
                                    onChange={(e) => {
                                      if (!/^\d{2}:\d{2}$/.test(e.target.value))
                                        return;
                                      const [h, m] = e.target.value
                                        .split(':')
                                        .map(Number);
                                      updateItems(
                                        day.items.map((x) =>
                                          x.id === item.id
                                            ? {
                                                ...x,
                                                plan: {
                                                  activity:
                                                    x.plan?.activity ??
                                                    p.description,
                                                  tips: x.plan?.tips ?? [p.tip],
                                                  earliestStart: h * 60 + m,
                                                },
                                              }
                                            : x,
                                        ),
                                      );
                                    }}
                                  />
                                </label>
                              </details>
                              <div className="stop-toolbar">
                                <GripVertical size={15} />
                                <label>
                                  停留{' '}
                                  <select
                                    aria-label={p.name + '停留时长'}
                                    value={item.duration}
                                    onChange={(e) =>
                                      updateItems(
                                        day.items.map((x) =>
                                          x.id === item.id
                                            ? {
                                                ...x,
                                                duration: Number(
                                                  e.target.value,
                                                ),
                                              }
                                            : x,
                                        ),
                                      )
                                    }
                                  >
                                    {[
                                      ...new Set([
                                        30,
                                        45,
                                        60,
                                        75,
                                        90,
                                        100,
                                        120,
                                        150,
                                        180,
                                        240,
                                        item.duration,
                                      ]),
                                    ]
                                      .sort((a, b) => a - b)
                                      .map((v) => (
                                        <option value={v} key={v}>
                                          {v} 分钟
                                        </option>
                                      ))}
                                  </select>
                                </label>
                                <button
                                  className="text-btn duration-more"
                                  disabled={item.duration >= 720}
                                  onClick={() =>
                                    updateItems(
                                      day.items.map((x) =>
                                        x.id === item.id
                                          ? {
                                              ...x,
                                              duration: Math.min(
                                                720,
                                                x.duration + 30,
                                              ),
                                            }
                                          : x,
                                      ),
                                    )
                                  }
                                  aria-label={`延长${p.name}30分钟`}
                                >
                                  +30分钟
                                </button>
                                <button
                                  className="text-btn replace-stop"
                                  onClick={() => startReplace(item)}
                                  aria-label={`替换${p.name}`}
                                >
                                  替换
                                </button>
                                <button
                                  className="icon-btn"
                                  aria-label={'上移' + p.name}
                                  disabled={i === 0}
                                  onClick={() => moveItem(item.id, -1)}
                                >
                                  <ArrowUp size={14} />
                                </button>
                                <button
                                  className="icon-btn"
                                  aria-label={'下移' + p.name}
                                  disabled={i === day.items.length - 1}
                                  onClick={() => moveItem(item.id, 1)}
                                >
                                  <ArrowDown size={14} />
                                </button>
                                <button
                                  className="icon-btn"
                                  aria-label={'移除' + p.name}
                                  onClick={() => {
                                    updateItems(
                                      day.items.filter((x) => x.id !== item.id),
                                    );
                                    notify('已移除地点，可使用撤销恢复。');
                                  }}
                                >
                                  <Trash2 size={14} />
                                </button>
                                <button
                                  className="text-btn"
                                  onClick={() => showPlace(p.id)}
                                >
                                  详情
                                  <ChevronRight size={13} />
                                </button>
                              </div>
                              {warning && (
                                <div className="stop-warning">
                                  超出营业时间 {p.hours[0]}:00—{p.hours[1]}
                                  :00
                                </div>
                              )}
                            </div>
                          </div>
                        ),
                      )}
                      {dayPlan.afterEvents.map((event) => (
                        <DayEvent
                          event={event}
                          key={event.key}
                          onTransport={showTransport}
                        />
                      ))}
                    </div>
                    {!day.items.length && (
                      <div className="empty-itinerary">
                        <Empty
                          title="从一份完整三日计划开始"
                          text="贵阳慢游、荔波山水、黔东南村寨，已安排每天的游览、用餐和交通参考。也可继续手动添加地点。"
                        />
                        <Button
                          className="primary-btn"
                          onClick={() => open('presets')}
                        >
                          <Sparkles size={18} /> 选择详细三日行程{' '}
                          <ArrowRight size={17} />
                        </Button>
                      </div>
                    )}
                    <button
                      className="add-place-btn"
                      onClick={() => {
                        setQuery('');
                        setFilter('全部');
                        open('add');
                      }}
                    >
                      <Plus size={20} />
                      添加地点 <span>让旅行更像你</span>
                    </button>
                    <p className="timeline-help">
                      拖动卡片或使用上下箭头排序 · 修改后自动重算后续时间
                    </p>
                  </section>
                  <aside className="map-pane">
                    <GuizhouRouteMap
                      items={day.items}
                      summary={dayMetrics}
                      selected={selectedItem?.id || null}
                      dayIndex={dayIndex}
                      onSelect={(id) => {
                        selectItem(id, true);
                        if (typeof window !== 'undefined' && window.matchMedia('(max-width: 760px)').matches) {
                          const item = day.items.find((i) => i.id === id);
                          if (item) showPlace(item.placeId);
                        }
                      }}
                      scenario={dayPlan.settings.scenario}
                      onScenarioChange={(scenario) =>
                        updateDay({
                          ...day,
                          settings: { ...day.settings, scenario },
                        })
                      }
                      onApplyRain={() => {
                        const result = rainPlanChanges(day.items);
                        updateDay({
                          ...day,
                          items: result.items,
                          settings: { ...day.settings, scenario: 'rain' },
                        });
                        notify('已应用雨天方案，并重新计算后续时间。');
                      }}
                      onTransport={() => showTransport()}
                    />
                    {selectedItem ? (
                      <PlaceDetail
                        key={selectedItem.placeId}
                        place={placeById(selectedItem.placeId)}
                        saved={data.savedPlaces.includes(selectedItem.placeId)}
                        onSave={toggleSave}
                        onAdd={addPlace}
                        preferences={trip.preferences}
                        journeyScore={
                          scheduled.find((v) => v.item.id === selectedItem.id)
                            ?.goScore
                        }
                        compact
                      />
                    ) : (
                      <div className="empty-map">
                        <Map size={32} />
                        <p>添加地点后，路线会出现在这里。</p>
                      </div>
                    )}
                  </aside>
                </div>
              )}
              {tripTab === '概览' && (
                <section className="trip-content">
                  {!!trip.sourcePostIds?.length && (
                    <div className="trip-source-library">
                      <h3>这趟旅行的灵感来源</h3>
                      <p>原内容始终保留，你的行程修改不会改变它。</p>
                      {trip.sourcePostIds.map((id) => {
                        const p = socialPosts.find((post) => post.id === id);
                        return (
                          p && (
                            <a key={id} href={'/inspiration/' + id}>
                              <NotebookPen size={16} />
                              <span>
                                {p.title}
                                <small>
                                  {p.theme || '综合灵感'} · 可重新定制
                                </small>
                              </span>
                              <ArrowUpRight size={16} />
                            </a>
                          )
                        );
                      })}
                    </div>
                  )}
                  <div className="overview-hero">
                    <div>
                      <span className="eyebrow">A LITTLE ESCAPE</span>
                      <h2>这一程，有山水，也有故事。</h2>
                      <p>
                        {trip.destination} · {trip.days.length} 天 ·{' '}
                        {trip.people.join('、')} · {trip.pace}节奏
                      </p>
                      <div className="pill-group">
                        {(trip.preferences.length
                          ? trip.preferences
                          : ['山水', '文化', '美食']
                        ).map((t) => (
                          <span className="pill" key={t}>
                            {t}
                          </span>
                        ))}
                      </div>
                      <Button
                        className="primary-btn"
                        onClick={() => setTripTab('行程')}
                      >
                        开始看行程 <ArrowRight />
                      </Button>
                    </div>
                    <img src="/images/xijiang.jpg" alt="西江千户苗寨" />
                  </div>
                  <div className="overview-stats">
                    <div>
                      <MapPin />
                      <strong>
                        {trip.days.reduce((s, d) => s + d.items.length, 0)}
                      </strong>
                      <span>处值得停留</span>
                    </div>
                    <div>
                      <CalendarDays />
                      <strong>{trip.days.length}</strong>
                      <span>天慢慢相遇</span>
                    </div>
                    <div>
                      <Wallet />
                      <strong>¥{money(trip.budget)}</strong>
                      <span>全员总预算</span>
                    </div>
                  </div>
                  <div className="overview-days">
                    {trip.days.map((d, i) => (
                      <button
                        key={d.id}
                        onClick={() => {
                          setDayIndex(i);
                          setTripTab('行程');
                        }}
                      >
                        <span>DAY 0{i + 1}</span>
                        <div>
                          <h3>{d.title}</h3>
                          <p>
                            {d.items
                              .map((x) => placeById(x.placeId).name)
                              .join(' → ') || '自由安排'}
                          </p>
                        </div>
                        <ChevronRight />
                      </button>
                    ))}
                  </div>
                  <div className="notice">
                    跨城交通、开放时间与价格为估算。示意路线不含酒店接送和真实导航，请在正式出发前核验。
                  </div>
                </section>
              )}
              {tripTab === '探索' && (
                <section className="trip-content">
                  <ExploreHeader
                    query={query}
                    setQuery={setQuery}
                    filter={filter}
                    setFilter={setFilter}
                  />
                  <div className="destination-grid">
                    {filteredPlaces.map((p) => card(p.id))}
                  </div>
                  {!filteredPlaces.length && (
                    <Empty
                      title="还没找到这处风景"
                      text="试试贵州城市、景点名称，或者切换主题。"
                    />
                  )}
                </section>
              )}
              {tripTab === '费用' && (
                <section className="trip-content budget-page">
                  <div className="section-heading">
                    <div>
                      <h2>把花费记清，让同行更轻松</h2>
                      <p>记录谁付了什么，剩下的交给黔驴。</p>
                    </div>
                    <Button
                      className="primary-btn"
                      onClick={() => {
                        setExpenseTitle('');
                        setExpenseAmount('');
                        setPayer(trip.people[0]);
                        open('expense');
                      }}
                    >
                      <Plus />
                      记一笔
                    </Button>
                  </div>
                  <div className="budget-card">
                    <span>本次旅行已花费</span>
                    <div className="budget-total">
                      ¥{money(settlement.total)}
                      <small> / ¥{money(trip.budget)}</small>
                    </div>
                    <Progress
                      value={Math.min(
                        100,
                        (settlement.total / trip.budget) * 100,
                      )}
                      aria-label="预算使用比例"
                    />
                    <div className="budget-bottom">
                      <span
                        className={
                          settlement.total > trip.budget ? 'danger-text' : ''
                        }
                      >
                        {settlement.total > trip.budget
                          ? '已超出预算'
                          : '剩余预算'}{' '}
                        ¥{money(Math.abs(trip.budget - settlement.total))}
                      </span>
                      <label htmlFor="travel-app-field-1">
                        调整预算 ¥
                        <Input
                          id="travel-app-field-1"
                          aria-label="总预算"
                          type="number"
                          value={trip.budget}
                          min={100}
                          max={100000}
                          onChange={(e) => {
                            const v = Number(e.target.value);
                            if (v >= 100 && v <= 100000)
                              updateTrip({ ...trip, budget: v });
                          }}
                        />
                      </label>
                    </div>
                  </div>
                  <div className="expense-grid">
                    <div className="panel">
                      <h3>费用明细</h3>
                      {expenses.map((e) => (
                        <div className="expense-row" key={e.id}>
                          <span className="feature-icon">
                            <Wallet size={18} />
                          </span>
                          <div>
                            <b>{e.title}</b>
                            <small>
                              {e.payer} 支付 · {trip.people.length} 人均摊
                            </small>
                          </div>
                          <strong>¥{money(e.amount)}</strong>
                          <button
                            className="icon-btn"
                            aria-label={'删除费用' + e.title}
                            onClick={() =>
                              setData((d) => ({
                                ...d,
                                expenses: d.expenses.filter(
                                  (x) => x.id !== e.id,
                                ),
                              }))
                            }
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                      {!expenses.length && (
                        <Empty
                          title="第一笔花费，记在这里"
                          text="添加费用后，自动计算每人应付与补款。"
                        />
                      )}
                    </div>
                    <div className="panel">
                      <h3>同行费用分摊</h3>
                      {settlement.balances.map((b) => (
                        <div className="split-row" key={b.name}>
                          <span className="avatar">{b.name[0]}</span>
                          <div>
                            <b>{b.name}</b>
                            <small>
                              已付 ¥{money(b.paid)} · 应付 ¥{money(b.owed)}
                            </small>
                          </div>
                        </div>
                      ))}
                      <div className="settlement">
                        <h4>建议结算</h4>
                        {settlement.transfers.map((t, i) => (
                          <p key={i}>
                            {t.from} <ArrowRight size={13} /> {t.to}
                            <b>¥{money(t.amount)}</b>
                          </p>
                        ))}
                        {!settlement.transfers.length && (
                          <p>
                            <Check size={16} />
                            账目已平，无需补款
                          </p>
                        )}
                        <small>仅计算分摊，不发起真实转账。</small>
                      </div>
                    </div>
                  </div>
                </section>
              )}
              {tripTab === '游记' && (
                <section className="trip-content journal-page">
                  <span className="eyebrow">MEMORIES TO KEEP</span>
                  <h2>带走风景，也留下故事。</h2>
                  <p>记下路上的片刻，导出时会一起收进行程攻略。</p>
                  <label className="field-label">
                    <span>我的旅行笔记</span>
                    <textarea
                      value={trip.notes}
                      onChange={(e) =>
                        updateTrip({ ...trip, notes: e.target.value }, false)
                      }
                      placeholder="今天最喜欢的风景、吃到的味道、遇见的人…"
                      rows={10}
                    />
                  </label>
                  <Button className="primary-btn" onClick={exportGuide}>
                    <Download />
                    导出旅行攻略
                  </Button>
                </section>
              )}
            </main>
          )}
          {page === 'discover' && (
            <main className="home-page">
              <div className="page-heading">
                <div>
                  <div className="eyebrow">GOOD PLACES, GOOD COMPANY</div>
                  <h1>风景之外，还有同路人。</h1>
                  <p>发现一条喜欢的路线，遇见一个同频的旅行搭子。</p>
                </div>
                <Button className="primary-btn" onClick={() => open('publish')}>
                  <Plus />
                  发布我的行程
                </Button>
              </div>
              <div className="tab-row discover-tabs">
                {['约伴广场', '探索'].map((t) => (
                  <button
                    key={t}
                    className={
                      (tripTab === '探索' ? t === '探索' : t === '约伴广场')
                        ? 'active'
                        : ''
                    }
                    onClick={() => {
                      setTripTab(t);
                      setFilter('全部');
                      setQuery('');
                    }}
                  >
                    {t === '探索' ? '探索目的地' : t}
                  </button>
                ))}
              </div>
              {tripTab === '探索' ? (
                <>
                  <ExploreHeader
                    query={query}
                    setQuery={setQuery}
                    filter={filter}
                    setFilter={setFilter}
                  />
                  <div className="destination-grid">
                    {filteredPlaces.map((p) => card(p.id))}
                  </div>
                  {!filteredPlaces.length && (
                    <Empty
                      title="暂未找到地点"
                      text="试试“贵阳”“瀑布”，或选择全部主题。"
                    />
                  )}
                </>
              ) : (
                <>
                  <div className="discover-banner">
                    <Users size={28} />
                    <div>
                      <h3>一条好路线，值得一起走。</h3>
                      <p>
                        收藏灵感、复制行程，或者说一句“一起玩”。约伴互动仅在本机。
                      </p>
                    </div>
                  </div>
                  <div className="feed-grid">
                    {[...data.feed]
                      .sort(
                        (a, b) =>
                          b.trip.preferences.filter((p) =>
                            trip.preferences.includes(p),
                          ).length -
                          a.trip.preferences.filter((p) =>
                            trip.preferences.includes(p),
                          ).length,
                      )
                      .map((post) => (
                        <article className="feed-card" key={post.id}>
                          <div className="feed-image">
                            <img
                              src={post.image}
                              alt={post.trip.destination + '风景'}
                              loading="lazy"
                            />
                            <span className="image-tag">
                              {post.trip.days.length} 天 · {post.trip.pace}旅行
                            </span>
                            <button
                              className={
                                'icon-btn ' + (post.saved ? 'saved' : '')
                              }
                              aria-label={
                                (post.saved ? '取消收藏行程' : '收藏行程') +
                                post.title
                              }
                              onClick={() =>
                                setData((d) => ({
                                  ...d,
                                  feed: d.feed.map((f) =>
                                    f.id === post.id
                                      ? { ...f, saved: !f.saved }
                                      : f,
                                  ),
                                }))
                              }
                            >
                              <Bookmark size={18} />
                            </button>
                          </div>
                          <div className="feed-body">
                            <span className="feed-author">
                              <span className="avatar small">
                                {post.author[0]}
                              </span>
                              {post.author}
                              <small>发布了旅行</small>
                            </span>
                            <h2>{post.title}</h2>
                            <p>{post.description}</p>
                            <div className="feed-meta">
                              <span>
                                <MapPin size={13} />
                                {post.trip.destination}
                              </span>
                              <span>
                                <CalendarDays size={13} />
                                {post.trip.start.slice(5)}
                              </span>
                              <span>¥{money(post.trip.budget)} / 全程</span>
                            </div>
                            <div className="pill-group">
                              {(post.trip.preferences.length
                                ? post.trip.preferences
                                : ['山水奇观', '多彩民族']
                              ).map((t) => (
                                <span className="mini-tag" key={t}>
                                  {t}
                                </span>
                              ))}
                            </div>
                            <div className="feed-footer">
                              <button
                                className="outline-btn"
                                onClick={() => copyShared(post)}
                              >
                                <Copy size={15} />
                                复制行程
                              </button>
                              <Button
                                className={
                                  post.requested ? 'outline-btn' : 'primary-btn'
                                }
                                disabled={post.requested}
                                onClick={() => {
                                  setData((d) => ({
                                    ...d,
                                    feed: d.feed.map((f) =>
                                      f.id === post.id
                                        ? { ...f, requested: true }
                                        : f,
                                    ),
                                  }));
                                  notify(
                                    '结伴请求已在本机记录，未发送给真实用户。',
                                  );
                                }}
                              >
                                {post.requested ? (
                                  <>
                                    <Check size={16} />
                                    已申请
                                  </>
                                ) : (
                                  <>
                                    <Users size={16} />
                                    一起玩
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </article>
                      ))}
                  </div>
                </>
              )}
              <DataFootnote />
            </main>
          )}
          {page === 'profile' && (
            <main className="home-page profile-page">
              <div className="page-heading">
                <div>
                  <div className="eyebrow">YOUR TRAVEL CORNER</div>
                  <h1>你好，{data.profile}。</h1>
                  <p>想去的远方，和已经开始的故事，都在这里。</p>
                </div>
                <span className="profile-avatar">旅</span>
              </div>
              <div className="overview-stats">
                <div>
                  <Map />
                  <strong>{data.trips.length}</strong>
                  <span>段我的旅行</span>
                </div>
                <div>
                  <Bookmark />
                  <strong>{data.savedPlaces.length}</strong>
                  <span>处收藏地点</span>
                </div>
                <div>
                  <Users />
                  <strong>{data.feed.filter((f) => f.requested).length}</strong>
                  <span>条约伴请求</span>
                </div>
              </div>
              <div className="section-heading profile-section-heading">
                <h2>我的旅行</h2>
                <button
                  className="text-btn"
                  onClick={() => {
                    setImported([]);
                    open('create');
                  }}
                >
                  <Plus size={16} />
                  新建旅行
                </button>
              </div>
              <div className="my-trips">
                {data.trips.map((t) => (
                  <button key={t.id} onClick={() => activateTrip(t.id)}>
                    <span className="feature-icon">
                      <Map />
                    </span>
                    <div>
                      <h3>{t.title}</h3>
                      <p>
                        {t.start} · {t.days.length} 天 · {t.people.length} 人
                      </p>
                    </div>
                    <ChevronRight />
                  </button>
                ))}
              </div>
              <div className="section-heading profile-section-heading">
                <h2>规划素材</h2>
              </div>
              <div className="my-trips material-library">
                {data.savedPostIds.map((id) => {
                  const p = socialPosts.find((post) => post.id === id)!;
                  return (
                    <article key={id}>
                      <a href={'/inspiration/' + id}>
                        <NotebookPen size={20} />
                        <span>
                          <b>{p.title}</b>
                          <small>
                            {p.theme || '综合灵感'} ·{' '}
                            {p.kind === 'video'
                              ? `原作者视频 · ${p.author}`
                              : '站内编辑攻略'}
                          </small>
                        </span>
                        <ArrowUpRight size={16} />
                      </a>
                      <button
                        className="text-btn"
                        onClick={() => {
                          const ids = p.mentions.map((m) => m.placeId);
                          setImported(ids);
                          open('create', [p.id]);
                        }}
                      >
                        <Sparkles size={15} />
                        用它定制
                      </button>
                      <button
                        className="icon-btn"
                        aria-label={'取消收藏素材' + p.title}
                        onClick={() =>
                          setData((d) => ({
                            ...d,
                            savedPostIds: d.savedPostIds.filter(
                              (x) => x !== id,
                            ),
                          }))
                        }
                      >
                        <Trash2 size={15} />
                      </button>
                    </article>
                  );
                })}
              </div>
              {!data.savedPostIds.length && (
                <p className="panel-sub">
                  首页收藏视频或笔记后，会保存在这里，随时用于后续规划。
                </p>
              )}
              <div className="section-heading profile-section-heading">
                <h2>收藏的地点</h2>
              </div>
              <div className="destination-grid">
                {data.savedPlaces.map(card)}
              </div>
              {!data.savedPlaces.length && (
                <Empty
                  title="把喜欢的风景，先收藏起来"
                  text="在探索页点击书签，即可收进这里。"
                />
              )}
              <div className="section-heading profile-section-heading">
                <h2>收藏的路线</h2>
              </div>
              <div className="my-trips saved-routes">
                {data.feed
                  .filter((f) => f.saved)
                  .map((f) => (
                    <button key={f.id} onClick={() => copyShared(f)}>
                      <Bookmark />
                      <div>
                        <h3>{f.title}</h3>
                        <p>点击复制为我的行程</p>
                      </div>
                      <Copy size={18} />
                    </button>
                  ))}
              </div>
              {!data.feed.some((f) => f.saved) && (
                <p className="panel-sub">
                  还没有收藏路线，去发现页遇见下一段旅行。
                </p>
              )}
              <section className="panel offline-panel">
                <h3>山里没信号，也不慌</h3>
                <p className="panel-sub">
                  本机保存行程与修改。缓存页面后，生产版本可离线读取；云端同步尚未接入。
                </p>
                <div className="offline-state">
                  <WifiOff size={28} />
                  <span>
                    {data.offlineReady
                      ? '已完成页面资源缓存'
                      : '离线资源尚未准备'}
                    <small>不会请求位置、相册或通讯录权限</small>
                  </span>
                </div>
                <Button
                  className="outline-btn"
                  disabled={busy}
                  onClick={() => void enableOffline()}
                >
                  {busy ? (
                    <LoaderCircle className="spin" size={16} />
                  ) : (
                    <Download size={16} />
                  )}
                  准备离线访问
                </Button>
                <button className="text-btn" onClick={exportTrip}>
                  导出行程备份 <ArrowRight size={14} />
                </button>
                <div className="notice">
                  开发服务器依赖开发模块，完整离线体验请使用生产构建。清除浏览器数据会移除本机内容。
                </div>
              </section>
              {/* <div className="about-demo">
                <h3>关于规划数据</h3>
                <p>
                  Vite + TypeScript · 本地规划服务 ·
                  无真实交易与社交发送。所有天气、交通、评分和价格仅用于交互演示。地图为近似地理示意，不提供导航。
                </p>
                <details>
                  <summary>图片来源与演示说明</summary>
                  <p>
                    贵州风景摄影来自公开攻略页面，仅用于界面中的规划参考。
                    正式对外使用前需替换为团队授权素材。
                  </p>
                  <a
                    href="https://you.ctrip.com/sight/libo659/107386.html"
                    target="_blank"
                    rel="noreferrer"
                  >
                    荔波小七孔
                  </a>{' '}
                  ·{' '}
                  <a
                    href="https://gs.ctrip.com/html5/you/travels/120531/3976245.html"
                    target="_blank"
                    rel="noreferrer"
                  >
                    西江千户苗寨
                  </a>{' '}
                  ·{' '}
                  <a
                    href="https://you.ctrip.com/sight/guiyang33/18081.html"
                    target="_blank"
                    rel="noreferrer"
                  >
                    甲秀楼
                  </a>{' '}
                  ·{' '}
                  <a
                    href="https://www.tanxingmao.com/detail-54.html"
                    target="_blank"
                    rel="noreferrer"
                  >
                    黄果树
                  </a>{' '}
                  ·{' '}
                  <a
                    href="https://hk.trip.com/restaurant/china/kaili/detail/silianhongtangsiwawa-30810956/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    丝娃娃美食
                  </a>{' '}
                  ·{' '}
                  <a
                    href="https://k.sina.cn/article_1786653501_p6a7e2b3d02700bzzr.html"
                    target="_blank"
                    rel="noreferrer"
                  >
                    梵净山登山步道（程阅川）
                  </a>{' '}
                  ·{' '}
                  <a
                    href="https://gs.ctrip.com/html5/you/sight/zunyi204/17661.html"
                    target="_blank"
                    rel="noreferrer"
                  >
                    遵义会议旧址
                  </a>{' '}
                  ·{' '}
                  <a
                    href="https://city.cri.cn/20171212/25ff4ee6-a818-28a4-f711-1abbcc869b3b.html"
                    target="_blank"
                    rel="noreferrer"
                  >
                    青岩古镇（新华社 / 国际在线）
                  </a>{' '}
                  ·{' '}
                  <a
                    href="https://you.ctrip.com/sight/jiangkou2334/4747351.html"
                    target="_blank"
                    rel="noreferrer"
                  >
                    梵净山蘑菇石
                  </a>{' '}
                  ·{' '}
                  <a
                    href="https://you.ctrip.com/sight/xingyi519/17707.html"
                    target="_blank"
                    rel="noreferrer"
                  >
                    马岭河峡谷
                  </a>{' '}
                  ·{' '}
                  <a
                    href="https://www.sohu.com/a/439876229_100195554"
                    target="_blank"
                    rel="noreferrer"
                  >
                    丹寨蜡染（乐玩日志）
                  </a>
                </details>
              </div> */}
            </main>
          )}
        </div>
        <nav className="bottom-nav" aria-label="手机主导航">
          {navEntries.map(({ id, label, Icon }) => (
            <button
              key={id}
              className={page === id ? 'active' : ''}
              onClick={() => go(id)}
              aria-current={page === id ? 'page' : undefined}
            >
              <Icon size={22} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <button
          className="assistant-fab"
          onClick={() => open('assistant')}
          aria-label="询问黔驴旅行助手"
        >
          <Sparkles size={23} />
          <span>问问黔驴</span>
        </button>
        <Dialog
          open={modal !== null}
          onOpenChange={(v) => {
            if (!v && !busy) {
              setModal(null);
              setError('');
            }
          }}
        >
          <DialogContent
            className={
              'travel-dialog ' +
              (modal === 'create' ? 'wizard-dialog' : '') +
              (modal === 'transport' || modal === 'presets'
                ? ' route-dialog'
                : '')
            }
          >
            <DialogTitle className="sr-only">
              {(
                {
                  create: '创建旅行',
                  import: '从链接生成攻略',
                  detail: '地点详情',
                  add: '添加地点',
                  replace: '替换行程地点',
                  optimize: '优化路线',
                  weather: '应对旅途变化',
                  expense: '记录费用',
                  publish: '发布行程约伴',
                  assistant: '黔驴旅行助手',
                  export: '导出旅行',
                  presets: '选择详细三日行程',
                  transport: '交通方案与线路查询',
                } as Record<string, string>
              )[modal || ''] || '旅行工具'}
            </DialogTitle>
            <DialogDescription className="sr-only">
              AI 黔驴交互，数据保存在当前浏览器。
            </DialogDescription>
            {modal === 'presets' && (
              <ItineraryLibrary
                trip={trip}
                onCreate={createTrip}
                onFill={(next) => {
                  updateTrip(next);
                  setDayIndex(0);
                  setSelected(null);
                  setModal(null);
                  setTripTab('行程');
                  go('trip');
                  notify('已填入详细三日样例，原日期与笔记保留，可撤销。');
                }}
              />
            )}
            {modal === 'transport' && (
              <TransportPlanner
                key={day.id + (transportTo ?? '')}
                plan={dayPlan}
                initialTo={transportTo}
                onChoose={(key, mode) => {
                  const segment = dayPlan.segments.find((s) => s.key === key);
                  if (segment)
                    updateDay(chooseDayTransport(day, segment, mode));
                }}
              />
            )}
            {modal === 'create' && (
              <TripWizard
                key={creationTheme ?? 'custom'}
                imported={imported}
                initialTheme={creationTheme}
                initialPlan={creationContext}
                onCreate={(t) =>
                  createTrip(attachTripSources(t, importedSourceIds))
                }
              />
            )}
            {modal === 'detail' && (
              <PlaceDetail
                key={detailId}
                place={placeById(detailId)}
                onAdd={addPlace}
                onSave={toggleSave}
                saved={data.savedPlaces.includes(detailId)}
                preferences={trip.preferences}
                journeyScore={
                  scheduled.find((v) => v.place.id === detailId)?.goScore
                }
              />
            )}
            {modal === 'import' && (
              <div className="modal-body">
                <span className="feature-icon">
                  <Link2 />
                </span>
                <h2>刷到的心动，落进地图。</h2>
                <p>粘贴社交链接，或直接输入地点名称。</p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    void parse();
                  }}
                >
                  <label className="field-label">
                    <span>链接 / 地点文案</span>
                    <textarea
                      value={link}
                      onChange={(e) => setLink(e.target.value)}
                      placeholder="甲秀楼、黔灵山公园、青云路美食街"
                      rows={3}
                    />
                  </label>
                  <div className="row-between">
                    <button
                      type="button"
                      className="text-btn"
                      onClick={() =>
                        setLink(
                          'https://www.xiaohongshu.com/explore/qianlv',
                        )
                      }
                    >
                      填入链接
                    </button>
                    <Button
                      type="submit"
                      className="primary-btn"
                      disabled={busy}
                    >
                      {busy ? <LoaderCircle className="spin" /> : <Sparkles />}
                      {busy ? '正在识别' : '识别攻略'}
                    </Button>
                  </div>
                </form>
                <p className="notice">
                  规划参考
                  模式不会抓取平台内容。支持域名的链接统一返回贵阳样例；直接输入地点名称可匹配本地数据。
                </p>
                {error && (
                  <div role="alert" className="error-message">
                    {error}
                    <button
                      className="text-btn"
                      onClick={() => {
                        setQuery('');
                        setFilter('全部');
                        open('add');
                      }}
                    >
                      手动搜索添加 <ArrowRight size={14} />
                    </button>
                  </div>
                )}
                {guide.length > 0 && (
                  <>
                    <div className="section-heading">
                      <h3>识别到 {guide.length} 个地点</h3>
                      <span className="mini-tag">可删除 · 去重</span>
                    </div>
                    <div className="guide-results">
                      {guide.map((id, i) => (
                        <div key={id}>
                          <span className="round-number">{i + 1}</span>
                          <span>
                            <b>{placeById(id).name}</b>
                            <small>
                              {placeById(id).category} ·{' '}
                              {placeById(id).duration} 分钟
                            </small>
                          </span>
                          <button
                            className="icon-btn"
                            aria-label={'删除识别地点' + placeById(id).name}
                            onClick={() =>
                              setGuide((g) => g.filter((x) => x !== id))
                            }
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <Button
                      className="primary-btn full-width"
                      onClick={() => {
                        setImported(guide);
                        open('create');
                      }}
                    >
                      用这些地点创建行程 <ArrowRight />
                    </Button>
                    <button
                      className="text-btn full-width"
                      onClick={() => {
                        const ids = guide.filter(
                          (id) => !day.items.some((i) => i.placeId === id),
                        );
                        updateItems([...day.items, ...ids.map(makeItem)]);
                        notify(
                          `已向当天加入 ${ids.length} 个地点，自动跳过重复项。`,
                        );
                        setModal(null);
                        go('trip');
                        setTripTab('行程');
                      }}
                    >
                      加入现有行程的第 {dayIndex + 1} 天
                    </button>
                  </>
                )}
              </div>
            )}
            {(modal === 'add' || modal === 'replace') && (
              <div className="modal-body">
                <span className="eyebrow">A PLACE TO REMEMBER</span>
                <h2>
                  {modal === 'replace'
                    ? '换一站，遇见新的风景。'
                    : '给旅行，加一点喜欢。'}
                </h2>
                <p>
                  {modal === 'replace'
                    ? `替换「${placeById(day.items.find((i) => i.id === replaceTarget)?.placeId ?? '').name}」。默认显示同主题，切换分类可选择其他玩法。保留此站的位置与最早开始时间。`
                    : `添加到「${trip.title}」第 ${dayIndex + 1} 天。`}
                </p>
                <ExploreHeader
                  query={query}
                  setQuery={setQuery}
                  filter={filter}
                  setFilter={setFilter}
                />
                <div className="search-results">
                  {filteredPlaces.map((p) => (
                    <div key={p.id}>
                      <span className="feature-icon">
                        <MapPin size={20} />
                      </span>
                      <div className="result-name">
                        <b>{p.name}</b>
                        <small>
                          {p.region} · {p.category} · 推荐指数{' '}
                          {score(p, 'normal', trip.preferences).total} ·
                          规划参考
                        </small>
                        <small>{p.description}</small>
                      </div>
                      <button
                        className="icon-btn"
                        aria-label={
                          (modal === 'replace' ? '替换为' : '添加') + p.name
                        }
                        disabled={day.items.some((i) => i.placeId === p.id)}
                        onClick={() => {
                          if (modal === 'replace' && replaceTarget) {
                            updateDay(
                              replaceDayPlace(day, replaceTarget, p.id),
                            );
                            setSelected(replaceTarget);
                            setModal(null);
                            notify(
                              `已替换为「${p.name}」，时间、交通和 GoScore 已重新计算。`,
                            );
                          } else addPlace(p.id);
                        }}
                      >
                        {day.items.some((i) => i.placeId === p.id) ? (
                          <Check size={19} />
                        ) : (
                          <Plus size={19} />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
                {!filteredPlaces.length && (
                  <Empty
                    title="还没有这个地点"
                    text="本地数据覆盖贵州样例地点，试试更短的关键词。"
                  />
                )}
              </div>
            )}
            {modal === 'optimize' && (
              <div className="modal-body">
                <span className="feature-icon">
                  <Route />
                </span>
                <h2>少一点绕路，多一点风景。</h2>
                <p>保留第一站，比较后续地点的顺序。交通按近似坐标估算。</p>
                <div className="comparison">
                  <div>
                    <small>当前路线</small>
                    <b>
                      {dayMetrics.minutes}
                      <em>分钟</em>
                    </b>
                    <span>{dayMetrics.km.toFixed(1)} km</span>
                  </div>
                  <ArrowRight />
                  <div>
                    <small>优化后</small>
                    <b>
                      {optimizedMetrics.minutes}
                      <em>分钟</em>
                    </b>
                    <span>{optimizedMetrics.km.toFixed(1)} km</span>
                  </div>
                </div>
                <div className="notice">
                  {dayMetrics.minutes === optimizedMetrics.minutes
                    ? '当前顺序已是此模型下的较优路线，无需调整。'
                    : `预计减少 ${dayMetrics.minutes - optimizedMetrics.minutes} 分钟交通。`}
                </div>
                <div className="route-preview">
                  {optimizedItems.map((i, n) => (
                    <span key={i.id}>
                      <b>{n + 1}</b>
                      {placeById(i.placeId).name}
                    </span>
                  ))}
                </div>
                <Button
                  className="primary-btn full-width"
                  onClick={() => {
                    updateItems(optimizedItems);
                    setModal(null);
                    notify('已应用优化路线，地图与时间轴同步更新。');
                  }}
                >
                  应用这个顺序 <Check />
                </Button>
                <p className="source-note">
                  不代表实际道路最短路径；开放时间冲突仍会在时间轴提示。
                </p>
              </div>
            )}
            {modal === 'weather' && (
              <div className="modal-body">
                <span className="feature-icon">
                  <CloudRain />
                </span>
                <h2>计划有变，故事继续。</h2>
                <p>选择一个事件，先看调整，再由你决定。</p>
                <div className="pill-group">
                  {[
                    ['rain', '突然下雨'],
                    ['crowd', '人流拥堵'],
                    ['closed', '景点闭园'],
                  ].map(([id, label]) => (
                    <button
                      className={'pill ' + (event === id ? 'selected' : '')}
                      key={id}
                      onClick={() => setEvent(id)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div className="ai-tip">
                  <Sparkles size={18} />
                  <div>
                    <b>黔驴的调整建议</b>
                    <p>{replan(day.items, event).reason}</p>
                  </div>
                </div>
                <div className="comparison-route">
                  <div>
                    <h4>调整前</h4>
                    {day.items.map((i) => (
                      <p key={i.id}>{placeById(i.placeId).name}</p>
                    ))}
                  </div>
                  <div>
                    <h4>调整后</h4>
                    {replan(day.items, event).items.map((i) => (
                      <p key={i.placeId}>{placeById(i.placeId).name}</p>
                    ))}
                  </div>
                </div>
                <p className="notice">
                  本次为规则重排。费用与交通不保证真实可行，应用后请检查时间轴警告；不向同行人发送真实通知。
                </p>
                <Button
                  className="primary-btn full-width"
                  onClick={() => {
                    updateItems(replan(day.items, event).items);
                    setModal(null);
                    notify('已采用调整方案，可撤销。未向真实同行人发送通知。');
                  }}
                >
                  采用调整方案 <Check />
                </Button>
              </div>
            )}
            {modal === 'expense' && (
              <form
                className="modal-body"
                onSubmit={(e) => {
                  e.preventDefault();
                  const amount = Number(expenseAmount);
                  if (
                    !expenseTitle.trim() ||
                    !Number.isFinite(amount) ||
                    amount <= 0 ||
                    amount > 1000000
                  ) {
                    setError('请填写费用名称和 0—1,000,000 元之间的有效金额。');
                    return;
                  }
                  setData((d) => ({
                    ...d,
                    expenses: [
                      ...d.expenses,
                      {
                        id: uid(),
                        tripId: trip.id,
                        title: expenseTitle.trim(),
                        amount: Math.round(amount * 100) / 100,
                        payer,
                      },
                    ],
                  }));
                  setModal(null);
                  notify('已记下这笔费用，分摊已更新。');
                }}
              >
                <span className="feature-icon">
                  <Wallet />
                </span>
                <h2>记下一笔旅行花费</h2>
                <p>所有同行人平均分摊，精确到分。</p>
                <label className="field-label" htmlFor="travel-app-field-3">
                  <span>花在了哪里？</span>
                  <Input
                    id="travel-app-field-3"
                    value={expenseTitle}
                    onChange={(e) => setExpenseTitle(e.target.value)}
                    required
                    maxLength={60}
                    placeholder="例如：今天的酸汤鱼"
                  />
                </label>
                <label className="field-label" htmlFor="travel-app-field-4">
                  <span>金额（元）</span>
                  <Input
                    id="travel-app-field-4"
                    type="number"
                    min="0.01"
                    step="0.01"
                    max="1000000"
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                    required
                    placeholder="0.00"
                  />
                </label>
                <label className="field-label">
                  <span>谁先支付？</span>
                  <select
                    value={payer}
                    onChange={(e) => setPayer(e.target.value)}
                  >
                    {trip.people.map((p) => (
                      <option key={p}>{p}</option>
                    ))}
                  </select>
                </label>
                {error && (
                  <p role="alert" className="error-message">
                    {error}
                  </p>
                )}
                <Button type="submit" className="primary-btn full-width">
                  保存费用 <Check />
                </Button>
              </form>
            )}
            {modal === 'publish' && (
              <div className="modal-body">
                <span className="feature-icon">
                  <Users />
                </span>
                <h2>好风景，想和你一起看。</h2>
                <p>把这份行程发布到本机的发现页，寻找同路人。</p>
                <div className="publish-preview">
                  <h3>{trip.title}</h3>
                  <p>
                    {trip.destination} · {trip.days.length} 天 · {trip.pace}节奏
                    · 总预算 ¥{money(trip.budget)}
                  </p>
                </div>
                <label className="field-label">
                  <span>和未来的旅行搭子说句话</span>
                  <textarea
                    rows={4}
                    value={publishText}
                    maxLength={300}
                    onChange={(e) => setPublishText(e.target.value)}
                  />
                </label>
                <p className="notice">
                  仅在本机展示，不会上传或公开。请勿填入手机号、身份证号等个人敏感信息。生产版本需接入用户认证与内容审核。
                </p>
                <Button
                  className="primary-btn full-width"
                  disabled={!publishText.trim()}
                  onClick={() => {
                    setData((d) => ({
                      ...d,
                      feed: [
                        {
                          id: uid(),
                          title: trip.title,
                          author: data.profile || '旅行家',
                          description: publishText,
                          trip: structuredClone(trip),
                          saved: false,
                          requested: false,
                          image:
                            trip.days
                              .flatMap((d) => d.items)
                              .map((i) => placeById(i.placeId).image)
                              .find(Boolean) || '/images/xijiang.jpg',
                        },
                        ...d.feed,
                      ],
                    }));
                    setModal(null);
                    setTripTab('约伴广场');
                    go('discover');
                    notify('已发布到本机发现页，未向真实社区发送。');
                  }}
                >
                  发布行程 <Share2 />
                </Button>
              </div>
            )}
            {modal === 'assistant' && (
              <div className="modal-body assistant-body">
                <span className="feature-icon">
                  <Sparkles />
                </span>
                <h2>这一程，我陪你想。</h2>
                <p>黔驴规则助手 · 不连接真实大模型</p>
                <div className="assistant-greeting">
                  你好，{data.profile}
                  。我可以帮你查看路线、说明预算，或为天气变化准备替代方案。
                </div>
                <div className="pill-group">
                  {['下雨怎么办？', '预算还剩多少？', '想体验贵州文化'].map(
                    (q) => (
                      <button
                        className="pill"
                        key={q}
                        onClick={() => {
                          setAssistantInput(q);
                          setAnswer(
                            q.includes('下雨')
                              ? '可以将户外地点替换为同区域室内体验。点击下方“旅途变化”查看具体调整，确认后才会修改。'
                              : q.includes('预算')
                                ? `当前记录花费 ¥${money(settlement.total)}，总预算 ¥${money(trip.budget)}，${settlement.total > trip.budget ? '已超出' : '还剩'} ¥${money(Math.abs(trip.budget - settlement.total))}。费用页可以查看每人应付与补款。`
                                : '建议从贵州省博物馆理解文化背景，再选择蜡染或银饰体验。工坊未经过真实核验，正式出行需先确认主理人、场次与授权。',
                          );
                        }}
                      >
                        {q}
                      </button>
                    ),
                  )}
                </div>
                {answer && (
                  <output className="assistant-answer">
                    <Sparkles size={18} />
                    <p>{answer}</p>
                  </output>
                )}
                <form
                  className="import-input"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!assistantInput.trim()) return;
                    setAnswer(
                      assistantInput.includes('雨') ||
                        assistantInput.includes('闭')
                        ? '天气与开放可能变化，可以使用“旅途变化”查看替代路线。此处没有真实天气与闭园通知。'
                        : assistantInput.includes('钱') ||
                            assistantInput.includes('预算')
                          ? `当前花费 ¥${money(settlement.total)}，预算 ¥${money(trip.budget)}，请在费用页查看完整分摊。`
                          : `关于“${assistantInput}”，当前仅有本地规则，无法核验实时信息。你可以在探索页搜索贵州地点，或通过创建旅行选择日期、预算与偏好。`,
                    );
                  }}
                >
                  <Input
                    value={assistantInput}
                    onChange={(e) => setAssistantInput(e.target.value)}
                    aria-label="询问旅行助手"
                    placeholder="问问路线、预算或天气变化…"
                  />
                  <Button
                    type="submit"
                    className="dark-btn"
                    aria-label="发送问题"
                  >
                    <Send size={17} />
                  </Button>
                </form>
                <div className="row-between">
                  <button className="text-btn" onClick={() => open('weather')}>
                    <CloudRain size={16} />
                    旅途变化
                  </button>
                  <button
                    className="text-btn"
                    onClick={() => {
                      setImported([]);
                      open('create');
                    }}
                  >
                    <Plus size={16} />
                    创建新旅行
                  </button>
                </div>
              </div>
            )}
            {modal === 'export' && (
              <div className="modal-body">
                <span className="feature-icon">
                  <Download />
                </span>
                <h2>把这一程，装进口袋。</h2>
                <p>导出后可发给同行人，也可以作为本地备份。</p>
                <button className="export-option" onClick={exportGuide}>
                  <NotebookPen />
                  <span>
                    <b>导出旅行攻略</b>
                    <small>Markdown · 每日路线、交通、地点建议与游记</small>
                  </span>
                  <Download size={18} />
                </button>
                <button className="export-option" onClick={exportTrip}>
                  <Map />
                  <span>
                    <b>导出结构化行程</b>
                    <small>JSON · 完整行程、同行人和费用记录</small>
                  </span>
                  <Download size={18} />
                </button>
                <Button
                  className="primary-btn full-width"
                  disabled={busy}
                  onClick={() => void enableOffline()}
                >
                  {busy ? <LoaderCircle className="spin" /> : <WifiOff />}
                  缓存离线资源
                </Button>
                <p className="source-note">
                  不生成真实共享链接，不上传数据。发送文件前请检查同行人姓名和个人笔记。
                </p>
              </div>
            )}
          </DialogContent>
        </Dialog>
        {toast && (
          <output className="toast">
            <Check size={18} />
            {toast}
          </output>
        )}
      </div>
    </IconContext.Provider>
  );
}
function DataFootnote() {
  return (
    <p className="data-footnote">
      评分、天气、路线与价格为规划参考，未接入实时运营数据；出发前请核验。
    </p>
  );
}
function Empty({ title, text }: { title: string; text: string }) {
  return (
    <div className="empty-state">
      <Compass size={30} />
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}
function ExploreHeader({
  query,
  setQuery,
  filter,
  setFilter,
}: {
  query: string;
  setQuery: (s: string) => void;
  filter: string;
  setFilter: (s: string) => void;
}) {
  return (
    <div className="explore-header">
      <div className="search-box">
        <Search size={19} />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索景点、美食、文化体验…"
          aria-label="搜索贵州地点"
        />
        {query && (
          <button className="text-btn" onClick={() => setQuery('')}>
            清除
          </button>
        )}
      </div>
      <div className="pill-group">
        {['全部', ...themes].map((t) => (
          <button
            key={t}
            className={'pill ' + (t === filter ? 'selected' : '')}
            onClick={() => setFilter(t)}
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}
