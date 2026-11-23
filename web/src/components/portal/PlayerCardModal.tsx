import { useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import {
  Award,
  Download,
  Flame,
  Footprints,
  Hand,
  Layers,
  Monitor,
  RotateCw,
  Shield,
  Smartphone,
  Sparkles,
  Swords,
  User,
  X,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { BorderBeam } from '@/components/ui/border-beam';
import { Button } from '@/components/ui/button';
import { MinecraftItemIcon } from '@/components/portal/MinecraftItemIcon';
import { formatPlaytime } from '@/components/portal/PlayerAvatar';
import { Skin3DViewer, type Skin3DPose } from '@/components/portal/Skin3DViewer';
import { CAREER_META, TEAM_COLOR_META, type PlayerStatus, type TeamColor } from '../../shared/types';

export type ShareCardTemplate = 'classic' | 'collector' | 'competitive';

interface PlayerCardModalProps {
  open: boolean;
  onClose: () => void;
  player: PlayerStatus;
  rank: number;
  level: number;
  tierName: string;
  teamName: string;
  teamColor?: TeamColor;
}

const WEAPON_LABELS: Record<string, string> = {
  'minecraft:netherite_sword': 'Netherite Sword',
  'minecraft:diamond_sword': 'Diamond Sword',
  'minecraft:iron_sword': 'Iron Sword',
  'minecraft:netherite_axe': 'Netherite Axe',
  'minecraft:diamond_axe': 'Diamond Axe',
  'minecraft:mace': 'Heavy Mace',
  'minecraft:trident': 'Trident',
  'minecraft:bow': 'Bow',
  'minecraft:crossbow': 'Crossbow',
};

const TEAM_CLASSIC_BG: Partial<Record<TeamColor, string>> = {
  red: '/assets/team-banner-red.jpg',
  blue: '/assets/team-banner-blue.jpg',
  aqua: '/assets/team-banner-blue.jpg',
  green: '/assets/team-banner-green.jpg',
  yellow: '/assets/team-banner-yellow.jpg',
  gold: '/assets/team-banner-yellow.jpg',
};

const TEMPLATE_META: Record<
  ShareCardTemplate,
  { label: string; subtitle: string; icon: typeof Layers }
> = {
  classic: { label: 'Classic', subtitle: 'Classic Card', icon: Layers },
  collector: { label: 'Collector', subtitle: 'Collector Edition', icon: Award },
  competitive: { label: 'Competitive', subtitle: 'Competitive Profile', icon: Swords },
};

function getTemplateBackdrop(template: ShareCardTemplate, teamColor: TeamColor): string {
  if (template === 'collector') return '/assets/card-bg-collector.jpg';
  if (template === 'competitive') return '/assets/card-bg-competitive.jpg';
  return TEAM_CLASSIC_BG[teamColor] ?? '/assets/team-banner-green.jpg';
}

/** Subtle tiered skin-frame rim determined by Rank & Level (restrained, no heavy glow). */
function getSkinFrameMeta(rank: number, level: number, teamHex: string) {
  if (rank === 1 || level >= 20) {
    return {
      borderColor: 'rgba(245, 158, 11, 0.55)',
      cornerColor: '#f59e0b',
      insetGlow: 'rgba(245, 158, 11, 0.24)',
      accentHex: '#f59e0b',
      showCorners: true,
    };
  }
  if ((rank > 0 && rank <= 3) || level >= 12) {
    return {
      borderColor: 'rgba(52, 211, 153, 0.48)',
      cornerColor: '#34d399',
      insetGlow: 'rgba(52, 211, 153, 0.20)',
      accentHex: '#34d399',
      showCorners: true,
    };
  }
  if (level >= 6) {
    return {
      borderColor: `${teamHex}70`,
      cornerColor: teamHex,
      insetGlow: `${teamHex}24`,
      accentHex: teamHex,
      showCorners: false,
    };
  }
  return {
    borderColor: 'rgba(255, 255, 255, 0.14)',
    cornerColor: '#94a3b8',
    insetGlow: 'rgba(255, 255, 255, 0.08)',
    accentHex: '#94a3b8',
    showCorners: false,
  };
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export function PlayerCardModal({
  open,
  onClose,
  player,
  rank,
  level,
  tierName,
  teamName,
  teamColor = 'red',
}: PlayerCardModalProps) {
  const [template, setTemplate] = useState<ShareCardTemplate>('classic');
  const [format, setFormat] = useState<'card' | 'story'>('card');
  const [pose, setPose] = useState<Skin3DPose>('idle');
  const [autoRotate, setAutoRotate] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [draggingSkin, setDraggingSkin] = useState(false);

  const skinCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 30, opacity: 0 });

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [5.5, -5.5]), {
    stiffness: 200,
    damping: 22,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-5.5, 5.5]), {
    stiffness: 200,
    damping: 22,
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (draggingSkin) return;
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width;
    const ny = (e.clientY - rect.top) / rect.height;
    mouseX.set(nx - 0.5);
    mouseY.set(ny - 0.5);
    setGlarePos({ x: nx * 100, y: ny * 100, opacity: 1 });
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setGlarePos((prev) => ({ ...prev, opacity: 0 }));
  };

  const careerLabel = CAREER_META[player.careerId]?.label ?? 'Unassigned';
  const teamHex = TEAM_COLOR_META[teamColor]?.hex ?? '#34d399';
  const weaponName = player.inGameStats?.favoriteWeapon
    ? (WEAPON_LABELS[player.inGameStats.favoriteWeapon] ??
        player.inGameStats.favoriteWeapon.replace('minecraft:', ''))
    : null;
  const backdropUrl = getTemplateBackdrop(template, teamColor);
  const skinFrame = getSkinFrameMeta(rank, level, teamHex);
  const totalEngagements = Math.max(1, player.kills + player.deaths);
  const killWinRatePct = Math.round((player.kills / totalEngagements) * 100);
  const rankFormatted = `#${String(rank).padStart(2, '0')}`;

  /**
   * High-DPI Canvas PNG exporter: composites the active template's backdrop, tiered skin frame,
   * live rotated 3D WebGL skin snapshot, and template-specific layout with zero editor hints.
   */
  const handleDownloadPng = async () => {
    setExporting(true);
    try {
      const isStory = format === 'story';
      const W = isStory ? 1080 : 1440;
      const H = isStory ? 1920 : 810;

      const out = document.createElement('canvas');
      out.width = W;
      out.height = H;
      const ctx = out.getContext('2d');
      if (!ctx) return;

      // 1. Base dark charcoal canvas
      ctx.fillStyle = '#14171C';
      ctx.fillRect(0, 0, W, H);

      // 2. Template-specific backdrop image (same-origin)
      try {
        const bgImg = new Image();
        bgImg.src = backdropUrl;
        await new Promise<void>((resolve, reject) => {
          bgImg.onload = () => resolve();
          bgImg.onerror = () => reject(new Error('bg'));
        });
        ctx.save();
        ctx.globalAlpha = template === 'classic' ? 0.52 : 0.58;
        const scale = Math.max(W / bgImg.width, H / bgImg.height);
        const bw = bgImg.width * scale;
        const bh = bgImg.height * scale;
        ctx.drawImage(bgImg, (W - bw) / 2, (H - bh) / 2, bw, bh);
        ctx.restore();
      } catch {
        // fallback cleanly to solid charcoal
      }

      // 3. Directional dark vignette + subtle team aura
      const vig = ctx.createLinearGradient(0, 0, W, H);
      vig.addColorStop(0, 'rgba(14, 17, 22, 0.80)');
      vig.addColorStop(0.55, 'rgba(20, 23, 28, 0.60)');
      vig.addColorStop(1, 'rgba(14, 17, 22, 0.90)');
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, W, H);

      const aura = ctx.createRadialGradient(
        isStory ? W * 0.5 : W * 0.23,
        isStory ? H * 0.30 : H * 0.52,
        30,
        isStory ? W * 0.5 : W * 0.23,
        isStory ? H * 0.30 : H * 0.52,
        isStory ? 500 : 440,
      );
      aura.addColorStop(0, `${teamHex}38`);
      aura.addColorStop(0.6, 'rgba(52, 211, 153, 0.08)');
      aura.addColorStop(1, 'rgba(20, 23, 28, 0)');
      ctx.fillStyle = aura;
      ctx.fillRect(0, 0, W, H);

      // 4. Outer crisp border
      ctx.strokeStyle = `${teamHex}6e`;
      ctx.lineWidth = 3;
      drawRoundedRect(ctx, 28, 28, W - 56, H - 56, 36);
      ctx.stroke();

      // 5. Subdued Rank Watermark (~25-30% smaller & lower opacity)
      ctx.save();
      ctx.font = `800 ${isStory ? 156 : 148}px "IBM Plex Sans", system-ui, sans-serif`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.055)';
      ctx.textAlign = 'right';
      ctx.fillText(rankFormatted, W - 76, isStory ? 210 : 196);
      ctx.restore();

      // 6. Top Brand Strip
      ctx.fillStyle = '#34D399';
      ctx.font = '700 26px "IBM Plex Sans", system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`NBS SMP  ·  ${TEMPLATE_META[template].subtitle.toUpperCase()}`, 78, 98);

      // 7. Tiered Skin Frame + Live 3D WebGL Snapshot
      const glCanvas = skinCanvasRef.current;
      const frameW = isStory ? (template === 'collector' ? 540 : 480) : template === 'collector' ? 430 : 385;
      const frameH = isStory ? (template === 'collector' ? 680 : 610) : template === 'collector' ? 570 : 520;
      const frameX = isStory ? (W - frameW) / 2 : 80;
      const frameY = isStory ? 170 : (H - frameH) / 2 + 22;

      ctx.save();
      ctx.fillStyle = 'rgba(14, 17, 22, 0.56)';
      ctx.strokeStyle = skinFrame.borderColor;
      ctx.lineWidth = 3;
      drawRoundedRect(ctx, frameX, frameY, frameW, frameH, 32);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      if (glCanvas) {
        const pad = 24;
        const maxH = frameH - pad * 2;
        const maxW = frameW - pad * 2;
        const aspect = glCanvas.width / Math.max(1, glCanvas.height);
        let drawH = maxH;
        let drawW = drawH * aspect;
        if (drawW > maxW) {
          drawW = maxW;
          drawH = drawW / aspect;
        }
        ctx.drawImage(
          glCanvas,
          frameX + (frameW - drawW) / 2,
          frameY + (frameH - drawH) / 2,
          drawW,
          drawH,
        );
      }

      // 8. Identity & Template-Specific Right / Bottom Column
      const textX = isStory ? W / 2 : frameX + frameW + 58;
      const contentW = isStory ? W - 160 : W - textX - 80;
      ctx.textAlign = isStory ? 'center' : 'left';

      // Username
      ctx.fillStyle = '#F1F5F9';
      ctx.font = `700 ${isStory ? 92 : 84}px "IBM Plex Sans", system-ui, sans-serif`;
      const nameY = isStory ? frameY + frameH + 115 : 235;
      ctx.fillText(player.name, textX, nameY);

      // Team Color Dot + Identity Line
      const subY = nameY + 56;
      ctx.fillStyle = teamHex;
      ctx.font = `600 ${isStory ? 34 : 30}px "IBM Plex Sans", system-ui, sans-serif`;
      ctx.fillText(
        `${teamName}  ·  Lv.${level}  ·  ${careerLabel} (${tierName})`,
        textX,
        subY,
      );

      // Helper for 2x2 stat cards
      const drawStatGrid = (
        items: { label: string; value: string; accent: string }[],
        startY: number,
        boxH: number,
      ) => {
        const gap = isStory ? 30 : 22;
        const boxW = (contentW - gap) / 2;
        const baseStartX = isStory ? 80 : textX;
        items.forEach((st, idx) => {
          const col = idx % 2;
          const row = Math.floor(idx / 2);
          const bx = baseStartX + col * (boxW + gap);
          const by = startY + row * (boxH + gap);
          ctx.fillStyle = 'rgba(18, 21, 27, 0.86)';
          ctx.strokeStyle = '#2C323E';
          ctx.lineWidth = 2;
          drawRoundedRect(ctx, bx, by, boxW, boxH, 20);
          ctx.fill();
          ctx.stroke();

          ctx.textAlign = 'left';
          ctx.fillStyle = '#94A3B8';
          ctx.font = `600 ${isStory ? 22 : 19}px "IBM Plex Sans", system-ui, sans-serif`;
          ctx.fillText(st.label, bx + 28, by + (isStory ? 56 : 46));

          ctx.fillStyle = st.accent;
          ctx.font = `700 ${isStory ? 56 : 46}px "IBM Plex Sans", system-ui, sans-serif`;
          ctx.fillText(st.value, bx + 28, by + (isStory ? 130 : 108));
        });
      };

      if (template === 'collector') {
        const plaqueY = subY + 48;
        const items = [
          { label: 'GLOBAL RANK', value: rankFormatted, accent: skinFrame.accentHex },
          { label: 'CAREER LEVEL', value: `Lv.${level}`, accent: '#34D399' },
          { label: 'CAREER ROLE', value: careerLabel, accent: '#F1F5F9' },
          { label: 'PLAYTIME', value: formatPlaytime(player.playtimeSeconds), accent: '#F1F5F9' },
        ];
        drawStatGrid(items, plaqueY, isStory ? 172 : 138);

        if (weaponName) {
          const wy = plaqueY + (isStory ? 396 : 312);
          const wx = isStory ? 80 : textX;
          ctx.fillStyle = 'rgba(18, 21, 27, 0.88)';
          ctx.strokeStyle = `${teamHex}55`;
          ctx.lineWidth = 2;
          drawRoundedRect(ctx, wx, wy, contentW, isStory ? 116 : 92, 20);
          ctx.fill();
          ctx.stroke();

          ctx.textAlign = 'left';
          ctx.fillStyle = '#94A3B8';
          ctx.font = '600 18px "IBM Plex Sans", system-ui, sans-serif';
          ctx.fillText('SIGNATURE WEAPON', wx + 28, wy + 36);
          ctx.fillStyle = '#F1F5F9';
          ctx.font = '700 32px "IBM Plex Sans", system-ui, sans-serif';
          ctx.fillText(weaponName, wx + 28, wy + 74);
        }
      } else if (template === 'competitive') {
        const heroY = subY + 42;
        const heroX = isStory ? 80 : textX;
        const heroH = isStory ? 210 : 162;

        // K/D Hero Banner + Kill-share Ratio Bar
        ctx.fillStyle = 'rgba(18, 21, 27, 0.90)';
        ctx.strokeStyle = 'rgba(52, 211, 153, 0.45)';
        ctx.lineWidth = 2;
        drawRoundedRect(ctx, heroX, heroY, contentW, heroH, 22);
        ctx.fill();
        ctx.stroke();

        ctx.textAlign = 'left';
        ctx.fillStyle = '#94A3B8';
        ctx.font = '600 20px "IBM Plex Sans", system-ui, sans-serif';
        ctx.fillText('K/D RATIO  ·  COMBAT EFFICIENCY', heroX + 30, heroY + 46);

        ctx.fillStyle = '#34D399';
        ctx.font = `700 ${isStory ? 84 : 68}px "IBM Plex Sans", system-ui, sans-serif`;
        ctx.fillText(player.kd.toFixed(2), heroX + 30, heroY + (isStory ? 132 : 114));

        ctx.textAlign = 'right';
        ctx.fillStyle = '#F1F5F9';
        ctx.font = '700 28px "IBM Plex Sans", system-ui, sans-serif';
        ctx.fillText(`${killWinRatePct}% Kill Share`, heroX + contentW - 30, heroY + 110);

        // Ratio bar
        const barX = heroX + 30;
        const barY = heroY + heroH - 28;
        const barW = contentW - 60;
        ctx.fillStyle = '#2C323E';
        drawRoundedRect(ctx, barX, barY, barW, 10, 5);
        ctx.fill();
        ctx.fillStyle = '#34D399';
        drawRoundedRect(ctx, barX, barY, Math.max(12, (barW * killWinRatePct) / 100), 10, 5);
        ctx.fill();

        drawStatGrid(
          [
            { label: 'TOTAL KILLS', value: `${player.kills}`, accent: '#34D399' },
            { label: 'DEATHS', value: `${player.deaths}`, accent: '#F1F5F9' },
            { label: 'BEST STREAK', value: `${player.bestStreak}`, accent: '#F59E0B' },
            { label: 'BOSS SCORE', value: `${player.bossScore} pts`, accent: '#F1F5F9' },
          ],
          heroY + heroH + 24,
          isStory ? 168 : 132,
        );
      } else {
        // Classic Template
        const gridStartY = weaponName ? subY + 104 : subY + 48;
        if (weaponName) {
          ctx.fillStyle = '#94A3B8';
          ctx.font = `500 ${isStory ? 28 : 24}px "IBM Plex Sans", system-ui, sans-serif`;
          ctx.fillText(`Favorite Weapon: ${weaponName}`, textX, subY + 52);
        }
        drawStatGrid(
          [
            { label: 'K/D RATIO', value: player.kd.toFixed(2), accent: '#34D399' },
            { label: 'KILLS / DEATHS', value: `${player.kills} / ${player.deaths}`, accent: '#F1F5F9' },
            { label: 'BEST STREAK', value: `${player.bestStreak}`, accent: '#F59E0B' },
            { label: 'PLAYTIME', value: formatPlaytime(player.playtimeSeconds), accent: '#F1F5F9' },
          ],
          gridStartY,
          isStory ? 182 : 142,
        );
      }

      // Footer UUID
      ctx.textAlign = isStory ? 'center' : 'left';
      ctx.fillStyle = '#64748B';
      ctx.font = '500 20px monospace';
      ctx.fillText(`UUID: ${player.uuid}`, isStory ? W / 2 : 78, H - 64);

      const link = document.createElement('a');
      link.download = `nbs-smp-${player.name.toLowerCase()}-${template}-${format}.png`;
      link.href = out.toDataURL('image/png');
      link.click();
    } finally {
      setExporting(false);
    }
  };

  const skinWidth =
    template === 'collector'
      ? format === 'story'
        ? 235
        : 245
      : format === 'story'
        ? 220
        : 225;
  const skinHeight =
    template === 'collector'
      ? format === 'story'
        ? 275
        : 305
      : format === 'story'
        ? 255
        : 285;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          onClick={onClose}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label="การ์ด 3D แชร์โปรไฟล์ผู้เล่น"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-3xl flex flex-col items-center gap-3.5 my-auto"
          >
            {/* Top Studio Toolbar: Template + Ratio + 3D Pose + Download PNG */}
            <div className="w-full flex flex-wrap items-center justify-between gap-2 px-1">
              <div className="flex flex-wrap items-center gap-2">
                {/* 3 Template Selector */}
                <div
                  role="group"
                  aria-label="เลือก Template การ์ด"
                  className="inline-flex rounded-lg border border-border-strong bg-surface p-1"
                >
                  {(['classic', 'collector', 'competitive'] as const).map((tpl) => {
                    const meta = TEMPLATE_META[tpl];
                    const Icon = meta.icon;
                    const active = template === tpl;
                    return (
                      <button
                        key={tpl}
                        type="button"
                        onClick={() => setTemplate(tpl)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                          active
                            ? 'bg-emerald text-emerald-ink font-semibold'
                            : 'text-ink-secondary hover:text-ink'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>{meta.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Format Ratio Toggle */}
                <div className="inline-flex rounded-lg border border-border-strong bg-surface p-1">
                  <button
                    type="button"
                    onClick={() => setFormat('card')}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer transition-colors tabular-nums ${
                      format === 'card'
                        ? 'bg-elevated text-emerald border border-emerald/35 font-semibold'
                        : 'text-ink-secondary hover:text-ink'
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>16:9</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormat('story')}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer transition-colors tabular-nums ${
                      format === 'story'
                        ? 'bg-elevated text-emerald border border-emerald/35 font-semibold'
                        : 'text-ink-secondary hover:text-ink'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>9:16</span>
                  </button>
                </div>

                {/* 3D Animation Pose Switcher */}
                <div className="inline-flex rounded-lg border border-border-strong bg-surface p-1">
                  {(
                    [
                      { id: 'idle', label: 'Idle', icon: User },
                      { id: 'walk', label: 'Walk', icon: Footprints },
                      { id: 'wave', label: 'Wave', icon: Hand },
                    ] as const
                  ).map((p) => {
                    const Icon = p.icon;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setPose(p.id)}
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                          pose === p.id
                            ? 'bg-elevated text-emerald border border-emerald/35'
                            : 'text-ink-secondary hover:text-ink'
                        }`}
                      >
                        <Icon className="w-3 h-3" aria-hidden="true" />
                        <span className="hidden sm:inline">{p.label}</span>
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => setAutoRotate((v) => !v)}
                    title="หมุนตัวละครอัตโนมัติ"
                    aria-label="หมุนตัวละครอัตโนมัติ"
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                      autoRotate ? 'text-amber' : 'text-ink-muted hover:text-ink'
                    }`}
                  >
                    <RotateCw className="w-3 h-3" aria-hidden="true" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  disabled={exporting}
                  onClick={handleDownloadPng}
                  className="min-h-8 bg-emerald hover:bg-emerald-hover text-emerald-ink font-semibold cursor-pointer text-xs"
                >
                  <Download className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
                  <span>{exporting ? 'กำลังสร้าง PNG...' : 'Download PNG'}</span>
                </Button>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="ปิดการ์ดแชร์"
                  className="p-1.5 rounded-lg border border-hairline bg-surface text-ink-muted hover:text-ink hover:bg-elevated cursor-pointer"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Clean Export-Ready 3D Share Card (NO editor hints inside) */}
            <div style={{ perspective: 1300 }} className="w-full flex justify-center">
              <motion.div
                ref={cardRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{
                  rotateX: draggingSkin ? 0 : rotateX,
                  rotateY: draggingSkin ? 0 : rotateY,
                  transformStyle: 'preserve-3d',
                  boxShadow: `0 25px 70px -15px rgba(0,0,0,0.8), 0 0 36px -14px ${teamHex}33`,
                }}
                className={`relative rounded-2xl border border-border-strong bg-surface overflow-hidden select-none ${
                  format === 'story'
                    ? 'w-full max-w-[375px] p-6'
                    : 'w-full max-w-[760px] p-6 sm:p-8'
                }`}
              >
                <BorderBeam color={`${teamHex}b3`} durationSec={8} />

                {/* Template-Aware Scenic Backdrop */}
                <div
                  className={`absolute inset-0 bg-cover bg-center pointer-events-none transition-all duration-300 ${
                    template === 'classic' ? 'opacity-50' : 'opacity-55'
                  }`}
                  style={{ backgroundImage: `url('${backdropUrl}')` }}
                  aria-hidden="true"
                />
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: `radial-gradient(circle at ${format === 'story' ? '50% 24%' : '22% 50%'}, ${teamHex}2c 0%, rgba(18,21,27,0.66) 48%, rgba(14,17,22,0.90) 100%)`,
                  }}
                  aria-hidden="true"
                />

                {/* Subtle Specular Glare Overlay */}
                <div
                  className="pointer-events-none absolute inset-0 transition-opacity duration-300 motion-reduce:hidden"
                  style={{
                    opacity: glarePos.opacity * 0.55,
                    background: `radial-gradient(460px circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,0.13), ${teamHex}1c 35%, transparent 70%)`,
                    mixBlendMode: 'screen',
                  }}
                  aria-hidden="true"
                />

                {/* Subdued Editorial Rank Watermark (reduced ~25-30% in size & opacity) */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute right-6 top-5 text-5xl sm:text-6xl font-black tracking-tighter text-white/[0.055] tabular-nums leading-none"
                >
                  {rankFormatted}
                </div>

                {/* Card Content */}
                <div className="relative space-y-5">
                  {/* Top Brand Strip */}
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <div className="inline-flex items-center gap-2 font-bold tracking-wider uppercase text-ink">
                      <img src="/favicon.svg" alt="" width={20} height={20} className="w-5 h-5" />
                      <span>NBS SMP</span>
                      <span className="text-ink-muted font-normal">
                        · {TEMPLATE_META[template].subtitle}
                      </span>
                    </div>
                  </div>

                  {/* Main Body: Large 3D Skin with Tiered Frame + Template Layout */}
                  <div
                    className={`flex ${
                      format === 'story'
                        ? 'flex-col items-center text-center gap-5'
                        : 'flex-col sm:flex-row items-center gap-6'
                    }`}
                  >
                    {/* Large Interactive 3D Character Stage with Refined Rank/Level Frame */}
                    <div
                      onPointerDown={() => setDraggingSkin(true)}
                      onPointerUp={() => setDraggingSkin(false)}
                      onPointerCancel={() => setDraggingSkin(false)}
                      className="relative flex flex-col items-center shrink-0"
                    >
                      <div
                        className="relative rounded-2xl bg-canvas/55 backdrop-blur-xs p-2.5 flex items-center justify-center border"
                        style={{
                          borderColor: skinFrame.borderColor,
                          boxShadow: `inset 0 0 28px -12px ${skinFrame.insetGlow}`,
                        }}
                      >
                        {skinFrame.showCorners && (
                          <svg
                            aria-hidden="true"
                            viewBox="0 0 100 100"
                            preserveAspectRatio="none"
                            className="pointer-events-none absolute inset-1.5 w-[calc(100%-12px)] h-[calc(100%-12px)]"
                          >
                            <path
                              d="M0 9V0H9 M91 0H100V9 M0 91V100H9 M91 100H100V91"
                              fill="none"
                              stroke={skinFrame.cornerColor}
                              strokeWidth="1.5"
                              vectorEffect="non-scaling-stroke"
                            />
                          </svg>
                        )}

                        <Skin3DViewer
                          name={player.name}
                          uuid={player.uuid}
                          width={skinWidth}
                          height={skinHeight}
                          pose={pose}
                          autoRotate={autoRotate}
                          zoom={0.94}
                          onCanvasReady={(c) => {
                            skinCanvasRef.current = c;
                          }}
                        />
                      </div>
                    </div>

                    {/* Right / Bottom Column: Dominant Player Identity + Template Body */}
                    <div className="flex-1 w-full space-y-4 min-w-0">
                      {/* Prominent Player Identity Block */}
                      <div className="space-y-2">
                        <div
                          className={`flex flex-wrap items-center gap-2.5 ${
                            format === 'story' ? 'justify-center' : 'justify-center sm:justify-start'
                          }`}
                        >
                          <h2 className="text-3xl sm:text-4xl font-bold tracking-[-0.03em] text-ink truncate">
                            {player.name}
                          </h2>
                          <Badge
                            variant="secondary"
                            className="rounded-md border bg-canvas/90 px-2.5 py-0.5 text-xs font-bold tabular-nums"
                            style={{
                              borderColor: skinFrame.borderColor,
                              color: skinFrame.accentHex,
                            }}
                          >
                            Lv.{level}
                          </Badge>
                        </div>

                        <div
                          className={`flex flex-wrap items-center gap-2 text-sm ${
                            format === 'story' ? 'justify-center' : 'justify-center sm:justify-start'
                          }`}
                        >
                          <span
                            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md border bg-canvas/85 text-xs font-semibold text-ink"
                            style={{ borderColor: `${teamHex}55` }}
                          >
                            <span
                              className="w-2 h-2 rounded-xs shrink-0"
                              style={{ backgroundColor: teamHex }}
                              aria-hidden="true"
                            />
                            <span>{teamName}</span>
                          </span>
                          <span className="text-ink font-medium">{careerLabel}</span>
                          <span className="text-ink-muted">·</span>
                          <span className="text-xs text-ink-secondary">{tierName}</span>
                        </div>
                      </div>

                      {/* TEMPLATE 1: CLASSIC — Balanced Identity + Favorite Weapon + 4 Core Stats */}
                      {template === 'classic' && (
                        <>
                          {weaponName && (
                            <div className="rounded-xl border border-hairline bg-canvas/75 px-3.5 py-2.5 flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3 min-w-0">
                                <MinecraftItemIcon
                                  item={player.inGameStats?.favoriteWeapon ?? undefined}
                                  size={28}
                                />
                                <div className="text-left min-w-0">
                                  <div className="text-[10px] uppercase tracking-wider text-ink-muted">
                                    Favorite Weapon
                                  </div>
                                  <div className="text-sm font-bold text-ink truncate">
                                    {weaponName}
                                  </div>
                                </div>
                              </div>
                              <span className="text-xs font-semibold text-emerald tabular-nums shrink-0">
                                {(player.inGameStats?.favoriteWeaponUses ?? 0).toLocaleString()} uses
                              </span>
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-2.5 tabular-nums text-left">
                            <div className="rounded-xl border border-hairline bg-canvas/80 px-3.5 py-3">
                              <div className="text-[11px] text-ink-muted">K/D Ratio</div>
                              <div className="text-2xl font-bold text-emerald mt-0.5">
                                {player.kd.toFixed(2)}
                              </div>
                            </div>
                            <div className="rounded-xl border border-hairline bg-canvas/80 px-3.5 py-3">
                              <div className="text-[11px] text-ink-muted">Kills / Deaths</div>
                              <div className="text-2xl font-bold text-ink mt-0.5">
                                {player.kills}{' '}
                                <span className="text-sm text-ink-muted">/ {player.deaths}</span>
                              </div>
                            </div>
                            <div className="rounded-xl border border-hairline bg-canvas/80 px-3.5 py-3">
                              <div className="text-[11px] text-ink-muted flex items-center gap-1">
                                <Flame className="w-3 h-3 text-amber" aria-hidden="true" />
                                <span>Best Streak</span>
                              </div>
                              <div className="text-2xl font-bold text-ink mt-0.5">
                                {player.bestStreak}
                              </div>
                            </div>
                            <div className="rounded-xl border border-hairline bg-canvas/80 px-3.5 py-3">
                              <div className="text-[11px] text-ink-muted">Playtime</div>
                              <div className="text-2xl font-bold text-ink mt-0.5">
                                {formatPlaytime(player.playtimeSeconds)}
                              </div>
                            </div>
                          </div>
                        </>
                      )}

                      {/* TEMPLATE 2: COLLECTOR — Emphasizes Skin, Rank, Level, Career & Signature Gear */}
                      {template === 'collector' && (
                        <div className="space-y-3 text-left">
                          <div className="grid grid-cols-2 gap-2.5 tabular-nums">
                            <div
                              className="rounded-xl border bg-canvas/80 px-3.5 py-3"
                              style={{ borderColor: skinFrame.borderColor }}
                            >
                              <div className="text-[10px] uppercase tracking-wider text-ink-muted">
                                Season Rank
                              </div>
                              <div
                                className="text-2xl font-bold mt-0.5"
                                style={{ color: skinFrame.accentHex }}
                              >
                                {rankFormatted}
                              </div>
                            </div>
                            <div className="rounded-xl border border-hairline bg-canvas/80 px-3.5 py-3">
                              <div className="text-[10px] uppercase tracking-wider text-ink-muted">
                                Career Standing
                              </div>
                              <div className="text-lg font-bold text-ink mt-1 truncate">
                                {careerLabel}
                              </div>
                              <div className="text-[11px] text-ink-secondary truncate">
                                {tierName}
                              </div>
                            </div>
                          </div>

                          {weaponName && (
                            <div
                              className="rounded-xl border bg-canvas/80 px-4 py-3 flex items-center justify-between gap-3"
                              style={{ borderColor: `${teamHex}45` }}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <MinecraftItemIcon
                                  item={player.inGameStats?.favoriteWeapon ?? undefined}
                                  size={36}
                                />
                                <div className="min-w-0">
                                  <div className="text-[10px] uppercase tracking-wider text-ink-muted">
                                    Signature Weapon
                                  </div>
                                  <div className="text-base font-bold text-ink truncate">
                                    {weaponName}
                                  </div>
                                </div>
                              </div>
                              <span className="text-xs font-semibold text-emerald tabular-nums shrink-0">
                                {(player.inGameStats?.favoriteWeaponUses ?? 0).toLocaleString()} uses
                              </span>
                            </div>
                          )}

                          <div className="grid grid-cols-3 gap-2 tabular-nums">
                            <div className="rounded-lg border border-hairline bg-canvas/75 px-3 py-2">
                              <div className="text-[10px] text-ink-muted">Quests</div>
                              <div className="text-sm font-bold text-ink mt-0.5">
                                {player.questsCompleted} ใบ
                              </div>
                            </div>
                            <div className="rounded-lg border border-hairline bg-canvas/75 px-3 py-2">
                              <div className="text-[10px] text-ink-muted">Boss Pts</div>
                              <div className="text-sm font-bold text-amber mt-0.5">
                                {player.bossScore}
                              </div>
                            </div>
                            <div className="rounded-lg border border-hairline bg-canvas/75 px-3 py-2">
                              <div className="text-[10px] text-ink-muted">Playtime</div>
                              <div className="text-sm font-bold text-ink mt-0.5">
                                {formatPlaytime(player.playtimeSeconds)}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* TEMPLATE 3: COMPETITIVE — Bold K/D Efficiency + Kills, Deaths & Combat Telemetry */}
                      {template === 'competitive' && (
                        <div className="space-y-2.5 text-left tabular-nums">
                          <div className="rounded-xl border border-emerald/40 bg-canvas/85 px-4 py-3 space-y-2">
                            <div className="flex items-end justify-between gap-3">
                              <div>
                                <div className="text-[10px] uppercase tracking-wider text-ink-muted">
                                  K/D Ratio · Combat Rating
                                </div>
                                <div className="text-3xl sm:text-4xl font-bold text-emerald leading-tight">
                                  {player.kd.toFixed(2)}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-xs font-semibold text-ink">
                                  {killWinRatePct}% Kill Share
                                </div>
                                <div className="text-[11px] text-ink-muted">
                                  {player.kills}W · {player.deaths}L
                                </div>
                              </div>
                            </div>
                            <div className="h-1.5 w-full rounded-full bg-elevated overflow-hidden">
                              <div
                                className="h-full bg-emerald rounded-full"
                                style={{ width: `${Math.max(6, killWinRatePct)}%` }}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2.5">
                            <div className="rounded-xl border border-hairline bg-canvas/80 px-3.5 py-2.5">
                              <div className="text-[11px] text-ink-muted">Total Kills</div>
                              <div className="text-2xl font-bold text-emerald mt-0.5">
                                {player.kills}
                              </div>
                            </div>
                            <div className="rounded-xl border border-hairline bg-canvas/80 px-3.5 py-2.5">
                              <div className="text-[11px] text-ink-muted">Deaths</div>
                              <div className="text-2xl font-bold text-ink mt-0.5">
                                {player.deaths}
                              </div>
                            </div>
                            <div className="rounded-xl border border-hairline bg-canvas/80 px-3.5 py-2.5">
                              <div className="text-[11px] text-ink-muted flex items-center gap-1">
                                <Flame className="w-3 h-3 text-amber" aria-hidden="true" />
                                <span>Best Streak</span>
                              </div>
                              <div className="text-2xl font-bold text-amber mt-0.5">
                                {player.bestStreak}
                              </div>
                            </div>
                            <div className="rounded-xl border border-hairline bg-canvas/80 px-3.5 py-2.5">
                              <div className="text-[11px] text-ink-muted flex items-center gap-1">
                                <Shield className="w-3 h-3 text-ink-secondary" aria-hidden="true" />
                                <span>Boss Score</span>
                              </div>
                              <div className="text-2xl font-bold text-ink mt-0.5">
                                {player.bossScore}{' '}
                                <span className="text-xs font-normal text-ink-muted">pts</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Editor-only Interactive Tip (outside the card so exports & screenshots stay clean) */}
            <p className="inline-flex items-center gap-1.5 text-xs text-ink-muted">
              <Sparkles className="w-3.5 h-3.5 text-emerald shrink-0" aria-hidden="true" />
              <span>ลากบนตัวละครเพื่อหมุน 360° (ข้อความนี้แสดงเฉพาะหน้า Editor ไม่ติดไปในภาพ PNG)</span>
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
