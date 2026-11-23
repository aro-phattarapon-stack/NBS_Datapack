import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '../../client/api';
import {
  MC_QUEST_WHITELIST,
  TEAM_COLOR_META,
  type TeamColor,
  type TeamInfo,
} from '../../shared/types';

interface AdminConsoleProps {
  activeTeams: TeamInfo[];
  raidDay: boolean;
  busy: boolean;
  adminToken: string;
  runAdmin: (fn: () => Promise<{ data: unknown; error: unknown }>, successMsg: string) => Promise<void>;
}

const controlFocusClass =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring focus:outline-none';

export function AdminConsole({
  activeTeams,
  raidDay,
  busy,
  adminToken,
  runAdmin,
}: AdminConsoleProps) {
  const [teamDrafts, setTeamDrafts] = useState<Record<number, string>>({});
  const [customItem, setCustomItem] = useState(MC_QUEST_WHITELIST[0]!.item);
  const [customCount, setCustomCount] = useState(MC_QUEST_WHITELIST[0]!.defaultCount);
  const [confirmSeasonReset, setConfirmSeasonReset] = useState(false);
  const authHeaders = { headers: { 'x-admin-token': adminToken } };
  const selectedQuestMeta =
    MC_QUEST_WHITELIST.find((w) => w.item === customItem) ?? MC_QUEST_WHITELIST[0]!;

  return (
    <section
      aria-label="แผงควบคุมแอดมิน"
      className="rounded-lg border border-hairline bg-surface divide-y divide-hairline"
    >
      <div className="p-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-ink">
          แผงควบคุมแอดมิน (Live RCON + AI)
        </h2>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            disabled={busy}
            onClick={() =>
              runAdmin(
                () => api.api.admin.game.action.post({ action: 'start' }, authHeaders),
                'สั่ง Start Game (เช็กความพร้อม) แล้ว',
              )
            }
            className="min-h-10 sm:min-h-8 bg-emerald hover:bg-emerald-hover text-emerald-ink font-semibold cursor-pointer"
          >
            Start Game
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={() =>
              runAdmin(
                () => api.api.admin.game.action.post({ action: 'do_start' }, authHeaders),
                'สั่งบังคับเริ่มเกม (ข้ามการเช็กพร้อม) แล้ว',
              )
            }
            className="min-h-10 sm:min-h-8 bg-elevated border-amber/40 text-amber hover:bg-amber/10 hover:text-amber cursor-pointer"
          >
            บังคับเริ่มเกม (Skip Check)
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={() =>
              runAdmin(
                () => api.api.admin.game.action.post({ action: 'auto_ready' }, authHeaders),
                'สุ่มทีม + อาชีพให้คนที่ยังไม่พร้อมแล้ว',
              )
            }
            className="min-h-10 sm:min-h-8 bg-elevated border-border-strong text-ink hover:bg-hairline cursor-pointer"
          >
            สุ่มทีม + อาชีพ
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={() =>
              runAdmin(
                () => api.api.admin.team.auto_assign.post(undefined, authHeaders),
                'สุ่มแบ่งทีมอย่างเดียวแล้ว',
              )
            }
            className="min-h-10 sm:min-h-8 bg-elevated border-border-strong text-ink hover:bg-hairline cursor-pointer"
          >
            สุ่มทีมอย่างเดียว
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={() =>
              runAdmin(
                () =>
                  api.api.admin.game.action.post(
                    { action: raidDay ? 'raid_off' : 'raid_on' },
                    authHeaders,
                  ),
                raidDay ? 'ปิด Raid Day แล้ว' : 'เปิด Raid Day แล้ว',
              )
            }
            className={`min-h-10 sm:min-h-8 bg-elevated cursor-pointer ${
              raidDay
                ? 'border-border-strong text-ink hover:bg-hairline'
                : 'border-danger/40 text-danger hover:bg-danger/15 hover:text-danger'
            }`}
          >
            {raidDay ? 'ปิด Raid Day' : 'เปิด Raid Day'}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={() =>
              runAdmin(
                () => api.api.admin.game.action.post({ action: 'reset' }, authHeaders),
                'รีเซ็ตกลับ Lobby แล้ว',
              )
            }
            className="min-h-10 sm:min-h-8 bg-elevated border-border-strong text-ink-secondary hover:text-ink hover:bg-hairline cursor-pointer"
          >
            Reset Lobby
          </Button>
          {!confirmSeasonReset ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={busy}
              onClick={() => setConfirmSeasonReset(true)}
              className="min-h-10 sm:min-h-8 bg-elevated border-danger/40 text-danger hover:bg-danger/15 hover:text-danger cursor-pointer"
            >
              เริ่มซีซันใหม่ (ล้าง Web DB)
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              disabled={busy}
              onClick={async () => {
                setConfirmSeasonReset(false);
                await runAdmin(
                  () => api.api.admin.season.reset.post(undefined, authHeaders),
                  'ล้างสถิติเว็บและเริ่มต้นซีซันใหม่แล้ว',
                );
              }}
              className="min-h-10 sm:min-h-8 bg-danger hover:bg-danger/90 text-[#14171C] font-semibold cursor-pointer"
            >
              ยืนยันล้างข้อมูลซีซัน?
            </Button>
          )}
        </div>
      </div>

      {/* Team Manager */}
      <div className="p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-ink">จำนวนทีม:</span>
            {[2, 3, 4, 5, 6, 7, 8].map((cnt) => (
              <Button
                type="button"
                key={cnt}
                size="sm"
                variant={activeTeams.length === cnt ? 'default' : 'outline'}
                disabled={busy}
                onClick={() =>
                  runAdmin(
                    () => api.api.admin.team.count.post({ count: cnt }, authHeaders),
                    `ปรับจำนวนทีมเป็น ${cnt} ทีมแล้ว`,
                  )
                }
                className={`min-h-10 sm:min-h-8 min-w-10 tabular-nums cursor-pointer ${
                  activeTeams.length === cnt
                    ? 'bg-emerald hover:bg-emerald-hover text-emerald-ink font-semibold'
                    : 'bg-elevated border-border-strong text-ink hover:bg-hairline'
                }`}
              >
                {cnt === 4 ? '4 (Default)' : cnt}
              </Button>
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={async () => {
              await runAdmin(
                () => api.api.admin.team.reset.post(undefined, authHeaders),
                'รีเซ็ตทีมกลับ Default 4 ทีมแล้ว',
              );
              setTeamDrafts({});
            }}
            className="min-h-10 sm:min-h-8 bg-elevated border-border-strong text-ink-secondary hover:text-ink hover:bg-hairline cursor-pointer"
          >
            รีเซ็ตชื่อ/สี Default
          </Button>
        </div>

        <div className="border border-hairline rounded-md divide-y divide-hairline">
          {activeTeams.map((t) => (
            <div key={t.id} className="flex flex-wrap items-center gap-2.5 px-3.5 py-2.5">
              <span className="text-xs font-semibold text-ink-secondary tabular-nums w-8">
                #{t.id}
              </span>
              <Input
                type="text"
                aria-label={`ชื่อทีม ${t.id}`}
                value={teamDrafts[t.id] ?? t.name}
                onChange={(e) =>
                  setTeamDrafts((prev) => ({ ...prev, [t.id]: e.target.value }))
                }
                className="flex-1 min-w-32 min-h-10 sm:min-h-8 bg-elevated border-border-strong text-sm text-ink"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={busy}
                onClick={() =>
                  runAdmin(
                    () =>
                      api.api.admin.team.rename.post(
                        { team: t.id, name: teamDrafts[t.id] ?? t.name },
                        authHeaders,
                      ),
                    `เปลี่ยนชื่อทีม ${t.id} แล้ว`,
                  )
                }
                className="min-h-10 sm:min-h-8 bg-elevated border-border-strong text-ink hover:bg-hairline cursor-pointer"
              >
                บันทึกชื่อ
              </Button>
              <select
                aria-label={`สีทีม ${t.id}`}
                value={t.color}
                onChange={(e) =>
                  runAdmin(
                    () =>
                      api.api.admin.team.color.post(
                        { team: t.id, color: e.target.value as TeamColor },
                        authHeaders,
                      ),
                    `เปลี่ยนสีทีม ${t.id} แล้ว`,
                  )
                }
                className={`min-h-10 sm:min-h-8 px-2.5 rounded-md bg-elevated border border-border-strong text-xs text-ink focus:border-ring ${controlFocusClass}`}
              >
                {Object.entries(TEAM_COLOR_META).map(([val, meta]) => (
                  <option key={val} value={val}>
                    {meta.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* AI Game Director & Custom Flash Quest */}
      <div className="p-5 flex flex-wrap items-center justify-between gap-4">
        <Button
          type="button"
          disabled={busy}
          onClick={() =>
            runAdmin(
              () => api.api.admin.quest.ai.post(undefined, authHeaders),
              'AI Game Director ออกเควสด่วนใหม่แล้ว',
            )
          }
          className="min-h-10 sm:min-h-9 bg-emerald hover:bg-emerald-hover text-emerald-ink font-semibold cursor-pointer"
        >
          ให้ AI วิเคราะห์และสุ่มเควสด่วน
        </Button>

        <div className="flex flex-wrap items-center gap-2">
          <select
            aria-label="เลือกไอเทมเควสด่วน"
            value={customItem}
            onChange={(e) => {
              const next = e.target.value;
              setCustomItem(next);
              const found = MC_QUEST_WHITELIST.find((w) => w.item === next);
              if (found) setCustomCount(found.defaultCount);
            }}
            className={`min-h-10 sm:min-h-9 px-2.5 rounded-md bg-elevated border border-border-strong text-xs text-ink focus:border-ring ${controlFocusClass}`}
          >
            {MC_QUEST_WHITELIST.map((w) => (
              <option key={w.item} value={w.item}>
                {w.thaiName} ({w.minCount}-{w.maxCount})
              </option>
            ))}
          </select>
          <Input
            aria-label="จำนวนไอเทม"
            type="number"
            min={selectedQuestMeta.minCount}
            max={selectedQuestMeta.maxCount}
            value={customCount}
            onChange={(e) => {
              const raw = Number.parseInt(e.target.value, 10);
              setCustomCount(Number.isFinite(raw) ? raw : selectedQuestMeta.defaultCount);
            }}
            className="w-20 min-h-10 sm:min-h-9 bg-elevated border-border-strong text-xs text-ink tabular-nums"
          />
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            onClick={() => {
              const safeCount = Math.max(
                selectedQuestMeta.minCount,
                Math.min(
                  selectedQuestMeta.maxCount,
                  Number.isFinite(customCount) ? Math.round(customCount) : selectedQuestMeta.defaultCount,
                ),
              );
              setCustomCount(safeCount);
              return runAdmin(
                () =>
                  api.api.admin.quest.custom.post(
                    { item: customItem, count: safeCount },
                    authHeaders,
                  ),
                'เปิดเควสด่วนที่กำหนดเองแล้ว',
              );
            }}
            className="min-h-10 sm:min-h-9 bg-elevated border-border-strong text-ink hover:bg-hairline cursor-pointer"
          >
            ส่งเควสนี้เข้าเกม
          </Button>
        </div>
      </div>
    </section>
  );
}
