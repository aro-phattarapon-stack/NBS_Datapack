import { motion } from 'motion/react';

interface BorderBeamProps {
  color?: string;
  durationSec?: number;
}

/**
 * 21st.dev / ReUI-inspired subtle animated border beam for focal cards
 * (Active Event & #1 Champion Spotlight).
 */
export function BorderBeam({
  color = 'rgba(52, 211, 153, 0.55)',
  durationSec = 7,
}: BorderBeamProps) {
  return (
    <div
      className="pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden motion-reduce:hidden"
      aria-hidden="true"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Number.POSITIVE_INFINITY, duration: durationSec, ease: 'linear' }}
        className="absolute -inset-[100%] opacity-40"
        style={{
          background: `conic-gradient(from 0deg, transparent 0deg 315deg, ${color} 345deg, transparent 360deg)`,
        }}
      />
      <div className="absolute inset-[1px] rounded-[inherit] bg-surface" />
    </div>
  );
}

/**
 * Linear / 21st.dev-inspired subtle architectural dot matrix backdrop.
 */
export function DotPatternBackdrop() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 opacity-35"
      aria-hidden="true"
      style={{
        backgroundImage:
          'radial-gradient(rgba(148, 163, 184, 0.22) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
        maskImage:
          'radial-gradient(ellipse 80% 55% at 50% 0%, #000 35%, transparent 100%)',
        WebkitMaskImage:
          'radial-gradient(ellipse 80% 55% at 50% 0%, #000 35%, transparent 100%)',
      }}
    />
  );
}
