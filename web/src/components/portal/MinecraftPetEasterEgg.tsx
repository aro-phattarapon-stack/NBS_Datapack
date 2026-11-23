import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';

type PetKind = 'cat' | 'wolf' | 'fox';
type PetState = 'walking' | 'idle' | 'sitting';

interface FloatingHeart {
  id: number;
  dx: number;
  delay: number;
}

const PET_META: Record<PetKind, { name: string; sound: string; speedPxPerSec: number }> = {
  cat: { name: 'Cat', sound: 'Meow~', speedPxPerSec: 38 },
  wolf: { name: 'Wolf', sound: 'Woof!', speedPxPerSec: 46 },
  fox: { name: 'Fox', sound: 'Yip!', speedPxPerSec: 54 },
};

/** Weighted random roll: Cat 50%, Wolf 35%, rare Fox 15% */
function rollRandomPet(): PetKind {
  const r = Math.random();
  if (r < 0.5) return 'cat';
  if (r < 0.85) return 'wolf';
  return 'fox';
}

/** Crisp Minecraft-style pixel heart SVG (9x8 grid) */
function PixelHeart({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={Math.round((size * 8) / 9)}
      viewBox="0 0 9 8"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      <path
        d="M1 1h2v1h1v1h1V2h1V1h2v1h1v2H8v1H7v1H6v1H5v1H4V7H3V6H2V5H1V4H0V2h1V1z"
        fill="#14171c"
      />
      <rect x="1" y="1" width="2" height="1" fill="#ef4444" />
      <rect x="6" y="1" width="2" height="1" fill="#ef4444" />
      <rect x="1" y="2" width="3" height="1" fill="#ef4444" />
      <rect x="5" y="2" width="3" height="1" fill="#ef4444" />
      <rect x="1" y="3" width="7" height="1" fill="#ef4444" />
      <rect x="2" y="4" width="5" height="1" fill="#dc2626" />
      <rect x="3" y="5" width="3" height="1" fill="#dc2626" />
      <rect x="4" y="6" width="1" height="1" fill="#b91c1c" />
      <rect x="2" y="2" width="1" height="1" fill="#fecaca" />
    </svg>
  );
}

/**
 * Crisp side-profile Minecraft pixel-art sprites facing RIGHT on a 24x18 pixel grid.
 * Supports 2-frame walk cycle and autonomous sitting posture.
 */
