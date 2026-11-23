import { useState } from 'react';
import {
  Activity,
  FileText,
  Gamepad2,
  LayoutDashboard,
  Lock,
  LogOut,
  RefreshCw,
  ScrollText,
  Shield,
  Users,
  Zap,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AdminConsole } from '@/components/dashboard/AdminConsole';
import type {
  AuditLogItem,
  FlashQuestState,
  QuestHistoryItem,
  TeamInfo,
} from '../../shared/types';

interface AdminPageViewProps {
  isAdmin: boolean;
  adminToken: string;
  busy: boolean;
  mode: 'rcon' | 'demo';
  worldId: number;
  onlinePlayers: number;
  raidDay: boolean;
  flashQuest: FlashQuestState;
  activeTeams: TeamInfo[];
  quests: QuestHistoryItem[];
  audits: AuditLogItem[];
  snapshotsCount: number;
  onLogin: (token: string) => Promise<void>;
  onLogout: () => void;
  runAdmin: (fn: () => Promise<{ data: unknown; error: unknown }>, successMsg: string) => Promise<void>;
}

type AdminSection = 'overview' | 'control' | 'quests' | 'audit';

export function AdminPageView({
  isAdmin,
  adminToken,
  busy,
  mode,
  worldId,
  onlinePlayers,
  raidDay,
  flashQuest,
  activeTeams,
  quests,
  audits,
  snapshotsCount,
  onLogin,
  onLogout,
  runAdmin,
}: AdminPageViewProps) {
  const [tokenInput, setTokenInput] = useState('');
  const [section, setSection] = useState<AdminSection>('overview');
  const [syncStatus, setSyncStatus] = useState<{
    latencyMs: number;
    dbConnected: boolean;
    at: string;
  } | null>(null);
  const [syncing, setSyncing] = useState(false);

  const handleForceSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch('/api/admin/sync', {
        method: 'POST',
        headers: { 'x-admin-token': adminToken },
      });
      if (res.ok) {
        const json = (await res.json()) as {
          latencyMs: number;
          dbConnected: boolean;
          updatedAt: string;
        };
        setSyncStatus({
          latencyMs: json.latencyMs,
          dbConnected: json.dbConnected,
          at: json.updatedAt,
        });
      }
    } finally {
      setSyncing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onLogin(tokenInput);
    setTokenInput('');
  };

  if (!isAdmin) {
    return (
      <div className="min-h-[62vh] flex flex-col items-center justify-center py-12">
        <section className="w-full max-w-md rounded-xl border border-hairline bg-surface p-6 sm:p-8 space-y-6">
          <div className="space-y-2 text-center">
            <div className="w-11 h-11 rounded-xl border border-emerald/35 bg-elevated mx-auto flex items-center justify-center">
              <Lock className="w-5 h-5 text-emerald" aria-hidden="true" />
            </div>
            <h1 className="text-xl font-bold tracking-[-0.02em] text-ink">
              Admin Console Authentication
            </h1>
            <p className="text-sm text-ink-secondary">
              พื้นที่เฉพาะผู้ดูแลระบบ NBs SMP สำหรับสั่งการ Minecraft RCON, จัดการทีม, สุ่มเควสด่วน และตรวจสอบ Audit Log
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="admin-page-token" className="text-sm font-medium text-ink block">
                รหัสผ่านแอดมิน (ADMIN_TOKEN)
              </label>
              <Input
                id="admin-page-token"
                type="password"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="ใส่รหัส ADMIN_TOKEN จากไฟล์ web/.env..."
                className="min-h-10 bg-elevated border-border-strong text-sm text-ink placeholder:text-ink-muted"
              />
            </div>
            <Button
              type="submit"
              className="w-full min-h-10 bg-emerald hover:bg-emerald-hover text-emerald-ink font-semibold cursor-pointer"
            >
              ปลดล็อกแผงควบคุม Admin
            </Button>
          </form>

          <div className="pt-4 border-t border-hairline flex items-center justify-between text-xs text-ink-muted tabular-nums">
            <span>โหมดเซิร์ฟเวอร์: {mode === 'rcon' ? 'RCON Live' : 'Demo Mode'}</span>
            <span>World ID #{worldId}</span>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left Sidebar Navigation (Mockup Style) */}
      <aside className="lg:col-span-3 rounded-xl border border-hairline bg-surface p-3.5 space-y-4">
        <div className="px-2.5 py-2 flex items-center gap-2.5 border-b border-hairline">
          <Shield className="w-5 h-5 text-emerald shrink-0" aria-hidden="true" />
          <div>
            <div className="text-sm font-bold text-ink">Admin Panel</div>
            <div className="text-[11px] text-ink-muted">Server Management</div>
          </div>
        </div>

        <nav aria-label="เมนูแอดมิน" className="space-y-1">
          {(
            [
              { id: 'overview', label: 'Overview', icon: LayoutDashboard },
              { id: 'control', label: 'Game & Team Control', icon: Gamepad2 },
              { id: 'quests', label: 'Quest Dispatch Log', icon: ScrollText },
              { id: 'audit', label: 'Audit Logs', icon: FileText },
            ] as const
          ).map((item) => {
            const Icon = item.icon;
            const active = section === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSection(item.id)}
                className={`w-full px-3 py-2.5 rounded-lg text-left text-xs sm:text-sm font-medium flex items-center gap-2.5 transition-colors cursor-pointer ${
                  active
                    ? 'bg-emerald/15 text-emerald border border-emerald/35'
                    : 'text-ink-secondary hover:text-ink hover:bg-elevated'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="pt-3 border-t border-hairline">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onLogout}
            className="w-full min-h-9 bg-elevated border-danger/40 text-danger hover:bg-danger/15 hover:text-danger cursor-pointer text-xs"
          >
            <LogOut className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
            ล็อกแผงควบคุม (Logout)
          </Button>
        </div>
      </aside>

      {/* Right Workspace (9 Columns) */}
      <div className="lg:col-span-9 space-y-6">
        {/* Top Admin Header & Server Status Tiles */}
        <section className="rounded-xl border border-hairline bg-surface p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-[-0.02em] text-ink">
                Admin Panel &amp; Live RCON Console
              </h1>
              <p className="text-xs sm:text-sm text-ink-secondary">
                ควบคุมสถานะเกม RCON และตรวจสอบประวัติคำสั่ง
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={syncing}
                onClick={handleForceSync}
                className="min-h-8 bg-elevated border-border-strong text-ink hover:bg-hairline cursor-pointer text-xs"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 mr-1.5 text-emerald ${syncing ? 'animate-spin' : ''}`}
                  aria-hidden="true"
                />
                {syncing ? 'กำลังซิงค์...' : 'Force Sync RCON'}
              </Button>
              <Badge
                variant="outline"
                className="rounded-full border-emerald/45 bg-canvas px-3 py-1 text-xs font-medium text-emerald"
              >
                ● {mode === 'rcon' ? 'RCON Online' : 'Demo Sandbox'}
              </Badge>
            </div>
          </div>

          {syncStatus && (
            <div className="rounded-lg border border-emerald/30 bg-canvas/80 px-3.5 py-2 flex flex-wrap items-center justify-between gap-2 text-xs tabular-nums">
              <span className="text-emerald font-medium">
                ซิงค์สถานะ RCON สำเร็จ ({syncStatus.latencyMs} ms)
              </span>
              <span className="text-ink-secondary">
                Database: {syncStatus.dbConnected ? 'PostgreSQL Connected' : 'In-Memory Fallback'} ·{' '}
                {new Date(syncStatus.at).toLocaleTimeString('th-TH')}
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-lg border border-hairline bg-canvas/70 p-3.5 flex items-center gap-3 tabular-nums">
              <span className="w-9 h-9 rounded-lg border border-emerald/30 bg-elevated flex items-center justify-center shrink-0">
                <Users className="w-4 h-4 text-emerald" aria-hidden="true" />
              </span>
              <div>
                <div className="text-xs text-ink-muted">Online Players</div>
                <div className="text-lg font-bold text-ink">{onlinePlayers} / 20</div>
              </div>
            </div>

            <div className="rounded-lg border border-hairline bg-canvas/70 p-3.5 flex items-center gap-3 tabular-nums">
              <span className="w-9 h-9 rounded-lg border border-hairline bg-elevated flex items-center justify-center shrink-0">
                <Activity className="w-4 h-4 text-emerald" aria-hidden="true" />
              </span>
              <div>
                <div className="text-xs text-ink-muted">Server Mode</div>
                <div className="text-lg font-bold text-ink">
                  {mode === 'rcon' ? 'RCON Live' : 'Demo'}
                </div>
                <div className="text-[11px] text-ink-muted">World #{worldId}</div>
              </div>
            </div>

            <div className="rounded-lg border border-hairline bg-canvas/70 p-3.5 flex items-center gap-3 tabular-nums">
              <span className="w-9 h-9 rounded-lg border border-amber/30 bg-elevated flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4 text-amber" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <div className="text-xs text-ink-muted">Active Event</div>
                <div className="text-sm font-bold text-ink truncate">
                  {flashQuest.active ? flashQuest.name : 'Standby'}
                </div>
                <div className="text-[11px] text-ink-muted">
                  {raidDay ? 'Raid 24/7: เปิดแล้ว' : 'Grace Period 48 ชม. แรก'}
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-hairline bg-canvas/70 p-3.5 flex items-center gap-3 tabular-nums">
              <span className="w-9 h-9 rounded-lg border border-hairline bg-elevated flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-ink-secondary" aria-hidden="true" />
              </span>
              <div>
                <div className="text-xs text-ink-muted">Audit Logs</div>
                <div className="text-lg font-bold text-ink">{audits.length} คำสั่ง</div>
                <div className="text-[11px] text-ink-muted">{snapshotsCount} Snapshots</div>
              </div>
            </div>
          </div>
        </section>

        {(section === 'overview' || section === 'control') && (
          <AdminConsole
            activeTeams={activeTeams}
            raidDay={raidDay}
            busy={busy}
            adminToken={adminToken}
            runAdmin={runAdmin}
          />
        )}

        {(section === 'overview' || section === 'quests' || section === 'audit') && (
          <div
            className={`grid grid-cols-1 ${
              section === 'overview' ? 'md:grid-cols-2' : ''
            } gap-6`}
          >
            {(section === 'overview' || section === 'quests') && (
              <section className="rounded-xl border border-hairline bg-surface overflow-hidden">
                <div className="px-5 py-3.5 border-b border-hairline flex items-center justify-between">
                  <h2 className="text-base font-semibold text-ink">ประวัติการสั่งเปิดเควสด่วน</h2>
                  <span className="text-xs text-ink-muted tabular-nums">{quests.length} รายการ</span>
                </div>
                {quests.length === 0 ? (
                  <p className="p-5 text-sm text-ink-secondary">
                    ยังไม่มีประวัติเควสด่วนที่สั่งจากเว็บในซีซันนี้
                  </p>
                ) : (
                  <div
                    className={`divide-y divide-hairline ${
                      section === 'quests' ? 'max-h-[460px]' : 'max-h-64'
                    } overflow-y-auto`}
                  >
                    {quests.map((q) => (
                      <div key={q.id} className="px-5 py-3 text-sm space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-ink">{q.displayName}</span>
                          <Badge
                            variant="secondary"
                            className="rounded border border-hairline bg-elevated text-ink-secondary px-1.5 py-0 text-xs font-normal"
                          >
                            {q.source}
                          </Badge>
                        </div>
                        {q.aiReason && <p className="text-xs text-ink-secondary">{q.aiReason}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {(section === 'overview' || section === 'audit') && (
              <section className="rounded-xl border border-hairline bg-surface overflow-hidden">
                <div className="px-5 py-3.5 border-b border-hairline flex items-center justify-between gap-2">
                  <h2 className="text-base font-semibold text-ink">Audit Logs (บันทึกคำสั่งแอดมิน)</h2>
                  <span className="text-xs text-ink-muted tabular-nums">{audits.length} รายการ</span>
                </div>
                {audits.length === 0 ? (
                  <p className="p-5 text-sm text-ink-secondary">ยังไม่มีประวัติคำสั่งแอดมิน</p>
                ) : (
                  <div
                    className={`divide-y divide-hairline ${
                      section === 'audit' ? 'max-h-[460px]' : 'max-h-64'
                    } overflow-y-auto`}
                  >
                    {audits.map((a) => (
                      <div
                        key={a.id}
                        className="px-5 py-3 text-xs sm:text-sm flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <div className="font-mono text-ink font-medium">{a.action}</div>
                          <div className="text-xs text-ink-muted tabular-nums">
                            {new Date(a.createdAt).toLocaleString('th-TH')}
                          </div>
                        </div>
                        <span className="text-xs text-ink-secondary truncate max-w-52">
                          {a.result}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
