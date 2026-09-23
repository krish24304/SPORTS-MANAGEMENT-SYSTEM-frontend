"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import {
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Clock3,
  Dumbbell,
  Goal,
  LockKeyhole,
  Package,
  ShieldCheck,
  Table2,
  Trophy,
  Wrench,
  X,
} from "lucide-react";

import { AnimatePresence, motion } from "framer-motion";

import DashboardLayout from "@/components/layout/DashboardLayout";
import SportsCarousel from "@/components/ui/SportsCarousel";
import { studentApi } from "@/lib/student-api";
import type { Sport as ApiSport } from "@/types";

type ResourceUnit = {
  id: number;
  name: string;
  status: string;
};

type ResourceType = {
  id: number;
  name: string;
  total: number;
  available: number;
  units: ResourceUnit[];
};

type Sport = {
  id: number;
  name: string;
  status: string;
  totalGear: number;
  availableGear: number;
  resourceTypes: ResourceType[];
  hasSlotSystem?: boolean;
  slotDurationMinutes?: number;
  maintenance?: boolean;
  maintenanceMessage?: string | null;
};

/* =========================================================
   ADAPT LIVE API SPORT -> DASHBOARD SPORT SHAPE

   The dashboard UI (SportsCarousel/SportCard + the availability
   modal below) was built around a flat `resourceTypes[]` list
   mixing real resources (courts/tables/...) and gear together.
   This adapts the real `/sports` response into that same shape
   instead of changing the UI, so real data (resource units, gear
   quantities, maintenance state) now flows through unchanged.
========================================================= */

function adaptSport(raw: ApiSport): Sport {
  const resourceUnits = Array.isArray(raw.resources) ? raw.resources : [];
  const gears = Array.isArray(raw.gears) ? raw.gears : [];

  const groups = new Map<string, ResourceUnit[]>();

  if (resourceUnits.length > 0) {
    for (const unit of resourceUnits) {
      const key = unit.type || raw.resourceType || "Resource";
      const list = groups.get(key) ?? [];
      list.push({ id: unit.id, name: unit.name, status: unit.status });
      groups.set(key, list);
    }
  } else {
    // No ResourceUnit rows created yet for this sport - fall back to the
    // totalCourts/availableCourts counts, same convention already used by
    // the sport detail page (app/sports/[id]/page.tsx `resourceRows`).
    const total = Math.max(0, Number(raw.totalCourts || 0));
    const available = Math.max(
      0,
      Math.min(Number(raw.availableCourts || 0), total)
    );

    if (total > 0) {
      const key = raw.resourceType || "Court";

      groups.set(
        key,
        Array.from({ length: total }, (_, index) => ({
          id: -(index + 1),
          name: `${key} ${index + 1}`,
          status: index < available ? "available" : "booked",
        }))
      );
    }
  }

  const resourceTypes: ResourceType[] = Array.from(
    groups.entries()
  ).map(([name, units], index) => ({
    id: index + 1,
    name,
    total: units.length,
    available: units.filter(
      (unit) => unit.status.toLowerCase() === "available"
    ).length,
    units,
  }));

  const equipmentTypes: ResourceType[] = gears.map((gear) => ({
    id: 100000 + gear.id,
    name: gear.name,
    total: gear.totalQuantity,
    available: gear.availableQuantity,
    units: [],
  }));

  const totalGear = gears.reduce(
    (sum, gear) => sum + gear.totalQuantity,
    0
  );

  const availableGear = gears.reduce(
    (sum, gear) => sum + gear.availableQuantity,
    0
  );

  const hasAvailableResource = resourceTypes.some(
    (resource) => resource.available > 0
  );

  const status = raw.maintenance
    ? "Maintenance"
    : hasAvailableResource || availableGear > 0
    ? "Available"
    : "Unavailable";

  return {
    id: raw.id,
    name: raw.name,
    status,
    totalGear,
    availableGear,
    resourceTypes: [...resourceTypes, ...equipmentTypes],
    hasSlotSystem: raw.hasSlotSystem,
    slotDurationMinutes: raw.slotDurationMinutes,
    maintenance: raw.maintenance,
    maintenanceMessage: raw.maintenanceMessage,
  };
}

