"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  motion,
  AnimatePresence,
  useMotionValue,
  useAnimationControls,
  type PanInfo,
} from "framer-motion";
import {
  Search,
  ChevronDown,
  CircleCheck,
  Package,
    Dumbbell,
  CheckCircle2,
  Clock3,
  AlertTriangle,
  Pause,
} from "lucide-react";

import DashboardLayout from "@/components/layout/DashboardLayout";

type Equipment = {
  id: number;
  sport: string;
  name: string;
  total: number;
  available: number;
  damaged: number;
};

/*
 * ---------------------------------------------------------
 * TEMPORARY FRONTEND DATA
 * ---------------------------------------------------------
 *
 * Replace this later with your backend/API data.
 */
const equipmentData: Equipment[] = [
  {
    id: 1,
    sport: "Basketball",
    name: "Basketballs",
    total: 10,
    available: 6,
    damaged: 1,
  },
  {
    id: 2,
    sport: "Football",
    name: "Footballs",
    total: 8,
    available: 5,
    damaged: 1,
  },
  {
    id: 3,
    sport: "Tennis",
    name: "Rackets",
    total: 12,
    available: 7,
    damaged: 1,
  },
  {
    id: 4,
    sport: "Cricket",
    name: "Cricket Bats",
    total: 6,
    available: 2,
    damaged: 1,
  },
  {
    id: 5,
    sport: "Badminton",
    name: "Rackets",
    total: 10,
    available: 6,
    damaged: 1,
  },
  {
    id: 6,
    sport: "Badminton",
    name: "Shuttlecocks",
    total: 20,
    available: 12,
    damaged: 2,
  },
  {
    id: 7,
    sport: "Volleyball",
    name: "Volleyballs",
    total: 8,
    available: 4,
    damaged: 1,
  },
  {
    id: 8,
    sport: "Table Tennis",
    name: "Paddles",
    total: 14,
    available: 9,
    damaged: 1,
  },
  {
    id: 9,
    sport: "Table Tennis",
    name: "Balls",
    total: 30,
    available: 21,
    damaged: 2,
  },
  {
    id: 10,
    sport: "Cricket",
    name: "Cricket Balls",
    total: 18,
    available: 11,
    damaged: 1,
  },
  {
    id: 11,
    sport: "Football",
    name: "Training Cones",
    total: 24,
    available: 17,
    damaged: 2,
  },
  {
    id: 12,
    sport: "Basketball",
    name: "Training Cones",
    total: 16,
    available: 10,
    damaged: 1,
  },
];

type FilterType = "all" | "available";

/*
 * ---------------------------------------------------------
 * SPORT ICONS
 * ---------------------------------------------------------
 *
 * Using small visual symbols keeps this page lightweight
 * and avoids another icon dependency.
 */
function SportIcon({
  sport,
  size = "normal",
}: {
  sport: string;
  size?: "normal" | "large";
}) {
  const iconSize =
    size === "large"
      ? "text-2xl"
      : "text-lg";

  const icons: Record<string, string> = {
    Basketball: "🏀",
    Football: "⚽",
    Tennis: "🎾",
    Cricket: "🏏",
    Badminton: "🏸",
    Volleyball: "🏐",
    "Table Tennis": "🏓",
    Hockey: "🏑",
    Swimming: "🏊",
    Athletics: "🏃",
  };

  return (
    <span
      className={`${iconSize} select-none leading-none`}
      aria-hidden="true"
    >
      {icons[sport] ?? "🏅"}
    </span>
  );
}

/*
 * ---------------------------------------------------------
 * EQUIPMENT PAGE
 * ---------------------------------------------------------
 */
