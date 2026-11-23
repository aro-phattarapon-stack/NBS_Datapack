import { useEffect, useRef, useState } from 'react';

interface CountUpProps {
  value: number;
  durationMs?: number;
  className?: string;
}

/**
 * React Bits-inspired CountUp micro-interaction for live scores and diamond counts.
 * Respects `prefers-reduced-motion` and enforces `tabular-nums` alignment.
 */
export function CountUp({ value, durationMs = 450, className }: CountUpProps) {
  const [display, setDisplay] = useState(value);
  const prevRef = useRef(value);

  useEffect(() => {
    const start = prevRef.current;
    if (start === value) return;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      prevRef.current = value;
      setDisplay(value);
      return;
    }

    let rafId = 0;
    const t0 = performance.now();

    const step = (now: number) => {
      const progress = Math.min(1, (now - t0) / durationMs);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + (value - start) * eased));
      if (progress < 1) {
        rafId = requestAnimationFrame(step);
      } else {
        prevRef.current = value;
      }
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [value, durationMs]);

  return <span className={className ? `tabular-nums ${className}` : 'tabular-nums'}>{display}</span>;
}
