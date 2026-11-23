import { useMemo, useState } from 'react';
import { TEAM_COLOR_META, type SnapshotPoint, type TeamInfo } from '../shared/types';

interface ScoreTrendChartProps {
  teams: TeamInfo[];
  snapshots: SnapshotPoint[];
}

/**
 * Minimalist SVG Multi-Team Score Trend Chart following DESIGN.md ("The Quiet Command Ledger").
 * Uses hairline gridlines, tabular numerals, interactive hover tooltip, and color-blind-safe legend badges.
 */
export function ScoreTrendChart({ teams, snapshots }: ScoreTrendChartProps) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const { timestamps, seriesByTeam, maxScore } = useMemo(() => {
    const uniqueTimes = Array.from(new Set(snapshots.map((s) => s.recordedAt)))
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
      .slice(-24);

    const lookup = new Map<string, number>();
    let highest = 50;
    for (const pt of snapshots) {
      lookup.set(`${pt.teamId}|${pt.recordedAt}`, pt.score);
      if (pt.score > highest) highest = pt.score;
    }

    const activeIds = new Set(teams.map((t) => t.id));
    const map = new Map<number, number[]>();
    for (const t of teams) {
      if (!activeIds.has(t.id)) continue;
      let lastVal = 0;
      const values = uniqueTimes.map((ts) => {
        const found = lookup.get(`${t.id}|${ts}`);
        if (found !== undefined) lastVal = found;
        return lastVal;
      });
      map.set(t.id, values);
    }

    return {
      timestamps: uniqueTimes,
      seriesByTeam: map,
      maxScore: Math.ceil(highest / 50) * 50,
    };
  }, [teams, snapshots]);

  const width = 760;
  const height = 220;
  const padLeft = 44;
  const padRight = 16;
  const padTop = 14;
  const padBottom = 26;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  const hasEnoughPoints = timestamps.length >= 2;
  const yTicks = [0, 0.25, 0.5, 0.75, 1];
  const hoverX =
    hoverIdx !== null && timestamps.length > 1
      ? padLeft + (hoverIdx / (timestamps.length - 1)) * plotW
      : null;

  return (
    <section className="rounded-xl border border-hairline bg-surface overflow-hidden">
      <div className="px-5 py-3.5 border-b border-hairline flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-ink">แนวโน้มคะแนนทีม (Snapshots)</h2>
        <span className="text-xs text-ink-muted tabular-nums">
          {timestamps.length} ช่วงเวลา (บันทึกทุก 60 วินาที)
        </span>
      </div>

      {!hasEnoughPoints ? (
        <div className="p-5 text-sm text-ink-secondary">
          รอข้อมูลอย่างน้อย 2 รอบเพื่อแสดงกราฟ (ตอนนี้ {timestamps.length}/2)
        </div>
      ) : (
        <div className="p-5 space-y-4">
          <div className="relative w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="w-full min-w-[480px] h-auto select-none"
              role="img"
              aria-label="กราฟเส้นเปรียบเทียบคะแนนทีมย้อนหลัง"
              onMouseLeave={() => setHoverIdx(null)}
            >
              {yTicks.map((t) => {
                const y = padTop + plotH * (1 - t);
                const labelVal = Math.round(maxScore * t);
                return (
                  <g key={t}>
                    <line
                      x1={padLeft}
                      y1={y}
                      x2={width - padRight}
                      y2={y}
                      stroke="var(--color-hairline)"
                      strokeWidth={1}
                    />
                    <text
                      x={padLeft - 8}
                      y={y + 4}
                      textAnchor="end"
                      fill="var(--color-ink-muted)"
                      fontSize="11"
                      style={{ fontVariantNumeric: 'tabular-nums' }}
                    >
                      {labelVal}
                    </text>
                  </g>
                );
              })}

              {/* Vertical hover guide */}
              {hoverX !== null && (
                <line
                  x1={hoverX}
                  y1={padTop}
                  x2={hoverX}
                  y2={padTop + plotH}
                  stroke="var(--color-border-strong)"
                  strokeWidth={1}
                  strokeDasharray="3 3"
                />
              )}

              {timestamps.map((ts, idx) => {
                const showLabel =
                  idx === 0 ||
                  idx === timestamps.length - 1 ||
                  idx === Math.floor(timestamps.length / 2);
                if (!showLabel) return null;
                const x =
                  padLeft +
                  (timestamps.length > 1 ? (idx / (timestamps.length - 1)) * plotW : 0);
                return (
                  <text
                    key={ts}
                    x={x}
                    y={height - 6}
                    textAnchor={
                      idx === 0 ? 'start' : idx === timestamps.length - 1 ? 'end' : 'middle'
                    }
                    fill="var(--color-ink-muted)"
                    fontSize="11"
                    style={{ fontVariantNumeric: 'tabular-nums' }}
                  >
                    {new Date(ts).toLocaleTimeString('th-TH', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </text>
                );
              })}

              {teams.map((team) => {
                const values = seriesByTeam.get(team.id) ?? [];
                if (values.length < 2) return null;
                const meta = TEAM_COLOR_META[team.color] ?? TEAM_COLOR_META.white;
                const points = values.map((val, idx) => {
                  const x = padLeft + (idx / (values.length - 1)) * plotW;
                  const y = padTop + plotH * (1 - Math.min(1, val / Math.max(1, maxScore)));
                  return { x, y };
                });
                const d = points
                  .map((p, idx) => `${idx === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
                  .join(' ');
                const activePt = hoverIdx !== null ? points[hoverIdx] : points[points.length - 1]!;
                return (
                  <g key={team.id}>
                    <path
                      d={d}
                      fill="none"
                      stroke={meta.hex}
                      strokeWidth={2}
                      strokeLinejoin="round"
                      strokeLinecap="round"
                    />
                    {activePt && (
                      <circle
                        cx={activePt.x}
                        cy={activePt.y}
                        r={hoverIdx !== null ? 4.5 : 3.5}
                        fill={meta.hex}
                        stroke="var(--color-surface)"
                        strokeWidth={1.5}
                      />
                    )}
                  </g>
                );
              })}

              {/* Invisible interactive hit columns for smooth hover tooltip */}
              {timestamps.map((ts, idx) => {
                const colW = plotW / Math.max(1, timestamps.length - 1);
                const x = padLeft + (idx / Math.max(1, timestamps.length - 1)) * plotW - colW / 2;
                return (
                  <rect
                    key={`hit-${ts}`}
                    x={Math.max(padLeft, x)}
                    y={padTop}
                    width={colW}
                    height={plotH}
                    fill="transparent"
                    className="cursor-crosshair"
                    onMouseEnter={() => setHoverIdx(idx)}
                  />
                );
              })}
            </svg>

            {/* Interactive Hover Tooltip Strip */}
            {hoverIdx !== null && timestamps[hoverIdx] && (
              <div className="mt-2 rounded-lg border border-border-strong bg-canvas/95 px-3.5 py-2 flex flex-wrap items-center justify-between gap-2 text-xs tabular-nums">
                <span className="text-ink-secondary font-medium">
                  เวลา{' '}
                  {new Date(timestamps[hoverIdx]!).toLocaleTimeString('th-TH', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                <div className="flex flex-wrap items-center gap-3">
                  {teams.map((team) => {
                    const meta = TEAM_COLOR_META[team.color] ?? TEAM_COLOR_META.white;
                    const val = seriesByTeam.get(team.id)?.[hoverIdx] ?? 0;
                    return (
                      <span key={team.id} className="inline-flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-sm shrink-0"
                          style={{ backgroundColor: meta.hex }}
                          aria-hidden="true"
                        />
                        <span className="text-ink-secondary">{team.name}:</span>
                        <strong className="text-ink">{val} pts</strong>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Color-blind-safe Legend */}
          <div className="flex flex-wrap gap-3 pt-2 border-t border-hairline text-xs">
            {teams.map((team) => {
              const meta = TEAM_COLOR_META[team.color] ?? TEAM_COLOR_META.white;
              return (
                <div
                  key={team.id}
                  className="inline-flex items-center gap-2 text-ink-secondary tabular-nums"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-sm ring-1 ring-white/25 shrink-0"
                    style={{ backgroundColor: meta.hex }}
                    title={`สี${meta.label}`}
                    aria-hidden="true"
                  />
                  <span className="text-ink font-medium">{team.name}</span>
                  <span className="text-ink font-semibold">{team.score} pts</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
