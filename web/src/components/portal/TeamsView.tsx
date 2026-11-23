import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  ArrowRight,
  Crown,
  Flag,
  Gem,
  ScrollText,
  Shield,
  Star,
  Users,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { SpotlightCard } from '@/components/react-bits/SpotlightCard';
import { ScoreTrendChart } from '@/components/ScoreTrendChart';
import { PlayerAvatar, formatPlaytime } from '@/components/portal/PlayerAvatar';
import {
  CAREER_META,
  TEAM_COLOR_META,
  type TeamColor,
  type TeamMemberHistoryItem,
  type TeamsOverviewResponse,
} from '../../shared/types';

const TEAM_BANNER_BY_COLOR: Partial<Record<TeamColor, string>> = {
  red: '/assets/team-banner-red.jpg',
  blue: '/assets/team-banner-blue.jpg',
  aqua: '/assets/team-banner-blue.jpg',
  green: '/assets/team-banner-green.jpg',
  yellow: '/assets/team-banner-yellow.jpg',
  gold: '/assets/team-banner-yellow.jpg',
  light_purple: '/assets/event-blaze.png',
  white: '/assets/hero-citadel.png',
};

const TEAM_BANNER_FALLBACKS = [
  '/assets/team-banner-red.jpg',
  '/assets/team-banner-blue.jpg',
  '/assets/team-banner-green.jpg',
  '/assets/team-banner-yellow.jpg',
];

function getTeamBannerUrl(color: TeamColor, teamId: number): string {
  return (
    TEAM_BANNER_BY_COLOR[color] ??
    TEAM_BANNER_FALLBACKS[Math.abs(teamId - 1) % TEAM_BANNER_FALLBACKS.length] ??
    '/assets/team-banner.png'
  );
}

interface TeamsViewProps {
  selectedTeamId?: number | null;
  updatedAt: string;
  onSelectPlayer: (uuid: string) => void;
  onSelectTeam: (teamId: number | null) => void;
}

