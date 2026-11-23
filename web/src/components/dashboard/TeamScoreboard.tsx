import { useState } from 'react';
import { ChevronDown, Flag, Gem } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CountUp } from '@/components/react-bits/CountUp';
import { TEAM_COLOR_META, type TeamInfo } from '../../shared/types';

interface TeamScoreboardProps {
  teams: TeamInfo[];
  topScore: number;
  wealthiestId: number;
  updatedAt: string;
  onSelectTeam?: (teamId: number) => void;
}

export function TeamScoreboard({
  teams,
  topScore,
  wealthiestId,
  updatedAt,
  onSelectTeam,
}: TeamScoreboardProps) {
  const [expandedTeamId, setExpandedTeamId] = useState<number | null>(null);
  const maxDiamonds = Math.max(0, ...teams.map((t) => t.diamonds));

  return (
    <section className="lg:col-span-8 rounded-lg border border-hairline bg-surface overflow-hidden">
      <div className="px-5 py-3.5 border-b border-hairline flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-base font-semibold text-ink tabular-nums">
          ตารางคะแนนทีมสด ({teams.length} ทีม)
        </h3>
        <span className="text-xs text-ink-muted tabular-nums">
          อัปเดตล่าสุด: {new Date(updatedAt).toLocaleTimeString('th-TH')}
        </span>
      </div>

      {/* Table Column Header */}
      <div className="px-5 py-2.5 border-b border-hairline bg-canvas/40 grid grid-cols-12 text-xs font-medium text-ink-muted">
        <div className="col-span-5 sm:col-span-6">อันดับ / ทีม</div>
        <div className="col-span-2 text-right">ธง</div>
        <div className="col-span-2 text-right">เพชร</div>
        <div className="col-span-3 sm:col-span-2 text-right">คะแนน</div>
      </div>

      <div className="divide-y divide-hairline">
        {teams.map((team, idx) => {
          const meta = TEAM_COLOR_META[team.color] ?? TEAM_COLOR_META.white;
          const ratio = Math.max(0.03, Math.min(1, team.score / topScore));
          const isExpanded = expandedTeamId === team.id;
          const breakdown = team.breakdown ?? {
            chestAndBonus: team.score,
            quest: 0,
            career: 0,
            adv: 0,
            boss: 0,
          };

          return (
            <div key={team.id} className="px-5 py-3.5 space-y-2.5 hover:bg-elevated/40 transition-colors motion-reduce:transition-none">
              <div className="grid grid-cols-12 items-center gap-2">
                <div className="col-span-5 sm:col-span-6 flex items-center gap-2 min-w-0">
                  <span className="text-xs font-semibold text-ink-secondary tabular-nums w-6 shrink-0">
                    #{idx + 1}
                  </span>
                  <span
                    className="w-2.5 h-2.5 rounded-sm shrink-0 ring-1 ring-white/25"
                    style={{ backgroundColor: meta.hex }}
                    title={`สี${meta.label}`}
                    aria-hidden="true"
                  />
                  {onSelectTeam ? (
                    <button
                      type="button"
                      onClick={() => onSelectTeam(team.id)}
                      className="font-semibold text-sm sm:text-base text-ink hover:text-emerald transition-colors truncate cursor-pointer text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded"
                    >
                      {team.name}
                    </button>
                  ) : (
                    <span className="font-semibold text-sm sm:text-base text-ink truncate">
                      {team.name}
                    </span>
                  )}
                  {team.diamonds > 0 &&
                    (team.diamonds === maxDiamonds || team.id === wealthiestId) && (
                    <Badge
                      variant="outline"
                      className="hidden md:inline-flex rounded border-emerald/35 bg-elevated text-emerald text-[11px] px-1.5 py-0 shrink-0"
                    >
                      รวยที่สุด +80
                    </Badge>
                  )}
                </div>

                <div className="col-span-2 flex items-center justify-end gap-1 text-xs sm:text-sm text-ink-secondary tabular-nums">
                  <Flag className="w-3.5 h-3.5 text-ink-muted shrink-0" aria-hidden="true" />
                  <span className="text-ink font-medium">{team.flags ?? 0}/3</span>
                </div>

                <div className="col-span-2 flex items-center justify-end gap-1 text-xs sm:text-sm text-ink-secondary tabular-nums">
                  <Gem className="w-3.5 h-3.5 text-ink-secondary shrink-0" aria-hidden="true" />
                  <CountUp value={team.diamonds} className="text-ink font-medium" />
                </div>

                <div className="col-span-3 sm:col-span-2 text-right tabular-nums">
                  <CountUp value={team.score} className="text-lg font-bold text-ink" />
                  <span className="text-xs text-ink-muted ml-1">pts</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div
                  className="flex-1 h-1 bg-elevated rounded-sm overflow-hidden"
                  role="progressbar"
                  aria-label={`คะแนนทีม ${team.name} (${meta.label})`}
                  aria-valuenow={team.score}
                  aria-valuemin={0}
                  aria-valuemax={topScore}
                >
                  <div
                    className="h-full w-full origin-left transition-transform duration-300 motion-reduce:transition-none"
                    style={{ transform: `scaleX(${ratio})`, backgroundColor: meta.hex }}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  aria-expanded={isExpanded}
                  onClick={() => setExpandedTeamId(isExpanded ? null : team.id)}
                  className="text-[11px] text-ink-muted hover:text-ink px-2 h-6 shrink-0 cursor-pointer"
                >
                  ที่มาคะแนน
                  <ChevronDown
                    className={`w-3 h-3 transition-transform duration-200 motion-reduce:transition-none ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                    aria-hidden="true"
                  />
                </Button>
              </div>

              {isExpanded && (
                <div className="pt-2 border-t border-hairline/70 grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs tabular-nums">
                  <div>
                    <span className="text-ink-muted block">กล่อง + โบนัส</span>
                    <span className="text-ink font-semibold">{breakdown.chestAndBonus} pts</span>
                  </div>
                  <div>
                    <span className="text-ink-muted block">เควส</span>
                    <span className="text-ink font-semibold">{breakdown.quest} pts</span>
                  </div>
                  <div>
                    <span className="text-ink-muted block">อาชีพ</span>
                    <span className="text-ink font-semibold">{breakdown.career} pts</span>
                  </div>
                  <div>
                    <span className="text-ink-muted block">Advancement</span>
                    <span className="text-ink font-semibold">{breakdown.adv} pts</span>
                  </div>
                  <div>
                    <span className="text-ink-muted block">บอส / Event</span>
                    <span className="text-ink font-semibold">{breakdown.boss} pts</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