function MinecraftPetSprite({
  kind,
  stepFrame,
  sitting,
  wagTail,
}: {
  kind: PetKind;
  stepFrame: number;
  sitting: boolean;
  wagTail: boolean;
}) {
  if (kind === 'wolf') {
    return (
      <svg
        width={56}
        height={42}
        viewBox="0 0 24 18"
        shapeRendering="crispEdges"
        className="drop-shadow-[0_4px_8px_rgba(0,0,0,0.65)]"
        aria-hidden="true"
      >
        {/* Tail */}
        <rect x="1" y={sitting ? 10 : wagTail ? 7 : 8} width="4" height="2" fill="#d1d5db" />
        <rect x="1" y={sitting ? 10 : wagTail ? 7 : 8} width="1" height="2" fill="#9ca3af" />

        {/* Body */}
        {sitting ? (
          <>
            <rect x="5" y="11" width="6" height="5" fill="#e5e7eb" />
            <rect x="9" y="8" width="5" height="6" fill="#f3f4f6" />
            <rect x="6" y="12" width="4" height="3" fill="#d1d5db" />
          </>
        ) : (
          <>
            <rect x="5" y="8" width="9" height="5" fill="#e5e7eb" />
            <rect x="5" y="8" width="9" height="1" fill="#f3f4f6" />
            <rect x="6" y="9" width="4" height="3" fill="#d1d5db" />
            <rect x="11" y="7" width="4" height="6" fill="#f3f4f6" />
          </>
        )}

        {/* Red Tamed Collar */}
        <rect x="14" y="7" width="2" height="5" fill="#dc2626" />
        <rect x="14" y="8" width="2" height="1" fill="#ef4444" />

        {/* Head */}
        <rect x="15" y={sitting ? 3 : 4} width="6" height="6" fill="#e5e7eb" />
        <rect x="15" y={sitting ? 3 : 4} width="6" height="1" fill="#f3f4f6" />
        {/* Ears */}
        <rect x="15" y={sitting ? 1 : 2} width="2" height="2" fill="#9ca3af" />
        <rect x="18" y={sitting ? 1 : 2} width="2" height="2" fill="#d1d5db" />
        {/* Snout */}
        <rect x="20" y={sitting ? 6 : 7} width="3" height="3" fill="#d1d5db" />
        <rect x="22" y={sitting ? 6 : 7} width="1" height="1" fill="#1f2937" />
        {/* Eye */}
        <rect x="19" y={sitting ? 5 : 6} width="1" height="1" fill="#111827" />
        <rect x="18" y={sitting ? 5 : 6} width="1" height="1" fill="#ffffff" />

        {/* Legs */}
        {sitting ? (
          <>
            <rect x="5" y="15" width="4" height="2" fill="#9ca3af" />
            <rect x="12" y="13" width="2" height="4" fill="#d1d5db" />
            <rect x="14" y="13" width="2" height="4" fill="#e5e7eb" />
          </>
        ) : stepFrame === 0 ? (
          <>
            <rect x="6" y="13" width="2" height="4" fill="#9ca3af" />
            <rect x="8" y="13" width="2" height="3" fill="#d1d5db" />
            <rect x="12" y="13" width="2" height="4" fill="#d1d5db" />
            <rect x="14" y="13" width="2" height="3" fill="#9ca3af" />
          </>
        ) : (
          <>
            <rect x="5" y="13" width="2" height="3" fill="#9ca3af" />
            <rect x="7" y="13" width="2" height="4" fill="#d1d5db" />
            <rect x="11" y="13" width="2" height="3" fill="#9ca3af" />
            <rect x="13" y="13" width="2" height="4" fill="#e5e7eb" />
          </>
        )}
      </svg>
    );
  }

  if (kind === 'cat') {
    return (
      <svg
        width={54}
        height={40}
        viewBox="0 0 24 18"
        shapeRendering="crispEdges"
        className="drop-shadow-[0_4px_8px_rgba(0,0,0,0.65)]"
        aria-hidden="true"
      >
        {/* Upright Curved Tail */}
        <rect x="2" y={wagTail ? 5 : 6} width="2" height="5" fill="#f59e0b" />
        <rect x="2" y={wagTail ? 5 : 6} width="2" height="1" fill="#fef3c7" />
        <rect x="4" y={sitting ? 11 : 9} width="2" height="2" fill="#d97706" />

        {/* Body */}
        {sitting ? (
          <>
            <rect x="6" y="11" width="6" height="5" fill="#f59e0b" />
            <rect x="10" y="8" width="5" height="6" fill="#fbbf24" />
            <rect x="7" y="12" width="2" height="2" fill="#b45309" />
            <rect x="12" y="10" width="3" height="4" fill="#fef3c7" />
          </>
        ) : (
          <>
            <rect x="5" y="9" width="10" height="4" fill="#f59e0b" />
            <rect x="7" y="9" width="2" height="2" fill="#b45309" />
            <rect x="11" y="9" width="2" height="2" fill="#b45309" />
            <rect x="6" y="12" width="8" height="1" fill="#fef3c7" />
          </>
        )}

        {/* Head */}
        <rect x="15" y={sitting ? 4 : 6} width="5" height="5" fill="#fbbf24" />
        <rect x="16" y={sitting ? 4 : 6} width="2" height="1" fill="#b45309" />
        {/* Pointed Ears */}
        <rect x="15" y={sitting ? 2 : 4} width="1" height="2" fill="#d97706" />
        <rect x="18" y={sitting ? 2 : 4} width="1" height="2" fill="#f59e0b" />
        {/* Emerald Eye & Pink Nose */}
        <rect x="18" y={sitting ? 6 : 8} width="1" height="1" fill="#34d399" />
        <rect x="19" y={sitting ? 7 : 9} width="2" height="2" fill="#fef3c7" />
        <rect x="20" y={sitting ? 7 : 9} width="1" height="1" fill="#f472b6" />

        {/* Legs */}
        {sitting ? (
          <>
            <rect x="6" y="15" width="4" height="2" fill="#d97706" />
            <rect x="12" y="13" width="2" height="4" fill="#fef3c7" />
          </>
        ) : stepFrame === 0 ? (
          <>
            <rect x="6" y="13" width="2" height="4" fill="#d97706" />
            <rect x="6" y="16" width="2" height="1" fill="#fef3c7" />
            <rect x="13" y="13" width="2" height="4" fill="#f59e0b" />
            <rect x="13" y="16" width="2" height="1" fill="#fef3c7" />
          </>
        ) : (
          <>
            <rect x="5" y="13" width="2" height="3" fill="#d97706" />
            <rect x="8" y="13" width="2" height="4" fill="#f59e0b" />
            <rect x="8" y="16" width="2" height="1" fill="#fef3c7" />
            <rect x="12" y="13" width="2" height="3" fill="#d97706" />
            <rect x="14" y="13" width="2" height="4" fill="#f59e0b" />
            <rect x="14" y="16" width="2" height="1" fill="#fef3c7" />
          </>
        )}
      </svg>
    );
  }

  return (
    <svg
      width={56}
      height={40}
      viewBox="0 0 24 18"
      shapeRendering="crispEdges"
      className="drop-shadow-[0_4px_8px_rgba(0,0,0,0.65)]"
      aria-hidden="true"
    >
      {/* Fluffy Tail with white tip */}
      <rect x="0" y={sitting ? 13 : wagTail ? 10 : 11} width="3" height="3" fill="#f8fafc" />
      <rect x="3" y={sitting ? 13 : wagTail ? 10 : 11} width="3" height="3" fill="#ea580c" />

      {/* Body */}
      {sitting ? (
        <>
          <rect x="6" y="11" width="7" height="5" fill="#ea580c" />
          <rect x="10" y="9" width="5" height="6" fill="#f97316" />
          <rect x="13" y="11" width="2" height="4" fill="#f8fafc" />
        </>
      ) : (
        <>
          <rect x="6" y="10" width="9" height="4" fill="#ea580c" />
          <rect x="6" y="10" width="9" height="1" fill="#f97316" />
          <rect x="11" y="13" width="4" height="1" fill="#f8fafc" />
        </>
      )}

      {/* Head */}
      <rect x="15" y={sitting ? 5 : 7} width="5" height="5" fill="#f97316" />
      <rect x="15" y={sitting ? 9 : 11} width="5" height="1" fill="#f8fafc" />
      {/* Dark-tipped Ears */}
      <rect x="15" y={sitting ? 3 : 5} width="2" height="2" fill="#27272a" />
      <rect x="18" y={sitting ? 3 : 5} width="2" height="2" fill="#ea580c" />
      <rect x="18" y={sitting ? 3 : 5} width="2" height="1" fill="#27272a" />
      {/* Pointy Snout */}
      <rect x="20" y={sitting ? 8 : 10} width="3" height="2" fill="#f8fafc" />
      <rect x="22" y={sitting ? 8 : 10} width="1" height="1" fill="#18181b" />
      {/* Eye */}
      <rect x="18" y={sitting ? 7 : 9} width="1" height="1" fill="#18181b" />
      <rect x="19" y={sitting ? 7 : 9} width="1" height="1" fill="#ffffff" />

      {/* Dark Fox Paws */}
      {sitting ? (
        <>
          <rect x="6" y="15" width="4" height="2" fill="#27272a" />
          <rect x="12" y="14" width="2" height="3" fill="#27272a" />
        </>
      ) : stepFrame === 0 ? (
        <>
          <rect x="7" y="14" width="2" height="3" fill="#27272a" />
          <rect x="13" y="14" width="2" height="3" fill="#27272a" />
        </>
      ) : (
        <>
          <rect x="6" y="14" width="2" height="2" fill="#27272a" />
          <rect x="8" y="14" width="2" height="3" fill="#3f3f46" />
          <rect x="12" y="14" width="2" height="2" fill="#3f3f46" />
          <rect x="14" y="14" width="2" height="3" fill="#27272a" />
        </>
      )}
    </svg>
  );
}