/* =========================================================
   STATUS
========================================================= */

function getStatus(status: string) {
  const normalized = status.toLowerCase().replace(/[\_-]/g, " ");

  if (
    normalized.includes("maintenance") ||
    normalized.includes("maintain")
  ) {
    return {
      label: "Maintenance",
      icon: Wrench,
      dot: "bg-amber-400",
      text: "text-amber-300",
      border: "border-amber-500/20",
      bg: "bg-amber-500/[0.045]",
    };
  }

  if (
    normalized.includes("reserved") ||
    normalized.includes("reservation")
  ) {
    return {
      label: "Reserved",
      icon: LockKeyhole,
      dot: "bg-orange-400",
      text: "text-orange-300",
      border: "border-orange-500/20",
      bg: "bg-orange-500/[0.045]",
    };
  }

  if (
    normalized.includes("booked") ||
    normalized.includes("unavailable") ||
    normalized.includes("occupied")
  ) {
    return {
      label: "Booked",
      icon: ShieldCheck,
      dot: "bg-red-400",
      text: "text-red-300",
      border: "border-red-500/20",
      bg: "bg-red-500/[0.045]",
    };
  }

  return {
    label: "Available",
    icon: CheckCircle2,
    dot: "bg-emerald-400",
    text: "text-emerald-300",
    border: "border-emerald-400/20",
    bg: "bg-emerald-400/[0.045]",
  };
}

/* =========================================================
   RESOURCE / EQUIPMENT DETECTION
========================================================= */

function isEquipment(resource: ResourceType) {
  const name = resource.name.toLowerCase();

  return (
    name.includes("racket") ||
    name.includes("racquet") ||
    name.includes("shuttle") ||
    name.includes("ball") ||
    name.includes("bat") ||
    name.includes("stick") ||
    name.includes("paddle") ||
    name.includes("helmet") ||
    name.includes("glove") ||
    name.includes("equipment") ||
    name.includes("gear")
  );
}

/* =========================================================
   DYNAMIC RESOURCE ICON
========================================================= */

function getResourceIcon(name: string) {
  const normalized = name.toLowerCase();

  if (
    normalized.includes("table")
  ) {
    return Table2;
  }

  if (
    normalized.includes("court") ||
    normalized.includes("ground") ||
    normalized.includes("field")
  ) {
    return Goal;
  }

  if (
    normalized.includes("pool")
  ) {
    return CircleDot;
  }

  return Trophy;
}

/* =========================================================
   DYNAMIC EQUIPMENT ICON
========================================================= */

function getEquipmentIcon(name: string) {
  const normalized = name.toLowerCase();

  if (
    normalized.includes("racket") ||
    normalized.includes("racquet") ||
    normalized.includes("paddle")
  ) {
    return Dumbbell;
  }

  if (
    normalized.includes("ball") ||
    normalized.includes("shuttle")
  ) {
    return CircleDot;
  }

  if (
    normalized.includes("bat") ||
    normalized.includes("stick")
  ) {
    return Trophy;
  }

  return Package;
}

/* =========================================================
   EQUIPMENT LABEL
========================================================= */

function getEquipmentAvailabilityLabel(
  available: number,
  total: number
) {
  if (available <= 0) {
    return "Currently unavailable";
  }

  if (total > 0 && available / total <= 0.25) {
    return "Limited availability";
  }

  return "Available to book";
}

/* =========================================================
   STUDENT DASHBOARD
========================================================= */

