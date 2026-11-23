import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, Award, Crown, Filter, Trophy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { BorderBeam } from '@/components/ui/border-beam';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { SpotlightCard } from '@/components/react-bits/SpotlightCard';
import { PlayerAvatar, formatPlaytime } from '@/components/portal/PlayerAvatar';
import { TeamScoreboard } from '@/components/dashboard/TeamScoreboard';
import {
  CAREER_META,
  TEAM_COLOR_META,
  type PlayerStatus,
  type TeamInfo,
} from '../../shared/types';

type LeaderboardTab = 'kills' | 'kd' | 'deaths' | 'playtime' | 'teams';
type TimePeriod = 'season' | '7d';

interface LeaderboardViewProps {
  teamNameById: Map<number, string>;
  updatedAt: string;
  myPlayerUuid?: string;
  onSelectPlayer: (uuid: string) => void;
  onSelectTeam?: (teamId: number) => void;
  onOpenHallOfFame?: () => void;
}

const TABS: { id: LeaderboardTab; label: string }[] = [
  { id: 'kills', label: 'Top Kills' },
  { id: 'kd', label: 'Highest K/D' },
  { id: 'deaths', label: 'Most Deaths' },
  { id: 'playtime', label: 'Top Playtime' },
  { id: 'teams', label: 'Team Rankings' },
];

const DEFAULT_MIN_KILLS_FOR_KD = 3;