export default function EquipmentPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] =
    useState<FilterType>("all");

  const filteredEquipment = useMemo(() => {
    const query = search.trim().toLowerCase();

    return equipmentData.filter((item) => {
      const matchesSearch =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.sport.toLowerCase().includes(query);

      const matchesFilter =
        filter === "all" || item.available > 0;

      return matchesSearch && matchesFilter;
    });
  }, [search, filter]);

  return (
    <DashboardLayout title="Equipment">
      <div className="space-y-7">

        {/* =================================================
            HEADER
        ================================================= */}

        <motion.div
          initial={{
            opacity: 0,
            y: 12,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.4,
          }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
            Equipment Overview
          </p>

          <h2 className="mt-2 text-3xl font-black tracking-tight text-white md:text-4xl">
            Equipment Overview
          </h2>

          <p className="mt-2 text-sm text-zinc-500">
            See what&apos;s currently available
          </p>
        </motion.div>


        {/* =================================================
            SEARCH + FILTER
        ================================================= */}

        <motion.div
          initial={{
            opacity: 0,
            y: 14,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.4,
            delay: 0.05,
          }}
          className="
            flex
            flex-col
            gap-3
            sm:flex-row
          "
        >

          {/* SEARCH */}

          <div className="relative flex-1">

            <Search
              size={18}
              className="
                pointer-events-none
                absolute
                left-4
                top-1/2
                z-10
                -translate-y-1/2
                text-zinc-600
              "
            />

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search equipment..."
              className="
                h-12
                w-full
                rounded-xl
                border
                border-zinc-800
                bg-zinc-900/60
                pl-11
                pr-4
                text-sm
                text-white
                outline-none
                transition-all
                duration-200
                placeholder:text-zinc-600
                hover:border-zinc-700
                focus:border-emerald-500/50
                focus:bg-zinc-900
                focus:ring-4
                focus:ring-emerald-500/5
              "
            />

          </div>


          {/* FILTER */}

          <div className="relative">

            <select
              value={filter}
              onChange={(event) =>
                setFilter(
                  event.target.value as FilterType
                )
              }
              className="
                h-12
                w-full
                appearance-none
                rounded-xl
                border
                border-zinc-800
                bg-zinc-900/60
                px-4
                pr-10
                text-sm
                font-medium
                text-zinc-300
                outline-none
                transition-all
                hover:border-zinc-700
                focus:border-emerald-500/50
                sm:w-[150px]
              "
            >
              <option value="all">
                All
              </option>

              <option value="available">
                Available
              </option>
            </select>

            <ChevronDown
              size={16}
              className="
                pointer-events-none
                absolute
                right-4
                top-1/2
                -translate-y-1/2
                text-zinc-500
              "
            />

          </div>

        </motion.div>


        {/* =================================================
            EQUIPMENT STATUS
        ================================================= */}

        <motion.section
          initial={{
            opacity: 0,
            y: 18,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.45,
            delay: 0.1,
          }}
          className="
            overflow-hidden
            rounded-3xl
            border
            border-zinc-800
            bg-zinc-950
            shadow-[0_25px_70px_rgba(0,0,0,0.22)]
          "
        >

          {/* SECTION HEADER */}

          <div
            className="
              flex
              items-center
              justify-between
              border-b
              border-zinc-800
              px-5
              py-5
              md:px-6
            "
          >

            <div>
              <h3 className="font-bold text-white">
                Equipment Status
              </h3>

              <p className="mt-1 text-xs text-zinc-600">
                Current inventory across sports
              </p>
            </div>

            <div
              className="
                hidden
                items-center
                gap-2
                rounded-full
                border
                border-zinc-800
                bg-zinc-900
                px-3
                py-1.5
                text-xs
                text-zinc-500
                sm:flex
              "
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_7px_rgba(52,211,153,0.8)]" />

              {filteredEquipment.length} items
            </div>

          </div>


          {/* =================================================
              TABLE / CAROUSEL
          ================================================= */}

          <EquipmentCarousel
            equipment={filteredEquipment}
          />

        </motion.section>


        {/* MOBILE SCROLL HINT */}

        <p className="text-center text-[11px] text-zinc-700 md:hidden">
          Swipe horizontally to view all equipment details
        </p>

      </div>
    </DashboardLayout>
  );
}


/*
 * =========================================================
 * EQUIPMENT CAROUSEL
 * =========================================================
 */
