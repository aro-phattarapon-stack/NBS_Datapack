import { useRef, useState, type ReactNode } from 'react';

interface SpotlightCardProps {
  children: ReactNode;
  className?: string;
  spotlightColor?: string;
}

/**
 * React Bits-inspired SpotlightCard: tracks cursor position to cast a subtle
 * radial sheen across the dark surface without adding visual clutter.
 */
export function SpotlightCard({
  children,
  className = '',
  spotlightColor = 'rgba(52, 211, 153, 0.10)',
}: SpotlightCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      className={`relative rounded-xl border border-hairline bg-surface overflow-hidden transition-colors duration-200 hover:border-border-strong ${className}`}
    >
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300 motion-reduce:hidden"
        style={{
          opacity,
          background: `radial-gradient(420px circle at ${pos.x}px ${pos.y}px, ${spotlightColor}, transparent 65%)`,
        }}
        aria-hidden="true"
      />
      {children}
    </div>
  );
}