export function LeaderboardView({
  teamNameById,
  updatedAt,
  myPlayerUuid = '',
  onSelectPlayer,
  onSelectTeam,
  onOpenHallOfFame,
}: LeaderboardViewProps) {
  const [tab, setTab] = useState<LeaderboardTab>('kills');
  const [period, setPeriod] = useState<TimePeriod>('season');
  const [enforceMinKills, setEnforceMinKills] = useState(true);

  const { data: lbData, isLoading: loading } = useQuery<{
    players?: PlayerStatus[];
    teams?: TeamInfo[];
  }>({
    queryKey: ['leaderboard', period],
    placeholderData: (prev) => prev,
    queryFn: async () => {
      const r = await fetch(`/api/leaderboard?period=${period}`);
      return (await r.json()) as { players?: PlayerStatus[]; teams?: TeamInfo[] };
    },
  });

  const players = Array.isArray(lbData?.players) ? lbData.players : [];
  const teams = Array.isArray(lbData?.teams) ? lbData.teams : [];

  const teamColorById = useMemo(() => {
    const map = new Map<number, string>();
    for (const t of teams) {
      map.set(t.id, TEAM_COLOR_META[t.color]?.hex ?? '#94a3b8');
    }
    return map;
  }, [teams]);

  const { rankedPlayers, excludedKdCount } = useMemo(() => {
    let copy = [...players];
    let excluded = 0;

    if (tab === 'kd' && enforceMinKills) {
      const qualified = copy.filter((p) => p.kills >= DEFAULT_MIN_KILLS_FOR_KD);
      excluded = copy.length - qualified.length;
      copy = qualified;
    }

    if (tab === 'kills') {
      copy.sort((a, b) => b.kills - a.kills || b.kd - a.kd);
    } else if (tab === 'kd') {
      copy.sort((a, b) => b.kd - a.kd || b.kills - a.kills);
    } else if (tab === 'deaths') {
      copy.sort((a, b) => b.deaths - a.deaths || a.kills - b.kills);
    } else if (tab === 'playtime') {
      copy.sort((a, b) => b.playtimeSeconds - a.playtimeSeconds);
    }

    return { rankedPlayers: copy, excludedKdCount: excluded };
  }, [players, tab, enforceMinKills]);

  const topScore = Math.max(1, ...teams.map((t) => t.score));
  const wealthiestId = useMemo(() => {
    let bestId = -1;
    let bestDia = 0;
    for (const t of teams) {
      if (t.diamonds > bestDia) {
        bestDia = t.diamonds;
        bestId = t.id;
      }
    }
    return bestId;
  }, [teams]);

  const champion = rankedPlayers[0] ?? null;

  return (
    <div className="space-y-6">
      {/* Scenic Header Banner */}
      <section className="relative rounded-xl border border-hairline bg-surface overflow-hidden p-5 sm:p-6">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-65 pointer-events-none"
          style={{ backgroundImage: "url('/assets/hero-citadel.png')" }}
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(90deg, rgba(20,23,28,0.88) 0%, rgba(20,23,28,0.48) 55%, rgba(20,23,28,0.84) 100%)',
          }}
          aria-hidden="true"
        />

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <span className="w-11 h-11 rounded-xl border border-amber/35 bg-elevated flex items-center justify-center shrink-0">
              <Trophy className="w-6 h-6 text-amber" aria-hidden="true" />
            </span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-[-0.02em] text-ink">
                Leaderboard
              </h1>
              <p className="text-sm text-ink-secondary">
                อันดับผู้เล่นและทีมทั้งหมดในเซิร์ฟเวอร์
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
            {onOpenHallOfFame && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onOpenHallOfFame}
                className="min-h-9 rounded-lg bg-canvas/85 border-amber/40 text-amber hover:bg-elevated cursor-pointer text-xs sm:text-sm"
              >
                <Award className="w-4 h-4 mr-1.5" aria-hidden="true" />
                Hall of Fame
              </Button>
            )}

            {/* Time Period Pill Switcher with sliding motion highlight */}
            <div
              role="group"
              aria-label="ช่วงเวลา"
              className="inline-flex rounded-lg border border-border-strong bg-canvas/85 p-1"
            >
            {(
              [
                { id: 'season', label: 'This Season' },
                { id: '7d', label: 'Last 7 Days' },
              ] as const
            ).map((p) => {
              const active = period === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPeriod(p.id)}
                  className={`relative px-3.5 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                    active ? 'text-emerald-ink font-semibold' : 'text-ink-secondary hover:text-ink'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="lb-period-pill"
                      transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                      className="absolute inset-0 rounded-md bg-emerald"
                      aria-hidden="true"
                    />
                  )}
                  <span className="relative z-10">{p.label}</span>
                </button>
              );
            })}
            </div>
          </div>
        </div>

        {/* Category Pill Tabs with sliding motion highlight */}
        <div className="relative mt-5 pt-4 border-t border-hairline flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            {TABS.map((t) => {
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={`relative min-h-9 px-3.5 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer border ${
                    active
                      ? 'border-transparent text-emerald-ink font-semibold'
                      : 'bg-canvas/75 border-border-strong text-ink-secondary hover:text-ink hover:bg-elevated'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="lb-category-pill"
                      transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                      className="absolute inset-0 rounded-lg bg-emerald"
                      aria-hidden="true"
                    />
                  )}
                  <span className="relative z-10">{t.label}</span>
                </button>
              );
            })}
          </div>

          {tab === 'kd' && (
            <div className="flex flex-wrap items-center gap-2 text-xs text-ink-secondary">
              <Filter className="w-3.5 h-3.5 text-emerald" aria-hidden="true" />
              <span>
                เกณฑ์ขั้นต่ำ Highest K/D:{' '}
                <strong className="text-ink">
                  {enforceMinKills ? `>= ${DEFAULT_MIN_KILLS_FOR_KD} Kills` : 'แสดงทุกคน'}
                </strong>
                {enforceMinKills && excludedKdCount > 0 ? ` (ซ่อน ${excludedKdCount} คน)` : ''}
              </span>
              <button
                type="button"
                onClick={() => setEnforceMinKills((v) => !v)}
                className="text-emerald hover:underline font-medium cursor-pointer ml-1"
              >
                {enforceMinKills ? 'แสดงทั้งหมด' : `กรอง >= ${DEFAULT_MIN_KILLS_FOR_KD} Kills`}
              </button>
            </div>
          )}
        </div>
      </section>

      {tab === 'teams' ? (
        <div className="grid grid-cols-1">
          <TeamScoreboard
            teams={teams}
            topScore={topScore}
            wealthiestId={wealthiestId}
            updatedAt={updatedAt}
            onSelectTeam={onSelectTeam}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left 8 Columns: Ranking Table */}
          <section className="lg:col-span-8 rounded-xl border border-hairline bg-surface overflow-hidden">
            <div className="px-5 py-3 border-b border-hairline bg-canvas/40 grid grid-cols-12 text-xs font-medium text-ink-muted">
              <div className="col-span-6 sm:col-span-4"># / Player</div>
              <div className="hidden sm:block sm:col-span-3">Team</div>
              <div className="hidden sm:block sm:col-span-2 text-right">Kills / Deaths</div>
              <div className="col-span-3 sm:col-span-1 text-right">K/D</div>
              <div className="col-span-3 sm:col-span-2 text-right">Playtime</div>
            </div>

            {loading ? (
              <div className="p-5 space-y-3">
                {[1, 2, 3, 4].map((n) => (
                  <Skeleton key={n} className="h-12 w-full" />
                ))}
              </div>
            ) : rankedPlayers.length === 0 ? (
              <p className="p-6 text-sm text-ink-secondary">
                {tab === 'kd' && enforceMinKills
                  ? `ยังไม่มีผู้เล่นที่ผ่านเกณฑ์ขั้นต่ำ (${DEFAULT_MIN_KILLS_FOR_KD} Kills) ในช่วงเวลานี้`
                  : 'ยังไม่มีข้อมูลผู้เล่นในช่วงเวลานี้'}
              </p>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${tab}-${period}-${enforceMinKills}`}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.16, ease: 'easeOut' }}
                  className="divide-y divide-hairline"
                >
                  {rankedPlayers.map((p, idx) => {
                    const teamLabel =
                      p.teamId > 0
                        ? (teamNameById.get(p.teamId) ?? `Team ${p.teamId}`)
                        : 'Unassigned';
                    const teamHex = teamColorById.get(p.teamId) ?? '#64748b';
                    const careerLabel = CAREER_META[p.careerId]?.label ?? 'Unassigned';

                    const isMe = Boolean(myPlayerUuid && p.uuid === myPlayerUuid);

                    return (
                      <button
                        key={p.uuid}
                        type="button"
                        onClick={() => onSelectPlayer(p.uuid)}
                        className={`w-full text-left px-5 py-3.5 hover:bg-elevated/70 transition-colors motion-reduce:transition-none grid grid-cols-12 items-center gap-2 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring ${
                          isMe ? 'bg-emerald/10' : ''
                        }`}
                      >
                        <div className="col-span-6 sm:col-span-4 flex items-center gap-3 min-w-0">
                          <span
                            className={`text-xs font-bold tabular-nums w-6 shrink-0 inline-flex items-center gap-1 ${
                              idx === 0
                                ? 'text-amber'
                                : idx === 1 || idx === 2
                                  ? 'text-emerald'
                                  : 'text-ink-muted'
                            }`}
                          >
                            {idx + 1}
                          </span>
                          <PlayerAvatar name={p.name} uuid={p.uuid} size={32} />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-sm sm:text-base text-ink truncate">
                                {p.name}
                              </span>
                              {isMe && (
                                <Badge
                                  variant="outline"
                                  className="rounded px-1.5 py-0 text-[10px] border-emerald/45 text-emerald bg-canvas/70 shrink-0"
                                >
                                  คุณ
                                </Badge>
                              )}
                              {idx === 0 && tab !== 'deaths' && (
                                <Crown className="w-3.5 h-3.5 text-amber shrink-0" aria-hidden="true" />
                              )}
                            </div>
                            <div className="text-xs text-ink-muted truncate">{careerLabel}</div>
                          </div>
                        </div>

                        <div className="hidden sm:flex sm:col-span-3 items-center gap-2 text-xs sm:text-sm text-ink-secondary truncate">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: teamHex }}
                            aria-hidden="true"
                          />
                          <span className="truncate">{teamLabel}</span>
                        </div>

                        <div className="hidden sm:block sm:col-span-2 text-right text-xs sm:text-sm text-ink-secondary tabular-nums">
                          <strong className="text-ink">{p.kills}</strong> / {p.deaths}
                        </div>

                        <div className="col-span-3 sm:col-span-1 text-right text-sm font-bold text-emerald tabular-nums">
                          {p.kd.toFixed(2)}
                        </div>

                        <div className="col-span-3 sm:col-span-2 text-right text-xs sm:text-sm text-ink-secondary tabular-nums">
                          {formatPlaytime(p.playtimeSeconds)}
                        </div>
                      </button>
                    );
                  })}
                </motion.div>
              </AnimatePresence>
            )}
          </section>

          {/* Right 4 Columns: #1 Champion Spotlight Card with SpotlightCard + BorderBeam */}
          {champion && (
            <aside className="lg:col-span-4">
              <SpotlightCard
                spotlightColor="rgba(245, 158, 11, 0.12)"
                className="p-6 text-center space-y-4"
              >
                <BorderBeam color="rgba(52, 211, 153, 0.55)" durationSec={7} />
                <div className="relative flex items-center justify-between text-xs text-ink-muted">
                  <span className="uppercase tracking-wider font-semibold text-emerald">
                    {tab === 'deaths' ? 'Most Deaths Record' : 'Top Ranked Spotlight'}
                  </span>
                  <span className="tabular-nums">
                    {period === '7d' ? 'Last 7 Days' : 'This Season'}
                  </span>
                </div>

                <div className="relative pt-2 flex flex-col items-center space-y-2.5">
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-amber/40 bg-elevated text-amber text-xs font-bold">
                    {tab !== 'deaths' && <Crown className="w-3.5 h-3.5" aria-hidden="true" />}
                    <span>#1</span>
                  </div>

                  <div className="p-2 rounded-xl border border-border-strong bg-canvas/80">
                    <PlayerAvatar name={champion.name} uuid={champion.uuid} size={72} />
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-ink">{champion.name}</h2>
                    <p className="text-xs text-ink-secondary">
                      {champion.teamId > 0
                        ? (teamNameById.get(champion.teamId) ?? `Team ${champion.teamId}`)
                        : 'No Team'}{' '}
                      · {CAREER_META[champion.careerId]?.label ?? 'Unassigned'}
                    </p>
                  </div>
                </div>

                <div className="relative rounded-lg border border-hairline bg-canvas/60 py-3 px-4 tabular-nums space-y-1">
                  <div className="text-2xl font-bold text-emerald">
                    {tab === 'deaths'
                      ? `${champion.deaths} Deaths`
                      : tab === 'playtime'
                        ? formatPlaytime(champion.playtimeSeconds)
                        : `${champion.kd.toFixed(2)} K/D`}
                  </div>
                  <div className="text-xs text-ink-secondary">
                    {champion.kills} Kills · {champion.deaths} Deaths ·{' '}
                    {formatPlaytime(champion.playtimeSeconds)}
                  </div>
                </div>

                <div className="relative">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onSelectPlayer(champion.uuid)}
                    className="w-full min-h-10 bg-elevated border-border-strong text-ink hover:bg-hairline cursor-pointer text-sm"
                  >
                    <span>View Player Profile</span>
                    <ArrowRight className="w-4 h-4 ml-1.5" aria-hidden="true" />
                  </Button>
                </div>
              </SpotlightCard>
            </aside>
          )}
        </div>
      )}
    </div>
  );
}
