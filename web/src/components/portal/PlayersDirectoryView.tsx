import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, GitCompare, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { PlayerAvatar, formatPlaytime } from '@/components/portal/PlayerAvatar';
import { CAREER_META, type PlayerStatus } from '../../shared/types';

interface PlayersDirectoryViewProps {
  initialQuery?: string;
  initialCompareUuid?: string;
  teamNameById: Map<number, string>;
  onSelectPlayer: (uuid: string) => void;
}

const selectFocusClass =
  'min-h-10 sm:min-h-9 px-3 rounded-md bg-elevated border border-border-strong text-sm text-ink focus:border-ring focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring focus:outline-none';

export function PlayersDirectoryView({
  initialQuery = '',
  initialCompareUuid = '',
  teamNameById,
  onSelectPlayer,
}: PlayersDirectoryViewProps) {
  const [query, setQuery] = useState(initialQuery);
  const [statusFilter, setStatusFilter] = useState<'all' | 'online' | 'offline'>('all');
  const [compareA, setCompareA] = useState(initialCompareUuid);
  const [compareB, setCompareB] = useState('');
  const compareSectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const { data: allPlayers = [] } = useQuery<PlayerStatus[]>({
    queryKey: ['players', 'all'],
    queryFn: async () => {
      const r = await fetch('/api/players');
      const rows = (await r.json()) as PlayerStatus[];
      return Array.isArray(rows) ? rows : [];
    },
  });

  useEffect(() => {
    if (allPlayers.length >= 2) {
      const defaultA =
        initialCompareUuid && allPlayers.some((p) => p.uuid === initialCompareUuid)
          ? initialCompareUuid
          : allPlayers[0]!.uuid;
      const defaultB = allPlayers.find((p) => p.uuid !== defaultA)?.uuid ?? allPlayers[1]!.uuid;
      setCompareA((prev) => (initialCompareUuid ? defaultA : prev || defaultA));
      setCompareB((prev) => (prev && prev !== defaultA ? prev : defaultB));

      if (initialCompareUuid) {
        const timer = setTimeout(() => {
          compareSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 80);
        return () => clearTimeout(timer);
      }
    }
  }, [allPlayers, initialCompareUuid]);

  const { data: players = [], isLoading: loading } = useQuery<PlayerStatus[]>({
    queryKey: ['players', 'filtered', query.trim(), statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (query.trim()) params.set('q', query.trim());
      params.set('status', statusFilter);
      const r = await fetch(`/api/players?${params.toString()}`);
      const rows = (await r.json()) as PlayerStatus[];
      return Array.isArray(rows) ? rows : [];
    },
  });

  const playerA = allPlayers.find((p) => p.uuid === compareA);
  const playerB = allPlayers.find((p) => p.uuid === compareB);

  const compareRows =
    playerA && playerB
      ? [
          { label: 'Total Kills', a: playerA.kills, b: playerB.kills, fmt: (v: number) => `${v}` },
          {
            label: 'Deaths (น้อยกว่าดีกว่า)',
            a: playerA.deaths,
            b: playerB.deaths,
            lowerBetter: true,
            fmt: (v: number) => `${v}`,
          },
          { label: 'K/D Ratio', a: playerA.kd, b: playerB.kd, fmt: (v: number) => v.toFixed(2) },
          {
            label: 'Best Kill Streak',
            a: playerA.bestStreak,
            b: playerB.bestStreak,
            fmt: (v: number) => `${v}`,
          },
          {
            label: 'Playtime',
            a: playerA.playtimeSeconds,
            b: playerB.playtimeSeconds,
            fmt: (v: number) => formatPlaytime(v),
          },
          {
            label: 'Quests Completed',
            a: playerA.questsCompleted,
            b: playerB.questsCompleted,
            fmt: (v: number) => `${v}`,
          },
          {
            label: 'Boss Score',
            a: playerA.bossScore,
            b: playerB.bossScore,
            fmt: (v: number) => `${v} pts`,
          },
        ]
      : [];

  return (
    <div className="space-y-8">
      {/* Flat Section Header & Filter Controls */}
      <div className="pb-5 border-b border-hairline flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-[-0.02em] text-ink">
            ค้นหาและทำเนียบผู้เล่น (Player Directory)
          </h1>
          <p className="text-sm text-ink-secondary mt-1">
            ค้นหาด้วยชื่อตัวละครหรือ UUID เพื่อดูโปรไฟล์และสถิติ
          </p>
        </div>

        <div className="inline-flex flex-wrap items-center gap-1 rounded-lg border border-border-strong bg-surface p-1">
          {(['all', 'online', 'offline'] as const).map((tab) => {
            const active = statusFilter === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setStatusFilter(tab)}
                className={`relative min-h-9 sm:min-h-8 px-3.5 rounded-md text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                  active ? 'text-emerald-ink font-semibold' : 'text-ink-secondary hover:text-ink'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="players-status-pill"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                    className="absolute inset-0 rounded-md bg-emerald"
                    aria-hidden="true"
                  />
                )}
                <span className="relative z-10">
                  {tab === 'all' ? 'ทั้งหมด' : tab === 'online' ? 'ออนไลน์' : 'ออฟไลน์'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Directory Search & Ledger Table */}
      <section className="rounded-lg border border-hairline bg-surface overflow-hidden">
        <div className="px-5 py-4 border-b border-hairline bg-canvas/30 flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search
              className="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <Input
              type="search"
              aria-label="ค้นหาชื่อผู้เล่นหรือ UUID"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ค้นหาชื่อผู้เล่น หรือ UUID..."
              className="pl-10 min-h-10 bg-elevated border-border-strong text-sm text-ink placeholder:text-ink-muted"
            />
          </div>
          <span className="text-xs sm:text-sm text-ink-muted tabular-nums">
            พบผู้เล่น {players.length} คน
          </span>
        </div>

        <div className="px-5 py-2.5 border-b border-hairline bg-canvas/40 hidden sm:grid grid-cols-12 text-xs font-medium text-ink-muted">
          <div className="col-span-5">ผู้เล่น / ทีม &amp; อาชีพ</div>
          <div className="col-span-2 text-right">K/D Ratio</div>
          <div className="col-span-2 text-right">Kills / Deaths</div>
          <div className="col-span-2 text-right">เวลาเล่นสะสม</div>
          <div className="col-span-1 text-right">โปรไฟล์</div>
        </div>

        {loading ? (
          <div className="p-6 text-sm text-ink-secondary">กำลังโหลดรายชื่อผู้เล่น...</div>
        ) : players.length === 0 ? (
          <div className="p-6 text-sm text-ink-secondary">ไม่พบผู้เล่นที่ตรงกับคำค้นหา</div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${statusFilter}-${query.trim()}`}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.16, ease: 'easeOut' }}
              className="divide-y divide-hairline"
            >
              {players.map((p) => {
                const teamLabel =
                  p.teamId > 0 ? (teamNameById.get(p.teamId) ?? `Team ${p.teamId}`) : 'ยังไม่เลือกทีม';
                const careerLabel = CAREER_META[p.careerId]?.label ?? 'ยังไม่เลือกอาชีพ';
                return (
                  <button
                    key={p.uuid}
                    type="button"
                    onClick={() => onSelectPlayer(p.uuid)}
                    className="w-full text-left px-5 py-3.5 hover:bg-elevated/70 transition-colors motion-reduce:transition-none grid grid-cols-12 items-center gap-2 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring"
                  >
                    <div className="col-span-7 sm:col-span-5 flex items-center gap-3 min-w-0">
                      <PlayerAvatar name={p.name} uuid={p.uuid} size={32} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm sm:text-base text-ink truncate">
                            {p.name}
                          </span>
                          <Badge
                            variant="outline"
                            className={`rounded px-1.5 py-0 text-[10px] shrink-0 ${
                              p.online
                                ? 'border-emerald/40 text-emerald bg-elevated'
                                : 'border-hairline text-ink-muted bg-elevated'
                            }`}
                          >
                            {p.online ? 'Online' : 'Offline'}
                          </Badge>
                        </div>
                        <div className="text-xs sm:text-sm text-ink-secondary truncate">
                          {teamLabel} · {careerLabel}
                        </div>
                      </div>
                    </div>

                    <div className="col-span-5 sm:col-span-2 text-right tabular-nums">
                      <span className="font-bold text-sm sm:text-base text-emerald">
                        {p.kd.toFixed(2)}
                      </span>
                      <span className="sm:hidden text-xs text-ink-muted ml-1">
                        K/D ({p.kills}/{p.deaths})
                      </span>
                    </div>

                    <div className="hidden sm:block sm:col-span-2 text-right text-sm text-ink-secondary tabular-nums">
                      <span className="text-ink font-semibold">{p.kills}</span> / {p.deaths}
                    </div>

                    <div className="hidden sm:block sm:col-span-2 text-right text-sm text-ink-secondary tabular-nums">
                      {formatPlaytime(p.playtimeSeconds)}
                    </div>

                    <div className="hidden sm:flex sm:col-span-1 justify-end text-ink-muted">
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </div>
                  </button>
                );
              })}
            </motion.div>
          </AnimatePresence>
        )}
      </section>

      {/* Player Comparison Section */}
      {allPlayers.length >= 2 && (
        <section
          ref={compareSectionRef}
          aria-label="เปรียบเทียบผู้เล่น"
          className="pt-2 space-y-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-ink flex items-center gap-2">
                <GitCompare className="w-4 h-4 text-emerald" aria-hidden="true" />
                <span>เปรียบเทียบสถิติผู้เล่น (1v1 Comparison)</span>
              </h2>
              <p className="text-sm text-ink-secondary">
                เลือกผู้เล่น 2 คนเพื่อเทียบสถิติ K/D, Kills, Kill Streak, เวลาเล่น และคะแนนบอสแบบตัวต่อตัว
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                aria-label="ผู้เล่นคนที่ 1"
                value={compareA}
                onChange={(e) => {
                  const nextA = e.target.value;
                  if (nextA === compareB) {
                    setCompareB(compareA);
                  }
                  setCompareA(nextA);
                }}
                className={selectFocusClass}
              >
                {allPlayers.map((p) => (
                  <option key={p.uuid} value={p.uuid}>
                    {p.name}
                  </option>
                ))}
              </select>
              <span className="text-xs font-semibold text-ink-muted px-1">VS</span>
              <select
                aria-label="ผู้เล่นคนที่ 2"
                value={compareB}
                onChange={(e) => {
                  const nextB = e.target.value;
                  if (nextB === compareA) {
                    setCompareA(compareB);
                  }
                  setCompareB(nextB);
                }}
                className={selectFocusClass}
              >
                {allPlayers.map((p) => (
                  <option key={p.uuid} value={p.uuid}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {playerA && playerB && (
            <div className="rounded-lg border border-hairline bg-surface overflow-hidden divide-y divide-hairline">
              <div className="px-5 py-3.5 bg-canvas/40 grid grid-cols-12 text-xs sm:text-sm font-semibold text-ink items-center">
                <div className="col-span-4 text-ink-muted font-medium">หมวดหมู่สถิติ</div>
                <div className="col-span-4 text-right flex items-center justify-end gap-2">
                  <PlayerAvatar name={playerA.name} uuid={playerA.uuid} size={24} />
                  <button
                    type="button"
                    onClick={() => onSelectPlayer(playerA.uuid)}
                    className="hover:text-emerald transition-colors cursor-pointer truncate"
                  >
                    {playerA.name}
                  </button>
                </div>
                <div className="col-span-4 text-right flex items-center justify-end gap-2">
                  <PlayerAvatar name={playerB.name} uuid={playerB.uuid} size={24} />
                  <button
                    type="button"
                    onClick={() => onSelectPlayer(playerB.uuid)}
                    className="hover:text-emerald transition-colors cursor-pointer truncate"
                  >
                    {playerB.name}
                  </button>
                </div>
              </div>
              {compareRows.map((row) => {
                const aWins = row.lowerBetter ? row.a < row.b : row.a > row.b;
                const bWins = row.lowerBetter ? row.b < row.a : row.b > row.a;
                return (
                  <div
                    key={row.label}
                    className="px-5 py-3 grid grid-cols-12 items-center text-sm tabular-nums hover:bg-elevated/40"
                  >
                    <div className="col-span-4 text-ink-secondary">{row.label}</div>
                    <div
                      className={`col-span-4 text-right font-semibold ${
                        aWins ? 'text-emerald' : 'text-ink'
                      }`}
                    >
                      {row.fmt(row.a)}
                    </div>
                    <div
                      className={`col-span-4 text-right font-semibold ${
                        bWins ? 'text-emerald' : 'text-ink'
                      }`}
                    >
                      {row.fmt(row.b)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
