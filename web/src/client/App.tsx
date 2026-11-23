import { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowRight,
  Award,
  Clock,
  Crown,
  ScrollText,
  Search,
  Shield,
  Skull,
  Swords,
  Trophy,
  UserCircle2,
  Users,
  Zap,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { BorderBeam, DotPatternBackdrop } from '@/components/ui/border-beam';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SpotlightCard } from '@/components/react-bits/SpotlightCard';
import { TeamScoreboard } from '@/components/dashboard/TeamScoreboard';
import { CommandSearchDialog } from '@/components/portal/CommandSearchDialog';
import {
  MinecraftItemIcon,
  getQuestThemeMeta,
} from '@/components/portal/MinecraftItemIcon';
import { MinecraftPetEasterEgg } from '@/components/portal/MinecraftPetEasterEgg';
import { MyPlayerDialog } from '@/components/portal/MyPlayerDialog';
import { PlayerAvatar } from '@/components/portal/PlayerAvatar';

const AdminPageView = lazy(() =>
  import('@/components/portal/AdminPageView').then((m) => ({ default: m.AdminPageView })),
);
const EventsView = lazy(() =>
  import('@/components/portal/EventsView').then((m) => ({ default: m.EventsView })),
);
const HallOfFameView = lazy(() =>
  import('@/components/portal/HallOfFameView').then((m) => ({ default: m.HallOfFameView })),
);
const LeaderboardView = lazy(() =>
  import('@/components/portal/LeaderboardView').then((m) => ({ default: m.LeaderboardView })),
);
const PlayerProfileView = lazy(() =>
  import('@/components/portal/PlayerProfileView').then((m) => ({ default: m.PlayerProfileView })),
);
const PlayersDirectoryView = lazy(() =>
  import('@/components/portal/PlayersDirectoryView').then((m) => ({ default: m.PlayersDirectoryView })),
);
const TeamsView = lazy(() =>
  import('@/components/portal/TeamsView').then((m) => ({ default: m.TeamsView })),
);
import { api } from './api';
import {
  CAREER_META,
  type AuditLogItem,
  type PlayerEventItem,
  type PlayerStatus,
  type QuestHistoryItem,
  type ServerState,
  type SnapshotPoint,
  type TeamColor,
} from '../shared/types';

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

type RouteMatch =
  | { view: 'home' }
  | { view: 'players'; q: string; compare: string }
  | { view: 'player'; uuid: string }
  | { view: 'teams'; teamId: number | null }
  | { view: 'leaderboard' }
  | { view: 'hall-of-fame' }
  | { view: 'events' }
  | { view: 'admin' };

function parseLocation(): RouteMatch {
  const path = window.location.pathname;
  const params = new URLSearchParams(window.location.search);
  if (path === '/admin') return { view: 'admin' };
  if (path === '/hall-of-fame') return { view: 'hall-of-fame' };
  if (path === '/teams') return { view: 'teams', teamId: null };
  if (path.startsWith('/teams/')) {
    const rawId = Number.parseInt(path.slice('/teams/'.length), 10);
    return { view: 'teams', teamId: Number.isFinite(rawId) ? rawId : null };
  }
  if (path === '/leaderboard') return { view: 'leaderboard' };
  if (path === '/events') return { view: 'events' };
  if (path === '/players') {
    return {
      view: 'players',
      q: params.get('q') ?? '',
      compare: params.get('compare') ?? '',
    };
  }
  if (path.startsWith('/players/')) {
    return { view: 'player', uuid: decodeURIComponent(path.slice('/players/'.length)) };
  }
  if (path.startsWith('/player/')) {
    return { view: 'player', uuid: decodeURIComponent(path.slice('/player/'.length)) };
  }
  return { view: 'home' };
}

