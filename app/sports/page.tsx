"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Search,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";

interface Gear {
  id: number;
  name: string;
  totalQuantity: number;
  availableQuantity: number;
  damagedQuantity: number;
}

interface Resource {
  id: number;
  name: string;
  type: string;
  status: string;
  maintenanceMessage?: string | null;
}

interface Sport {
  id: number;
  name: string;
  hasSlotSystem: boolean;
  slotDurationMinutes: number;
  totalCourts: number;
  availableCourts: number;
  maintenance: boolean;
  maintenanceMessage?: string;
  gears: Gear[];
  resources: Resource[];
}

export default function SportsPage() {
  const [sports, setSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [hoveredSportId, setHoveredSportId] = useState<number | null>(null);

  useEffect(() => {
    const fetchSports = async () => {
      try {
        const response = await fetch(
          "http://127.0.0.1:5000/sports"
        );

        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }

        const data = await response.json();

        const sportsData = Array.isArray(data)
          ? data
          : Array.isArray(data.sports)
            ? data.sports
            : [];

        console.log("SPORTS API DATA:", sportsData);

        setSports(sportsData);
      } catch (error) {
        console.error("Failed to fetch sports:", error);
        setSports([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSports();
  }, []);

  const filteredSports = sports.filter((sport) =>
    sport.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <DashboardLayout title="Sports">
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="text-center">
            <motion.div
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: "linear",
              }}
              className="
                mx-auto
                mb-5
                h-10
                w-10
                rounded-full
                border-2
                border-zinc-700
                border-t-emerald-400
              "
            />

            <p className="text-zinc-400">
              Loading sports...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Sports">
      <section className="py-4 md:py-6">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div
          className="
            mb-14
            flex
            flex-col
            gap-8
            lg:flex-row
            lg:items-end
            lg:justify-between
          "
        >
          <div>
            <motion.p
              initial={{
                opacity: 0,
                y: 8,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.5,
              }}
              className="
                mb-4
                text-sm
                font-semibold
                uppercase
                tracking-[0.25em]
                text-emerald-400
              "
            >
              Sports Block
            </motion.p>

            <motion.h1
              initial={{
                opacity: 0,
                y: 12,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.6,
                delay: 0.05,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="
                text-5xl
                font-black
                tracking-tight
                md:text-6xl
              "
            >
              Sports Arena
            </motion.h1>

            <motion.p
              initial={{
                opacity: 0,
                y: 10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.5,
                delay: 0.12,
              }}
              className="
                mt-4
                max-w-xl
                text-lg
                text-zinc-400
              "
            >
              Explore available sports, check resources,
              and find your next activity.
            </motion.p>
          </div>

          {/* SEARCH */}

          <motion.div
            initial={{
              opacity: 0,
              x: 15,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 0.5,
              delay: 0.15,
            }}
            className="relative w-full lg:w-[320px]"
          >
            <Search
              size={19}
              className="
                absolute
                left-4
                top-1/2
                -translate-y-1/2
                text-zinc-500
              "
            />

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search sports..."
              className="
                w-full
                rounded-2xl
                border
                border-zinc-800
                bg-zinc-900/80
                py-4
                pl-12
                pr-4
                text-white
                outline-none
                transition-all
                duration-300
                placeholder:text-zinc-600
                focus:border-emerald-500/60
                focus:bg-zinc-900
                focus:ring-4
                focus:ring-emerald-500/5
              "
            />
          </motion.div>
        </div>

        {/* =====================================================
            SPORTS
        ===================================================== */}

        <section>
          <div className="mb-7">
            <motion.h2
              initial={{
                opacity: 0,
                y: 8,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.45,
              }}
              className="
                text-2xl
                font-bold
                md:text-3xl
              "
            >
              Explore Sports
            </motion.h2>

            <motion.p
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              transition={{
                duration: 0.5,
                delay: 0.08,
              }}
              className="
                mt-1
                text-zinc-500
              "
            >
              Select a sport to view availability and resources
            </motion.p>
          </div>

          {/* =====================================================
              SPORTS GRID
          ===================================================== */}

          {filteredSports.length > 0 && (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},

                visible: {
                  transition: {
                    staggerChildren: 0.08,
                  },
                },
              }}
              className="
                grid
                grid-cols-1
                gap-6
                md:grid-cols-2
                xl:grid-cols-3
              "
              onMouseLeave={() =>
                setHoveredSportId(null)
              }
            >
              {filteredSports.map((sport) => (
                <SportPreviewCard
                  key={sport.id}
                  sport={sport}
                  isHovered={
                    hoveredSportId === sport.id
                  }
                  isAnotherHovered={
                    hoveredSportId !== null &&
                    hoveredSportId !== sport.id
                  }
                  onHover={() =>
                    setHoveredSportId(sport.id)
                  }
                />
              ))}
            </motion.div>
          )}

          {/* =====================================================
              EMPTY STATE
          ===================================================== */}

          {filteredSports.length === 0 && (
            <motion.div
              initial={{
                opacity: 0,
                y: 15,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              className="
                py-24
                text-center
              "
            >
              <p className="text-xl font-semibold">
                No sports found
              </p>

              <p className="mt-2 text-zinc-500">
                Try searching for another sport.
              </p>
            </motion.div>
          )}
        </section>
      </section>
    </DashboardLayout>
  );
}

/* =============================================================
   SPORT PREVIEW CARD
============================================================= */

function SportPreviewCard({
  sport,
  isHovered,
  isAnotherHovered,
  onHover,
}: {
  sport: Sport;
  isHovered: boolean;
  isAnotherHovered: boolean;
  onHover: () => void;
}) {
  const hasCourtsAvailable =
    sport.availableCourts > 0;

  const isAvailable =
    !sport.maintenance &&
    hasCourtsAvailable;

  const availabilityLabel =
    sport.maintenance
      ? "MAINTENANCE"
      : hasCourtsAvailable
        ? "AVAILABLE"
        : "UNAVAILABLE";

  const availabilityColor =
    sport.maintenance
      ? "orange"
      : hasCourtsAvailable
        ? "emerald"
        : "red";

  return (
    <motion.article
      initial={{
        opacity: 0,
        y: 24,
      }}
      variants={{
        hidden: {
          opacity: 0,
          y: 24,
        },

        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.55,
            ease: [0.22, 1, 0.36, 1],
          },
        },
      }}
      animate={{
        y: isHovered
          ? -18
          : 0,

        scale: isHovered
          ? 1.035
          : isAnotherHovered
            ? 0.965
            : 1,

        opacity: isAnotherHovered
          ? 0.28
          : 1,

        filter: isAnotherHovered
          ? "blur(6px)"
          : "blur(0px)",
      }}
      transition={{
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      }}
      onMouseEnter={onHover}
      className="
        group
        relative
        h-[500px]
        w-full
      "
    >
      {/* =====================================================
          LARGE AMBIENT GLOW
      ===================================================== */}

      <motion.div
        animate={{
          opacity: isHovered
            ? 1
            : 0,

          scale: isHovered
            ? 1.12
            : 0.92,
        }}
        transition={{
          duration: 0.55,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="
          pointer-events-none
          absolute
          -inset-8
          rounded-[44px]
          bg-emerald-500/10
          blur-3xl
        "
      />

      {/* =====================================================
          SECOND GLOW
      ===================================================== */}

      <motion.div
        animate={{
          opacity: isHovered
            ? 1
            : 0,

          scale: isHovered
            ? 1.08
            : 0.95,
        }}
        transition={{
          duration: 0.45,
        }}
        className="
          pointer-events-none
          absolute
          -inset-4
          rounded-[38px]
          bg-emerald-400/7
          blur-2xl
        "
      />

      {/* =====================================================
          CARD
      ===================================================== */}

      <motion.div
        animate={{
          boxShadow: isHovered
            ? "0 40px 110px rgba(0,0,0,0.65)"
            : "0 20px 60px rgba(0,0,0,0.28)",
        }}
        transition={{
          duration: 0.45,
        }}
        className="
          relative
          h-full
          w-full
          overflow-hidden
          rounded-[28px]
          border
          border-zinc-800
          bg-zinc-950
          transition-colors
          duration-500
          group-hover:border-emerald-500/40
        "
      >
        {/* =====================================================
            TOP STATIC LIGHT
        ===================================================== */}

        <div
          className="
            absolute
            left-0
            right-0
            top-0
            h-px
            bg-gradient-to-r
            from-transparent
            via-emerald-400/40
            to-transparent
          "
        />

        {/* =====================================================
            ANIMATED LIGHT SWEEP
        ===================================================== */}

        <motion.div
          initial={{
            x: "-120%",
            opacity: 0,
          }}
          animate={
            isHovered
              ? {
                  x: "120%",
                  opacity: [0, 1, 0],
                }
              : {
                  x: "-120%",
                  opacity: 0,
                }
          }
          transition={{
            duration: 1.1,
            ease: "easeInOut",
          }}
          className="
            pointer-events-none
            absolute
            left-0
            top-0
            h-px
            w-[65%]
            bg-gradient-to-r
            from-transparent
            via-emerald-300
            to-transparent
          "
        />

        {/* =====================================================
            RADIAL LIGHT
        ===================================================== */}

        <motion.div
          animate={{
            opacity: isHovered
              ? 1
              : 0,

            scale: isHovered
              ? 1
              : 0.7,
          }}
          transition={{
            duration: 0.5,
          }}
          className="
            pointer-events-none
            absolute
            -right-24
            -top-24
            h-72
            w-72
            rounded-full
            bg-emerald-500/10
            blur-3xl
          "
        />

        {/* =====================================================
            CONTENT
        ===================================================== */}

        <div
          className="
            relative
            flex
            h-full
            flex-col
            p-6
            md:p-7
          "
        >
          {/* =================================================
              HEADER
          ================================================= */}

          <div className="shrink-0">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p
                  className="
                    mb-2
                    text-[10px]
                    uppercase
                    tracking-[0.24em]
                    text-zinc-600
                  "
                >
                  Sport
                </p>

                <motion.h3
                  animate={{
                    x: isHovered
                      ? 3
                      : 0,

                    letterSpacing: isHovered
                      ? "-0.025em"
                      : "-0.02em",
                  }}
                  transition={{
                    duration: 0.3,
                  }}
                  className="
                    truncate
                    text-3xl
                    font-black
                    text-white
                    transition-colors
                    duration-300
                    group-hover:text-emerald-400
                  "
                >
                  {sport.name}
                </motion.h3>
              </div>

              {/* AVAILABILITY */}

              <StatusPill
                label={availabilityLabel}
                type={availabilityColor}
                isActive={isHovered}
              />
            </div>
          </div>

          {/* =================================================
              SLOT SYSTEM
          ================================================= */}

          <div className="mt-5 shrink-0">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p
                  className="
                    text-[10px]
                    uppercase
                    tracking-[0.22em]
                    text-zinc-600
                  "
                >
                  Slot system
                </p>

                <p
                  className="
                    mt-1.5
                    text-sm
                    text-zinc-300
                  "
                >
                  {sport.hasSlotSystem
                    ? `${sport.slotDurationMinutes} minute slots`
                    : "Direct booking"}
                </p>
              </div>

              {/* ON / OFF */}

              <motion.div
                animate={{
                  scale: isHovered
                    ? 1.05
                    : 1,
                }}
                transition={{
                  duration: 0.25,
                }}
                className={`
                  flex
                  items-center
                  gap-1.5
                  rounded-full
                  px-3
                  py-1.5
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-wider

                  ${
                    sport.hasSlotSystem
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-zinc-800/80 text-zinc-500"
                  }
                `}
              >
                <motion.span
                  animate={
                    sport.hasSlotSystem
                      ? {
                          scale: [1, 1.35, 1],
                          opacity: [0.55, 1, 0.55],
                        }
                      : {
                          scale: 1,
                          opacity: 1,
                        }
                  }
                  transition={{
                    duration: 2,
                    repeat:
                      sport.hasSlotSystem
                        ? Infinity
                        : 0,
                    ease: "easeInOut",
                  }}
                  className={`
                    h-1.5
                    w-1.5
                    rounded-full

                    ${
                      sport.hasSlotSystem
                        ? "bg-emerald-400"
                        : "bg-zinc-600"
                    }
                  `}
                />

                {sport.hasSlotSystem
                  ? "ON"
                  : "OFF"}
              </motion.div>
            </div>
          </div>

          {/* =================================================
              DIVIDER
          ================================================= */}

          <div
            className="
              mt-5
              h-px
              shrink-0
              bg-zinc-800/80
            "
          />

          {/* =================================================
              COURTS
          ================================================= */}

          <div className="mt-5 shrink-0">
            <p
              className="
                text-[10px]
                uppercase
                tracking-[0.22em]
                text-zinc-600
              "
            >
              Courts
            </p>

            <div className="mt-1 flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                <motion.span
                  animate={{
                    scale: isHovered
                      ? 1.06
                      : 1,
                  }}
                  transition={{
                    duration: 0.25,
                  }}
                  className="
                    text-4xl
                    font-black
                    tracking-tight
                    text-white
                  "
                >
                  {sport.availableCourts}
                </motion.span>

                <span
                  className="
                    text-lg
                    text-zinc-600
                  "
                >
                  / {sport.totalCourts}
                </span>
              </div>

              {/* EXACTLY ONE STATUS DOT */}

              <motion.span
                animate={
                  isAvailable
                    ? {
                        scale: [1, 1.35, 1],
                        opacity: [0.55, 1, 0.55],
                      }
                    : {
                        scale: 1,
                        opacity: 1,
                      }
                }
                transition={{
                  duration: 2,
                  repeat:
                    isAvailable
                      ? Infinity
                      : 0,
                  ease: "easeInOut",
                }}
                className={`
                  h-2
                  w-2
                  rounded-full

                  ${
                    sport.maintenance
                      ? "bg-orange-400"
                      : hasCourtsAvailable
                        ? "bg-emerald-400"
                        : "bg-red-400"
                  }
                `}
              />
            </div>
          </div>

          {/* =================================================
              GEAR AREA
              
              FLEXIBLE MIDDLE AREA
              NEVER PUSHES FOOTER OUT
          ================================================= */}

          <div
            className="
              mt-5
              min-h-0
              flex-1
              overflow-hidden
            "
          >
            <p
              className="
                mb-2.5
                text-[10px]
                uppercase
                tracking-[0.22em]
                text-zinc-600
              "
            >
              Gear
            </p>

            {sport.gears.length > 0 ? (
              <div
                className="
                  max-h-full
                  space-y-2
                  overflow-y-auto
                  pr-1
                  scrollbar-thin
                  scrollbar-track-transparent
                  scrollbar-thumb-zinc-800
                "
              >
                {sport.gears.map(
                  (gear, index) => {
                    const gearAvailable =
                      gear.availableQuantity > 0;

                    return (
                      <motion.div
                        key={gear.id}
                        initial={{
                          opacity: 0,
                          x: -8,
                        }}
                        animate={{
                          opacity: 1,
                          x: 0,
                        }}
                        transition={{
                          duration: 0.3,
                          delay:
                            index * 0.035,
                        }}
                        className="
                          flex
                          items-center
                          justify-between
                          gap-4
                          text-sm
                        "
                      >
                        <span
                          className="
                            min-w-0
                            truncate
                            text-zinc-400
                            transition-colors
                            duration-300
                            group-hover:text-zinc-300
                          "
                        >
                          {gear.name}
                        </span>

                        <div
                          className="
                            flex
                            shrink-0
                            items-center
                            gap-2
                          "
                        >
                          <span
                            className="
                              font-semibold
                              text-zinc-300
                            "
                          >
                            {gear.availableQuantity}

                            <span
                              className="
                                text-zinc-600
                              "
                            >
                              {" "}
                              /{" "}
                              {gear.totalQuantity}
                            </span>
                          </span>

                          <motion.span
                            animate={
                              gearAvailable
                                ? {
                                    scale: [
                                      1,
                                      1.2,
                                      1,
                                    ],
                                    opacity: [
                                      0.6,
                                      1,
                                      0.6,
                                    ],
                                  }
                                : {
                                    scale: 1,
                                    opacity: 1,
                                  }
                            }
                            transition={{
                              duration: 2.3,
                              repeat:
                                gearAvailable
                                  ? Infinity
                                  : 0,
                              ease: "easeInOut",
                              delay:
                                index * 0.15,
                            }}
                            className={`
                              h-1.5
                              w-1.5
                              rounded-full

                              ${
                                gearAvailable
                                  ? "bg-emerald-400"
                                  : "bg-red-400"
                              }
                            `}
                          />
                        </div>
                      </motion.div>
                    );
                  }
                )}
              </div>
            ) : (
              <p className="text-sm text-zinc-600">
                No gear assigned
              </p>
            )}
          </div>

          {/* =================================================
              BOOKING FOOTER
              
              DIRECT NAVIGATION
              
              /sports/1
              /sports/2
              /sports/3
              etc.
          ================================================= */}

          <div
            className="
              mt-5
              shrink-0
              border-t
              border-zinc-800/80
              pt-4
            "
          >
            <Link
              href={`/sports/${sport.id}`}
              className="
                group/book
                flex
                w-full
                items-center
                justify-between
                gap-4
                text-left
                outline-none
              "
            >
              <div
                className="
                  flex
                  items-center
                  gap-2.5
                "
              >
                <motion.span
                  animate={{
                    x: isHovered
                      ? 3
                      : 0,
                  }}
                  transition={{
                    duration: 0.3,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="
                    text-sm
                    font-bold
                    text-zinc-300
                    transition-colors
                    duration-300
                    group-hover/book:text-white
                  "
                >
                  Book {sport.name}
                </motion.span>

                <motion.span
                  animate={{
                    opacity:
                      isHovered
                        ? 1
                        : 0,

                    x:
                      isHovered
                        ? 0
                        : -6,
                  }}
                  transition={{
                    duration: 0.25,
                  }}
                  className="
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-[0.18em]
                    text-emerald-400
                  "
                >
                  Reserve
                </motion.span>
              </div>

              {/* =================================================
                  NEW ANIMATED ARROW
              ================================================= */}

              <motion.span
                whileHover={{
                  scale: 1.12,
                }}
                whileTap={{
                  scale: 0.9,
                }}
                animate={{
                  x: isHovered
                    ? 2
                    : 0,

                  boxShadow: isHovered
                    ? "0 0 0 6px rgba(16,185,129,0.06), 0 0 30px rgba(16,185,129,0.18)"
                    : "0 0 0 0 rgba(16,185,129,0)",
                }}
                transition={{
                  duration: 0.3,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="
                  relative
                  flex
                  h-11
                  w-11
                  shrink-0
                  items-center
                  justify-center
                  overflow-hidden
                  rounded-full
                  border
                  border-zinc-800
                  bg-zinc-900/80
                  text-zinc-500
                  transition-all
                  duration-300
                  group-hover/book:border-emerald-400/60
                  group-hover/book:bg-emerald-500
                  group-hover/book:text-black
                "
              >
                {/* rotating ring */}

                <motion.span
                  animate={{
                    rotate:
                      isHovered
                        ? 360
                        : 0,

                    opacity:
                      isHovered
                        ? 1
                        : 0,
                  }}
                  transition={{
                    rotate: {
                      duration: 2.5,
                      repeat:
                        isHovered
                          ? Infinity
                          : 0,
                      ease: "linear",
                    },

                    opacity: {
                      duration: 0.25,
                    },
                  }}
                  className="
                    pointer-events-none
                    absolute
                    -inset-1
                    rounded-full
                    border
                    border-dashed
                    border-emerald-300/50
                  "
                />

                {/* inner glow */}

                <motion.span
                  animate={{
                    scale:
                      isHovered
                        ? [1, 1.18, 1]
                        : 1,

                    opacity:
                      isHovered
                        ? [0.1, 0.25, 0.1]
                        : 0,
                  }}
                  transition={{
                    duration: 1.8,
                    repeat:
                      isHovered
                        ? Infinity
                        : 0,
                    ease: "easeInOut",
                  }}
                  className="
                    pointer-events-none
                    absolute
                    inset-1
                    rounded-full
                    bg-emerald-400
                    blur-md
                  "
                />

                {/* arrow */}

                <motion.span
                  animate={{
                    x: isHovered
                      ? 2
                      : 0,
                  }}
                  transition={{
                    duration: 0.3,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="
                    relative
                    z-10
                  "
                >
                  <ArrowRight
                    size={19}
                    strokeWidth={2.4}
                  />
                </motion.span>
              </motion.span>
            </Link>
          </div>
        </div>

        {/* =====================================================
            CORNER SPARKLE
        ===================================================== */}

        <motion.div
          animate={{
            opacity: isHovered
              ? 1
              : 0,

            scale: isHovered
              ? 1
              : 0.5,

            rotate: isHovered
              ? 0
              : -20,
          }}
          transition={{
            duration: 0.35,
          }}
          className="
            pointer-events-none
            absolute
            bottom-3
            right-3
          "
        >
          <Sparkles
            size={13}
            className="
              text-emerald-400/60
            "
          />
        </motion.div>
      </motion.div>
    </motion.article>
  );
}

/* =============================================================
   STATUS PILL
============================================================= */

function StatusPill({
  label,
  type,
  isActive,
}: {
  label: string;
  type: "emerald" | "orange" | "red";
  isActive: boolean;
}) {
  const styles = {
    emerald:
      "border-emerald-500/30 bg-emerald-500/5 text-emerald-400",

    orange:
      "border-orange-500/30 bg-orange-500/5 text-orange-400",

    red:
      "border-red-500/30 bg-red-500/5 text-red-400",
  };

  const dotStyles = {
    emerald:
      "bg-emerald-400",

    orange:
      "bg-orange-400",

    red:
      "bg-red-400",
  };

  return (
    <motion.div
      animate={{
        scale: isActive
          ? 1.04
          : 1,
      }}
      transition={{
        duration: 0.25,
      }}
      className={`
        flex
        shrink-0
        items-center
        gap-2
        rounded-full
        border
        px-3
        py-1.5
        text-[10px]
        font-bold
        tracking-wide
        ${styles[type]}
      `}
    >
      <motion.span
        animate={{
          scale: [
            1,
            1.25,
            1,
          ],

          opacity: [
            0.6,
            1,
            0.6,
          ],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className={`
          h-1.5
          w-1.5
          rounded-full
          ${dotStyles[type]}
        `}
      />

      {label}
    </motion.div>
  );
}