export function TeamsView({
  selectedTeamId = null,
  updatedAt,
  onSelectPlayer,
  onSelectTeam,
}: TeamsViewProps) {
  const { data } = useQuery<TeamsOverviewResponse>({
    queryKey: ['teams-overview'],
    placeholderData: (prev) => prev,
    queryFn: async () => {
      const r = await fetch('/api/teams');
      return (await r.json()) as TeamsOverviewResponse;
    },
  });

  if (!data) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[1, 2, 3, 4].map((n) => (
          <Skeleton key={n} className="h-60 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  const activeTeams = [...data.teams].filter((t) => t.active).sort((a, b) => b.score - a.score);
  const teamNameById = new Map(data.teams.map((t) => [t.id, t.name]));

  // Dedicated Team Profile View (/teams/:id)
  if (selectedTeamId !== null) {
    const team = data.teams.find((t) => t.id === selectedTeamId);
    if (!team) {
      return (
        <section className="rounded-xl border border-hairline bg-surface p-6 space-y-4">
          <h2 className="text-xl font-semibold text-ink">ไม่พบข้อมูลทีม #{selectedTeamId}</h2>
          <Button
            type="button"
            variant="outline"
            onClick={() => onSelectTeam(null)}
            className="bg-elevated border-border-strong text-ink hover:bg-hairline cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" aria-hidden="true" />
            Back to Teams
          </Button>
        </section>
      );
    }

    const meta = TEAM_COLOR_META[team.color] ?? TEAM_COLOR_META.white;
    const rankIdx = activeTeams.findIndex((t) => t.id === team.id);
    const members = data.players
      .filter((p) => p.teamId === team.id)
      .sort((a, b) => b.kills - a.kills || b.bossScore - a.bossScore);

    const totalKills = members.reduce((sum, m) => sum + m.kills, 0);
    const totalDeaths = members.reduce((sum, m) => sum + m.deaths, 0);
    const teamKd =
      totalDeaths <= 0 ? totalKills.toFixed(2) : (totalKills / totalDeaths).toFixed(2);
    const totalPlaytime = members.reduce((sum, m) => sum + m.playtimeSeconds, 0);
    const memberUuids = new Set(members.map((m) => m.uuid));
    const teamEvents = (data.recentEvents ?? []).filter(
      (ev) =>
        memberUuids.has(ev.uuid) ||
        ev.summary.includes(team.name) ||
        ev.summary.includes(`Team ${team.id}`),
    );
    const teamSnapshots = (data.snapshots ?? []).filter((s) => s.teamId === team.id);

    const breakdownItems = [
      { label: 'กล่องสมบัติ + โบนัสเพชร', pts: team.breakdown.chestAndBonus },
      { label: 'เควส The Citadel (16 ใบ)', pts: team.breakdown.quest },
      { label: 'คะแนนสายอาชีพ (Career)', pts: team.breakdown.career },
      { label: 'Advancement ทีม', pts: team.breakdown.adv },
      { label: 'บอส & อีเวนต์พิเศษ', pts: team.breakdown.boss },
    ];

    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onSelectTeam(null)}
            className="text-ink-secondary hover:text-ink -ml-2 cursor-pointer text-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" aria-hidden="true" />
            Back to Teams
          </Button>
          <span className="text-xs text-ink-muted tabular-nums">Team Profile · ID #{team.id}</span>
        </div>

        {/* Scenic Team Hero Banner */}
        <section className="relative rounded-xl border border-hairline bg-surface overflow-hidden p-6">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-55 pointer-events-none"
            style={{ backgroundImage: `url('${getTeamBannerUrl(team.color, team.id)}')` }}
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(90deg, rgba(20,23,28,0.86) 0%, rgba(20,23,28,0.48) 55%, rgba(20,23,28,0.82) 100%)',
            }}
            aria-hidden="true"
          />

          <div className="relative flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-xl border border-white/20 flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${meta.hex}25` }}
              >
                <Shield className="w-6 h-6" style={{ color: meta.hex }} aria-hidden="true" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-[-0.02em] text-ink">
                    {team.name}
                  </h1>
                  {rankIdx >= 0 && (
                    <Badge
                      variant="outline"
                      className="rounded-md border-emerald/40 bg-elevated text-emerald px-2.5 py-0.5 text-xs tabular-nums"
                    >
                      Rank #{rankIdx + 1}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-ink-secondary">
                  สมาชิกทั้งหมด {members.length} คน · เควสหลักสำเร็จ {team.questsDone}/16 ใบ · ธงอาณาเขต{' '}
                  {team.flags}/3 จุด
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right tabular-nums">
              <div className="text-xs uppercase tracking-wider text-ink-muted">Total Team Score</div>
              <div className="text-3xl sm:text-4xl font-bold text-ink">
                {team.score} <span className="text-sm font-normal text-ink-muted">pts</span>
              </div>
            </div>
          </div>
        </section>

        {/* Combined Team Statistics Strip */}
        <section className="rounded-xl border border-hairline bg-surface grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-y sm:divide-y-0 sm:divide-x divide-hairline">
          <div className="p-4 tabular-nums">
            <div className="text-xs text-ink-muted">Members</div>
            <div className="text-2xl font-bold text-ink mt-1">{members.length} คน</div>
          </div>
          <div className="p-4 tabular-nums">
            <div className="text-xs text-ink-muted">Total Kills</div>
            <div className="text-2xl font-bold text-ink mt-1">{totalKills}</div>
          </div>
          <div className="p-4 tabular-nums">
            <div className="text-xs text-ink-muted">Team K/D Ratio</div>
            <div className="text-2xl font-bold text-emerald mt-1">{teamKd}</div>
          </div>
          <div className="p-4 tabular-nums">
            <div className="text-xs text-ink-muted">Diamonds</div>
            <div className="text-2xl font-bold text-ink mt-1">{team.diamonds}</div>
          </div>
          <div className="p-4 tabular-nums">
            <div className="text-xs text-ink-muted">Citadel Quests</div>
            <div className="text-2xl font-bold text-ink mt-1">{team.questsDone}/16</div>
          </div>
          <div className="p-4 tabular-nums">
            <div className="text-xs text-ink-muted">Combined Playtime</div>
            <div className="text-2xl font-bold text-ink mt-1">{formatPlaytime(totalPlaytime)}</div>
          </div>
        </section>

        {/* Score Breakdown & Team Members Roster */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <section className="lg:col-span-5 rounded-xl border border-hairline bg-surface overflow-hidden">
            <div className="px-5 py-3.5 border-b border-hairline">
              <h2 className="text-base font-semibold text-ink">สัดส่วนคะแนนทีม (Score Breakdown)</h2>
            </div>
            <div className="divide-y divide-hairline text-sm tabular-nums">
              {breakdownItems.map((item) => (
                <div key={item.label} className="px-5 py-3 flex items-center justify-between">
                  <span className="text-ink-secondary">{item.label}</span>
                  <span className="font-semibold text-ink">{item.pts} pts</span>
                </div>
              ))}
            </div>
          </section>

          <section className="lg:col-span-7 rounded-xl border border-hairline bg-surface overflow-hidden">
            <div className="px-5 py-3.5 border-b border-hairline flex items-center justify-between">
              <h2 className="text-base font-semibold text-ink">สมาชิกในทีม ({members.length})</h2>
              <span className="text-xs text-ink-muted">กดที่ผู้เล่นเพื่อเปิดหน้าโปรไฟล์</span>
            </div>
            {members.length === 0 ? (
              <p className="p-5 text-sm text-ink-secondary">ยังไม่มีสมาชิกที่ลงทะเบียนในทีมนี้</p>
            ) : (
              <div className="divide-y divide-hairline">
                {members.map((m) => (
                  <button
                    key={m.uuid}
                    type="button"
                    onClick={() => onSelectPlayer(m.uuid)}
                    className="w-full text-left px-5 py-3.5 hover:bg-elevated/70 flex items-center justify-between gap-3 text-sm cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <PlayerAvatar name={m.name} uuid={m.uuid} size={32} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-ink truncate">{m.name}</span>
                          <Badge
                            variant="outline"
                            className={`rounded px-1.5 py-0 text-[10px] ${
                              m.online
                                ? 'border-emerald/40 text-emerald bg-elevated'
                                : 'border-hairline text-ink-muted bg-elevated'
                            }`}
                          >
                            {m.online ? 'Online' : 'Offline'}
                          </Badge>
                        </div>
                        <div className="text-xs text-ink-secondary">
                          {CAREER_META[m.careerId]?.label ?? 'ยังไม่เลือกอาชีพ'} · เล่นแล้ว{' '}
                          {formatPlaytime(m.playtimeSeconds)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 tabular-nums text-right shrink-0">
                      <div>
                        <div className="text-sm font-bold text-emerald">K/D {m.kd.toFixed(2)}</div>
                        <div className="text-xs text-ink-muted">
                          {m.kills}K / {m.deaths}D · {m.questsCompleted} เควส
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-ink-muted" aria-hidden="true" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Team Performance Snapshot Chart & Team Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7">
            <ScoreTrendChart teams={[team]} snapshots={teamSnapshots} />
          </div>

          <section className="lg:col-span-5 rounded-xl border border-hairline bg-surface overflow-hidden">
            <div className="px-5 py-3.5 border-b border-hairline">
              <h2 className="text-base font-semibold text-ink">กิจกรรมล่าสุดของสมาชิกทีม</h2>
            </div>
            {teamEvents.length === 0 ? (
              <p className="p-5 text-sm text-ink-secondary">ยังไม่มีกิจกรรมล่าสุดของสมาชิกในทีมนี้</p>
            ) : (
              <div className="divide-y divide-hairline max-h-72 overflow-y-auto">
                {teamEvents.map((ev) => (
                  <button
                    key={ev.id}
                    type="button"
                    onClick={() => onSelectPlayer(ev.uuid)}
                    className="w-full text-left px-5 py-3 hover:bg-elevated/60 flex items-center justify-between gap-2 text-sm cursor-pointer"
                  >
                    <div className="min-w-0">
                      <div className="text-ink font-medium truncate">{ev.summary}</div>
                      <div className="text-xs text-ink-muted tabular-nums mt-0.5">
                        {new Date(ev.createdAt).toLocaleString('th-TH')}
                      </div>
                    </div>
                    <Badge
                      variant="secondary"
                      className="rounded border border-hairline bg-elevated text-ink-secondary px-1.5 py-0 text-[10px] shrink-0"
                    >
                      {ev.type}
                    </Badge>
                  </button>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    );
  }

  // Overview /teams Directory (4-Column Scenic Banner Cards like the Mockups)
  const totalServerPoints = activeTeams.reduce((sum, t) => sum + t.score, 0);
  const totalTeamMembers = data.players.filter((p) => p.teamId > 0).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <span className="w-11 h-11 rounded-xl border border-emerald/35 bg-elevated flex items-center justify-center shrink-0">
            <Shield className="w-6 h-6 text-emerald" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-[-0.02em] text-ink">Teams</h1>
            <p className="text-sm text-ink-secondary">
              ดูคะแนน สมาชิก และรายละเอียดของแต่ละทีม
            </p>
          </div>
        </div>
        <span className="text-xs sm:text-sm text-ink-muted tabular-nums">
          Active Teams: {activeTeams.length}
        </span>
      </div>

      {/* 4-Column Scenic Team Banner Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {activeTeams.map((team, idx) => {
          const meta = TEAM_COLOR_META[team.color] ?? TEAM_COLOR_META.white;
          const members = data.players.filter((p) => p.teamId === team.id);
          const leadCareer =
            members.length > 0
              ? (CAREER_META[members[0]!.careerId]?.label ?? 'Adventurer')
              : 'Open Roster';

          return (
            <SpotlightCard
              key={team.id}
              className="flex flex-col justify-between min-h-[250px]"
            >
              {/* Atmospheric Stronghold Background + Dark Gradient */}
              <div
                className="absolute inset-0 bg-cover bg-center opacity-55 pointer-events-none"
                style={{ backgroundImage: `url('${getTeamBannerUrl(team.color, team.id)}')` }}
                aria-hidden="true"
              />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'linear-gradient(180deg, rgba(20,23,28,0.28) 0%, rgba(20,23,28,0.68) 62%, rgba(20,23,28,0.92) 100%)',
                }}
                aria-hidden="true"
              />

              <div className="relative p-5 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div
                    className="w-10 h-10 rounded-lg border border-white/20 flex items-center justify-center"
                    style={{ backgroundColor: `${meta.hex}28` }}
                    title={`สี${meta.label}`}
                  >
                    <Shield className="w-5 h-5" style={{ color: meta.hex }} aria-hidden="true" />
                  </div>
                  <Badge
                    variant="outline"
                    className="rounded-md border-hairline bg-canvas/75 text-ink-secondary text-xs tabular-nums"
                  >
                    #{idx + 1}
                  </Badge>
                </div>

                <div>
                  <h2 className="text-xl font-bold text-ink">{team.name}</h2>
                  <p className="text-xs text-ink-secondary">{leadCareer} Division</p>
                </div>

                {/* Member Avatars Preview */}
                <div className="flex items-center gap-1.5 pt-1">
                  {members.slice(0, 4).map((m) => (
                    <button
                      key={m.uuid}
                      type="button"
                      onClick={() => onSelectPlayer(m.uuid)}
                      title={m.name}
                      className="rounded hover:ring-2 hover:ring-emerald transition-all cursor-pointer"
                    >
                      <PlayerAvatar name={m.name} uuid={m.uuid} size={24} />
                    </button>
                  ))}
                  <span className="text-xs text-ink-secondary ml-1 tabular-nums">
                    {members.length} / 6 Members
                  </span>
                </div>
              </div>

              <div className="relative px-5 pb-5 pt-3 border-t border-hairline/70 space-y-3">
                <div className="flex items-baseline justify-between tabular-nums">
                  <div className="text-2xl font-bold text-ink">
                    {team.score.toLocaleString()}{' '}
                    <span className="text-xs font-normal text-ink-muted">pts</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-ink-secondary">
                    <span className="inline-flex items-center gap-1">
                      <Flag className="w-3 h-3 text-ink-muted" aria-hidden="true" />
                      {team.flags}/3
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Gem className="w-3 h-3 text-ink-muted" aria-hidden="true" />
                      {team.diamonds}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <ScrollText className="w-3 h-3 text-ink-muted" aria-hidden="true" />
                      {team.questsDone}/16
                    </span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onSelectTeam(team.id)}
                  className="w-full min-h-9 bg-elevated/90 border-border-strong text-ink hover:bg-hairline cursor-pointer text-xs font-medium"
                >
                  <span>View Team</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" aria-hidden="true" />
                </Button>
              </div>
            </SpotlightCard>
          );
        })}
      </div>

      {/* Team Stats Summary Bar (Mockup Style) */}
      <section className="rounded-xl border border-hairline bg-surface p-5 grid grid-cols-1 sm:grid-cols-3 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-hairline">
        <div className="flex items-center gap-3.5 pt-2 sm:pt-0">
          <span className="w-10 h-10 rounded-lg border border-amber/35 bg-elevated flex items-center justify-center shrink-0">
            <Crown className="w-5 h-5 text-amber" aria-hidden="true" />
          </span>
          <div className="tabular-nums">
            <div className="text-lg font-bold text-ink">
              {activeTeams[0]?.name ?? 'Team 1'} (#1)
            </div>
            <div className="text-xs text-ink-secondary">Leading Team Standings</div>
          </div>
        </div>

        <div className="flex items-center gap-3.5 pt-3 sm:pt-0 sm:pl-6">
          <span className="w-10 h-10 rounded-lg border border-emerald/35 bg-elevated flex items-center justify-center shrink-0">
            <Star className="w-5 h-5 text-emerald" aria-hidden="true" />
          </span>
          <div className="tabular-nums">
            <div className="text-lg font-bold text-ink">
              {totalServerPoints.toLocaleString()} pts
            </div>
            <div className="text-xs text-ink-secondary">Total Combined Team Points</div>
          </div>
        </div>

        <div className="flex items-center gap-3.5 pt-3 sm:pt-0 sm:pl-6">
          <span className="w-10 h-10 rounded-lg border border-hairline bg-elevated flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 text-ink-secondary" aria-hidden="true" />
          </span>
          <div className="tabular-nums">
            <div className="text-lg font-bold text-ink">{totalTeamMembers} Players</div>
            <div className="text-xs text-ink-secondary">Registered Team Operatives</div>
          </div>
        </div>
      </section>

      {/* Team Performance Snapshot Chart & Membership Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7">
          <ScoreTrendChart teams={activeTeams} snapshots={data.snapshots ?? []} />
        </div>

        <section className="lg:col-span-5 rounded-xl border border-hairline bg-surface overflow-hidden">
          <div className="px-5 py-3.5 border-b border-hairline">
            <h2 className="text-base font-semibold text-ink">Team Roster Activity</h2>
          </div>
          {data.teamHistory.length === 0 ? (
            <p className="p-5 text-sm text-ink-secondary">ยังไม่มีประวัติการเปลี่ยนทีม</p>
          ) : (
            <div className="divide-y divide-hairline max-h-72 overflow-y-auto">
              {data.teamHistory.map((item: TeamMemberHistoryItem) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectPlayer(item.uuid)}
                  className="w-full text-left px-5 py-3 hover:bg-elevated/60 flex items-center justify-between gap-3 text-sm cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring"
                >
                  <div className="text-ink">
                    <span className="font-semibold">{item.username}</span>{' '}
                    <span className="text-ink-secondary">
                      เข้าร่วม {teamNameById.get(item.teamId) ?? `Team ${item.teamId}`}
                    </span>
                  </div>
                  <span className="text-xs text-ink-muted tabular-nums shrink-0">
                    {new Date(item.joinedAt).toLocaleString('th-TH')}
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
