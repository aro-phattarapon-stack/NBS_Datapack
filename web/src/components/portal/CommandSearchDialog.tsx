import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowRight,
  Calendar,
  Home,
  Search,
  Shield,
  Trophy,
  Users,
  X,
} from 'lucide-react';
import { PlayerAvatar } from '@/components/portal/PlayerAvatar';
import { CAREER_META, TEAM_COLOR_META, type PlayerStatus, type TeamInfo } from '../../shared/types';

interface CommandSearchDialogProps {
  open: boolean;
  onClose: () => void;
  players: PlayerStatus[];
  teams: TeamInfo[];
  teamNameById: Map<number, string>;
  onNavigate: (path: string) => void;
}

type CommandEntry =
  | { kind: 'player'; key: string; player: PlayerStatus }
  | { kind: 'team'; key: string; team: TeamInfo }
  | { kind: 'nav'; key: string; label: string; sub: string; path: string };

const NAV_COMMANDS = [
  { key: 'nav-home', label: 'Home', sub: 'หน้าแรก · ค้นหาผู้เล่น & ภาพรวมเซิร์ฟเวอร์', path: '/' },
  { key: 'nav-players', label: 'Players Directory', sub: 'รายชื่อผู้เล่นทั้งหมด & เปรียบเทียบ 1v1', path: '/players' },
  { key: 'nav-leaderboard', label: 'Leaderboard', sub: 'จัดอันดับ Kills, Highest K/D, Playtime', path: '/leaderboard' },
  { key: 'nav-hall-of-fame', label: 'Hall of Fame', sub: 'บันทึกแชมป์ประจำซีซันที่ผ่านมา', path: '/hall-of-fame' },
  { key: 'nav-teams', label: 'Teams', sub: 'ทำเนียบทีม & โปรไฟล์แต่ละทีม', path: '/teams' },
  { key: 'nav-events', label: 'Events', sub: 'Boost Quest สด & ประวัติกิจกรรม', path: '/events' },
  { key: 'nav-admin', label: 'Admin Console', sub: 'แผงควบคุมเซิร์ฟเวอร์ RCON', path: '/admin' },
];

