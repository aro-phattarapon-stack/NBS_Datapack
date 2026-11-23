import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
  Compass,
  Copy,
  Flame,
  Gamepad2,
  GitCompare,
  History,
  Pickaxe,
  ScrollText,
  Share2,
  Shield,
  Skull,
  Swords,
  TrendingUp,
  Trophy,
  UserCheck,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { MinecraftItemIcon } from '@/components/portal/MinecraftItemIcon';
import { PlayerCardModal } from '@/components/portal/PlayerCardModal';
import { Skin3DViewer, type Skin3DPose } from '@/components/portal/Skin3DViewer';
import { formatPlaytime } from '@/components/portal/PlayerAvatar';
import {
  CAREER_META,
  type PlayerEventItem,
  type PlayerProfileResponse,
  type PlayerStatsHistoryPoint,
  type PlayerStatus,
  type TeamColor,
} from '../../shared/types';

interface PlayerProfileViewProps {
  uuidOrName: string;
  teamNameById: Map<number, string>;
  teamColorById?: Map<number, TeamColor>;
  onBack: () => void;
  onCompare?: (uuid: string) => void;
  onSelectTeam?: (teamId: number) => void;
}

type ProfileSubTab = 'overview' | 'ingame' | 'history' | 'quests';

const WEAPON_LABELS: Record<string, string> = {
  'minecraft:netherite_sword': 'Netherite Sword',
  'minecraft:diamond_sword': 'Diamond Sword',
  'minecraft:iron_sword': 'Iron Sword',
  'minecraft:netherite_axe': 'Netherite Axe',
  'minecraft:diamond_axe': 'Diamond Axe',
  'minecraft:mace': 'Heavy Mace',
  'minecraft:trident': 'Trident',
  'minecraft:bow': 'Bow',
  'minecraft:crossbow': 'Crossbow',
};

const CAREER_DESCRIPTIONS: Record<number, { role: string; specialty: string }> = {
  0: {
    role: 'Unassigned Adventurer',
    specialty: 'ยังไม่ได้ลงทะเบียนสายอาชีพในวิหารกลาง The Citadel',
  },
  1: {
    role: 'Harvester & Sustenance',
    specialty: 'เชี่ยวชาญการเก็บเกี่ยวเสบียง, Honey Bottle และวัตถุดิบธรรมชาติส่ง The Citadel',
  },
  2: {
    role: 'Armorer & Master Smith',
    specialty: 'เชี่ยวชาญการหลอมแร่ Iron/Gold/Emerald Block และเสริมยุทโธปกรณ์ให้ทีม',
  },
  3: {
    role: 'Beast Slayer & Nether Tracker',
    specialty: 'เชี่ยวชาญการล่ามอนสเตอร์ Nether, Blaze Rod, Ghast Tear และ Phantom Membrane',
  },
  4: {
    role: 'Citadel Explorer & Boss Raider',
    specialty: 'เชี่ยวชาญการสำรวจโครงสร้างโบราณ, Sculk Catalyst และพิชิตบอสประจำซีซัน',
  },
};

function computeCareerProgress(questsCompleted: number, bossScore: number, kills: number) {
  const xp = questsCompleted * 120 + bossScore * 15 + kills * 45;
  const level = Math.max(1, Math.min(50, Math.floor(xp / 180) + 1));
  const currentFloor = (level - 1) * 180;
  const nextCeiling = level * 180;
  const pct =
    level >= 50
      ? 100
      : Math.min(
          100,
          Math.max(8, Math.round(((xp - currentFloor) / (nextCeiling - currentFloor)) * 100)),
        );
  const tierName =
    level >= 15
      ? 'Master Vanguard'
      : level >= 8
        ? 'Veteran Specialist'
        : level >= 4
          ? 'Seasoned Operative'
          : 'Apprentice';
  return { xp, level, nextCeiling, pct, tierName };
}

function deduplicateHistory(history: PlayerStatsHistoryPoint[]): PlayerStatsHistoryPoint[] {
  const out: PlayerStatsHistoryPoint[] = [];
  for (const pt of history) {
    const prev = out[out.length - 1];
    if (
      !prev ||
      prev.kills !== pt.kills ||
      prev.deaths !== pt.deaths ||
      Math.abs(pt.playtimeSeconds - prev.playtimeSeconds) >= 300
    ) {
      out.push(pt);
    }
  }
  return out;
}

function EventTypeIcon({ type }: { type: PlayerEventItem['type'] }) {
  if (type === 'KILL' || type === 'RAID') {
    return (
      <span className="w-8 h-8 rounded-md border border-emerald/30 bg-elevated flex items-center justify-center shrink-0">
        <Swords className="w-4 h-4 text-emerald" aria-hidden="true" />
      </span>
    );
  }
  if (type === 'QUEST') {
    return (
      <span className="w-8 h-8 rounded-md border border-amber/35 bg-elevated flex items-center justify-center shrink-0">
        <ScrollText className="w-4 h-4 text-amber" aria-hidden="true" />
      </span>
    );
  }
  if (type === 'DEATH') {
    return (
      <span className="w-8 h-8 rounded-md border border-danger/35 bg-elevated flex items-center justify-center shrink-0">
        <Skull className="w-4 h-4 text-danger" aria-hidden="true" />
      </span>
    );
  }
  return (
    <span className="w-8 h-8 rounded-md border border-hairline bg-elevated flex items-center justify-center shrink-0">
      <Shield className="w-4 h-4 text-ink-secondary" aria-hidden="true" />
    </span>
  );
}