export default function StudentDashboard() {
  const [sportsList, setSportsList] = useState<Sport[]>([]);
  const [sportsLoading, setSportsLoading] = useState(true);
  const [sportsError, setSportsError] = useState("");

  const [selectedSport, setSelectedSport] =
    useState<Sport | null>(null);

  const sport = selectedSport;

  /* =======================================================
     LOAD REAL SPORTS DATA
  ======================================================= */

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setSportsLoading(true);
        setSportsError("");

        const data = await studentApi.getSports();

        if (!cancelled) {
          setSportsList(
            Array.isArray(data) ? data.map(adaptSport) : []
          );
        }
      } catch (error) {
        if (!cancelled) {
          console.error(error);
          setSportsError("Unable to load sports right now.");
        }
      } finally {
        if (!cancelled) {
          setSportsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  /* =======================================================
     BODY SCROLL LOCK
  ======================================================= */

  useEffect(() => {
    if (!sport) return;

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [sport]);

  /* =======================================================
     DERIVED DATA
  ======================================================= */

  const resources = useMemo(() => {
    if (!sport) return [];

    return sport.resourceTypes.filter(
      (resource) => !isEquipment(resource)
    );
  }, [sport]);

  const equipment = useMemo(() => {
    if (!sport) return [];

    return sport.resourceTypes.filter(isEquipment);
  }, [sport]);

  const resourceUnits = useMemo(() => {
    return resources.flatMap(
      (resource) => resource.units ?? []
    );
  }, [resources]);

  const totalResources =
    resourceUnits.length;

  const availableResources =
    resourceUnits.filter(
      (unit) =>
        getStatus(unit.status).label ===
        "Available"
    ).length;

  const totalEquipment = equipment.reduce(
    (sum, resource) =>
      sum + resource.total,
    0
  );

  const availableEquipment =
    equipment.reduce(
      (sum, resource) =>
        sum + resource.available,
      0
    );

  return (
    <DashboardLayout title="Home">
      <div className="space-y-10">

        {/* =================================================
            NEXT BOOKING
        ================================================= */}

        <section>
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
                Your activity
              </p>

              <h2 className="mt-1 text-xl font-semibold text-white">
                Next Booking
              </h2>
            </div>

            <Link
              href="/my-bookings"
              className="
                hidden
                items-center
                gap-1
                text-sm
                text-zinc-500
                transition-colors
                hover:text-emerald-400
                sm:flex
              "
            >
              View all
              <ChevronRight size={15} />
            </Link>
          </div>

          <motion.div
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.4,
              ease: "easeOut",
            }}
            className="
              group
              relative
              overflow-hidden
              rounded-[24px]
              border
              border-zinc-800/80
              bg-[#090b0b]
              p-5
              shadow-[0_15px_45px_rgba(0,0,0,0.18)]
              transition-all
              duration-300
              hover:border-emerald-400/15
            "
          >
            <motion.div
              animate={{
                opacity: [0.35, 0.6, 0.35],
                scale: [0.9, 1, 0.9],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="
                pointer-events-none
                absolute
                -right-20
                -top-20
                h-40
                w-40
                rounded-full
                bg-emerald-400/[0.035]
                blur-3xl
              "
            />

            <div
              className="
                pointer-events-none
                absolute
                inset-x-0
                bottom-0
                h-px
                bg-gradient-to-r
                from-transparent
                via-emerald-400/10
                to-transparent
              "
            />

            <div
              className="
                relative
                flex
                flex-col
                justify-between
                gap-5
                md:flex-row
                md:items-center
              "
            >
              <div className="flex items-center gap-4">
                <motion.div
                  whileHover={{
                    scale: 1.06,
                    rotate: 2,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 350,
                    damping: 20,
                  }}
                  className="
                    flex
                    h-11
                    w-11
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-emerald-400/10
                    bg-emerald-400/[0.05]
                    text-emerald-400/80
                  "
                >
                  <CalendarCheck size={20} />
                </motion.div>

                <div>
                  <h3 className="font-semibold text-white">
                    Badminton
                  </h3>

                  <div
                    className="
                      mt-1
                      flex
                      flex-wrap
                      items-center
                      gap-3
                      text-sm
                      text-zinc-500
                    "
                  >
                    <span>Today</span>

                    <span className="text-zinc-700">
                      •
                    </span>

                    <span className="flex items-center gap-1">
                      <Clock3 size={13} />
                      5:30 PM – 6:30 PM
                    </span>
                  </div>
                </div>
              </div>

              <motion.span
                animate={{
                  y: [0, -1, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="
                  inline-flex
                  w-fit
                  items-center
                  gap-1.5
                  rounded-full
                  border
                  border-emerald-400/15
                  bg-emerald-400/[0.045]
                  px-3
                  py-1.5
                  text-xs
                  font-medium
                  text-emerald-300/80
                "
              >
                <CheckCircle2 size={13} />
                Confirmed
              </motion.span>
            </div>
          </motion.div>
        </section>

        {/* =================================================
            SPORTS
        ================================================= */}

        <section>
          {sportsError ? (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.04] p-6 text-center text-sm text-red-300">
              {sportsError}
            </div>
          ) : sportsLoading ? (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 text-center">
              <p className="text-sm text-zinc-500">Loading sports…</p>
            </div>
          ) : (
            <SportsCarousel
              sports={sportsList}
              onSportClick={(selected) => {
                setSelectedSport(selected);
              }}
            />
          )}
        </section>
      </div>

      {/* =====================================================
          SPORT AVAILABILITY MODAL
      ===================================================== */}

      <AnimatePresence>
        {sport && (
          <motion.div
            key="sport-modal"
            initial={{
              opacity: 0,
              backdropFilter: "blur(0px)",
            }}
            animate={{
              opacity: 1,
              backdropFilter: "blur(12px)",
            }}
            exit={{
              opacity: 0,
              backdropFilter: "blur(0px)",
            }}
            transition={{
              duration: 0.25,
              ease: "easeOut",
            }}
            className="
              fixed
              inset-0
              z-[100]
              flex
              items-center
              justify-center
              bg-black/80
              p-3
              sm:p-5
            "
            onClick={() =>
              setSelectedSport(null)
            }
          >
            {/* =============================================
                BACKGROUND GLOW
            ============================================= */}

            <motion.div
              initial={{
                opacity: 0,
                scale: 0.7,
              }}
              animate={{
                opacity: [0.08, 0.16, 0.08],
                scale: [0.85, 1.05, 0.85],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="
                pointer-events-none
                absolute
                h-[520px]
                w-[520px]
                rounded-full
                bg-emerald-400/[0.06]
                blur-[120px]
              "
            />

            {/* =============================================
                MODAL
            ============================================= */}

            <motion.div
              initial={{
                opacity: 0,
                y: 28,
                scale: 0.965,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: 20,
                scale: 0.975,
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 28,
                mass: 0.8,
              }}
              onClick={(event) =>
                event.stopPropagation()
              }
              className="
                relative
                flex
                max-h-[92vh]
                w-full
                max-w-2xl
                flex-col
                overflow-hidden
                rounded-[28px]
                border
                border-zinc-800/90
                bg-[#080b0a]
                shadow-[0_40px_120px_rgba(0,0,0,0.85)]
              "
            >

              {/* ===========================================
                  TOP ACCENT LINE
              =========================================== */}

              <motion.div
                initial={{
                  scaleX: 0,
                  opacity: 0,
                }}
                animate={{
                  scaleX: 1,
                  opacity: 1,
                }}
                transition={{
                  duration: 0.55,
                  delay: 0.05,
                  ease: "easeOut",
                }}
                className="
                  absolute
                  left-10
                  right-10
                  top-0
                  z-20
                  h-px
                  origin-center
                  bg-gradient-to-r
                  from-transparent
                  via-emerald-400/80
                  to-transparent
                "
              />

              {/* ===========================================
                  HEADER
              =========================================== */}

              <div
                className="
                  relative
                  shrink-0
                  border-b
                  border-zinc-800/70
                  px-6
                  py-6
                  sm:px-8
                "
              >
                <div className="relative flex items-start justify-between gap-5">

                  <div>
                    <motion.p
                      initial={{
                        opacity: 0,
                        x: -8,
                      }}
                      animate={{
                        opacity: 1,
                        x: 0,
                      }}
                      transition={{
                        delay: 0.1,
                        duration: 0.3,
                      }}
                      className="
                        text-[10px]
                        font-semibold
                        uppercase
                        tracking-[0.22em]
                        text-emerald-400
                      "
                    >
                      Sport availability
                    </motion.p>

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
                        delay: 0.14,
                        duration: 0.35,
                      }}
                      className="
                        mt-2
                        text-3xl
                        font-semibold
                        tracking-tight
                        text-white
                        sm:text-4xl
                      "
                    >
                      {sport.name}
                    </motion.h2>

                    <motion.p
                      initial={{
                        opacity: 0,
                        y: 5,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        delay: 0.18,
                        duration: 0.3,
                      }}
                      className="
                        mt-2
                        text-sm
                        text-zinc-500
                      "
                    >
                      Check what is available before booking.
                    </motion.p>
                  </div>

                  {/* ONLY CLOSE BUTTON */}

                  <motion.button
                    type="button"
                    onClick={() =>
                      setSelectedSport(null)
                    }
                    whileHover={{
                      scale: 1.07,
                      rotate: 4,
                    }}
                    whileTap={{
                      scale: 0.92,
                    }}
                    className="
                      flex
                      h-10
                      w-10
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      border
                      border-zinc-800
                      bg-zinc-950/80
                      text-zinc-500
                      transition-all
                      duration-200
                      hover:border-zinc-700
                      hover:bg-zinc-900
                      hover:text-white
                    "
                    aria-label="Close sport availability"
                  >
                    <X size={18} />
                  </motion.button>
                </div>

                {/* SLOT SYSTEM */}

                <motion.div
                  initial={{
                    opacity: 0,
                    y: 7,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: 0.23,
                    duration: 0.3,
                  }}
                  className="
                    mt-5
                    flex
                    items-center
                    gap-2
                  "
                >
                  <motion.span
                    animate={
                      sport.hasSlotSystem
                        ? {
                            opacity: [0.55, 1, 0.55],
                            scale: [1, 1.15, 1],
                          }
                        : undefined
                    }
                    transition={{
                      duration: 2.2,
                      repeat: Infinity,
                    }}
                    className={`
                      h-1.5
                      w-1.5
                      rounded-full
                      ${
                        sport.hasSlotSystem
                          ? "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.7)]"
                          : "bg-zinc-600"
                      }
                    `}
                  />

                  <span
                    className={`
                      text-xs
                      font-medium
                      ${
                        sport.hasSlotSystem
                          ? "text-emerald-300"
                          : "text-zinc-500"
                      }
                    `}
                  >
                    Slot system{" "}
                    {sport.hasSlotSystem
                      ? "on"
                      : "off"}
                  </span>

                  {sport.hasSlotSystem &&
                    sport.slotDurationMinutes && (
                      <>
                        <span className="text-zinc-800">
                          •
                        </span>

                        <span className="text-xs text-zinc-600">
                          {sport.slotDurationMinutes} min slots
                        </span>
                      </>
                    )}
                </motion.div>
              </div>

              {/* ===========================================
                  SCROLLABLE CONTENT
              =========================================== */}

              <div
                className="
                  min-h-0
                  flex-1
                  overflow-y-auto
                  px-6
                  py-6
                  sm:px-8
                "
              >
                <div className="space-y-8">

                  {/* =======================================
                      COMPACT AVAILABILITY SUMMARY
                  ======================================= */}

                  <motion.div
                    initial={{
                      opacity: 0,
                      y: 8,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      delay: 0.26,
                      duration: 0.35,
                    }}
                    className="
                      flex
                      flex-wrap
                      items-center
                      gap-x-5
                      gap-y-2
                      border-b
                      border-zinc-900
                      pb-5
                    "
                  >
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs text-zinc-500">
                        Resources
                      </span>

                      <span className="text-sm font-semibold text-white">
                        {availableResources}
                        <span className="text-zinc-700">
                          {" "}
                          / {totalResources}
                        </span>
                      </span>
                    </div>

                    <span className="text-zinc-800">
                      •
                    </span>

                    <div className="flex items-baseline gap-2">
                      <span className="text-xs text-zinc-500">
                        Equipment
                      </span>

                      <span className="text-sm font-semibold text-white">
                        {availableEquipment}
                        <span className="text-zinc-700">
                          {" "}
                          / {totalEquipment}
                        </span>
                      </span>
                    </div>
                  </motion.div>

                  {/* =======================================
                      RESOURCES
                  ======================================= */}

                  {resources.length > 0 && (
                    <section>
                      <motion.div
                        initial={{
                          opacity: 0,
                          y: 8,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        transition={{
                          delay: 0.3,
                          duration: 0.3,
                        }}
                        className="
                          mb-4
                          flex
                          items-end
                          justify-between
                        "
                      >
                        <div>
                          <p
                            className="
                              text-[10px]
                              font-semibold
                              uppercase
                              tracking-[0.2em]
                              text-zinc-500
                            "
                          >
                            Resources
                          </p>

                          <p className="mt-1 text-xs text-zinc-700">
                            Individual availability
                          </p>
                        </div>

                        <span className="text-xs text-zinc-600">
                          <span className="text-emerald-400">
                            {availableResources}
                          </span>{" "}
                          / {totalResources}
                        </span>
                      </motion.div>

                      <div className="space-y-2">
                        {resources.flatMap(
                          (resource) =>
                            (resource.units ?? []).map(
                              (unit, index) => {
                                const state =
                                  getStatus(
                                    unit.status
                                  );

                                const StatusIcon =
                                  state.icon;

                                const ResourceIcon =
                                  getResourceIcon(
                                    resource.name
                                  );

                                return (
                                  <motion.div
                                    key={unit.id}
                                    initial={{
                                      opacity: 0,
                                      x: -14,
                                    }}
                                    animate={{
                                      opacity: 1,
                                      x: 0,
                                    }}
                                    transition={{
                                      delay:
                                        0.34 +
                                        index * 0.065,
                                      duration: 0.32,
                                      ease: "easeOut",
                                    }}
                                    whileHover={{
                                      x: 3,
                                      borderColor:
                                        "rgba(63,63,70,0.9)",
                                    }}
                                    className={`
                                      group
                                      relative
                                      flex
                                      min-h-[72px]
                                      items-center
                                      justify-between
                                      gap-4
                                      overflow-hidden
                                      rounded-2xl
                                      border
                                      border-zinc-800/70
                                      bg-zinc-950/45
                                      px-4
                                      py-3
                                      transition-colors
                                      duration-300
                                      ${state.bg}
                                    `}
                                  >
                                    {/* subtle hover glow */}

                                    <div
                                      className="
                                        pointer-events-none
                                        absolute
                                        inset-y-0
                                        left-0
                                        w-20
                                        bg-gradient-to-r
                                        from-white/[0.025]
                                        to-transparent
                                        opacity-0
                                        transition-opacity
                                        duration-300
                                        group-hover:opacity-100
                                      "
                                    />

                                    <div className="relative flex min-w-0 items-center gap-3">

                                      {/* RESOURCE ICON */}

                                      <motion.div
                                        whileHover={{
                                          scale: 1.05,
                                          rotate: 2,
                                        }}
                                        className="
                                          flex
                                          h-10
                                          w-10
                                          shrink-0
                                          items-center
                                          justify-center
                                          rounded-xl
                                          border
                                          border-emerald-400/10
                                          bg-emerald-400/[0.055]
                                          text-emerald-400
                                        "
                                      >
                                        <ResourceIcon
                                          size={18}
                                          strokeWidth={1.7}
                                        />
                                      </motion.div>

                                      <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                          <motion.span
                                            animate={
                                              state.label ===
                                              "Available"
                                                ? {
                                                    opacity: [
                                                      0.55,
                                                      1,
                                                      0.55,
                                                    ],
                                                  }
                                                : undefined
                                            }
                                            transition={{
                                              duration: 2.4,
                                              repeat: Infinity,
                                            }}
                                            className={`
                                              h-1.5
                                              w-1.5
                                              shrink-0
                                              rounded-full
                                              ${state.dot}
                                            `}
                                          />

                                          <p className="truncate text-sm font-medium text-zinc-200">
                                            {unit.name}
                                          </p>
                                        </div>

                                        <p className="mt-1 text-[11px] text-zinc-600">
                                          {resource.name}
                                        </p>
                                      </div>
                                    </div>

                                    {/* STATUS */}

                                    <div
                                      className={`
                                        relative
                                        inline-flex
                                        shrink-0
                                        items-center
                                        gap-1.5
                                        rounded-full
                                        border
                                        px-2.5
                                        py-1.5
                                        text-[10px]
                                        font-semibold
                                        ${state.border}
                                        ${state.text}
                                      `}
                                    >
                                      <StatusIcon size={12} />

                                      {state.label}
                                    </div>
                                  </motion.div>
                                );
                              }
                            )
                        )}
                      </div>
                    </section>
                  )}

                  {/* =======================================
                      EQUIPMENT
                  ======================================= */}

                  {equipment.length > 0 && (
                    <section>
                      <motion.div
                        initial={{
                          opacity: 0,
                          y: 8,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        transition={{
                          delay:
                            0.4 +
                            Math.min(
                              resourceUnits.length,
                              4
                            ) *
                              0.035,
                          duration: 0.3,
                        }}
                        className="
                          mb-4
                          flex
                          items-end
                          justify-between
                        "
                      >
                        <div>
                          <p
                            className="
                              text-[10px]
                              font-semibold
                              uppercase
                              tracking-[0.2em]
                              text-zinc-500
                            "
                          >
                            Equipment
                          </p>

                          <p className="mt-1 text-xs text-zinc-700">
                            Quantity available for booking
                          </p>
                        </div>

                        <span className="text-xs text-zinc-600">
                          <span className="text-emerald-400">
                            {availableEquipment}
                          </span>{" "}
                          / {totalEquipment}
                        </span>
                      </motion.div>

                      <div className="space-y-2">
                        {equipment.map(
                          (item, index) => {
                            const ratio =
                              item.total > 0
                                ? Math.min(
                                    item.available /
                                      item.total,
                                    1
                                  )
                                : 0;

                            const available =
                              item.available > 0;

                            const EquipmentIcon =
                              getEquipmentIcon(
                                item.name
                              );

                            return (
                              <motion.div
                                key={item.id}
                                initial={{
                                  opacity: 0,
                                  y: 12,
                                }}
                                animate={{
                                  opacity: 1,
                                  y: 0,
                                }}
                                transition={{
                                  delay:
                                    0.45 +
                                    index * 0.08,
                                  duration: 0.34,
                                  ease: "easeOut",
                                }}
                                whileHover={{
                                  y: -1,
                                }}
                                className="
                                  group
                                  relative
                                  overflow-hidden
                                  rounded-2xl
                                  border
                                  border-zinc-800/70
                                  bg-zinc-950/45
                                  p-4
                                  transition-all
                                  duration-300
                                  hover:border-zinc-700
                                  hover:bg-zinc-950/70
                                "
                              >
                                <div className="flex items-center justify-between gap-4">

                                  <div className="flex min-w-0 items-center gap-3">

                                    {/* EQUIPMENT ICON */}

                                    <motion.div
                                      whileHover={{
                                        scale: 1.05,
                                        rotate: -2,
                                      }}
                                      transition={{
                                        type: "spring",
                                        stiffness: 350,
                                        damping: 18,
                                      }}
                                      className="
                                        flex
                                        h-10
                                        w-10
                                        shrink-0
                                        items-center
                                        justify-center
                                        rounded-xl
                                        border
                                        border-emerald-400/10
                                        bg-emerald-400/[0.055]
                                        text-emerald-400
                                      "
                                    >
                                      <EquipmentIcon
                                        size={18}
                                        strokeWidth={1.7}
                                      />
                                    </motion.div>

                                    <div className="min-w-0">
                                      <p className="truncate text-sm font-medium text-zinc-200">
                                        {item.name}
                                      </p>

                                      <p className="mt-1 text-[10px] text-zinc-600">
                                        {getEquipmentAvailabilityLabel(
                                          item.available,
                                          item.total
                                        )}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="shrink-0 text-right">
                                    <span
                                      className={`
                                        text-sm
                                        font-semibold
                                        ${
                                          available
                                            ? "text-emerald-300"
                                            : "text-zinc-600"
                                        }
                                      `}
                                    >
                                      {item.available}
                                    </span>

                                    <span className="text-sm text-zinc-700">
                                      {" "}
                                      / {item.total}
                                    </span>
                                  </div>
                                </div>

                                {/* PROGRESS BAR */}

                                <div className="mt-4">
                                  <div
                                    className="
                                      relative
                                      h-1.5
                                      overflow-hidden
                                      rounded-full
                                      bg-zinc-900
                                    "
                                  >
                                    <motion.div
                                      initial={{
                                        width: 0,
                                      }}
                                      animate={{
                                        width: `${ratio * 100}%`,
                                      }}
                                      transition={{
                                        duration: 0.8,
                                        delay:
                                          0.52 +
                                          index * 0.08,
                                        ease: [
                                          0.22,
                                          1,
                                          0.36,
                                          1,
                                        ],
                                      }}
                                      className="
                                        relative
                                        h-full
                                        rounded-full
                                        bg-emerald-400/75
                                      "
                                    />

                                    {/* tiny shine */}

                                    {available && (
                                      <motion.div
                                        initial={{
                                          x: "-100%",
                                          opacity: 0,
                                        }}
                                        animate={{
                                          x: "200%",
                                          opacity: [
                                            0,
                                            0.45,
                                            0,
                                          ],
                                        }}
                                        transition={{
                                          duration: 1.2,
                                          delay:
                                            1.1 +
                                            index * 0.12,
                                          ease: "easeInOut",
                                        }}
                                        className="
                                          pointer-events-none
                                          absolute
                                          inset-y-0
                                          left-0
                                          w-1/4
                                          skew-x-[-20deg]
                                          bg-gradient-to-r
                                          from-transparent
                                          via-white/30
                                          to-transparent
                                        "
                                      />
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            );
                          }
                        )}
                      </div>
                    </section>
                  )}

                  {/* =======================================
                      MAINTENANCE NOTICE
                  ======================================= */}

                  {sport.maintenance &&
                    sport.maintenanceMessage && (
                      <motion.div
                        initial={{
                          opacity: 0,
                          y: 8,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        transition={{
                          delay: 0.55,
                          duration: 0.3,
                        }}
                        className="
                          rounded-2xl
                          border
                          border-amber-500/20
                          bg-amber-500/[0.045]
                          p-4
                        "
                      >
                        <div className="flex gap-3">
                          <Wrench
                            size={17}
                            className="
                              mt-0.5
                              shrink-0
                              text-amber-400
                            "
                          />

                          <div>
                            <p className="text-sm font-medium text-amber-300">
                              Maintenance notice
                            </p>

                            <p className="mt-1 text-xs leading-5 text-zinc-500">
                              {
                                sport.maintenanceMessage
                              }
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}

                  {/* bottom breathing space */}

                  <div className="h-1" />
                </div>
              </div>

              {/* ===========================================
                  FOOTER
              =========================================== */}

              <div
                className="
                  relative
                  shrink-0
                  border-t
                  border-zinc-800/80
                  bg-[#080b0a]
                  px-6
                  py-4
                  sm:px-8
                "
              >
                <motion.div
                  initial={{
                    opacity: 0,
                    scaleX: 0.5,
                  }}
                  animate={{
                    opacity: [0.2, 0.5, 0.2],
                    scaleX: [0.8, 1, 0.8],
                  }}
                  transition={{
                    duration: 3.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="
                    pointer-events-none
                    absolute
                    inset-x-12
                    top-0
                    h-px
                    origin-center
                    bg-emerald-400/60
                    blur-sm
                  "
                />

                {/* ONLY CTA */}

                <Link
                  href={`/sports/${sport.id}`}
                  className="
                    group
                    relative
                    flex
                    h-13
                    w-full
                    items-center
                    justify-center
                    gap-2.5
                    overflow-hidden
                    rounded-2xl
                    bg-emerald-400
                    px-5
                    py-3.5
                    text-sm
                    font-semibold
                    text-black
                    shadow-[0_10px_35px_rgba(16,185,129,0.12)]
                    transition-all
                    duration-300
                    hover:bg-emerald-300
                    hover:shadow-[0_14px_45px_rgba(16,185,129,0.22)]
                  "
                >
                  {/* CTA SHINE */}

                  <motion.span
                    initial={{
                      x: "-120%",
                    }}
                    animate={{
                      x: "120%",
                    }}
                    transition={{
                      duration: 2.2,
                      repeat: Infinity,
                      repeatDelay: 4,
                      ease: "easeInOut",
                    }}
                    className="
                      pointer-events-none
                      absolute
                      inset-y-0
                      left-0
                      w-1/4
                      skew-x-[-20deg]
                      bg-gradient-to-r
                      from-transparent
                      via-white/30
                      to-transparent
                    "
                  />

                  <span className="relative">
                    Book {sport.name}
                  </span>

                  <ArrowRight
                    size={17}
                    className="
                      relative
                      transition-transform
                      duration-300
                      group-hover:translate-x-1
                    "
                  />
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}