export function CommandSearchDialog({
  open,
  onClose,
  players,
  teams,
  teamNameById,
  onNavigate,
}: CommandSearchDialogProps) {
  const [query, setQuery] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIdx(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  const entries: CommandEntry[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    const out: CommandEntry[] = [];

    const matchedPlayers = players
      .filter((p) => !q || p.name.toLowerCase().includes(q) || p.uuid.toLowerCase().includes(q))
      .slice(0, 6);
    for (const p of matchedPlayers) {
      out.push({ kind: 'player', key: `pl-${p.uuid}`, player: p });
    }

    const matchedTeams = teams
      .filter((t) => t.active && (!q || t.name.toLowerCase().includes(q)))
      .slice(0, 4);
    for (const t of matchedTeams) {
      out.push({ kind: 'team', key: `tm-${t.id}`, team: t });
    }

    const matchedNav = NAV_COMMANDS.filter(
      (n) => !q || n.label.toLowerCase().includes(q) || n.sub.toLowerCase().includes(q),
    );
    for (const n of matchedNav) {
      out.push({ kind: 'nav', ...n });
    }

    return out;
  }, [query, players, teams]);

  useEffect(() => {
    setActiveIdx(0);
  }, [query]);

  const selectEntry = (entry: CommandEntry) => {
    if (entry.kind === 'player') {
      onNavigate(`/player/${encodeURIComponent(entry.player.uuid)}`);
    } else if (entry.kind === 'team') {
      onNavigate(`/teams/${entry.team.id}`);
    } else {
      onNavigate(entry.path);
    }
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((i) => Math.min(entries.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => Math.max(0, i - 1));
    } else if (e.key === 'Enter' && entries[activeIdx]) {
      e.preventDefault();
      selectEntry(entries[activeIdx]!);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.14 }}
          onClick={onClose}
          className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-start justify-center pt-[12vh] px-4"
          role="dialog"
          aria-modal="true"
          aria-label="ค้นหาด่วน (Command Palette)"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -6 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={handleKeyDown}
            className="w-full max-w-lg rounded-xl border border-border-strong bg-surface shadow-2xl overflow-hidden"
          >
            {/* Search Input Header */}
            <div className="px-4 py-3 border-b border-hairline flex items-center gap-3">
              <Search className="w-4 h-4 text-emerald shrink-0" aria-hidden="true" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="พิมพ์ชื่อผู้เล่น, UUID, ชื่อทีม หรือหน้าเว็บที่ต้องการไป..."
                className="flex-1 bg-transparent text-sm text-ink placeholder:text-ink-muted focus:outline-none"
              />
              <button
                type="button"
                onClick={onClose}
                aria-label="ปิดหน้าต่างค้นหา"
                className="p-1 rounded-md text-ink-muted hover:text-ink hover:bg-elevated cursor-pointer"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            {/* Results List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-hairline/60 p-1.5">
              {entries.length === 0 ? (
                <div className="py-8 text-center text-sm text-ink-secondary">
                  ไม่พบผู้เล่น ทีม หรือเมนูที่ตรงกับ &ldquo;{query}&rdquo;
                </div>
              ) : (
                entries.map((entry, idx) => {
                  const selected = idx === activeIdx;
                  if (entry.kind === 'player') {
                    const p = entry.player;
                    const teamLabel =
                      p.teamId > 0
                        ? (teamNameById.get(p.teamId) ?? `Team ${p.teamId}`)
                        : 'No Team';
                    return (
                      <button
                        key={entry.key}
                        type="button"
                        onMouseEnter={() => setActiveIdx(idx)}
                        onClick={() => selectEntry(entry)}
                        className={`w-full px-3 py-2.5 rounded-lg flex items-center justify-between gap-3 text-left text-sm cursor-pointer transition-colors ${
                          selected ? 'bg-elevated text-ink' : 'text-ink-secondary hover:bg-elevated/60'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <PlayerAvatar name={p.name} uuid={p.uuid} size={24} />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-ink truncate">{p.name}</span>
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  p.online ? 'bg-emerald' : 'bg-ink-muted'
                                }`}
                                aria-hidden="true"
                              />
                            </div>
                            <div className="text-xs text-ink-muted truncate">
                              {teamLabel} · {CAREER_META[p.careerId]?.label ?? 'Unassigned'}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs tabular-nums shrink-0">
                          <span className="text-emerald font-semibold">K/D {p.kd.toFixed(2)}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-ink-muted" aria-hidden="true" />
                        </div>
                      </button>
                    );
                  }

                  if (entry.kind === 'team') {
                    const t = entry.team;
                    const hex = TEAM_COLOR_META[t.color]?.hex ?? '#94a3b8';
                    return (
                      <button
                        key={entry.key}
                        type="button"
                        onMouseEnter={() => setActiveIdx(idx)}
                        onClick={() => selectEntry(entry)}
                        className={`w-full px-3 py-2.5 rounded-lg flex items-center justify-between gap-3 text-left text-sm cursor-pointer transition-colors ${
                          selected ? 'bg-elevated text-ink' : 'text-ink-secondary hover:bg-elevated/60'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className="w-3 h-3 rounded-sm shrink-0"
                            style={{ backgroundColor: hex }}
                            aria-hidden="true"
                          />
                          <div>
                            <div className="font-semibold text-ink">{t.name}</div>
                            <div className="text-xs text-ink-muted">Team Profile</div>
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-ink tabular-nums">
                          {t.score} pts
                        </span>
                      </button>
                    );
                  }

                  const NavIcon =
                    entry.path === '/'
                      ? Home
                      : entry.path === '/players'
                        ? Users
                        : entry.path === '/leaderboard'
                          ? Trophy
                          : entry.path === '/teams'
                            ? Shield
                            : Calendar;
                  return (
                    <button
                      key={entry.key}
                      type="button"
                      onMouseEnter={() => setActiveIdx(idx)}
                      onClick={() => selectEntry(entry)}
                      className={`w-full px-3 py-2.5 rounded-lg flex items-center justify-between gap-3 text-left text-sm cursor-pointer transition-colors ${
                        selected ? 'bg-elevated text-ink' : 'text-ink-secondary hover:bg-elevated/60'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <NavIcon className="w-4 h-4 text-ink-muted shrink-0" aria-hidden="true" />
                        <div className="min-w-0">
                          <div className="font-medium text-ink">{entry.label}</div>
                          <div className="text-xs text-ink-muted truncate">{entry.sub}</div>
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-ink-muted shrink-0" aria-hidden="true" />
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer Shortcuts Hint */}
            <div className="px-4 py-2 border-t border-hairline bg-canvas/70 flex items-center justify-between text-[11px] text-ink-muted">
              <span>↑ ↓ เลื่อนรายการ · Enter เปิด</span>
              <span>ESC ปิดหน้าต่าง</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