/**
 * 5-Axis SVG Radar Chart ("Statistics Overview": Combat, Survival, Progression, Economy, Teamwork)
 * derived from real player statistics.
 */
function PlayerRadarChart({ player }: { player: PlayerStatus }) {
  const axes = useMemo(() => {
    const ig = player.inGameStats;
    const combat = Math.min(
      1,
      Math.max(0.2, (player.kills * 6 + player.kd * 10 + (ig?.mobKills ?? 0) * 0.08) / 145),
    );
    const survival = Math.min(
      1,
      Math.max(
        0.22,
        (player.playtimeSeconds / 54000) * 0.5 +
          (player.bestStreak / 6) * 0.25 +
          ((ig?.distanceKm ?? 0) / 100) * 0.25,
      ),
    );
    const progression = Math.min(1, Math.max(0.2, (player.questsCompleted * 18 + 15) / 100));
    const economy = Math.min(
      1,
      Math.max(
        0.2,
        (player.bossScore + (ig?.diamondsMined ?? 0) + (ig?.villagerTrades ?? 0) * 0.5) / 180,
      ),
    );
    const teamwork = Math.min(
      1,
      Math.max(0.25, (player.teamId > 0 ? 0.45 : 0.15) + (player.questsCompleted / 8) * 0.55),
    );

    return [
      { label: 'Combat', value: combat },
      { label: 'Survival', value: survival },
      { label: 'Progression', value: progression },
      { label: 'Economy', value: economy },
      { label: 'Teamwork', value: teamwork },
    ];
  }, [player]);

  const cx = 130;
  const cy = 115;
  const rMax = 72;
  const levels = [0.33, 0.66, 1];

  const getCoord = (idx: number, radiusRatio: number) => {
    const angle = -Math.PI / 2 + (idx * 2 * Math.PI) / axes.length;
    return {
      x: cx + Math.cos(angle) * rMax * radiusRatio,
      y: cy + Math.sin(angle) * rMax * radiusRatio,
    };
  };

  const dataPoints = axes.map((a, idx) => getCoord(idx, a.value));
  const polygonPoints = dataPoints.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  return (
    <div className="flex flex-col items-center justify-center">
      <svg
        viewBox="0 0 260 225"
        className="w-full max-w-[260px] h-auto select-none"
        role="img"
        aria-label="กราฟเรดาร์สรุปความสามารถ 5 ด้านของผู้เล่น"
      >
        {/* Concentric Pentagon Grid */}
        {levels.map((lvl) => {
          const ringPts = axes
            .map((_, idx) => {
              const p = getCoord(idx, lvl);
              return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
            })
            .join(' ');
          return (
            <polygon
              key={lvl}
              points={ringPts}
              fill="none"
              stroke="var(--color-hairline)"
              strokeWidth={1}
            />
          );
        })}

        {/* Axis Spokes & Labels */}
        {axes.map((a, idx) => {
          const outer = getCoord(idx, 1);
          const labelPt = getCoord(idx, 1.24);
          return (
            <g key={a.label}>
              <line
                x1={cx}
                y1={cy}
                x2={outer.x}
                y2={outer.y}
                stroke="var(--color-hairline)"
                strokeWidth={1}
              />
              <text
                x={labelPt.x}
                y={labelPt.y + 3}
                textAnchor="middle"
                fill="var(--color-ink-secondary)"
                fontSize="10.5"
                fontWeight="500"
              >
                {a.label}
              </text>
            </g>
          );
        })}

        {/* Player Stat Polygon */}
        <polygon
          points={polygonPoints}
          fill="rgba(52, 211, 153, 0.22)"
          stroke="var(--color-emerald)"
          strokeWidth={2}
        />

        {dataPoints.map((pt, idx) => (
          <circle
            key={axes[idx]!.label}
            cx={pt.x}
            cy={pt.y}
            r={3}
            fill="var(--color-emerald)"
            stroke="var(--color-surface)"
            strokeWidth={1.5}
          />
        ))}
      </svg>
    </div>
  );
}

