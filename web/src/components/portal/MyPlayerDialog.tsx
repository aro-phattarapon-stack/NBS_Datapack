import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, Check, User, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlayerAvatar } from '@/components/portal/PlayerAvatar';
import type { PlayerStatus } from '../../shared/types';

interface MyPlayerDialogProps {
  open: boolean;
  currentIgn: string;
  players: PlayerStatus[];
  onClose: () => void;
  onSaveIgn: (ign: string) => void;
  onOpenProfile: (uuidOrName: string) => void;
}

export function MyPlayerDialog({
  open,
  currentIgn,
  players,
  onClose,
  onSaveIgn,
  onOpenProfile,
}: MyPlayerDialogProps) {
  const [input, setInput] = useState(currentIgn);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open) {
      setInput(currentIgn);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open, currentIgn]);

  const suggestions = useMemo(() => {
    const q = input.trim().toLowerCase();
    return players
      .filter((p) => !q || p.name.toLowerCase().includes(q))
      .slice(0, 6);
  }, [players, input]);

  const matchedPlayer = useMemo(() => {
    const needle = currentIgn.trim().toLowerCase();
    if (!needle) return null;
    return players.find((p) => p.name.toLowerCase() === needle) ?? null;
  }, [players, currentIgn]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = input.trim();
    onSaveIgn(cleaned);
    onClose();
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
          className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center px-4"
          role="dialog"
          aria-modal="true"
          aria-label="เลือกตัวละคร Minecraft ของฉัน"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 4 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-xl border border-border-strong bg-surface p-5 sm:p-6 shadow-2xl space-y-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="w-9 h-9 rounded-lg border border-emerald/35 bg-elevated flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-emerald" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="text-base font-bold text-ink">เลือกตัวละครของคุณ</h2>
                  <p className="text-xs text-ink-secondary">
                    พิมพ์ชื่อในเกม Minecraft เพื่อโชว์ Avatar และเข้าหน้าโปรไฟล์ได้ทันที
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="ปิดหน้าต่างเลือกตัวละคร"
                className="p-1 rounded-md text-ink-muted hover:text-ink hover:bg-elevated cursor-pointer"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            {currentIgn && (
              <div className="rounded-lg border border-hairline bg-canvas/70 px-3.5 py-2.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <PlayerAvatar
                    name={matchedPlayer?.name ?? currentIgn}
                    uuid={matchedPlayer?.uuid}
                    size={32}
                  />
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-ink truncate">
                      {matchedPlayer?.name ?? currentIgn}
                    </div>
                    <div className="text-[11px] text-ink-muted">
                      {matchedPlayer
                        ? `K/D ${matchedPlayer.kd.toFixed(2)} · ${matchedPlayer.kills} Kills`
                        : 'บันทึกชื่อไว้ในเบราว์เซอร์แล้ว'}
                    </div>
                  </div>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    onOpenProfile(matchedPlayer?.uuid ?? currentIgn);
                    onClose();
                  }}
                  className="bg-elevated border-border-strong text-ink hover:bg-hairline cursor-pointer text-xs shrink-0"
                >
                  <span>ดูโปรไฟล์</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" aria-hidden="true" />
                </Button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1.5">
                <label htmlFor="my-ign-input" className="text-xs font-medium text-ink-secondary block">
                  ชื่อในเกม (Minecraft Username)
                </label>
                <Input
                  ref={inputRef}
                  id="my-ign-input"
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="เช่น Steve หรือชื่อตัวละครของคุณ..."
                  className="min-h-10 bg-elevated border-border-strong text-sm text-ink placeholder:text-ink-muted"
                />
              </div>

              {suggestions.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] text-ink-muted block">เลือกจากผู้เล่นในเซิร์ฟเวอร์:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {suggestions.map((p) => (
                      <button
                        key={p.uuid}
                        type="button"
                        onClick={() => {
                          onSaveIgn(p.name);
                          onClose();
                        }}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-hairline bg-canvas/80 hover:bg-elevated hover:border-emerald/45 text-xs text-ink transition-colors cursor-pointer"
                      >
                        <PlayerAvatar name={p.name} uuid={p.uuid} size={24} className="w-4 h-4" />
                        <span>{p.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2 flex items-center justify-between gap-2">
                {currentIgn ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      onSaveIgn('');
                      onClose();
                    }}
                    className="text-xs text-ink-muted hover:text-danger cursor-pointer"
                  >
                    เลิกเลือกตัวละคร
                  </Button>
                ) : (
                  <span />
                )}
                <Button
                  type="submit"
                  size="sm"
                  className="min-h-9 px-4 bg-emerald hover:bg-emerald-hover text-emerald-ink font-semibold cursor-pointer text-xs"
                >
                  <Check className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
                  ยืนยันตัวละคร
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
