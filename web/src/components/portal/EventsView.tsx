import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Calendar, Clock, ScrollText, Shield, Skull, Swords, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { BorderBeam } from '@/components/ui/border-beam';
import {
  MinecraftItemIcon,
  getQuestThemeMeta,
} from '@/components/portal/MinecraftItemIcon';
import type {
  FlashQuestState,
  PlayerEventItem,
  QuestHistoryItem,
  TeamInfo,
} from '../../shared/types';

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

interface EventsViewProps {
  flashQuest: FlashQuestState;
  raidDay: boolean;
  gracePeriodEndsAt?: string | null;
  teams?: TeamInfo[];
  quests: QuestHistoryItem[];
  recentEvents: PlayerEventItem[];
  onSelectPlayer: (uuid: string) => void;
}

type EventFilterTab = 'all' | 'active' | 'quests' | 'pvp';

function EventIcon({ type }: { type: PlayerEventItem['type'] }) {
  if (type === 'KILL' || type === 'RAID') {
    return (
      <span className="w-9 h-9 rounded-lg border border-emerald/35 bg-elevated flex items-center justify-center shrink-0">
        <Swords className="w-4 h-4 text-emerald" aria-hidden="true" />
      </span>
    );
  }
  if (type === 'QUEST') {
    return (
      <span className="w-9 h-9 rounded-lg border border-amber/35 bg-elevated flex items-center justify-center shrink-0">
        <ScrollText className="w-4 h-4 text-amber" aria-hidden="true" />
      </span>
    );
  }
  if (type === 'DEATH') {
    return (
      <span className="w-9 h-9 rounded-lg border border-danger/35 bg-elevated flex items-center justify-center shrink-0">
        <Skull className="w-4 h-4 text-danger" aria-hidden="true" />
      </span>
    );
  }
  return (
    <span className="w-9 h-9 rounded-lg border border-hairline bg-elevated flex items-center justify-center shrink-0">
      <Shield className="w-4 h-4 text-ink-secondary" aria-hidden="true" />
    </span>
  );
}