function CombatPerformanceChart({ points }: { points: PlayerStatsHistoryPoint[] }) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const width = 680;
  const height = 190;
  const padL = 40;
  const padR = 20;
  const padT = 16;
  const padB = 28;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;

  if (points.length < 2) {
    return (
      <div className="p-5 text-sm text-ink-secondary">
        รอข้อมูลอย่างน้อย 2 จุดเพื่อแสดงกราฟ (ตอนนี้ {points.length}/2)
      </div>
    );
  }

  const maxKills = Math.max(5, ...points.map((p) => p.kills));
  const maxKd = Math.max(2, ...points.map((p) => p.kd));

  const killCoords = points.map((pt, idx) => {
    const x = padL + (idx / (points.length - 1)) * plotW;
    const y = padT + plotH * (1 - Math.min(1, pt.kills / maxKills));
    return { x, y, pt };
  });

  const kdCoords = points.map((pt, idx) => {
    const x = padL + (idx / (points.length - 1)) * plotW;
    const y = padT + plotH * (1 - Math.min(1, pt.kd / maxKd));
    return { x, y, pt };
  });

  const killPath = killCoords
    .map((c, idx) => `${idx === 0 ? 'M' : 'L'}${c.x.toFixed(1)},${c.y.toFixed(1)}`)
    .join(' ');
  const kdPath = kdCoords
    .map((c, idx) => `${idx === 0 ? 'M' : 'L'}${c.x.toFixed(1)},${c.y.toFixed(1)}`)
    .join(' ');
  const activePoint = hoverIdx !== null ? points[hoverIdx] : null;
  const activeX = hoverIdx !== null ? killCoords[hoverIdx]?.x : null;

  return (
    <div className="p-5 space-y-3">
      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full min-w-[440px] h-auto select-none"
          role="img"
          aria-label="กราฟพัฒนาการ Kills และ K/D Ratio ตามช่วงเวลา"
          onMouseLeave={() => setHoverIdx(null)}
        >
          {[0, 0.5, 1].map((t) => {
            const y = padT + plotH * (1 - t);
            const val = Math.round(maxKills * t);
            return (
              <g key={t}>
                <line
                  x1={padL}
                  y1={y}
                  x2={width - padR}
                  y2={y}
                  stroke="var(--color-hairline)"
                  strokeWidth={1}
                />
                <text
                  x={padL - 8}
                  y={y + 4}
                  textAnchor="end"
                  fill="var(--color-ink-muted)"
                  fontSize="11"
                  style={{ fontVariantNumeric: 'tabular-nums' }}
                >
                  {val}
                </text>
              </g>
            );
          })}

          {activeX !== null && activeX !== undefined && (
            <line
              x1={activeX}
              y1={padT}
              x2={activeX}
              y2={padTopBottom(padT, plotH)}
              stroke="var(--color-border-strong)"
              strokeWidth={1}
              strokeDasharray="3 3"
            />
          )}

          <path
            d={killPath}
            fill="none"
            stroke="var(--color-emerald)"
            strokeWidth={2.25}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={kdPath}
            fill="none"
            stroke="var(--color-amber)"
            strokeWidth={1.75}
            strokeDasharray="4 3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {killCoords.map((c, idx) => (
            <circle
              key={`k-${idx}`}
              cx={c.x}
              cy={c.y}
              r={hoverIdx === idx ? 5.5 : 3.5}
              fill="var(--color-emerald)"
              stroke="var(--color-surface)"
              strokeWidth={1.5}
            />
          ))}

          {kdCoords.map((c, idx) => (
            <circle
              key={`kd-${idx}`}
              cx={c.x}
              cy={c.y}
              r={hoverIdx === idx ? 5 : 3}
              fill="var(--color-amber)"
              stroke="var(--color-surface)"
              strokeWidth={1.5}
            />
          ))}

          {points.map((pt, idx) => {
            const show =
              idx === 0 || idx === points.length - 1 || idx === Math.floor(points.length / 2);
            if (!show) return null;
            const x = padL + (idx / (points.length - 1)) * plotW;
            return (
              <text
                key={pt.recordedAt}
                x={x}
                y={height - 6}
                textAnchor={
                  idx === 0 ? 'start' : idx === points.length - 1 ? 'end' : 'middle'
                }
                fill="var(--color-ink-muted)"
                fontSize="11"
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {new Date(pt.recordedAt).toLocaleDateString('th-TH', {
                  day: 'numeric',
                  month: 'short',
                })}
              </text>
            );
          })}

          {killCoords.map((c, idx) => {
            const colW = plotW / Math.max(1, points.length - 1);
            return (
              <rect
                key={`hit-${c.pt.recordedAt}`}
                x={Math.max(padL, c.x - colW / 2)}
                y={padT}
                width={colW}
                height={plotH}
                fill="transparent"
                className="cursor-crosshair"
                onMouseEnter={() => setHoverIdx(idx)}
              />
            );
          })}
        </svg>
      </div>

      {activePoint && (
        <div className="rounded-lg border border-border-strong bg-canvas/95 px-3.5 py-2 flex flex-wrap items-center justify-between gap-2 text-xs tabular-nums">
          <span className="text-ink-secondary font-medium">
            {new Date(activePoint.recordedAt).toLocaleString('th-TH')}
          </span>
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-ink">
              Kills: <strong className="text-emerald">{activePoint.kills}</strong> · Deaths:{' '}
              <strong>{activePoint.deaths}</strong>
            </span>
            <span className="text-amber font-semibold">K/D {activePoint.kd.toFixed(2)}</span>
            <span className="text-ink-secondary">
              Playtime {formatPlaytime(activePoint.playtimeSeconds)}
            </span>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-hairline text-xs text-ink-secondary tabular-nums">
        <div className="flex flex-wrap items-center gap-4">
          <span className="inline-flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald inline-block" aria-hidden="true" />
            <span>Total Kills (เส้นทึบ)</span>
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber inline-block" aria-hidden="true" />
            <span>K/D Ratio (เส้นประ · สูงสุด {maxKd.toFixed(2)})</span>
          </span>
        </div>
        <span className="text-ink-muted">ชี้ที่จุดบนกราฟเพื่อดูค่าสถิติรายช่วงเวลา</span>
      </div>
    </div>
  );
}

function padTopBottom(padT: number, plotH: number) {
  return padT + plotH;
}

