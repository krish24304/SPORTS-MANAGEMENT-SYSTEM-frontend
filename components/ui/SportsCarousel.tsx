"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import Link from "next/link";

import { motion, useMotionValue } from "framer-motion";
import { Grid2X2 } from "lucide-react";

import SportCard from "./SportCard";

type Sport = {
  id: number;
  name: string;
  status: string;
  totalGear: number;
  availableGear: number;
  resourceTypes: {
    id: number;
    name: string;
    total: number;
    available: number;
    units: {
      id: number;
      name: string;
      status: string;
    }[];
  }[];
};

type SportsCarouselProps = {
  sports: Sport[];
  onSportClick?: (sport: Sport) => void;
};

const CARD_WIDTH = 360;
const GAP = 24;
const AUTO_SPEED = 0.42;

export default function SportsCarousel({
  sports,
  onSportClick,
}: SportsCarouselProps) {
  const [isPaused, setIsPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredSportId, setHoveredSportId] = useState<number | null>(null);

  const x = useMotionValue(0);

  const animationFrame = useRef<number | null>(null);
  const lastTime = useRef<number | null>(null);

  const dragVelocity = useRef(0);
  const velocityDecay = useRef(0);

  const trackWidth = sports.length * (CARD_WIDTH + GAP);

  /*
   * Three copies are rendered so the carousel can
   * continuously loop through the middle copy.
   */
  const duplicatedSports = useMemo(
    () => [...sports, ...sports, ...sports],
    [sports]
  );

  /*
   * Keep the carousel inside the middle copy.
   */
  const normalizePosition = useCallback(() => {
    const current = x.get();

    if (!trackWidth) return;

    if (current <= -trackWidth * 2) {
      x.set(current + trackWidth);
    }

    if (current >= -trackWidth) {
      x.set(current - trackWidth);
    }
  }, [trackWidth, x]);

  /*
   * Automatic movement.
   */
  useEffect(() => {
    if (sports.length <= 1) return;

    const animate = (time: number) => {
      if (lastTime.current === null) {
        lastTime.current = time;
      }

      const delta = Math.min(time - lastTime.current, 32);

      lastTime.current = time;

      if (!isPaused && !isDragging) {
        let movement = AUTO_SPEED * delta;

        /*
         * Small drag momentum.
         */
        if (Math.abs(velocityDecay.current) > 0.01) {
          movement += velocityDecay.current * delta;
          velocityDecay.current *= 0.92;
        }

        x.set(x.get() - movement);
      }

      normalizePosition();

      animationFrame.current = requestAnimationFrame(animate);
    };

    animationFrame.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrame.current !== null) {
        cancelAnimationFrame(animationFrame.current);
      }

      lastTime.current = null;
    };
  }, [
    sports.length,
    isPaused,
    isDragging,
    normalizePosition,
    x,
  ]);

  /*
   * Pointer interaction.
   */
  const handlePointerDown = () => {
    setIsPaused(true);
    setIsDragging(true);
    velocityDecay.current = 0;
  };

  /*
   * Capture drag velocity.
   */
  const handleDrag = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: {
      velocity: {
        x: number;
        y: number;
      };
    }
  ) => {
    dragVelocity.current = info.velocity.x;
  };

  /*
   * Release with subtle momentum.
   */
  const handleDragEnd = () => {
    setIsDragging(false);

    velocityDecay.current = dragVelocity.current * 0.018;

    setTimeout(() => {
      setIsPaused(false);
    }, 140);
  };

  /*
   * IMPORTANT:
   *
   * This handler is used ONLY by the actual View Sport arrow.
   *
   * Clicking anywhere else on the card does NOT call
   * onSportClick.
   */
 

  if (!sports.length) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 text-center">
        <p className="text-sm text-zinc-500">
          No sports are currently available.
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* =====================================================
          SECTION HEADER
      ====================================================== */}

      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
            Discover
          </p>

          <h2 className="mt-1 text-2xl font-bold tracking-tight text-white">
            Explore Sports
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            Explore sports, resources and availability.
          </p>
        </div>
      </div>

      {/* =====================================================
          CAROUSEL
      ====================================================== */}

      <div
        className="relative overflow-hidden py-5"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => {
          if (!isDragging) {
            setIsPaused(false);
          }

          setHoveredSportId(null);
        }}
      >
        {/* LEFT FADE */}

        <div
          className="
            pointer-events-none
            absolute
            left-0
            top-0
            z-30
            h-full
            w-20
            bg-gradient-to-r
            from-zinc-950
            via-zinc-950/70
            to-transparent
          "
        />

        {/* RIGHT FADE */}

        <div
          className="
            pointer-events-none
            absolute
            right-0
            top-0
            z-30
            h-full
            w-20
            bg-gradient-to-l
            from-zinc-950
            via-zinc-950/70
            to-transparent
          "
        />

        {/* =================================================
            DRAG TRACK
        ================================================== */}

        <motion.div
          drag="x"
          dragConstraints={{
            left: -Infinity,
            right: Infinity,
          }}
          dragElastic={0.04}
          style={{ x }}
          onPointerDown={handlePointerDown}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          className="
            flex
            cursor-grab
            gap-6
            active:cursor-grabbing
          "
        >
          {duplicatedSports.map((sport, index) => {
            const isDimmed =
              hoveredSportId !== null &&
              hoveredSportId !== sport.id;

            const isHovered =
              hoveredSportId === sport.id;

            return (
              <motion.div
                key={`${sport.id}-${index}`}
                style={{
                  minWidth: CARD_WIDTH,
                  width: CARD_WIDTH,
                }}
                initial={{
                  opacity: 0,
                  y: 12,
                }}
                animate={{
                  opacity: isDimmed ? 0.38 : 1,
                  y: isHovered ? -8 : 0,
                  scale: isHovered ? 1.015 : 1,
                  filter: isDimmed
                    ? "blur(1.5px)"
                    : "blur(0px)",
                }}
                transition={{
                  duration: 0.28,
                  ease: "easeOut",
                  delay: Math.min(index, 5) * 0.035,
                }}
                onMouseEnter={() => {
                  setHoveredSportId(sport.id);
                  setIsPaused(true);
                }}
                onMouseLeave={() => {
                  setHoveredSportId(null);

                  if (!isDragging) {
                    setIsPaused(false);
                  }
                }}
              >
                <SportCard
                  name={sport.name}
                  resourceTypes={sport.resourceTypes}
                  status={sport.status}
                  isDimmed={isDimmed}

                  /*
                   * IMPORTANT:
                   *
                   * SportCard itself does not receive a card-level
                   * click handler here.
                   *
                   * The only click should come from the View Sport
                   * control inside SportCard.
                   */
                  onClick={() => onSportClick?.(sport)}
                />
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* =====================================================
          FOOTER
      ====================================================== */}

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-zinc-600">
          <motion.span
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.55, 1, 0.55],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="h-1.5 w-1.5 rounded-full bg-emerald-500"
          />

          <span>Drag to explore</span>
        </div>

        <Link
          href="/sports"
          className="
            group
            flex
            items-center
            gap-2
            text-sm
            text-zinc-400
            transition-colors
            duration-200
            hover:text-emerald-400
          "
        >
          <Grid2X2
            size={15}
            className="
              transition-transform
              duration-200
              group-hover:scale-110
            "
          />

          <span>View all sports</span>
        </Link>
      </div>
    </div>
  );
}