export function EventsView({
  flashQuest,
  raidDay,
  gracePeriodEndsAt = null,
  teams = [],
  quests,
  recentEvents,
  onSelectPlayer,
}: EventsViewProps) {
  const [filter, setFilter] = useState<EventFilterTab>('all');

  const graceRemainingMs = gracePeriodEndsAt
    ? Math.max(0, new Date(gracePeriodEndsAt).getTime() - Date.now())
    : 0;
  const graceHoursLeft = Math.floor(graceRemainingMs / 3600_000);
  const graceMinsLeft = Math.floor((graceRemainingMs % 3600_000) / 60_000);
  const raidStatusLabel = raidDay
    ? 'Raid / PvP 24/7: เปิดแล้ว'
    : graceRemainingMs > 0
      ? `ช่วงเตรียมตัว 48 ชม. (เหลือ ${graceHoursLeft}h ${graceMinsLeft}m)`
      : 'Raid / PvP: ปิด (เปิดอัตโนมัติหลังพ้น 2 วันแรก)';

  const questRatio =
    flashQuest.active && flashQuest.maxSeconds
      ? Math.max(0, Math.min(1, flashQuest.remainingSeconds / flashQuest.maxSeconds))
      : 0;
  const questPct = Math.round(questRatio * 100);
  const questUrgent =
    flashQuest.active && flashQuest.remainingSeconds > 0 && flashQuest.remainingSeconds < 120;

  // Citadel Quest Progress Ring across active teams (each team has 16 main quests)
  const activeTeams = teams.filter((t) => t.active);
  const totalCompletedQuests = activeTeams.reduce((sum, t) => sum + t.questsDone, 0);
  const maxPossibleQuests = Math.max(16, activeTeams.length * 16);
  const bestTeamQuests = Math.max(0, ...activeTeams.map((t) => t.questsDone));
  const ringPct = Math.min(100, Math.round((bestTeamQuests / 16) * 100));
  const ringRadius = 46;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringDashoffset = ringCircumference * (1 - ringPct / 100);

  const filteredEvents = recentEvents.filter((ev) => {
    if (filter === 'active') {
      return ev.type === 'QUEST' || ev.type === 'KILL' || ev.type === 'RAID';
    }
    if (filter === 'quests') return ev.type === 'QUEST';
    if (filter === 'pvp') return ev.type === 'KILL' || ev.type === 'DEATH' || ev.type === 'RAID';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header + Filter Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <span className="w-11 h-11 rounded-xl border border-emerald/35 bg-elevated flex items-center justify-center shrink-0">
            <Calendar className="w-6 h-6 text-emerald" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-[-0.02em] text-ink">Events</h1>
            <p className="text-sm text-ink-secondary">
              Boost Quest สด, บันทึกเควส และประวัติการต่อสู้ PvP
            </p>
          </div>
        </div>

        <div className="inline-flex flex-wrap gap-1 rounded-lg border border-border-strong bg-surface p-1">
          {(
            [
              { id: 'all', label: 'All' },
              { id: 'active', label: 'Active' },
              { id: 'quests', label: 'Quests' },
              { id: 'pvp', label: 'PvP & Raids' },
            ] as const
          ).map((t) => {
            const active = filter === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setFilter(t.id)}
                className={`relative min-h-8 px-3.5 rounded-md text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                  active ? 'text-emerald-ink font-semibold' : 'text-ink-secondary hover:text-ink'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="events-filter-pill"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                    className="absolute inset-0 rounded-md bg-emerald"
                    aria-hidden="true"
                  />
                )}
                <span className="relative z-10">{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Top Featured Active Event Banner + Citadel Quest Progress Ring */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Featured Active Boost Quest Banner (8 cols) with Dynamic Theme & Minecraft Item Icon */}
        {(() => {
          const questTheme = getQuestThemeMeta(flashQuest.item);
          return (
        <section
          aria-label="Active Boost Quest"
          className="lg:col-span-8 relative rounded-xl border border-hairline bg-surface overflow-hidden p-6 sm:p-7 flex flex-col justify-between min-h-[235px]"
        >
          <BorderBeam color="rgba(52, 211, 153, 0.55)" durationSec={8} />
          <div
            className="absolute inset-0 bg-cover bg-center opacity-60 pointer-events-none"
            style={{ backgroundImage: `url('${questTheme.bannerUrl}')` }}
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(90deg, rgba(20,23,28,0.86) 0%, rgba(20,23,28,0.50) 55%, rgba(20,23,28,0.22) 100%)',
            }}
            aria-hidden="true"
          />

          <div className="relative space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className="rounded-full border-emerald/50 bg-canvas/85 text-emerald px-2.5 py-0.5 text-xs font-semibold"
              >
                ● {flashQuest.active ? 'Active Event' : 'Standby'}
              </Badge>
              {flashQuest.source && (
                <Badge
                  variant="secondary"
                  className="rounded-md border border-hairline bg-canvas/80 text-ink-secondary text-xs px-2 py-0.5"
                >
                  Source: {flashQuest.source}
                </Badge>
              )}
              <Badge
                variant="outline"
                className={`rounded-md text-xs px-2 py-0.5 bg-canvas/80 tabular-nums ${
                  raidDay ? 'border-amber/50 text-amber' : 'border-hairline text-ink-secondary'
                }`}
              >
                {raidStatusLabel}
              </Badge>
            </div>

            <div className="flex items-center gap-3.5">
              {flashQuest.active && <MinecraftItemIcon item={flashQuest.item} size={44} />}
              <h2 className="text-2xl sm:text-4xl font-bold tracking-[-0.02em] text-ink">
                {flashQuest.active ? flashQuest.name : 'ยังไม่มีเควสด่วนในขณะนี้'}
              </h2>
            </div>
            <p className="text-sm text-ink-secondary max-w-[54ch]">
              {flashQuest.reason ??
                'ออกตามหาไอเทมเควสด่วนนำมาส่งที่วิหารกลาง The Citadel (0, 0) ทีมแรกที่ส่งสำเร็จรับ +35 แต้ม ทีมถัดไปรับ +25 แต้ม!'}
            </p>
          </div>

          <div className="relative pt-5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="inline-flex items-center gap-2 text-sm text-ink tabular-nums">
                <Clock className="w-4 h-4 text-amber" aria-hidden="true" />
                <span>
                  Time Remaining:{' '}
                  <strong className={questUrgent ? 'text-amber' : 'text-emerald'}>
                    {flashQuest.active ? formatDuration(flashQuest.remainingSeconds) : '--:--'}
                  </strong>
                </span>
              </div>
              <span className="text-xs text-ink-secondary tabular-nums">
                รางวัล: ทีมแรก +35 pts · ทีมถัดไป +25 pts
              </span>
            </div>

            <div
              className="w-full h-1.5 bg-canvas/80 rounded-full overflow-hidden"
              role="progressbar"
              aria-valuenow={questPct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="ความคืบหน้าเวลาเควสด่วน"
            >
              <div
                className={`h-full w-full origin-left transition-transform duration-300 ${
                  questUrgent ? 'bg-amber' : 'bg-emerald'
                }`}
                style={{ transform: `scaleX(${questRatio})` }}
              />
            </div>
          </div>
        </section>
          );
        })()}

        {/* Right 4 cols: Citadel Quest Progress Circular Ring (Mockup Style) */}
        <section className="lg:col-span-4 rounded-xl border border-hairline bg-surface p-6 flex flex-col items-center justify-between text-center">
          <div className="w-full flex items-center justify-between text-xs">
            <span className="font-semibold text-ink text-sm">Quest Progress</span>
            <span className="text-ink-muted">The Citadel (16 ใบ)</span>
          </div>

          <div className="relative my-2 flex items-center justify-center">
            <svg width="124" height="124" viewBox="0 0 120 120" className="-rotate-90">
              <circle
                cx="60"
                cy="60"
                r={ringRadius}
                fill="none"
                stroke="var(--color-elevated)"
                strokeWidth="10"
              />
              <circle
                cx="60"
                cy="60"
                r={ringRadius}
                fill="none"
                stroke="var(--color-emerald)"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={ringCircumference}
                strokeDashoffset={ringDashoffset}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center tabular-nums">
              <span className="text-2xl font-bold text-ink">{ringPct}%</span>
              <span className="text-[11px] text-ink-muted">Leading Team</span>
            </div>
          </div>

          <div className="w-full pt-2 border-t border-hairline flex items-center justify-between text-xs text-ink-secondary tabular-nums">
            <span>ทีมนำส่งแล้ว: <strong className="text-ink">{bestTeamQuests} / 16</strong></span>
            <span>รวมทุกทีม: <strong className="text-emerald">{totalCompletedQuests} / {maxPossibleQuests}</strong></span>
          </div>
        </section>
      </div>

      {/* Event History & Server Quest Dispatch Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <section className="lg:col-span-7 rounded-xl border border-hairline bg-surface overflow-hidden">
          <div className="px-5 py-3.5 border-b border-hairline flex items-center justify-between">
            <h2 className="text-base font-semibold text-ink">
              Event History (บันทึกเควส, การสังหาร PvP &amp; กิจกรรมผู้เล่น)
            </h2>
            <span className="text-xs text-ink-muted tabular-nums">
              {filteredEvents.length} รายการ
            </span>
          </div>

          {filteredEvents.length === 0 ? (
            <p className="p-5 text-sm text-ink-secondary">ยังไม่มีรายการในหมวดที่เลือก</p>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={filter}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.16, ease: 'easeOut' }}
                className="divide-y divide-hairline"
              >
                {filteredEvents.map((ev) => (
                  <button
                    key={ev.id}
                    type="button"
                    onClick={() => onSelectPlayer(ev.uuid)}
                    className="w-full text-left px-5 py-3.5 hover:bg-elevated/70 flex items-center justify-between gap-3 text-sm cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <EventIcon type={ev.type} />
                      <div className="min-w-0">
                        <div className="font-semibold text-ink truncate">{ev.summary}</div>
                        <div className="text-xs text-ink-muted tabular-nums mt-0.5">
                          {new Date(ev.createdAt).toLocaleString('th-TH')}
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={`rounded-md px-2 py-0.5 text-[11px] shrink-0 ${
                        ev.type === 'QUEST'
                          ? 'border-amber/40 text-amber bg-elevated'
                          : ev.type === 'KILL'
                            ? 'border-emerald/40 text-emerald bg-elevated'
                            : ev.type === 'DEATH'
                              ? 'border-danger/40 text-danger bg-elevated'
                              : 'border-hairline text-ink-secondary bg-elevated'
                      }`}
                    >
                      {ev.type}
                    </Badge>
                  </button>
                ))}
              </motion.div>
            </AnimatePresence>
          )}
        </section>

        <section className="lg:col-span-5 rounded-xl border border-hairline bg-surface overflow-hidden">
          <div className="px-5 py-3.5 border-b border-hairline flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald" aria-hidden="true" />
              <h2 className="text-base font-semibold text-ink">Boost Quest Dispatch Log</h2>
            </div>
            <span className="text-xs text-ink-muted tabular-nums">{quests.length} รอบ</span>
          </div>

          {quests.length === 0 ? (
            <div className="p-5 space-y-1.5 text-sm text-ink-secondary">
              <p className="font-medium text-ink">
                ยังไม่มีประวัติการสั่งสุ่ม Global Boost Quest รอบใหม่จากเว็บในซีซันนี้
              </p>
              <p className="text-xs text-ink-muted">
                เควสที่ผู้เล่นส่งสำเร็จในเกมจะแสดงในตาราง Event History ด้านซ้าย ส่วนตารางนี้บันทึกเฉพาะเมื่อ Admin หรือ AI สั่งสุ่มโจทย์ Boost Quest รอบใหม่
              </p>
            </div>
          ) : (
            <div className="divide-y divide-hairline max-h-96 overflow-y-auto">
              {quests.map((q) => (
                <div key={q.id} className="px-5 py-3.5 text-sm space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-ink">{q.displayName}</span>
                    <Badge
                      variant="secondary"
                      className="rounded border border-hairline bg-elevated text-ink-secondary px-2 py-0 text-xs font-normal"
                    >
                      {q.source}
                    </Badge>
                  </div>
                  {q.aiReason && <p className="text-xs text-ink-secondary">{q.aiReason}</p>}
                  <div className="text-xs text-ink-muted tabular-nums">
                    {new Date(q.createdAt).toLocaleString('th-TH')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