export function PlayerProfileView({
  uuidOrName,
  teamNameById,
  teamColorById,
  onBack,
  onCompare,
  onSelectTeam,
}: PlayerProfileViewProps) {
  const [subTab, setSubTab] = useState<ProfileSubTab>('overview');
  const [copiedUuid, setCopiedUuid] = useState(false);
  const [shareCardOpen, setShareCardOpen] = useState(false);
  const [heroPose, setHeroPose] = useState<Skin3DPose>('idle');

  const {
    data,
    isLoading,
    isError,
  } = useQuery<PlayerProfileResponse>({
    queryKey: ['player-profile', uuidOrName],
    queryFn: async () => {
      const res = await fetch(`/api/players/${encodeURIComponent(uuidOrName)}`);
      if (!res.ok) throw new Error('NOT_FOUND');
      return (await res.json()) as PlayerProfileResponse;
    },
  });

  const notFound = isError || (!isLoading && !data);

  const distinctHistory = useMemo(
    () => (data ? deduplicateHistory(data.history) : []),
    [data],
  );

  const combatEvents = useMemo(
    () =>
      data
        ? data.events.filter((e) => e.type === 'KILL' || e.type === 'DEATH' || e.type === 'RAID')
        : [],
    [data],
  );

  const questEvents = useMemo(
    () => (data ? data.events.filter((e) => e.type === 'QUEST') : []),
    [data],
  );

  if (notFound) {
    return (
      <section className="rounded-xl border border-hairline bg-surface p-6 space-y-4">
        <h2 className="text-xl font-semibold text-ink">Player Not Found</h2>
        <p className="text-sm text-ink-secondary">
          ไม่พบข้อมูลของ <span className="font-mono text-ink">{uuidOrName}</span> ในระบบ
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="bg-elevated border-border-strong text-ink hover:bg-hairline cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" aria-hidden="true" />
          Back to Players
        </Button>
      </section>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-64 w-full rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-56 w-full rounded-xl" />
          <Skeleton className="h-56 w-full rounded-xl" />
          <Skeleton className="h-56 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  const { player, events, rank, totalPlayers } = data;
  const teamLabel =
    player.teamId > 0 ? (teamNameById.get(player.teamId) ?? `Team ${player.teamId}`) : 'No Team';
  const teamColor: TeamColor =
    (player.teamId > 0 ? teamColorById?.get(player.teamId) : undefined) ?? 'green';
  const careerLabel = CAREER_META[player.careerId]?.label ?? 'Unassigned';
  const careerMeta = CAREER_DESCRIPTIONS[player.careerId] ?? CAREER_DESCRIPTIONS[0]!;
  const progression = computeCareerProgress(
    player.questsCompleted,
    player.bossScore,
    player.kills,
  );

  const handleCopyUuid = () => {
    navigator.clipboard?.writeText(player.uuid).catch(() => undefined);
    setCopiedUuid(true);
    setTimeout(() => setCopiedUuid(false), 1800);
  };

  return (
    <div className="space-y-6">
      <PlayerCardModal
        open={shareCardOpen}
        onClose={() => setShareCardOpen(false)}
        player={player}
        rank={rank}
        level={progression.level}
        tierName={progression.tierName}
        teamName={teamLabel}
        teamColor={teamColor}
      />

      {/* Top Back, Share Card & Compare Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="text-ink-secondary hover:text-ink -ml-2 cursor-pointer text-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" aria-hidden="true" />
          Back to Players
        </Button>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShareCardOpen(true)}
            className="min-h-9 bg-surface border-emerald/45 text-emerald hover:bg-elevated cursor-pointer text-xs sm:text-sm font-medium"
          >
            <Share2 className="w-4 h-4 mr-1.5" aria-hidden="true" />
            <span>Share Card</span>
          </Button>

          {onCompare && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onCompare(player.uuid)}
              className="min-h-9 bg-surface border-border-strong text-ink hover:bg-elevated cursor-pointer text-xs sm:text-sm"
            >
              <GitCompare className="w-4 h-4 mr-1.5 text-emerald" aria-hidden="true" />
              Compare Player
            </Button>
          )}
        </div>
      </div>

      {/* Scenic Citadel Hero Profile Card (Mockup Style) */}
      <section className="relative rounded-xl border border-hairline bg-surface overflow-hidden">
        {/* Atmospheric Citadel Background Image + Dark Vignette */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-65 pointer-events-none"
          style={{ backgroundImage: "url('/assets/hero-citadel.png')" }}
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(90deg, rgba(20,23,28,0.86) 0%, rgba(20,23,28,0.50) 55%, rgba(20,23,28,0.84) 100%)',
          }}
          aria-hidden="true"
        />

        <div className="relative p-5 sm:p-7 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            {/* Left: Interactive 3D WebGL Character Stage + Identity */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-5 min-w-0">
              <div className="relative rounded-xl border border-border-strong bg-canvas/75 p-2 flex flex-col items-center shrink-0 self-start">
                <Skin3DViewer
                  name={player.name}
                  uuid={player.uuid}
                  width={148}
                  height={186}
                  pose={heroPose}
                  autoRotate={false}
                  zoom={0.88}
                />
                <div className="mt-1 flex items-center gap-1">
                  {(['idle', 'walk', 'wave'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setHeroPose(p)}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-medium uppercase cursor-pointer transition-colors ${
                        heroPose === p
                          ? 'bg-emerald/20 text-emerald border border-emerald/40'
                          : 'text-ink-muted hover:text-ink'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl sm:text-4xl font-bold tracking-[-0.02em] text-ink truncate">
                    {player.name}
                  </h1>
                  <UserCheck className="w-5 h-5 text-emerald shrink-0" aria-hidden="true" />
                  <Badge
                    variant="outline"
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      player.online
                        ? 'border-emerald/45 text-emerald bg-canvas/80'
                        : 'border-hairline text-ink-muted bg-canvas/80'
                    }`}
                  >
                    ● {player.online ? 'Online' : 'Offline'}
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="rounded-md border border-hairline bg-elevated/90 text-ink-secondary px-2 py-0.5 text-xs"
                  >
                    {progression.tierName}
                  </Badge>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-sm sm:text-base text-ink-secondary">
                  {player.teamId > 0 && onSelectTeam ? (
                    <button
                      type="button"
                      onClick={() => onSelectTeam(player.teamId)}
                      className="font-semibold text-ink hover:text-emerald transition-colors cursor-pointer"
                    >
                      {teamLabel}
                    </button>
                  ) : (
                    <span className="font-semibold text-ink">{teamLabel}</span>
                  )}
                  <span>·</span>
                  <span className="text-ink font-medium">{careerLabel}</span>
                  <span>·</span>
                  <span className="text-xs text-ink-muted">
                    เข้าร่วมเมื่อ {new Date(player.firstSeenAt).toLocaleDateString('th-TH')}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono text-ink-muted">
                  <span className="truncate">UUID: {player.uuid}</span>
                  <button
                    type="button"
                    onClick={handleCopyUuid}
                    aria-label="คัดลอก UUID"
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-hairline bg-elevated/80 hover:text-ink transition-colors cursor-pointer shrink-0"
                  >
                    {copiedUuid ? (
                      <Check className="w-3 h-3 text-emerald" aria-hidden="true" />
                    ) : (
                      <Copy className="w-3 h-3" aria-hidden="true" />
                    )}
                    <span className="font-sans text-[11px]">{copiedUuid ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Global Rank Badge Box */}
            <div className="self-start rounded-lg border border-border-strong bg-canvas/80 px-5 py-3 text-center tabular-nums shrink-0">
              <div className="text-2xl sm:text-3xl font-bold text-ink">#{rank}</div>
              <div className="text-xs text-ink-secondary mt-0.5">
                Global Rank <span className="text-ink-muted">/ {totalPlayers}</span>
              </div>
            </div>
          </div>

          {/* 4 Iconic Combat & Playtime KPI Boxes inside Hero Banner */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="rounded-lg border border-hairline bg-canvas/80 px-4 py-3.5 flex items-center gap-3.5 tabular-nums">
              <span className="w-10 h-10 rounded-lg border border-hairline bg-elevated flex items-center justify-center shrink-0">
                <Swords className="w-5 h-5 text-ink-secondary" aria-hidden="true" />
              </span>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-ink">{player.kills}</div>
                <div className="text-xs text-ink-secondary">Kills (สังหารรวม)</div>
              </div>
            </div>

            <div className="rounded-lg border border-hairline bg-canvas/80 px-4 py-3.5 flex items-center gap-3.5 tabular-nums">
              <span className="w-10 h-10 rounded-lg border border-hairline bg-elevated flex items-center justify-center shrink-0">
                <Skull className="w-5 h-5 text-ink-secondary" aria-hidden="true" />
              </span>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-ink">{player.deaths}</div>
                <div className="text-xs text-ink-secondary">Deaths (เสียชีวิต)</div>
              </div>
            </div>

            <div className="rounded-lg border border-hairline bg-canvas/80 px-4 py-3.5 flex items-center gap-3.5 tabular-nums">
              <span className="w-10 h-10 rounded-lg border border-emerald/30 bg-elevated flex items-center justify-center shrink-0">
                <TrendingUp className="w-5 h-5 text-emerald" aria-hidden="true" />
              </span>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-emerald">
                  {player.kd.toFixed(2)}
                </div>
                <div className="text-xs text-ink-secondary">
                  K/D Ratio (Streak สูงสุด {player.bestStreak})
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-hairline bg-canvas/80 px-4 py-3.5 flex items-center gap-3.5 tabular-nums">
              <span className="w-10 h-10 rounded-lg border border-hairline bg-elevated flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-ink-secondary" aria-hidden="true" />
              </span>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-ink">
                  {formatPlaytime(player.playtimeSeconds)}
                </div>
                <div className="text-xs text-ink-secondary">Playtime (เวลาเล่นสะสม)</div>
              </div>
            </div>
          </div>

          {/* Sub-Navigation Tabs with Active Mint Underline */}
          <div className="pt-1 border-b border-hairline flex items-center gap-6 overflow-x-auto">
            {(
              [
                { id: 'overview', label: 'Overview', icon: TrendingUp },
                { id: 'ingame', label: 'In-Game Stats', icon: Gamepad2 },
                { id: 'history', label: 'Combat & History', icon: History },
                { id: 'quests', label: 'Quests & Career', icon: ScrollText },
              ] as const
            ).map((t) => {
              const Icon = t.icon;
              const active = subTab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSubTab(t.id)}
                  className={`relative pb-3 inline-flex items-center gap-2 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    active
                      ? 'text-emerald'
                      : 'text-ink-secondary hover:text-ink'
                  }`}
                >
                  <Icon className="w-4 h-4" aria-hidden="true" />
                  <span>{t.label}</span>
                  {active && (
                    <motion.span
                      layoutId="profile-subtab-line"
                      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald rounded-full"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* SUB-TAB 1: OVERVIEW (3-Column Grid: Progression + Recent Activity + Radar Statistics Overview) */}
      {subTab === 'overview' && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Column 1: Progression Card */}
            <section className="lg:col-span-4 rounded-xl border border-hairline bg-surface p-5 flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-ink">Progression</h2>
                  <Flame className="w-4 h-4 text-emerald" aria-hidden="true" />
                </div>

                <div className="space-y-2 tabular-nums">
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-bold text-ink">Level {progression.level}</span>
                    <span className="text-xs text-ink-secondary">
                      {progression.xp.toLocaleString()} / {progression.nextCeiling.toLocaleString()}{' '}
                      XP
                    </span>
                  </div>
                  <div
                    className="w-full h-2 bg-elevated rounded-full overflow-hidden"
                    role="progressbar"
                    aria-valuenow={progression.pct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label="ความคืบหน้าเลเวล"
                  >
                    <div
                      className="h-full bg-emerald rounded-full transition-all duration-300"
                      style={{ width: `${progression.pct}%` }}
                    />
                  </div>
                </div>

                <div className="rounded-lg border border-hairline bg-canvas/60 p-3.5 flex items-center gap-3.5">
                  <span className="w-10 h-10 rounded-lg border border-amber/30 bg-elevated flex items-center justify-center shrink-0">
                    <Pickaxe className="w-5 h-5 text-amber" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <div className="text-xs text-ink-muted">Current Career</div>
                    <div className="text-base font-bold text-ink truncate">{careerLabel}</div>
                    <div className="text-xs text-ink-secondary truncate">{careerMeta.role}</div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-hairline grid grid-cols-3 gap-2 text-xs tabular-nums">
                <div>
                  <span className="text-ink-muted block">Quests</span>
                  <span className="text-sm font-bold text-ink">{player.questsCompleted} ใบ</span>
                </div>
                <div>
                  <span className="text-ink-muted block">Boss Points</span>
                  <span className="text-sm font-bold text-emerald">{player.bossScore} pts</span>
                </div>
                <div>
                  <span className="text-ink-muted block">Raid Kills</span>
                  <span className="text-sm font-bold text-ink">{player.pvpKills}</span>
                </div>
              </div>
            </section>

            {/* Column 2: Recent Activity Card */}
            <section className="lg:col-span-4 rounded-xl border border-hairline bg-surface p-5 flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-ink">Recent Activity</h2>
                <button
                  type="button"
                  onClick={() => setSubTab('history')}
                  className="inline-flex items-center gap-1 text-xs text-ink-secondary hover:text-emerald transition-colors cursor-pointer"
                >
                  <span>View All</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>

              {events.length === 0 ? (
                <p className="text-sm text-ink-secondary py-6">ยังไม่มีกิจกรรมล่าสุดของผู้เล่นนี้</p>
              ) : (
                <div className="divide-y divide-hairline flex-1">
                  {events.slice(0, 4).map((ev) => (
                    <div key={ev.id} className="py-3 flex items-center gap-3 text-sm">
                      <EventTypeIcon type={ev.type} />
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-ink truncate">{ev.summary}</div>
                        <div className="text-xs text-ink-muted tabular-nums">
                          {new Date(ev.createdAt).toLocaleString('th-TH')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Column 3: Statistics Overview (5-Axis Radar Chart) */}
            <section className="lg:col-span-4 rounded-xl border border-hairline bg-surface p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-ink">Statistics Overview</h2>
                <span className="text-xs text-ink-muted">5-Axis Profile</span>
              </div>

              <PlayerRadarChart player={player} />

              <div className="pt-2 border-t border-hairline flex items-center justify-between text-xs text-ink-secondary tabular-nums">
                <span>Best Kill Streak: <strong className="text-ink">{player.bestStreak}</strong></span>
                <span>Current Streak: <strong className="text-emerald">{player.killStreak}</strong></span>
              </div>
            </section>
          </div>

          {/* Combat Performance Graph & Deduplicated Stats History below Overview */}
          <section className="rounded-xl border border-hairline bg-surface overflow-hidden">
            <div className="px-5 py-3.5 border-b border-hairline flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-semibold text-ink">
                  Combat Performance Graph &amp; Stats History
                </h2>
                <p className="text-xs text-ink-secondary">
                  กราฟแนวโน้ม Kills และ K/D Ratio ตามช่วงเวลา (แสดงเฉพาะจุดที่มีการเปลี่ยนแปลงสถิติจริง)
                </p>
              </div>
              <span className="text-xs text-ink-muted tabular-nums">
                {distinctHistory.length} จุดการเปลี่ยนแปลง
              </span>
            </div>

            <CombatPerformanceChart points={distinctHistory} />
          </section>
        </>
      )}

      {/* SUB-TAB 2: IN-GAME STATS (Favorite Weapon + 4 Vanilla Categories) */}
      {subTab === 'ingame' && (
        <div className="space-y-6">
          {/* Favorite Weapon Showcase */}
          <section className="rounded-xl border border-hairline bg-surface p-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <MinecraftItemIcon
                item={player.inGameStats?.favoriteWeapon ?? undefined}
                size={44}
              />
              <div>
                <div className="text-xs uppercase tracking-wider text-ink-muted">
                  Favorite Weapon (อาวุธที่ใช้งานบ่อยที่สุด)
                </div>
                <div className="text-xl font-bold text-ink mt-0.5">
                  {player.inGameStats?.favoriteWeapon
                    ? (WEAPON_LABELS[player.inGameStats.favoriteWeapon] ??
                        player.inGameStats.favoriteWeapon.replace('minecraft:', ''))
                    : 'ยังไม่มีข้อมูลการใช้อาวุธ'}
                </div>
              </div>
            </div>
            {player.inGameStats?.favoriteWeapon && (
              <div className="text-left sm:text-right tabular-nums">
                <div className="text-2xl font-bold text-emerald">
                  {player.inGameStats.favoriteWeaponUses.toLocaleString()}
                </div>
                <div className="text-xs text-ink-muted">ครั้งที่ใช้งานในเกม</div>
              </div>
            )}
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Combat & Damage */}
            <section className="rounded-xl border border-hairline bg-surface overflow-hidden">
              <div className="px-5 py-3.5 border-b border-hairline flex items-center gap-2">
                <Swords className="w-4 h-4 text-emerald" aria-hidden="true" />
                <h2 className="text-base font-semibold text-ink">Combat &amp; Damage</h2>
              </div>
              <div className="divide-y divide-hairline text-sm tabular-nums">
                <div className="px-5 py-3 flex items-center justify-between">
                  <span className="text-ink-secondary">Mob Kills (สังหารมอนสเตอร์)</span>
                  <span className="font-semibold text-ink">
                    {(player.inGameStats?.mobKills ?? 0).toLocaleString()}
                  </span>
                </div>
                <div className="px-5 py-3 flex items-center justify-between">
                  <span className="text-ink-secondary">Damage Dealt (ดาเมจที่ทำได้)</span>
                  <span className="font-semibold text-emerald">
                    {(player.inGameStats?.damageDealt ?? 0).toLocaleString()}
                  </span>
                </div>
                <div className="px-5 py-3 flex items-center justify-between">
                  <span className="text-ink-secondary">Damage Taken (ดาเมจที่ได้รับ)</span>
                  <span className="font-semibold text-ink">
                    {(player.inGameStats?.damageTaken ?? 0).toLocaleString()}
                  </span>
                </div>
                <div className="px-5 py-3 flex items-center justify-between">
                  <span className="text-ink-secondary">PvP Bounties</span>
                  <span className="font-semibold text-ink">{player.pvpKills}</span>
                </div>
              </div>
            </section>

            {/* 2. Survival & Exploration */}
            <section className="rounded-xl border border-hairline bg-surface overflow-hidden">
              <div className="px-5 py-3.5 border-b border-hairline flex items-center gap-2">
                <Compass className="w-4 h-4 text-emerald" aria-hidden="true" />
                <h2 className="text-base font-semibold text-ink">Survival &amp; Exploration</h2>
              </div>
              <div className="divide-y divide-hairline text-sm tabular-nums">
                <div className="px-5 py-3 flex items-center justify-between">
                  <span className="text-ink-secondary">Distance Traveled (ระยะทางเดินทาง)</span>
                  <span className="font-semibold text-ink">
                    {(player.inGameStats?.distanceKm ?? 0).toFixed(1)} km
                  </span>
                </div>
                <div className="px-5 py-3 flex items-center justify-between">
                  <span className="text-ink-secondary">Survived Since Last Death</span>
                  <span className="font-semibold text-emerald">
                    {formatPlaytime((player.inGameStats?.survivedMinutes ?? 0) * 60)}
                  </span>
                </div>
                <div className="px-5 py-3 flex items-center justify-between">
                  <span className="text-ink-secondary">Animals Bred (ผสมพันธุ์สัตว์)</span>
                  <span className="font-semibold text-ink">
                    {(player.inGameStats?.animalsBred ?? 0).toLocaleString()}
                  </span>
                </div>
                <div className="px-5 py-3 flex items-center justify-between">
                  <span className="text-ink-secondary">Fish Caught (ตกปลา)</span>
                  <span className="font-semibold text-ink">
                    {(player.inGameStats?.fishCaught ?? 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </section>

            {/* 3. Mining & Economy */}
            <section className="rounded-xl border border-hairline bg-surface overflow-hidden">
              <div className="px-5 py-3.5 border-b border-hairline flex items-center gap-2">
                <Pickaxe className="w-4 h-4 text-amber" aria-hidden="true" />
                <h2 className="text-base font-semibold text-ink">Mining &amp; Economy</h2>
              </div>
              <div className="divide-y divide-hairline text-sm tabular-nums">
                <div className="px-5 py-3 flex items-center justify-between">
                  <span className="text-ink-secondary">Diamonds Mined (ขุดแร่เพชร)</span>
                  <span className="font-semibold text-emerald">
                    {(player.inGameStats?.diamondsMined ?? 0).toLocaleString()}
                  </span>
                </div>
                <div className="px-5 py-3 flex items-center justify-between">
                  <span className="text-ink-secondary">Ancient Debris Mined</span>
                  <span className="font-semibold text-ink">
                    {(player.inGameStats?.ancientDebrisMined ?? 0).toLocaleString()}
                  </span>
                </div>
                <div className="px-5 py-3 flex items-center justify-between">
                  <span className="text-ink-secondary">Villager Trades (เทรดกับ NPC)</span>
                  <span className="font-semibold text-ink">
                    {(player.inGameStats?.villagerTrades ?? 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </section>

            {/* 4. Boss & Raid Slays */}
            <section className="rounded-xl border border-hairline bg-surface overflow-hidden">
              <div className="px-5 py-3.5 border-b border-hairline flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber" aria-hidden="true" />
                <h2 className="text-base font-semibold text-ink">Boss &amp; Raid Slays</h2>
              </div>
              <div className="divide-y divide-hairline text-sm tabular-nums">
                <div className="px-5 py-3 flex items-center justify-between">
                  <span className="text-ink-secondary">Ender Dragon</span>
                  <span className="font-semibold text-ink">
                    {player.inGameStats?.bossKills.dragon ?? 0}
                  </span>
                </div>
                <div className="px-5 py-3 flex items-center justify-between">
                  <span className="text-ink-secondary">Wither</span>
                  <span className="font-semibold text-ink">
                    {player.inGameStats?.bossKills.wither ?? 0}
                  </span>
                </div>
                <div className="px-5 py-3 flex items-center justify-between">
                  <span className="text-ink-secondary">Warden</span>
                  <span className="font-semibold text-ink">
                    {player.inGameStats?.bossKills.warden ?? 0}
                  </span>
                </div>
                <div className="px-5 py-3 flex items-center justify-between">
                  <span className="text-ink-secondary">Elder Guardian / Illager Raid</span>
                  <span className="font-semibold text-ink">
                    {player.inGameStats?.bossKills.elder ?? 0} /{' '}
                    {player.inGameStats?.bossKills.raidWins ?? 0}
                  </span>
                </div>
              </div>
            </section>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: COMBAT & HISTORY */}
      {subTab === 'history' && (
        <div className="space-y-6">
          <section className="rounded-xl border border-hairline bg-surface overflow-hidden">
            <div className="px-5 py-3.5 border-b border-hairline flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-semibold text-ink">
                  Combat Performance Graph &amp; Stats Progression
                </h2>
                <p className="text-xs text-ink-secondary">
                  บันทึกเฉพาะจังหวะที่จำนวน Kills, Deaths หรือเวลาเล่นเปลี่ยนแปลงจริง
                </p>
              </div>
              <span className="text-xs text-ink-muted tabular-nums">
                {distinctHistory.length} จุดการเปลี่ยนแปลง
              </span>
            </div>

            <CombatPerformanceChart points={distinctHistory} />

            {distinctHistory.length > 0 && (
              <div className="border-t border-hairline divide-y divide-hairline max-h-64 overflow-y-auto">
                {[...distinctHistory].reverse().map((pt, idx) => (
                  <div
                    key={`${pt.recordedAt}-${idx}`}
                    className="px-5 py-2.5 grid grid-cols-12 items-center text-xs sm:text-sm tabular-nums hover:bg-elevated/40"
                  >
                    <span className="col-span-4 text-ink-muted text-xs">
                      {new Date(pt.recordedAt).toLocaleString('th-TH')}
                    </span>
                    <span className="col-span-3 text-right text-ink">
                      <strong>{pt.kills}</strong> Kills / {pt.deaths} Deaths
                    </span>
                    <span className="col-span-2 text-right font-semibold text-emerald">
                      K/D {pt.kd.toFixed(2)}
                    </span>
                    <span className="col-span-3 text-right text-ink-secondary">
                      {formatPlaytime(pt.playtimeSeconds)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-xl border border-hairline bg-surface overflow-hidden">
            <div className="px-5 py-3.5 border-b border-hairline flex items-center justify-between">
              <h3 className="text-base font-semibold text-ink">Kills / Deaths Timeline</h3>
              <span className="text-xs text-ink-muted tabular-nums">{combatEvents.length} รายการ</span>
            </div>
            {combatEvents.length === 0 ? (
              <p className="p-5 text-sm text-ink-secondary">ยังไม่มีบันทึกการสังหารหรือเสียชีวิตในช่วงล่าสุด</p>
            ) : (
              <div className="divide-y divide-hairline">
                {combatEvents.map((ev) => (
                  <div key={ev.id} className="px-5 py-3.5 flex items-center justify-between gap-3 text-sm">
                    <div className="flex items-center gap-3 min-w-0">
                      <EventTypeIcon type={ev.type} />
                      <div className="min-w-0">
                        <div className="text-ink font-medium">{ev.summary}</div>
                        <div className="text-xs text-ink-muted tabular-nums">
                          {new Date(ev.createdAt).toLocaleString('th-TH')}
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={`rounded px-2 py-0.5 text-[11px] shrink-0 ${
                        ev.type === 'KILL'
                          ? 'border-emerald/40 text-emerald bg-elevated'
                          : 'border-danger/40 text-danger bg-elevated'
                      }`}
                    >
                      {ev.type}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* SUB-TAB 3: QUESTS & CAREER */}
      {subTab === 'quests' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <section className="lg:col-span-5 rounded-xl border border-hairline bg-surface p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-wider text-ink-muted">Career Details</div>
                <h3 className="text-lg font-bold text-ink mt-0.5">
                  {careerLabel} · Level {progression.level}
                </h3>
              </div>
              <Badge
                variant="outline"
                className="rounded-md border-emerald/40 bg-elevated text-emerald px-2.5 py-0.5 text-xs tabular-nums"
              >
                {progression.xp} XP
              </Badge>
            </div>
            <p className="text-sm text-ink-secondary leading-relaxed">{careerMeta.specialty}</p>
            <div className="pt-3 border-t border-hairline grid grid-cols-2 gap-3 text-sm tabular-nums">
              <div>
                <span className="text-xs text-ink-muted block">Quests Completed</span>
                <span className="text-lg font-bold text-ink">{player.questsCompleted} ครั้ง</span>
              </div>
              <div>
                <span className="text-xs text-ink-muted block">Boss &amp; Event Score</span>
                <span className="text-lg font-bold text-emerald">{player.bossScore} pts</span>
              </div>
            </div>
          </section>

          <section className="lg:col-span-7 rounded-xl border border-hairline bg-surface overflow-hidden">
            <div className="px-5 py-3.5 border-b border-hairline flex items-center justify-between">
              <h3 className="text-base font-semibold text-ink">Citadel Quest Completion Log</h3>
              <span className="text-xs text-ink-muted tabular-nums">{questEvents.length} รายการ</span>
            </div>
            {questEvents.length === 0 ? (
              <p className="p-5 text-sm text-ink-secondary">ยังไม่มีประวัติการส่งเควสล่าสุด</p>
            ) : (
              <div className="divide-y divide-hairline">
                {questEvents.map((ev) => (
                  <div key={ev.id} className="px-5 py-3.5 flex items-center gap-3 text-sm">
                    <EventTypeIcon type={ev.type} />
                    <div className="min-w-0 flex-1">
                      <div className="text-ink font-medium">{ev.summary}</div>
                      <div className="text-xs text-ink-muted tabular-nums">
                        {new Date(ev.createdAt).toLocaleString('th-TH')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