function MiniSparkline({ values }: { values: number[] }) {
  const pts = values.length >= 2 ? values : [2, 3, 2, 4, 3, 5];
  const max = Math.max(1, ...pts);
  const min = Math.min(0, ...pts);
  const w = 68;
  const h = 24;
  const coords = pts.map((v, idx) => {
    const x = (idx / (pts.length - 1)) * w;
    const y = h - 3 - ((v - min) / Math.max(1, max - min)) * (h - 6);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const line = `M${coords.join(' L')}`;
  const area = `${line} L${w},${h} L0,${h} Z`;

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="shrink-0" aria-hidden="true">
      <path d={area} fill="rgba(52, 211, 153, 0.16)" />
      <path
        d={line}
        fill="none"
        stroke="var(--color-emerald)"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HomeActivityIcon({ type }: { type: PlayerEventItem['type'] }) {
  if (type === 'KILL' || type === 'RAID') {
    return (
      <span className="w-8 h-8 rounded-lg border border-emerald/35 bg-elevated flex items-center justify-center shrink-0">
        <Swords className="w-4 h-4 text-emerald" aria-hidden="true" />
      </span>
    );
  }
  if (type === 'QUEST') {
    return (
      <span className="w-8 h-8 rounded-lg border border-amber/35 bg-elevated flex items-center justify-center shrink-0">
        <ScrollText className="w-4 h-4 text-amber" aria-hidden="true" />
      </span>
    );
  }
  if (type === 'DEATH') {
    return (
      <span className="w-8 h-8 rounded-lg border border-danger/35 bg-elevated flex items-center justify-center shrink-0">
        <Skull className="w-4 h-4 text-danger" aria-hidden="true" />
      </span>
    );
  }
  return (
    <span className="w-8 h-8 rounded-lg border border-hairline bg-elevated flex items-center justify-center shrink-0">
      <Shield className="w-4 h-4 text-ink-secondary" aria-hidden="true" />
    </span>
  );
}

export default function App() {
  const queryClient = useQueryClient();
  const [route, setRoute] = useState<RouteMatch>(() => parseLocation());
  const [state, setState] = useState<ServerState | null>(null);
  const [allPlayers, setAllPlayers] = useState<PlayerStatus[]>([]);
  const [quests, setQuests] = useState<QuestHistoryItem[]>([]);
  const [snapshots, setSnapshots] = useState<SnapshotPoint[]>([]);
  const [audits, setAudits] = useState<AuditLogItem[]>([]);
  const [recentEvents, setRecentEvents] = useState<PlayerEventItem[]>([]);
  const lastDigestRef = useRef<string>('');

  // Home centered player search, Command Palette & Visitor IGN
  const [heroSearch, setHeroSearch] = useState('');
  const [searchResults, setSearchResults] = useState<PlayerStatus[]>([]);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [myIgn, setMyIgn] = useState<string>(() => localStorage.getItem('nbs_my_ign') ?? '');
  const [myDialogOpen, setMyDialogOpen] = useState(false);
  const heroSearchInputRef = useRef<HTMLInputElement | null>(null);

  // Admin auth
  const [adminToken, setAdminToken] = useState<string>(
    () => localStorage.getItem('nbs_admin_token') ?? '',
  );
  const [isAdmin, setIsAdmin] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setRoute(parseLocation());
    window.scrollTo({ top: 0 });
  };

  useEffect(() => {
    const onPop = () => setRoute(parseLocation());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => {
    const titles: Record<RouteMatch['view'], string> = {
      home: 'NBS SMP',
      players: 'Players · NBS SMP',
      player: 'Profile · NBS SMP',
      leaderboard: 'Leaderboard · NBS SMP',
      'hall-of-fame': 'Hall of Fame · NBS SMP',
      teams: 'Teams · NBS SMP',
      events: 'Events · NBS SMP',
      admin: 'Admin · NBS SMP',
    };
    document.title = titles[route.view] ?? 'NBS SMP';
  }, [route.view]);

  // Global Cmd+K / Ctrl+K shortcut to open Command Palette from any page
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCmdOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const notify = (msg: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast(msg);
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, 4000);
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const loadHistory = async () => {
    const [histRes, evRes, plRes] = await Promise.all([
      api.api.history.get(),
      fetch('/api/events').then((r) => (r.ok ? r.json() : null)),
      fetch('/api/players').then((r) => (r.ok ? r.json() : null)),
    ]);
    if (histRes.data) {
      setQuests(histRes.data.quests);
      setSnapshots(histRes.data.snapshots);
      setAudits(histRes.data.audits);
    }
    if (evRes && Array.isArray(evRes.recentEvents)) {
      setRecentEvents(evRes.recentEvents);
    }
    if (Array.isArray(plRes)) {
      setAllPlayers(plRes);
    }
  };

  useEffect(() => {
    api.api.state.get().then((res) => {
      if (res.data) setState(res.data);
    });
    loadHistory();

    const es = new EventSource('/api/stream');
    es.onmessage = (evt) => {
      try {
        const next = JSON.parse(evt.data) as ServerState;
        setState(next);
        // Smart cache invalidation: only invalidate React Query caches when meaningful game stats change
        const digest = [
          next.worldId,
          next.gameState,
          next.raidDay,
          next.onlinePlayers,
          next.teams
            .map((t) => `${t.id}:${t.name}:${t.color}:${t.active}:${t.score}:${t.diamonds}:${t.flags}:${t.questsDone}`)
            .join(','),
          next.players
            .map((p) => `${p.uuid}:${p.teamId}:${p.careerId}:${p.kills}:${p.deaths}:${p.questsCompleted}:${p.bossScore}`)
            .join(','),
        ].join('|');
        if (lastDigestRef.current && lastDigestRef.current !== digest) {
          queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
          queryClient.invalidateQueries({ queryKey: ['teams-overview'] });
          queryClient.invalidateQueries({ queryKey: ['players'] });
          queryClient.invalidateQueries({ queryKey: ['player-profile'] });
        }
        lastDigestRef.current = digest;
      } catch {
        // ignore keep-alive
      }
    };

    const histTimer = setInterval(loadHistory, 15_000);
    return () => {
      es.close();
      clearInterval(histTimer);
    };
  }, []);

  useEffect(() => {
    if (!adminToken) return;
    api.api.admin.verify
      .post(undefined, { headers: { 'x-admin-token': adminToken } })
      .then((res) => {
        if (res.data?.ok) setIsAdmin(true);
      })
      .catch(() => setIsAdmin(false));
  }, [adminToken]);

  // Live debounced player search on Home hero
  useEffect(() => {
    const q = heroSearch.trim();
    if (!q) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(() => {
      fetch(`/api/players?q=${encodeURIComponent(q)}`)
        .then((r) => r.json())
        .then((rows: PlayerStatus[]) => {
          setSearchResults(Array.isArray(rows) ? rows.slice(0, 5) : []);
        })
        .catch(() => setSearchResults([]));
    }, 150);
    return () => clearTimeout(timer);
  }, [heroSearch]);

  const handleLogin = async (token: string) => {
    const res = await api.api.admin.verify.post(undefined, {
      headers: { 'x-admin-token': token },
    });
    if (res.data?.ok) {
      localStorage.setItem('nbs_admin_token', token);
      setAdminToken(token);
      setIsAdmin(true);
      notify('ปลดล็อกสิทธิ์ Admin สำเร็จ');
    } else {
      const errMsg =
        (res.error?.value as { error?: string } | undefined)?.error ?? 'รหัสผ่าน Admin ไม่ถูกต้อง';
      notify(errMsg);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('nbs_admin_token');
    setAdminToken('');
    setIsAdmin(false);
    notify('ออกจากโหมด Admin แล้ว');
  };

  const runAdmin = async (
    fn: () => Promise<{ data: unknown; error: unknown }>,
    successMsg: string,
  ) => {
    setBusy(true);
    try {
      const { error } = await fn();
      if (error) {
        const val = (error as { value?: { error?: string; summary?: string; message?: string } })
          ?.value;
        const errMsg =
          val?.error ??
          val?.summary ??
          val?.message ??
          'คำสั่งไม่สำเร็จ (ตรวจสอบสิทธิ์หรือสถานะ RCON)';
        notify(errMsg);
      } else {
        notify(successMsg);
        await loadHistory();
        queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
        queryClient.invalidateQueries({ queryKey: ['teams-overview'] });
        queryClient.invalidateQueries({ queryKey: ['players'] });
        queryClient.invalidateQueries({ queryKey: ['player-profile'] });
        queryClient.invalidateQueries({ queryKey: ['hall-of-fame'] });
      }
    } finally {
      setBusy(false);
    }
  };

  const activeTeams = useMemo(() => {
    if (!state) return [];
    return [...state.teams].filter((t) => t.active).sort((a, b) => b.score - a.score);
  }, [state]);

  const teamNameById = useMemo(() => {
    const map = new Map<number, string>();
    for (const t of state?.teams ?? []) {
      map.set(t.id, t.name);
    }
    return map;
  }, [state]);

  const teamColorById = useMemo(() => {
    const map = new Map<number, TeamColor>();
    for (const t of state?.teams ?? []) {
      map.set(t.id, t.color);
    }
    return map;
  }, [state]);

  const topScore = Math.max(1, ...activeTeams.map((t) => t.score));
  const wealthiestId = useMemo(() => {
    let bestId = -1;
    let bestDia = 0;
    for (const t of activeTeams) {
      if (t.diamonds > bestDia) {
        bestDia = t.diamonds;
        bestId = t.id;
      }
    }
    return bestId;
  }, [activeTeams]);

  const topPlayers = useMemo(() => {
    const source = allPlayers.length > 0 ? allPlayers : (state?.players ?? []);
    return [...source].sort((a, b) => b.kills - a.kills || b.kd - a.kd);
  }, [allPlayers, state]);

  const myPlayer = useMemo(() => {
    const needle = myIgn.trim().toLowerCase();
    if (!needle) return null;
    return topPlayers.find((p) => p.name.toLowerCase() === needle) ?? null;
  }, [topPlayers, myIgn]);

  const handleSaveMyIgn = (ign: string) => {
    const cleaned = ign.trim();
    if (cleaned) {
      localStorage.setItem('nbs_my_ign', cleaned);
      notify(`เลือกตัวละคร ${cleaned} แล้ว`);
    } else {
      localStorage.removeItem('nbs_my_ign');
      notify('ยกเลิกการเลือกตัวละครแล้ว');
    }
    setMyIgn(cleaned);
  };

  const totalPlaytimeHours = useMemo(() => {
    const source = allPlayers.length > 0 ? allPlayers : (state?.players ?? []);
    const sec = source.reduce((sum, p) => sum + p.playtimeSeconds, 0);
    return Math.max(1, Math.round(sec / 3600));
  }, [allPlayers, state]);

  if (!state) {
    return <div className="min-h-screen bg-canvas" />;
  }

  return (
    <div className="relative min-h-screen bg-canvas text-ink pb-16">
      <DotPatternBackdrop />

      <CommandSearchDialog
        open={cmdOpen}
        onClose={() => setCmdOpen(false)}
        players={topPlayers}
        teams={state.teams}
        teamNameById={teamNameById}
        onNavigate={navigate}
      />

      <MyPlayerDialog
        open={myDialogOpen}
        currentIgn={myIgn}
        players={topPlayers}
        onClose={() => setMyDialogOpen(false)}
        onSaveIgn={handleSaveMyIgn}
        onOpenProfile={(id) => navigate(`/player/${encodeURIComponent(id)}`)}
      />

      {/* Modern Gaming Portal Navbar (Mockup Style) */}
      <header className="relative border-b border-hairline bg-canvas/90 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
          {/* Left: Custom Isometric Cube Emblem + NBS SMP */}
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2.5 text-base sm:text-lg font-bold tracking-[-0.01em] text-ink hover:text-emerald transition-colors cursor-pointer rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring shrink-0"
          >
            <img
              src="/favicon.svg"
              alt=""
              width={32}
              height={32}
              className="w-8 h-8 rounded-lg shrink-0"
            />
            <span>NBS SMP</span>
          </button>

          {/* Center: Navigation Links with Active Mint Bottom Indicator */}
          <nav
            aria-label="เมนูหลัก"
            className="flex items-center gap-1 sm:gap-2 overflow-x-auto h-full"
          >
            {(
              [
                { id: 'home', label: 'Home', path: '/' },
                { id: 'players', label: 'Players', path: '/players' },
                { id: 'leaderboard', label: 'Leaderboard', path: '/leaderboard' },
                { id: 'teams', label: 'Teams', path: '/teams' },
                { id: 'events', label: 'Events', path: '/events' },
                { id: 'admin', label: 'Admin', path: '/admin' },
              ] as const
            ).map((item) => {
              const active =
                route.view === item.id ||
                (item.id === 'players' && route.view === 'player') ||
                (item.id === 'leaderboard' && route.view === 'hall-of-fame');
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigate(item.path)}
                  className={`relative h-full px-2.5 sm:px-3.5 inline-flex items-center text-xs sm:text-sm font-medium transition-colors cursor-pointer whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring ${
                    active ? 'text-ink font-semibold' : 'text-ink-secondary hover:text-ink'
                  }`}
                >
                  <span>{item.label}</span>
                  {active && (
                    <motion.span
                      layoutId="nav-active-tab"
                      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                      className="absolute bottom-0 left-2 right-2 h-0.5 bg-emerald rounded-full"
                      aria-hidden="true"
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right: Quick Command Palette Trigger + Server Online Pill + Avatar */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setCmdOpen(true)}
              aria-label="เปิดค้นหาด่วน"
              className="hidden md:inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-hairline bg-surface hover:bg-elevated hover:border-border-strong text-xs text-ink-secondary transition-colors cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 text-ink-muted" aria-hidden="true" />
              <span>Search...</span>
              <kbd className="px-1.5 py-0.5 rounded bg-canvas border border-hairline text-[10px] font-mono text-ink-muted">
                ⌘K
              </kbd>
            </button>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald/35 bg-surface text-xs tabular-nums">
              <span className="w-2 h-2 rounded-full bg-emerald" aria-hidden="true" />
              <span className="text-ink font-medium hidden sm:inline">Server Online</span>
              <span className="text-emerald font-bold">{state.onlinePlayers} / 20</span>
            </div>

            {myIgn ? (
              <div className="inline-flex items-center rounded-lg border border-border-strong bg-surface overflow-hidden">
                <button
                  type="button"
                  onClick={() => navigate(`/player/${encodeURIComponent(myPlayer?.uuid ?? myIgn)}`)}
                  title={`เปิดโปรไฟล์ของ ${myPlayer?.name ?? myIgn}`}
                  className="inline-flex items-center gap-2 px-2 py-1 hover:bg-elevated transition-colors cursor-pointer"
                >
                  <PlayerAvatar name={myPlayer?.name ?? myIgn} uuid={myPlayer?.uuid} size={24} />
                  <span className="hidden lg:inline text-xs font-semibold text-ink max-w-24 truncate">
                    {myPlayer?.name ?? myIgn}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setMyDialogOpen(true)}
                  aria-label="เปลี่ยนชื่อตัวละครของฉัน"
                  title="เปลี่ยนตัวละคร"
                  className="px-1.5 py-1.5 border-l border-hairline text-[10px] text-ink-muted hover:text-ink hover:bg-elevated transition-colors cursor-pointer"
                >
                  •••
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setMyDialogOpen(true)}
                aria-label="เลือกตัวละครของฉัน"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-hairline bg-surface hover:bg-elevated hover:border-border-strong text-xs text-ink-secondary hover:text-ink transition-colors cursor-pointer"
              >
                <UserCircle2 className="w-4 h-4 text-emerald" aria-hidden="true" />
                <span className="hidden sm:inline">ตัวละครของฉัน</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 bg-surface border border-border-strong text-ink px-4 py-2.5 rounded-lg text-sm font-medium"
        >
          {toast}
        </div>
      )}

      <main className="max-w-[1440px] mx-auto px-4 sm:px-8 mt-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${route.view}-${route.view === 'player' ? route.uuid : route.view === 'teams' ? route.teamId : 'page'}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className="space-y-6"
          >
        {route.view === 'home' && (
          <>
            {/* 1. Scenic Citadel Hero Banner ("Your world. Your story.") + 3 KPI Sparkline Cards */}
            <section
              aria-label="ค้นหาผู้เล่น"
              className="relative rounded-2xl border border-hairline bg-surface overflow-hidden p-6 sm:p-8 lg:p-10"
            >
              {/* Atmospheric Citadel Castle Artwork + Gradient Vignette */}
              <div
                className="absolute inset-0 bg-cover bg-center opacity-65 pointer-events-none"
                style={{ backgroundImage: "url('/assets/hero-citadel.png')" }}
                aria-hidden="true"
              />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'linear-gradient(90deg, rgba(20,23,28,0.88) 0%, rgba(20,23,28,0.44) 48%, rgba(20,23,28,0.68) 100%)',
                }}
                aria-hidden="true"
              />

              <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Left 7 Columns: Headline + Search Bar + Quick-Pick Chips */}
                <div className="lg:col-span-7 space-y-5">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald/35 bg-canvas/80 text-xs font-medium text-emerald">
                    <span className="w-2 h-2 rounded-full bg-emerald" aria-hidden="true" />
                    <span>
                      {state.gameState === 1 ? 'Season Active · The Citadel (0, 0)' : 'Server Online · Ready'}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <motion.h1
                      initial={{ opacity: 0, filter: 'blur(6px)', y: 6 }}
                      animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
                      transition={{ duration: 0.35, ease: 'easeOut' }}
                      className="text-3xl sm:text-5xl font-bold tracking-[-0.03em] leading-[1.08] text-ink"
                    >
                      Your world.
                      <span className="block text-emerald mt-1">Your story.</span>
                    </motion.h1>
                    <p className="text-sm sm:text-base text-ink-secondary max-w-[54ch] leading-relaxed">
                      ค้นหาผู้เล่น ดูสถิติ K/D อาชีพ และอันดับทีมแบบเรียลไทม์
                    </p>
                  </div>

                  {/* Hero Search Bar with ⌘K Badge */}
                  <div className="max-w-xl space-y-2">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (searchResults.length === 1) {
                          navigate(`/player/${encodeURIComponent(searchResults[0]!.uuid)}`);
                          setHeroSearch('');
                        } else {
                          navigate(`/players?q=${encodeURIComponent(heroSearch.trim())}`);
                        }
                      }}
                      className="relative flex items-center"
                    >
                      <Search
                        className="w-4 h-4 text-ink-muted absolute left-4 pointer-events-none"
                        aria-hidden="true"
                      />
                      <Input
                        ref={heroSearchInputRef}
                        type="search"
                        aria-label="ค้นหาผู้เล่นด้วย Minecraft Username หรือ UUID"
                        value={heroSearch}
                        onChange={(e) => setHeroSearch(e.target.value)}
                        placeholder="Search Minecraft username or UUID..."
                        className="pl-11 pr-28 min-h-12 rounded-xl bg-canvas/90 border-border-strong text-sm text-ink placeholder:text-ink-muted"
                      />
                      <div className="absolute right-2 flex items-center gap-1.5">
                        <kbd className="hidden sm:inline-block px-2 py-1 rounded-md bg-surface border border-hairline text-[11px] font-mono text-ink-muted">
                          ⌘K
                        </kbd>
                        <Button
                          type="submit"
                          size="sm"
                          className="h-8 px-3.5 rounded-lg bg-emerald hover:bg-emerald-hover text-emerald-ink font-semibold cursor-pointer text-xs"
                        >
                          ค้นหา
                        </Button>
                      </div>
                    </form>

                    {/* Instant Search Autocomplete Dropdown */}
                    {searchResults.length > 0 && (
                      <div className="border border-border-strong rounded-xl bg-surface/95 divide-y divide-hairline overflow-hidden">
                        {searchResults.map((p) => (
                          <button
                            key={p.uuid}
                            type="button"
                            onClick={() => {
                              navigate(`/player/${encodeURIComponent(p.uuid)}`);
                              setHeroSearch('');
                            }}
                            className="w-full px-4 py-3 hover:bg-elevated flex items-center justify-between gap-2 text-sm text-left cursor-pointer"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <PlayerAvatar name={p.name} uuid={p.uuid} size={24} />
                              <span className="font-semibold text-ink truncate">{p.name}</span>
                              <span className="text-xs text-ink-muted">
                                {p.online ? 'Online' : 'Offline'}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-ink-secondary tabular-nums shrink-0">
                              <span>K/D {p.kd.toFixed(2)}</span>
                              <ArrowRight className="w-4 h-4 text-ink-muted" aria-hidden="true" />
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Quick-Pick Player Chips */}
                    {topPlayers.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                        <span className="text-ink-muted">Quick Profile:</span>
                        {topPlayers.slice(0, 5).map((p) => (
                          <button
                            key={p.uuid}
                            type="button"
                            onClick={() => navigate(`/player/${encodeURIComponent(p.uuid)}`)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-hairline bg-canvas/80 hover:bg-elevated text-ink transition-colors cursor-pointer"
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                p.online ? 'bg-emerald' : 'bg-ink-muted'
                              }`}
                              aria-hidden="true"
                            />
                            <span className="font-medium">{p.name}</span>
                            <span className="text-ink-muted tabular-nums">
                              K/D {p.kd.toFixed(2)}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right 5 Columns: 3 Stacked KPI Cards with Mini Sparkline (Mockup Style) */}
                <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3.5 lg:max-w-xs lg:ml-auto w-full">
                  <div className="rounded-xl border border-hairline bg-canvas/85 px-4 py-3.5 flex items-center justify-between gap-3 tabular-nums">
                    <div className="flex items-center gap-3">
                      <span className="w-9 h-9 rounded-lg border border-emerald/35 bg-elevated flex items-center justify-center shrink-0">
                        <Users className="w-4 h-4 text-emerald" aria-hidden="true" />
                      </span>
                      <div>
                        <div className="text-xs text-ink-secondary">Online Players</div>
                        <div className="text-xl font-bold text-ink">{state.onlinePlayers} / 20</div>
                      </div>
                    </div>
                    <MiniSparkline values={[2, 3, 3, 4, 3, state.onlinePlayers || 4]} />
                  </div>

                  <div className="rounded-xl border border-hairline bg-canvas/85 px-4 py-3.5 flex items-center justify-between gap-3 tabular-nums">
                    <div className="flex items-center gap-3">
                      <span className="w-9 h-9 rounded-lg border border-hairline bg-elevated flex items-center justify-center shrink-0">
                        <Trophy className="w-4 h-4 text-ink-secondary" aria-hidden="true" />
                      </span>
                      <div>
                        <div className="text-xs text-ink-secondary">Total Players</div>
                        <div className="text-xl font-bold text-ink">{topPlayers.length}</div>
                      </div>
                    </div>
                    <MiniSparkline values={[1, 2, 3, 4, 4, topPlayers.length || 5]} />
                  </div>

                  <div className="rounded-xl border border-hairline bg-canvas/85 px-4 py-3.5 flex items-center justify-between gap-3 tabular-nums">
                    <div className="flex items-center gap-3">
                      <span className="w-9 h-9 rounded-lg border border-hairline bg-elevated flex items-center justify-center shrink-0">
                        <Clock className="w-4 h-4 text-ink-secondary" aria-hidden="true" />
                      </span>
                      <div>
                        <div className="text-xs text-ink-secondary">Playtime This Season</div>
                        <div className="text-xl font-bold text-ink">{totalPlaytimeHours}h+</div>
                      </div>
                    </div>
                    <MiniSparkline values={[12, 24, 31, 38, 42, totalPlaytimeHours]} />
                  </div>
                </div>
              </div>
            </section>

            {/* 2. Three-Column Bento Grid with React Bits SpotlightCard & BorderBeam */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Column 1: Top Players */}
              <SpotlightCard className="lg:col-span-4 p-5 flex flex-col justify-between space-y-4">
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber" aria-hidden="true" />
                    <h2 className="text-base font-semibold text-ink">Top Players</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/leaderboard')}
                    className="inline-flex items-center gap-1 text-xs font-medium text-ink-secondary hover:text-emerald transition-colors cursor-pointer"
                  >
                    <span>View Leaderboard</span>
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>

                {topPlayers.length === 0 ? (
                  <p className="relative text-sm text-ink-secondary py-6">ยังไม่มีข้อมูลผู้เล่นในระบบ</p>
                ) : (
                  <div className="relative divide-y divide-hairline flex-1">
                    {topPlayers.slice(0, 3).map((p, idx) => {
                      const teamLabel =
                        p.teamId > 0
                          ? (teamNameById.get(p.teamId) ?? `Team ${p.teamId}`)
                          : 'No Team';
                      const careerLabel = CAREER_META[p.careerId]?.label ?? 'Unassigned';
                      return (
                        <button
                          key={p.uuid}
                          type="button"
                          onClick={() => navigate(`/player/${encodeURIComponent(p.uuid)}`)}
                          className="w-full py-3.5 px-2 -mx-2 rounded-lg hover:bg-elevated/70 flex items-center justify-between gap-3 text-left transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span
                              className={`text-xs font-bold tabular-nums w-6 shrink-0 ${
                                idx === 0
                                  ? 'text-amber'
                                  : idx === 1
                                    ? 'text-emerald'
                                    : 'text-ink-secondary'
                              }`}
                            >
                              #{idx + 1}
                            </span>
                            <PlayerAvatar name={p.name} uuid={p.uuid} size={32} />
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-sm text-ink truncate">
                                  {p.name}
                                </span>
                                {idx === 0 && (
                                  <Crown
                                    className="w-3.5 h-3.5 text-amber shrink-0"
                                    aria-hidden="true"
                                  />
                                )}
                              </div>
                              <div className="text-xs text-ink-muted truncate">
                                {teamLabel} · {careerLabel}
                              </div>
                            </div>
                          </div>

                          <div className="text-right tabular-nums shrink-0">
                            <div className="text-sm font-bold text-ink">{p.kills} Kills</div>
                            <div className="text-xs text-emerald font-medium">
                              K/D {p.kd.toFixed(2)}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </SpotlightCard>

              {/* Column 2: Recent Activities */}
              <SpotlightCard className="lg:col-span-4 p-5 flex flex-col justify-between space-y-4">
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber" aria-hidden="true" />
                    <h2 className="text-base font-semibold text-ink">Recent Activities</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/events')}
                    className="inline-flex items-center gap-1 text-xs font-medium text-ink-secondary hover:text-emerald transition-colors cursor-pointer"
                  >
                    <span>View All</span>
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>

                {recentEvents.length === 0 ? (
                  <p className="relative text-sm text-ink-secondary py-6">ยังไม่มีกิจกรรมล่าสุด</p>
                ) : (
                  <div className="relative divide-y divide-hairline flex-1">
                    {recentEvents.slice(0, 3).map((ev) => (
                      <button
                        key={ev.id}
                        type="button"
                        onClick={() => navigate(`/player/${encodeURIComponent(ev.uuid)}`)}
                        className="w-full py-3.5 px-2 -mx-2 rounded-lg hover:bg-elevated/70 flex items-center gap-3 text-left transition-colors cursor-pointer"
                      >
                        <HomeActivityIcon type={ev.type} />
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-ink truncate">{ev.summary}</div>
                          <div className="text-xs text-ink-muted tabular-nums mt-0.5">
                            {new Date(ev.createdAt).toLocaleTimeString('th-TH')}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </SpotlightCard>

              {/* Column 3: Active Event Card with Dynamic Theme Artwork & Minecraft Item Icon */}
              {(() => {
                const questTheme = getQuestThemeMeta(state.flashQuest.item);
                return (
              <SpotlightCard
                spotlightColor="rgba(245, 158, 11, 0.12)"
                className="lg:col-span-4 p-5 flex flex-col justify-between min-h-[240px]"
              >
                <BorderBeam color="rgba(52, 211, 153, 0.6)" durationSec={8} />
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-60 pointer-events-none"
                  style={{ backgroundImage: `url('${questTheme.bannerUrl}')` }}
                  aria-hidden="true"
                />
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(20,23,28,0.84) 0%, rgba(20,23,28,0.52) 52%, rgba(20,23,28,0.28) 100%)',
                  }}
                  aria-hidden="true"
                />

                <div className="relative flex items-center justify-between gap-2">
                  <Badge
                    variant="outline"
                    className="rounded-full border-emerald/45 bg-canvas/85 text-emerald px-2.5 py-0.5 text-xs font-semibold"
                  >
                    ● Active Event
                  </Badge>
                  <span className="text-xs font-medium text-amber tabular-nums">
                    {state.flashQuest.active
                      ? `Ends in ${formatDuration(state.flashQuest.remainingSeconds)}`
                      : 'Standby'}
                  </span>
                </div>

                <div className="relative my-4 space-y-2">
                  <div className="flex items-center gap-3">
                    {state.flashQuest.active && (
                      <MinecraftItemIcon item={state.flashQuest.item} size={36} />
                    )}
                    <h2 className="text-2xl font-bold tracking-[-0.02em] text-ink">
                      {state.flashQuest.active ? state.flashQuest.name : 'Citadel Boost Quest'}
                    </h2>
                  </div>
                  <p className="text-xs sm:text-sm text-ink-secondary line-clamp-2">
                    ออกตามหาไอเทมเควสด่วนมาส่งที่ The Citadel (0, 0) เพื่อรับคะแนนโบนัสทีมสูงสุด +35 แต้ม!
                  </p>
                </div>

                <div className="relative">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/events')}
                    className="bg-canvas/85 border-border-strong text-ink hover:bg-elevated cursor-pointer text-xs font-medium"
                  >
                    <span>View Event</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" aria-hidden="true" />
                  </Button>
                </div>
              </SpotlightCard>
                );
              })()}
            </div>

            {/* 3. Team Standings Ledger Section */}
            <section className="space-y-3 pt-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg font-semibold text-ink">
                    Team Standings (ตารางคะแนนทีมสด)
                  </h2>
                  <p className="text-sm text-ink-secondary">
                    กดที่ชื่อทีมเพื่อเปิดดูโปรไฟล์ทีม, สมาชิกทั้งหมด และกราฟแนวโน้มคะแนนย้อนหลัง
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/hall-of-fame')}
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-amber hover:underline cursor-pointer mr-4"
                >
                  <Award className="w-4 h-4" aria-hidden="true" />
                  <span>Hall of Fame</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/teams')}
                  className="inline-flex items-center gap-1 text-xs sm:text-sm font-medium text-emerald hover:underline cursor-pointer"
                >
                  <span>View All Teams</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>

              <div className="grid grid-cols-1">
                <TeamScoreboard
                  teams={activeTeams}
                  topScore={topScore}
                  wealthiestId={wealthiestId}
                  updatedAt={state.updatedAt}
                  onSelectTeam={(teamId) => navigate(`/teams/${teamId}`)}
                />
              </div>
            </section>
          </>
        )}

        <Suspense fallback={null}>
        {route.view === 'players' && (
          <PlayersDirectoryView
            initialQuery={route.q}
            initialCompareUuid={route.compare}
            teamNameById={teamNameById}
            onSelectPlayer={(uuid) => navigate(`/player/${encodeURIComponent(uuid)}`)}
          />
        )}

        {route.view === 'player' && (
          <PlayerProfileView
            uuidOrName={route.uuid}
            teamNameById={teamNameById}
            teamColorById={teamColorById}
            onBack={() => navigate('/players')}
            onCompare={(uuid) => navigate(`/players?compare=${encodeURIComponent(uuid)}`)}
            onSelectTeam={(teamId) => navigate(`/teams/${teamId}`)}
          />
        )}

        {route.view === 'teams' && (
          <TeamsView
            selectedTeamId={route.teamId}
            updatedAt={state.updatedAt}
            onSelectPlayer={(uuid) => navigate(`/player/${encodeURIComponent(uuid)}`)}
            onSelectTeam={(teamId) => navigate(teamId ? `/teams/${teamId}` : '/teams')}
          />
        )}

        {route.view === 'leaderboard' && (
          <LeaderboardView
            teamNameById={teamNameById}
            updatedAt={state.updatedAt}
            myPlayerUuid={myPlayer?.uuid ?? ''}
            onSelectPlayer={(uuid) => navigate(`/player/${encodeURIComponent(uuid)}`)}
            onSelectTeam={(teamId) => navigate(`/teams/${teamId}`)}
            onOpenHallOfFame={() => navigate('/hall-of-fame')}
          />
        )}

        {route.view === 'hall-of-fame' && (
          <HallOfFameView
            onSelectPlayer={(uuid) => navigate(`/player/${encodeURIComponent(uuid)}`)}
            onBackToLeaderboard={() => navigate('/leaderboard')}
          />
        )}

        {route.view === 'events' && (
          <EventsView
            flashQuest={state.flashQuest}
            raidDay={state.raidDay}
            gracePeriodEndsAt={state.gracePeriodEndsAt}
            teams={state.teams}
            quests={quests}
            recentEvents={recentEvents}
            onSelectPlayer={(uuid) => navigate(`/player/${encodeURIComponent(uuid)}`)}
          />
        )}

        {route.view === 'admin' && (
          <AdminPageView
            isAdmin={isAdmin}
            adminToken={adminToken}
            busy={busy}
            mode={state.mode}
            worldId={state.worldId}
            onlinePlayers={state.onlinePlayers}
            raidDay={state.raidDay}
            flashQuest={state.flashQuest}
            activeTeams={activeTeams}
            quests={quests}
            audits={audits}
            snapshotsCount={snapshots.length}
            onLogin={handleLogin}
            onLogout={handleLogout}
            runAdmin={runAdmin}
          />
        )}
        </Suspense>
          </motion.div>
        </AnimatePresence>
      </main>

      <MinecraftPetEasterEgg />
    </div>
  );
}