function EquipmentCarousel({
  equipment,
}: {
  equipment: Equipment[];
}) {
  const [isDragging, setIsDragging] = useState(false);

  const controls = useAnimationControls();

  const baseSpeed = 22; // normal pixels/second
  const maxDragSpeed = 95;

  const dragVelocity = useMotionValue(0);
  const currentY = useMotionValue(0);

  const velocityRef = useRef(0);
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  /*
   * Start automatic upward movement.
   *
   * The carousel only needs to move when there are enough
   * equipment rows to make scrolling useful.
   */
  const shouldScroll = equipment.length > 7;

  useEffect(() => {
    if (!shouldScroll) return;

    let frame: number;

    const animate = (time: number) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = time;
      }

      const delta =
        (time - lastTimeRef.current) / 1000;

      lastTimeRef.current = time;

      /*
       * Normal movement:
       * negative = upward
       */
      const normalVelocity = -baseSpeed;

      /*
       * When the user drags, add their velocity
       * temporarily to the normal movement.
       */
      const extraVelocity =
        velocityRef.current;

      const velocity =
        isDragging
          ? extraVelocity
          : normalVelocity + extraVelocity;

      currentY.set(
        currentY.get() +
          velocity * delta
      );

      /*
       * Gradually remove drag momentum after release.
       */
      if (!isDragging) {
        velocityRef.current *= 0.94;

        /*
         * Once momentum becomes tiny,
         * return completely to normal speed.
         */
        if (
          Math.abs(velocityRef.current) < 0.5
        ) {
          velocityRef.current = 0;
        }
      }

      frame = requestAnimationFrame(
        animate
      );
    };

    frame = requestAnimationFrame(
      animate
    );

    return () => {
      cancelAnimationFrame(frame);

      lastTimeRef.current = null;
    };
  }, [
    shouldScroll,
    isDragging,
    currentY,
  ]);

  /*
   * Duplicate the rows so the carousel can loop
   * seamlessly.
   */
  const rows = shouldScroll
    ? [...equipment, ...equipment]
    : equipment;

  /*
   * Estimate row height.
   *
   * Keep this equal to the actual row height
   * in the UI below.
   */
  const rowHeight = 72;

  const loopHeight =
    equipment.length * rowHeight;

  /*
   * Keep the carousel inside one loop.
   */
  useEffect(() => {
    const unsubscribe =
      currentY.on("change", (value) => {
        if (!shouldScroll) return;

        /*
         * Once we have moved one complete set
         * upward, jump back by exactly one set.
         */
        if (value <= -loopHeight) {
          currentY.set(
            value + loopHeight
          );
        }

        /*
         * Allows dragging downward without
         * breaking the loop.
         */
        if (value > 0) {
          currentY.set(
            value - loopHeight
          );
        }
      });

    return unsubscribe;
  }, [
    currentY,
    loopHeight,
    shouldScroll,
  ]);

  /*
   * DRAG START
   */
  const handleDragStart = () => {
    setIsDragging(true);

    velocityRef.current = 0;
  };

  /*
   * DRAG
   */
  const handleDrag = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    /*
     * User dragging upward:
     * positive Y movement = downward
     * negative Y movement = upward
     */
    const velocity =
      info.velocity.y;

    /*
     * Clamp it so a very fast drag doesn't
     * make the carousel uncontrollable.
     */
    const clampedVelocity =
      Math.max(
        -maxDragSpeed,
        Math.min(
          maxDragSpeed,
          velocity
        )
      );

    velocityRef.current =
      clampedVelocity;
  };

  /*
   * DRAG END
   */
  const handleDragEnd = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    setIsDragging(false);

    /*
     * Keep a percentage of the release velocity.
     *
     * This creates the "flick" effect.
     */
    velocityRef.current =
      Math.max(
        -maxDragSpeed,
        Math.min(
          maxDragSpeed,
          info.velocity.y * 0.65
        )
      );
  };

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.45,
      }}
      className="
        overflow-hidden
        rounded-3xl
        border
        border-zinc-800
        bg-zinc-950
        shadow-[0_25px_70px_rgba(0,0,0,0.25)]
      "
    >
      {/* HEADER */}

      <div
        className="
          border-b
          border-zinc-800
          px-5
          py-5
          md:px-6
        "
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white">
              Equipment Status
            </h3>

            <p className="mt-1 text-xs text-zinc-600">
              Current inventory across sports
            </p>
          </div>

          <div
            className="
              hidden
              items-center
              gap-2
              rounded-full
              border
              border-zinc-800
              bg-zinc-900/70
              px-3
              py-1.5
              text-xs
              text-zinc-500
              sm:flex
            "
          >
            <span
              className={`
                h-1.5
                w-1.5
                rounded-full
                ${
                  shouldScroll
                    ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                    : "bg-zinc-600"
                }
              `}
            />

            {shouldScroll
              ? "Auto scrolling"
              : "All equipment"}
          </div>
        </div>
      </div>

      {/* TABLE */}

      <div className="relative">
        {/* TOP FADE */}

        {shouldScroll && (
          <div
            className="
              pointer-events-none
              absolute
              left-0
              right-0
              top-0
              z-20
              h-12
              bg-gradient-to-b
              from-zinc-950
              to-transparent
            "
          />
        )}

        {/* BOTTOM FADE */}

        {shouldScroll && (
          <div
            className="
              pointer-events-none
              absolute
              bottom-0
              left-0
              right-0
              z-20
              h-12
              bg-gradient-to-t
              from-zinc-950
              to-transparent
            "
          />
        )}

        {/* COLUMN HEADER */}

        <div
          className="
            relative
            z-30
            grid
            grid-cols-[1.2fr_1.4fr_0.7fr_0.9fr_0.7fr_0.7fr]
            border-b
            border-zinc-800
            bg-zinc-900/80
            px-5
            py-4
            backdrop-blur-xl
            md:px-6
          "
        >
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-600">
            Sport
          </span>

          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-600">
            Equipment
          </span>

          <span className="text-center text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-600">
            Total
          </span>

          <span className="text-center text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-600">
            Available
          </span>

          <span className="text-center text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-600">
            In Use
          </span>

          <span className="text-center text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-600">
            Damaged
          </span>
        </div>

        {/* MOVING AREA */}

        <div
          className={`
            relative
            overflow-hidden
            ${
              shouldScroll
                ? "cursor-grab active:cursor-grabbing"
                : ""
            }
          `}
          style={{
            height:
              shouldScroll
                ? rowHeight * 7
                : "auto",
          }}
        >
          <motion.div
            style={{
              y: shouldScroll
                ? currentY
                : 0,
            }}
            drag={
              shouldScroll
                ? "y"
                : false
            }
            dragConstraints={{
              top: -Infinity,
              bottom: Infinity,
            }}
            dragElastic={0.04}
            dragMomentum={false}
            onDragStart={
              handleDragStart
            }
            onDrag={
              handleDrag
            }
            onDragEnd={
              handleDragEnd
            }
            className="relative"
          >
            {rows.map(
              (item, index) => {
                const inUse =
                  item.total -
                  item.available -
                  item.damaged;

                return (
                  <motion.div
                    key={`${item.id}-${index}`}
                    whileHover={{
                      backgroundColor:
                        "rgba(24,24,27,0.65)",
                    }}
                    className="
                      group
                      grid
                      h-[72px]
                      grid-cols-[1.2fr_1.4fr_0.7fr_0.9fr_0.7fr_0.7fr]
                      items-center
                      border-b
                      border-zinc-900
                      px-5
                      transition-colors
                      md:px-6
                    "
                  >
                    {/* SPORT */}

                    <div>
                      <span
                        className="
                          font-semibold
                          text-zinc-300
                          transition-colors
                          duration-200
                          group-hover:text-emerald-400
                        "
                      >
                        {item.sport}
                      </span>
                    </div>

                    {/* EQUIPMENT */}

                    <div className="flex items-center gap-3">
                      <div
                        className="
                          flex
                          h-9
                          w-9
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl
                          bg-emerald-500/10
                          text-emerald-400
                          transition-all
                          duration-300
                          group-hover:scale-105
                          group-hover:bg-emerald-500
                          group-hover:text-black
                        "
                      >
                        <Dumbbell
                          size={17}
                        />
                      </div>

                      <span className="text-sm text-zinc-300">
                        {item.name}
                      </span>
                    </div>

                    {/* TOTAL */}

                    <div className="text-center">
                      <span className="font-semibold text-zinc-300">
                        {item.total}
                      </span>
                    </div>

                    {/* AVAILABLE */}

                    <div className="text-center">
                      <span
                        className="
                          inline-flex
                          min-w-[42px]
                          justify-center
                          rounded-full
                          bg-emerald-500/10
                          px-3
                          py-1
                          text-sm
                          font-semibold
                          text-emerald-400
                        "
                      >
                        {item.available}
                      </span>
                    </div>

                    {/* IN USE */}

                    <div className="text-center">
                      <span
                        className="
                          inline-flex
                          min-w-[42px]
                          justify-center
                          rounded-full
                          bg-blue-500/10
                          px-3
                          py-1
                          text-sm
                          font-semibold
                          text-blue-400
                        "
                      >
                        {inUse}
                      </span>
                    </div>

                    {/* DAMAGED */}

                    <div className="text-center">
                      <span
                        className={`
                          inline-flex
                          min-w-[42px]
                          justify-center
                          rounded-full
                          px-3
                          py-1
                          text-sm
                          font-semibold
                          ${
                            item.damaged > 0
                              ? "bg-amber-500/10 text-amber-400"
                              : "bg-zinc-900 text-zinc-600"
                          }
                        `}
                      >
                        {item.damaged}
                      </span>
                    </div>
                  </motion.div>
                );
              }
            )}
          </motion.div>
        </div>
      </div>

      {/* MOBILE HINT */}

      <div className="border-t border-zinc-900 px-5 py-3 text-center">
        <p className="text-[11px] text-zinc-700">
          {shouldScroll
            ? "Drag vertically to control the equipment flow"
            : "All equipment is shown"}
        </p>
      </div>
    </motion.div>
  );
}