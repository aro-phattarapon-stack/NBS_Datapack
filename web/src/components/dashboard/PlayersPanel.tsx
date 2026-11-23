import { ArrowRight, Swords } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { PlayerAvatar } from '@/components/portal/PlayerAvatar';
import { CAREER_META, type PlayerStatus } from '../../shared/types';

interface PlayersPanelProps {
  players: PlayerStatus[];
  teamNameById: Map<number, string>;
  onSelectPlayer: (uuid: string) => void;
  onViewAll: () => void;
}

export function PlayersPanel({
  players,
  teamNameById,
  onSelectPlayer,
  onViewAll,
}: PlayersPanelProps) {
  const readyCount = players.filter((p) => p.teamId > 0 && p.careerId > 0).length;
  const sortedPlayers = [...players].sort(
    (a, b) => b.pvpKills - a.pvpKills || b.kills - a.kills || a.name.localeCompare(b.name),
  );

  return (
    <div className="p-5 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-ink">ผู้เล่น &amp; Top Killers</h2>
          <p className="text-[11px] text-ink-muted">โบนัส Top Killer +80 / +40 แต้ม</p>
        </div>
        <button
          type="button"
          onClick={onViewAll}
          className="text-xs text-ink-secondary hover:text-ink inline-flex items-center gap-1 cursor-pointer min-h-8 px-1.5 rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          ดูทั้งหมด ({readyCount}/{players.length})
          <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </div>

      {sortedPlayers.length === 0 ? (
        <p className="text-sm text-ink-secondary">ยังไม่มีผู้เล่นออนไลน์</p>
      ) : (
        <div className="border border-hairline rounded-md divide-y divide-hairline max-h-72 overflow-y-auto">
          {sortedPlayers.map((p, idx) => {
            const teamLabel =
              p.teamId > 0 ? (teamNameById.get(p.teamId) ?? `Team ${p.teamId}`) : 'ยังไม่เลือกทีม';
            const careerLabel = CAREER_META[p.careerId]?.label ?? 'ยังไม่เลือกอาชีพ';
            const isReady = p.teamId > 0 && p.careerId > 0;
            return (
              <button
                key={p.uuid || p.name}
                type="button"
                onClick={() => onSelectPlayer(p.uuid || p.name)}
                className="w-full text-left px-3 py-2.5 hover:bg-elevated/60 transition-colors motion-reduce:transition-none flex items-center justify-between gap-2 text-xs cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <PlayerAvatar name={p.name} uuid={p.uuid} size={24} />
                  <div className="min-w-0">
                    <div className="font-medium text-ink truncate">{p.name}</div>
                    <div className="text-ink-muted truncate">
                      {teamLabel} · {careerLabel}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 tabular-nums">
                  {p.pvpKills > 0 ? (
                    <Badge
                      variant="outline"
                      className={`rounded px-1.5 py-0 text-[11px] gap-1 ${
                        idx < 2 ? 'border-amber/40 text-amber bg-elevated' : 'border-hairline text-ink-secondary bg-elevated'
                      }`}
                    >
                      <Swords className="w-3 h-3" aria-hidden="true" />
                      {p.pvpKills}
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className={`rounded px-1.5 py-0 text-[11px] ${
                        isReady
                          ? 'border-emerald/40 text-emerald bg-elevated'
                          : 'border-amber/40 text-amber bg-elevated'
                      }`}
                    >
                      {isReady ? 'พร้อม' : 'รอเลือก'}
                    </Badge>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
