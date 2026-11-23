import { useEffect, useState } from 'react';
import { Flame, Gem, Package, Sparkles } from 'lucide-react';

export interface QuestThemeMeta {
  bannerUrl: string;
  accentLabel: string;
  category: 'nether' | 'stronghold' | 'citadel';
}

const NETHER_ITEMS = new Set([
  'blaze_rod',
  'ghast_tear',
  'magma_cream',
  'nether_wart',
  'quartz',
  'tnt',
]);

const STRONGHOLD_ITEMS = new Set([
  'ender_pearl',
  'sculk_catalyst',
  'prismarine_shard',
  'phantom_membrane',
  'slime_ball',
  'amethyst_shard',
]);

export function normalizeMcSlug(item?: string): string {
  if (!item) return 'blaze_rod';
  return item.replace(/^minecraft:/, '').trim().toLowerCase() || 'blaze_rod';
}

export function getQuestThemeMeta(item?: string): QuestThemeMeta {
  const slug = normalizeMcSlug(item);
  if (NETHER_ITEMS.has(slug)) {
    return {
      bannerUrl: '/assets/event-blaze.png',
      accentLabel: 'Nether Quest',
      category: 'nether',
    };
  }
  if (STRONGHOLD_ITEMS.has(slug)) {
    return {
      bannerUrl: '/assets/team-banner.png',
      accentLabel: 'Expedition Quest',
      category: 'stronghold',
    };
  }
  return {
    bannerUrl: '/assets/hero-citadel.png',
    accentLabel: 'Citadel Quest',
    category: 'citadel',
  };
}

interface MinecraftItemIconProps {
  item?: string;
  size?: 28 | 36 | 44;
  className?: string;
}

/**
 * Renders the authentic Minecraft item/block texture from PrismarineJS assets
 * with automatic blocks fallback and clean Lucide fallback if offline.
 */
export function MinecraftItemIcon({
  item,
  size = 36,
  className = '',
}: MinecraftItemIconProps) {
  const slug = normalizeMcSlug(item);
  const [stage, setStage] = useState<'item' | 'block' | 'fallback'>('item');

  useEffect(() => {
    setStage('item');
  }, [slug]);
  const boxClass =
    size === 44 ? 'w-12 h-12 p-1.5' : size === 36 ? 'w-10 h-10 p-1.5' : 'w-8 h-8 p-1';

  const theme = getQuestThemeMeta(item);

  if (stage === 'fallback' || !item) {
    const FallbackIcon =
      theme.category === 'nether'
        ? Flame
        : theme.category === 'stronghold'
          ? Sparkles
          : slug.includes('diamond') || slug.includes('emerald')
            ? Gem
            : Package;
    return (
      <span
        className={`${boxClass} rounded-lg border border-border-strong bg-canvas/85 inline-flex items-center justify-center shrink-0 ${className}`}
        aria-hidden="true"
      >
        <FallbackIcon className="w-5 h-5 text-amber" />
      </span>
    );
  }

  const src =
    stage === 'item'
      ? `https://raw.githubusercontent.com/PrismarineJS/minecraft-assets/master/data/1.20.2/items/${encodeURIComponent(slug)}.png`
      : `https://raw.githubusercontent.com/PrismarineJS/minecraft-assets/master/data/1.20.2/blocks/${encodeURIComponent(slug)}.png`;

  return (
    <span
      className={`${boxClass} rounded-lg border border-border-strong bg-canvas/85 inline-flex items-center justify-center shrink-0 ${className}`}
    >
      <img
        src={src}
        alt=""
        width={size}
        height={size}
        onError={() => setStage((s) => (s === 'item' ? 'block' : 'fallback'))}
        className="w-full h-full object-contain"
        style={{ imageRendering: 'pixelated' }}
      />
    </span>
  );
}