/**
 * Ambient Minecraft Pet Easter Egg walking and resting autonomously along the bottom edge.
 * Species is chosen randomly by probability (Cat 50%, Wolf 35%, Fox 15%).
 * Only interaction is petting (click -> pixel hearts + happy hop).
 */
export function MinecraftPetEasterEgg() {
  const [petKind, setPetKind] = useState<PetKind>(() => rollRandomPet());
  const [petState, setPetState] = useState<PetState>('walking');
  const [facingRight, setFacingRight] = useState(true);
  const [posX, setPosX] = useState(120);
  const [stepFrame, setStepFrame] = useState(0);
  const [wagTail, setWagTail] = useState(false);
  const [hopKey, setHopKey] = useState(0);
  const [speech, setSpeech] = useState<string | null>(null);
  const [hearts, setHearts] = useState<FloatingHeart[]>([]);

  const stateRef = useRef<PetState>(petState);
  const dirRef = useRef<number>(1);
  const posRef = useRef<number>(120);
  const kindRef = useRef<PetKind>(petKind);
  const reducedMotionRef = useRef<boolean>(false);
  const speechTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heartCounterRef = useRef(0);

  stateRef.current = petState;
  kindRef.current = petKind;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    reducedMotionRef.current = reduced;
    if (reduced) {
      setPetState('sitting');
    }
  }, []);

  // Autonomous patrol, pause, sitting, and occasional random species visit
  useEffect(() => {
    let rafId = 0;
    let lastTs = performance.now();
    let stepAccum = 0;
    let decisionTimer = 4 + Math.random() * 4.5;

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - lastTs) / 1000);
      lastTs = now;

      if (reducedMotionRef.current) {
        rafId = requestAnimationFrame(tick);
        return;
      }

      const minX = 24;
      const maxX = Math.max(minX + 60, window.innerWidth - 96);

      if (stateRef.current === 'walking') {
        const speed = PET_META[kindRef.current].speedPxPerSec;
        let nextX = posRef.current + dirRef.current * speed * dt;

        if (nextX >= maxX) {
          nextX = maxX;
          dirRef.current = -1;
          setFacingRight(false);
          // 25% chance another random animal strolls back from the edge
          if (Math.random() < 0.25) {
            setPetKind(rollRandomPet());
          }
        } else if (nextX <= minX) {
          nextX = minX;
          dirRef.current = 1;
          setFacingRight(true);
          if (Math.random() < 0.25) {
            setPetKind(rollRandomPet());
          }
        }

        posRef.current = nextX;
        setPosX(Math.round(nextX));

        stepAccum += dt;
        if (stepAccum >= 0.22) {
          stepAccum = 0;
          setStepFrame((f) => (f === 0 ? 1 : 0));
          setWagTail((w) => !w);
        }

        decisionTimer -= dt;
        if (decisionTimer <= 0) {
          const roll = Math.random();
          if (roll < 0.35) {
            // Sit down and rest autonomously for 4-8 seconds
            decisionTimer = 4 + Math.random() * 4;
            setPetState('sitting');
          } else if (roll < 0.6) {
            // Brief idle pause for 2-4 seconds
            decisionTimer = 2 + Math.random() * 2;
            setPetState('idle');
          } else {
            // Keep walking (occasionally turn around)
            decisionTimer = 4 + Math.random() * 5;
            if (Math.random() < 0.3) {
              dirRef.current *= -1;
              setFacingRight(dirRef.current > 0);
            }
          }
        }
      } else {
        // Idle or sitting: wag tail calmly until timer finishes, then stand up & walk
        stepAccum += dt;
        if (stepAccum >= 0.5) {
          stepAccum = 0;
          setWagTail((w) => !w);
        }
        decisionTimer -= dt;
        if (decisionTimer <= 0) {
          decisionTimer = 5 + Math.random() * 5;
          if (Math.random() < 0.45) {
            dirRef.current *= -1;
            setFacingRight(dirRef.current > 0);
          }
          setPetState('walking');
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  useEffect(() => {
    return () => {
      if (speechTimerRef.current) clearTimeout(speechTimerRef.current);
    };
  }, []);

  const handlePetClick = () => {
    setHopKey((k) => k + 1);
    setSpeech(PET_META[petKind].sound);
    if (speechTimerRef.current) clearTimeout(speechTimerRef.current);
    speechTimerRef.current = setTimeout(() => setSpeech(null), 1400);

    const batch: FloatingHeart[] = [-14, 0, 14].map((dx, i) => ({
      id: ++heartCounterRef.current,
      dx,
      delay: i * 0.08,
    }));
    setHearts((prev) => [...prev.slice(-6), ...batch]);
    setTimeout(() => {
      const ids = new Set(batch.map((h) => h.id));
      setHearts((prev) => prev.filter((h) => !ids.has(h.id)));
    }, 1100);
  };

  return (
    <div
      className="hidden md:block fixed bottom-0 inset-x-0 h-20 z-30 pointer-events-none overflow-x-clip select-none"
      aria-label="Minecraft Pet Companion"
    >
      <div
        className="absolute bottom-1 pointer-events-auto flex items-center justify-center"
        style={{ transform: `translate3d(${posX}px, 0, 0)` }}
      >
        <div className="relative flex items-center justify-center">
          <AnimatePresence>
            {speech && (
              <motion.span
                key={`speech-${hopKey}`}
                initial={{ opacity: 0, x: -4, scale: 0.9 }}
                animate={{ opacity: 1, x: 4, scale: 1 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="pointer-events-none absolute -top-2 left-full ml-1 whitespace-nowrap px-2 py-0.5 rounded-md border border-emerald/40 bg-canvas/95 text-[10px] font-semibold text-emerald shadow-md"
              >
                {speech}
              </motion.span>
            )}
          </AnimatePresence>

          {hearts.map((h) => (
            <motion.span
              key={h.id}
              initial={{ opacity: 1, y: -4, x: h.dx, scale: 0.7 }}
              animate={{ opacity: 0, y: -38, x: h.dx, scale: 1.1 }}
              transition={{ duration: 0.85, delay: h.delay, ease: 'easeOut' }}
              className="pointer-events-none absolute -top-3"
            >
              <PixelHeart size={13} />
            </motion.span>
          ))}

          <motion.button
            key={hopKey}
            type="button"
            onClick={handlePetClick}
            title={`ลูบหัว ${PET_META[petKind].name}`}
            aria-label={`ลูบหัว ${PET_META[petKind].name}`}
            animate={hopKey > 0 ? { y: [0, -10, 0] } : { y: 0 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            className="cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded-md"
          >
            <div
              style={{
                transform: `scaleX(${facingRight ? 1 : -1}) translateY(${
                  petState === 'walking' && stepFrame === 1 ? '-1px' : '0px'
                })`,
                transition: 'transform 80ms linear',
              }}
            >
              <MinecraftPetSprite
                kind={petKind}
                stepFrame={stepFrame}
                sitting={petState === 'sitting'}
                wagTail={wagTail}
              />
            </div>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
