import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Award, Crown, Shield, Swords, Trophy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { SpotlightCard } from '@/components/react-bits/SpotlightCard';
import { PlayerAvatar } from '@/components/portal/PlayerAvatar';
import { TEAM_COLOR_META, type HallOfFameEntry } from '../../shared/types';

interface HallOfFameViewProps {
  onSelectPlayer: (uuid: string) => void;
  onBackToLeaderboard: () => void;
}

export function HallOfFameView({
  onSelectPlayer,
  onBackToLeaderboard,
}: HallOfFameViewProps) {
  const { data: entries = [], isLoading } = useQuery<HallOfFameEntry[]>({
    queryKey: ['hall-of-fame'],
    placeholderData: (prev) => prev,
    queryFn: async () => {
      const res = await fetch('/api/hall-of-fame');
      const rows = (await res.json()) as HallOfFameEntry[];
      return Array.isArray(rows) ? rows : [];
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onBackToLeaderboard}
          className="text-ink-secondary hover:text-ink -ml-2 cursor-pointer text-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" aria-hidden="true" />
          Back to Leaderboard
        </Button>
      </div>

      {/* Scenic Hall of Fame Header */}
      <section className="relative rounded-xl border border-hairline bg-surface overflow-hidden p-6">
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

        <div className="relative flex items-center gap-3.5">
          <span className="w-11 h-11 rounded-xl border border-amber/40 bg-elevated flex items-center justify-center shrink-0">
            <Award className="w-6 h-6 text-amber" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-[-0.02em] text-ink">
              Hall of Fame
            </h1>
            <p className="text-sm text-ink-secondary">
              แชมป์ประจำซีซันที่ผ่านมา
            </p>
          </div>
        </div>
      </section>

      {isLoading && entries.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-52 w-full rounded-xl" />
          <Skeleton className="h-52 w-full rounded-xl" />
        </div>
      ) : entries.length === 0 ? (
        <section className="rounded-xl border border-hairline bg-surface p-8 text-center space-y-2">
          <Trophy className="w-8 h-8 text-amber mx-auto" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-ink">ยังไม่มีประวัติซีซันที่จบลง</h2>
          <p className="text-sm text-ink-secondary max-w-md mx-auto">
            เมื่อแอดมินกด &ldquo;เริ่มซีซันใหม่&rdquo; หรือเซิร์ฟเวอร์เปลี่ยนโลกใหม่ (#world_id) ระบบจะบันทึกทีมแชมป์และผู้เล่นยอดเยี่ยมของซีซันนี้มาแสดงที่นี่โดยอัตโนมัติ
          </p>
        </section>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {entries.map((entry) => {
            const colorHex = TEAM_COLOR_META[entry.championTeamColor]?.hex ?? '#ef4444';
            return (
              <SpotlightCard
                key={entry.id}
                spotlightColor="rgba(245, 158, 11, 0.11)"
                className="p-6 space-y-5"
              >
                <div className="relative flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-hairline">
                  <div>
                    <div className="flex items-center gap-2">
                      <Crown className="w-4 h-4 text-amber" aria-hidden="true" />
                      <h2 className="text-lg font-bold text-ink">{entry.seasonLabel}</h2>
                    </div>
                    <div className="text-xs text-ink-muted tabular-nums mt-0.5">
                      World #{entry.worldId} · จบซีซัน{' '}
                      {new Date(entry.endedAt).toLocaleDateString('th-TH')}
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className="rounded-md border-amber/40 bg-elevated text-amber text-xs"
                  >
                    Archived Legend
                  </Badge>
                </div>

                {/* 3 Honor Rows: Champion Team, Top Killer, MVP */}
                <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="rounded-lg border border-hairline bg-canvas/70 p-3.5 space-y-1.5">
                    <div className="text-[11px] uppercase tracking-wider text-ink-muted flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5" style={{ color: colorHex }} aria-hidden="true" />
                      <span>Champion Team</span>
                    </div>
                    <div className="font-bold text-base text-ink">{entry.championTeamName}</div>
                    <div className="text-xs font-semibold text-emerald tabular-nums">
                      {entry.championTeamScore} pts
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={!entry.topKillerUuid}
                    onClick={() => entry.topKillerUuid && onSelectPlayer(entry.topKillerUuid)}
                    className="rounded-lg border border-hairline bg-canvas/70 hover:bg-elevated/80 p-3.5 text-left space-y-1.5 transition-colors cursor-pointer disabled:cursor-default"
                  >
                    <div className="text-[11px] uppercase tracking-wider text-ink-muted flex items-center gap-1.5">
                      <Swords className="w-3.5 h-3.5 text-emerald" aria-hidden="true" />
                      <span>Top Killer</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <PlayerAvatar
                        name={entry.topKillerName}
                        uuid={entry.topKillerUuid}
                        size={24}
                      />
                      <span className="font-bold text-sm text-ink truncate">
                        {entry.topKillerName}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-ink-secondary tabular-nums">
                      {entry.topKillerKills} Kills
                    </div>
                  </button>

                  <button
                    type="button"
                    disabled={!entry.mvpUuid}
                    onClick={() => entry.mvpUuid && onSelectPlayer(entry.mvpUuid)}
                    className="rounded-lg border border-hairline bg-canvas/70 hover:bg-elevated/80 p-3.5 text-left space-y-1.5 transition-colors cursor-pointer disabled:cursor-default"
                  >
                    <div className="text-[11px] uppercase tracking-wider text-ink-muted flex items-center gap-1.5">
                      <Trophy className="w-3.5 h-3.5 text-amber" aria-hidden="true" />
                      <span>Season MVP</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <PlayerAvatar name={entry.mvpName} uuid={entry.mvpUuid} size={24} />
                      <span className="font-bold text-sm text-ink truncate">{entry.mvpName}</span>
                    </div>
                    <div className="text-xs font-semibold text-emerald tabular-nums">
                      K/D {entry.mvpKd.toFixed(2)}
                    </div>
                  </button>
                </div>
              </SpotlightCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
