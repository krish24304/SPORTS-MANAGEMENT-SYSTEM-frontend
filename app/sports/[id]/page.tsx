
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useParams, useRouter } from "next/navigation";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useTransform,
} from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ClipboardList,
  Clock3,
  Dumbbell,
  Minus,
  Plus,
  ShieldAlert,
  X,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";

interface Slot {
  id: number;
  startTime: string;
  endTime: string;
  slotType: string;
  isBooked: boolean;
  bookedById?: number;
  isTeamReserved: boolean;
  teamName?: string;
}

interface Gear {
  id: number;
  name: string;
  description?: string;
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
  maintenanceMessage?: string | null;
  resourceType?: string;
  hasDynamicBooking?: boolean;
  hasTeamSlots?: boolean;
  gears: Gear[];
  resources?: Resource[];
  slots?: Slot[];
}

interface Booking {
  id: number;
  status: string;
  sport?: {
    id?: number;
    name: string;
  };
  slot?: Slot;
  bookedAt?: string;
}

type Accent = {
  key: string;
  soft: string;
  border: string;
  text: string;
  bg: string;
  glow: string;
  solid: string;
  rgb: string;
};

type BookingTarget =
  | { type: "slot"; slot: Slot }
  | { type: "gear" }
  | null;

type ResourceVisualStatus = "available" | "booked" | "maintenance" | "reserved";
type SportVisualKind =
  | "cricket"
  | "badminton"
  | "tennis"
  | "basketball"
  | "football"
  | "volleyball"
  | "table-tennis"
  | "baseball"
  | "hockey"
  | "golf"
  | "swimming"
  | "combat"
  | "athletics"
  | "default";

function getSportVisualKind(sportName: string): SportVisualKind {
  const name = sportName.trim().toLowerCase();

  if (
    name.includes("cricket") ||
    name.includes("indoor cricket")
  ) {
    return "cricket";
  }

  if (
    name.includes("badminton") ||
    name.includes("shuttle")
  ) {
    return "badminton";
  }

  if (
    name.includes("table tennis") ||
    name.includes("ping pong")
  ) {
    return "table-tennis";
  }

  if (
    name.includes("tennis") ||
    name.includes("pickleball")
  ) {
    return "tennis";
  }

  if (
    name.includes("basketball") ||
    name.includes("netball")
  ) {
    return "basketball";
  }

  if (
    name.includes("football") ||
    name.includes("soccer") ||
    name.includes("futsal")
  ) {
    return "football";
  }

  if (
    name.includes("volleyball") ||
    name.includes("beach volleyball")
  ) {
    return "volleyball";
  }

  if (
    name.includes("baseball") ||
    name.includes("softball")
  ) {
    return "baseball";
  }

  if (
    name.includes("hockey") ||
    name.includes("field hockey")
  ) {
    return "hockey";
  }

  if (
    name.includes("golf")
  ) {
    return "golf";
  }

  if (
    name.includes("swimming") ||
    name.includes("swim")
  ) {
    return "swimming";
  }

  if (
    name.includes("boxing") ||
    name.includes("mma") ||
    name.includes("wrestling") ||
    name.includes("karate") ||
    name.includes("judo") ||
    name.includes("taekwondo")
  ) {
    return "combat";
  }

  if (
    name.includes("athletics") ||
    name.includes("running") ||
    name.includes("track") ||
    name.includes("sprint")
  ) {
    return "athletics";
  }

  return "default";
}

const API_BASE = "http://localhost:5000";

const AQUA_PAGE_THEME: Accent = {
  key: "aqua",
  soft: "rgba(74,225,255,0.10)",
  border: "rgba(74,225,255,0.30)",
  text: "#72eaff",
  bg: "rgba(74,225,255,0.07)",
  glow: "rgba(74,225,255,0.20)",
  solid: "#4ae1ff",
  rgb: "74,225,255",
};

const NEON_MINT_PAGE_THEME: Accent = {
  key: "neon-green",
  solid: "#39FF14",
text: "#39FF14",
border: "rgba(57,255,20,0.30)",
soft: "rgba(57,255,20,0.10)",
bg: "rgba(57,255,20,0.06)",
glow: "rgba(57,255,20,0.18)",
rgb: "57,255,20",
};

function normalizeStatus(status: string): ResourceVisualStatus {
  const value = status.trim().toLowerCase().replace(/[\s-]+/g, "_");

  if (value.includes("maintenance")) return "maintenance";
  if (value.includes("reserved") || value.includes("team")) return "reserved";
  if (value.includes("book")) return "booked";
  return "available";
}

function statusLabel(status: ResourceVisualStatus) {
  if (status === "maintenance") return "MAINTENANCE";
  if (status === "reserved") return "RESERVED";
  if (status === "booked") return "BOOKED";
  return "AVAILABLE";
}

function statusClass(status: ResourceVisualStatus) {
  if (status === "maintenance") return "text-amber-300";
  if (status === "reserved") return "text-orange-300";
  if (status === "booked") return "text-red-300";
  return "text-[#a8f0b0]";
}

function statusDotClass(status: ResourceVisualStatus) {
  if (status === "maintenance") return "bg-amber-400";
  if (status === "reserved") return "bg-orange-400";
  if (status === "booked") return "bg-red-400";
  return "bg-[#a8f0b0]";
}

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function slotUnavailable(slot: Slot) {
  return (
    slot.isBooked ||
    slot.isTeamReserved ||
    slot.slotType?.toLowerCase() === "team_reserved"
  );
}
function ResourceIcon() {
  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-zinc-800 bg-[#07111d]">
      <svg
        viewBox="0 0 48 48"
        className="h-7 w-7 text-zinc-400"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
      >
        <rect x="9" y="7" width="30" height="34" rx="3" />
        <path d="M16 7v34M32 7v34M9 16h30M9 32h30" />
        <path d="M16 16l16 16M32 16L16 32" opacity=".45" />
      </svg>
    </div>
  );
}

export default function SportDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const sportId = String(params?.id ?? "").trim();

  const [sport, setSport] = useState<Sport | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [pageError, setPageError] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [selectedGear, setSelectedGear] = useState<Record<number, number>>({});
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [bookingTarget, setBookingTarget] = useState<BookingTarget>(null);

  const [slotPopupOpen, setSlotPopupOpen] = useState(false);
  const [slotMode, setSlotMode] = useState<"all" | "available">("all");

  const [bookingLoading, setBookingLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [bookingHistory, setBookingHistory] = useState<Booking[]>([]);
  const [bookingSummaryOpen, setBookingSummaryOpen] = useState(false);

  const accent = sport?.hasSlotSystem
  ? AQUA_PAGE_THEME
  : NEON_MINT_PAGE_THEME;

  const fetchSport = useCallback(async () => {
    if (!sportId) return false;

    try {
      const response = await fetch(`${API_BASE}/sports/${sportId}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        setSport(null);
        setPageError(`Unable to load this sport (${response.status}).`);
        return false;
      }

      const data = (await response.json()) as Sport;
      setSport(data);
      setPageError("");
      return true;
    } catch {
      setSport(null);
      setPageError(
        "The sports server could not be reached. Make sure your Express backend is running on port 5000."
      );
      return false;
    }
  }, [sportId]);

  const fetchSlots = useCallback(async () => {
    if (!sportId) return;

    try {
      setSlotsLoading(true);

      const response = await fetch(
        `${API_BASE}/sports/${sportId}/available-slots`,
        { cache: "no-store" }
      );

      if (!response.ok) {
        setSlots([]);
        return;
      }

      const data = await response.json();
      setSlots(Array.isArray(data) ? data : []);
    } catch {
      setSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  }, [sportId]);

  const fetchBookings = useCallback(async (currentSportId?: number) => {
    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) return;

      const user = JSON.parse(storedUser);
      if (!user?.id) return;

      const response = await fetch(
        `${API_BASE}/users/${user.id}/bookings`,
        { cache: "no-store" }
      );

      if (!response.ok) return;

      const data = await response.json();
      if (!Array.isArray(data)) return;

      setBookingHistory(data);

      const sportNumber = currentSportId ?? sport?.id;
      const active = data.find(
        (item: Booking) =>
          item.sport?.id === sportNumber &&
          (item.status === "Active" || item.status === "Return Pending")
      );

      setActiveBooking(active || null);
    } catch {
      // Booking history is secondary UI; don't block the sport page.
    }
  }, [sport?.id]);

  useEffect(() => {
    if (!sportId) {
      setLoading(false);
      setPageError("No sport was selected.");
      return;
    }

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setPageError("");

      const sportLoaded = await fetchSport();
      if (cancelled) return;

      await Promise.all([fetchSlots(), fetchBookings()]);
      if (cancelled) return;

      if (!sportLoaded) {
        setPageError((current) =>
          current || "This sport could not be loaded."
        );
      }

      setLoading(false);
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [sportId, fetchSport, fetchSlots, fetchBookings]);

  useEffect(() => {
    if (!sportId || !sport?.hasSlotSystem) return;

    const interval = window.setInterval(() => {
      fetchSlots();
    }, 30000);

    return () => window.clearInterval(interval);
  }, [sportId, sport?.hasSlotSystem, fetchSlots]);

  const availableCourtCount = Math.max(
    0,
    Math.min(Number(sport?.availableCourts || 0), Number(sport?.totalCourts || 0))
  );

  const totalCourtCount = Math.max(0, Number(sport?.totalCourts || 0));

  const resourceRows = useMemo(() => {
    const resources = sport?.resources || [];

    if (resources.length > 0) {
      return resources.map((resource) => ({
        ...resource,
        visualStatus: normalizeStatus(resource.status),
      }));
    }

    return Array.from({ length: totalCourtCount }, (_, index) => ({
      id: -(index + 1),
      name: `Court ${index + 1}`,
      type: sport?.resourceType || "Court",
      status: index < availableCourtCount ? "available" : "booked",
      maintenanceMessage: null,
      visualStatus:
        index < availableCourtCount ? ("available" as const) : ("booked" as const),
    }));
  }, [sport?.resources, sport?.resourceType, totalCourtCount, availableCourtCount]);

  const availableSlotCount = slots.filter((slot) => !slotUnavailable(slot)).length;
  const teamReservedSlotCount = slots.filter(
    (slot) =>
      slot.isTeamReserved || slot.slotType?.toLowerCase() === "team_reserved"
  ).length;

  const visibleSlots = useMemo(() => {
    if (slotMode === "available") {
      return slots.filter((slot) => !slotUnavailable(slot));
    }
    return slots;
  }, [slots, slotMode]);

  const selectedGearCount = Object.values(selectedGear).reduce(
    (sum, value) => sum + value,
    0
  );

  const availableGearCount = (sport?.gears || []).filter(
    (gear) => gear.availableQuantity > 0
  ).length;

  const overallAvailable =
    !sport?.maintenance &&
    (availableCourtCount > 0 ||
      resourceRows.some((resource) => resource.visualStatus === "available") ||
      availableGearCount > 0);

  const bookingReady =
  !sport?.maintenance &&
  (Boolean(selectedResource) || selectedGearCount > 0) &&
  (sport?.hasSlotSystem ? Boolean(selectedSlot) : true);

  const increaseQuantity = (gearId: number, available: number) => {
    setSelectedGear((previous) => {
      const current = previous[gearId] || 0;
      if (current >= available) return previous;

      return {
        ...previous,
        [gearId]: current + 1,
      };
    });
  };

  const decreaseQuantity = (gearId: number) => {
    setSelectedGear((previous) => {
      const current = previous[gearId] || 0;
      if (current <= 0) return previous;

      return {
        ...previous,
        [gearId]: current - 1,
      };
    });
  };

  const submitBooking = async () => {
    if (bookingLoading || cancelLoading || !sport) return;

    try {
      setBookingLoading(true);
      setErrorMessage("");

      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        throw new Error("Please login first.");
      }

      const user = JSON.parse(storedUser);
      if (!user?.id) {
        throw new Error("Please login first.");
      }

      if (sport.maintenance) {
        throw new Error("This sport is currently under maintenance.");
      }

      const gearsBooked = Object.entries(selectedGear)
        .filter(([, quantity]) => Number(quantity) > 0)
        .map(([gearId, quantity]) => ({
          gearId: Number(gearId),
          quantity: Number(quantity),
        }));

      const resourcesBooked = selectedResource
  ? [{
      resourceId: selectedResource.id,
      name: selectedResource.name,
      type: selectedResource.type || sport.resourceType || "Court",
    }]
  : [];

      if (sport.hasSlotSystem) {
        if (!selectedSlot) {
          setSlotPopupOpen(true);
          throw new Error("Choose an available slot first.");
        }

        const response = await fetch(`${API_BASE}/bookings/slot`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            sportId: sport.id,
            slotId: selectedSlot.id,
            gearsBooked,
            resourcesBooked,
            notes: "",
          }),
        });

        const data = await safeJson(response);
        if (!response.ok) {
          throw new Error(
            data?.message || data?.error || "Booking failed. Please try again."
          );
        }

        setSuccessMessage("Your slot has been booked successfully.");
      } else {
        if (gearsBooked.length === 0 && !selectedResource) {
          throw new Error("Select a resource or equipment before booking.");
        }

        const response = await fetch(`${API_BASE}/bookings/gear`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            sportId: sport.id,
            gearsBooked,
            resourcesBooked,
            notes: "",
          }),
        });

        const data = await safeJson(response);
        if (!response.ok) {
          throw new Error(
            data?.message || data?.error || "Booking failed. Please try again."
          );
        }

        setSuccessMessage("Your equipment request has been submitted.");
      }

      setSelectedGear({});
      setSelectedSlot(null);
      setSelectedResource(null);
      setBookingTarget(null);

      await Promise.all([fetchSport(), fetchSlots(), fetchBookings(sport.id)]);

      window.setTimeout(() => setSuccessMessage(""), 4000);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Booking failed. Please try again."
      );
    } finally {
      setBookingLoading(false);
    }
  };

  const cancelBooking = async (bookingId: number) => {
    if (cancelLoading || bookingLoading) return;

    try {
      setCancelLoading(true);
      setErrorMessage("");

      const response = await fetch(`${API_BASE}/bookings/${bookingId}/cancel`, {
        method: "POST",
      });

      const data = await safeJson(response);
      if (!response.ok) {
        throw new Error(
          data?.message || data?.error || "Unable to cancel booking."
        );
      }

      setSuccessMessage(data?.message || "Booking cancelled successfully.");
      await Promise.all([fetchSport(), fetchSlots(), fetchBookings(sport?.id)]);
      window.setTimeout(() => setSuccessMessage(""), 4000);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Cancellation failed. Please try again."
      );
    } finally {
      setCancelLoading(false);
    }
  };

  if (loading && !sport) {
    return <LoadingState />;
  }

  if (!sport) {
    return (
      <main className="min-h-screen bg-[#040b16] text-white">
        <Navbar onOpenMobileSidebar={() => {}} />
        <div className="mx-auto max-w-5xl px-5 py-16 md:px-8">
          <button
            onClick={() => router.push("/sports")}
            className="mb-10 inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-white"
          >
            <ArrowLeft size={17} />
            Back to Sports
          </button>

          <div className="relative overflow-hidden rounded-[2rem] border border-red-500/20 bg-[#081827] p-8 md:p-12">
            <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-red-500/5 blur-3xl" />
            <div className="relative">
              <p className="mb-3 text-xs font-black uppercase tracking-[0.28em] text-red-400">
                Sport unavailable
              </p>
              <h1 className="text-3xl font-black md:text-5xl">Unable to open sport</h1>
              <p className="mt-4 max-w-2xl text-zinc-500">
                {pageError || "The requested sport could not be loaded."}
              </p>
              <p className="mt-3 text-xs text-zinc-700">
                Requested route: /sports/{sportId || "unknown"}
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen overflow-x-hidden bg-[#030507] text-white"
      style={{
        "--sport-accent": accent.text,
        "--sport-solid": accent.solid,
        "--sport-rgb": accent.rgb,
      } as React.CSSProperties}
    >
      <Navbar onOpenMobileSidebar={() => {}} />

      <div className="mx-auto max-w-7xl px-5 pb-20 pt-7 md:px-8 md:pt-10">
        <motion.button
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.push("/sports")}
          className="group mb-8 inline-flex items-center gap-2 text-sm font-semibold text-zinc-500 transition hover:text-white"
        >
          <motion.span whileHover={{ x: -3 }}>
            <ArrowLeft size={17} />
          </motion.span>
          Back
        </motion.button>

        {/* ============================================================
            HERO — SAME APP, NEW SPORT ACCENT
        ============================================================ */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="relative mb-6 overflow-hidden rounded-[1.5rem] border bg-[#05090a] px-6 py-6 md:px-8 md:py-7"
style={{ borderColor: accent.border }}
>
          <motion.div
            initial={{ opacity: 0, scale: 0.75 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.1, ease: "easeOut" }}
            className="pointer-events-none absolute -right-28 -top-28 h-80 w-80 rounded-full blur-3xl"
            style={{ background: accent.glow }}
          />

          <motion.div
            animate={{
              x: [0, 12, 0],
              y: [0, -8, 0],
              opacity: [0.12, 0.22, 0.12],
            }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            className="pointer-events-none absolute right-24 top-16 h-24 w-24 rounded-full blur-2xl"
            style={{ background: accent.text }}
          />

          <div className="relative flex min-h-[230px] items-center justify-between gap-6 md:flex-row">
            <div className="max-w-3xl">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12, duration: 0.45 }}
                className="mb-4 flex flex-wrap items-center gap-2"
              >
                {sport.maintenance && (
                  <span className="rounded-full border border-amber-500/25 bg-amber-500/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-amber-300">
                    Maintenance
                  </span>
                )}
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.16, duration: 0.55 }}
                className="text-5xl font-black tracking-[-0.045em] md:text-7xl"
              >
                {sport.name}
              </motion.h1>

             
              {/* SMALL LIVE AVAILABILITY + TIME DOORWAY */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.38, duration: 0.5 }}
                className="mt-6 flex flex-wrap items-center gap-4"
              >
                
                {sport.hasSlotSystem && (
                  <motion.button
                    type="button"
                    onClick={() => {
                      setSlotMode("all");
                      setSlotPopupOpen(true);
                    }}
                    disabled={sport.maintenance}
                    whileHover={!sport.maintenance ? { scale: 1.05, y: -2 } : undefined}
                    whileTap={!sport.maintenance ? { scale: 0.94 } : undefined}
                    className="group relative flex h-12 w-12 items-center justify-center rounded-2xl border bg-[#071522] disabled:cursor-not-allowed disabled:opacity-40"
                    style={{
                      borderColor: accent.border,
                      boxShadow: `0 0 32px ${accent.glow}`,
                    }}
                    aria-label="Open time slots"
                  >
                    <motion.div
                      animate={{ rotate: [0, 2, -2, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      className="relative h-8 w-6"
                    >
                      <div
                        className="absolute left-1/2 top-0 h-5 w-5 -translate-x-1/2 rounded-full border-2"
                        style={{ borderColor: accent.text }}
                      />
                      <motion.div
                        animate={{ rotate: [-24, 24, -24] }}
                        transition={{ duration: 1.15, repeat: Infinity, ease: "easeInOut" }}
                        style={{ transformOrigin: "50% 0%" }}
                        className="absolute left-1/2 top-5 h-3.5 w-px -translate-x-1/2"
                      >
                        <span
                          className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full"
                          style={{ background: accent.text, boxShadow: `0 0 10px ${accent.text}` }}
                        />
                      </motion.div>
                    </motion.div>
                    <motion.span
                      animate={{ opacity: [0.12, 0.32, 0.12], scale: [0.9, 1.08, 0.9] }}
                      transition={{ duration: 2.4, repeat: Infinity }}
                      className="pointer-events-none absolute inset-0 rounded-2xl"
                      style={{ boxShadow: `inset 0 0 20px ${accent.glow}` }}
                    />
                  </motion.button>
                )}
              </motion.div>
            </div>

            <div className="hidden shrink-0 md:block">
  <SportHeroArtwork
    accent={accent}
    sportName={sport.name}
  />
</div>
          </div>
        </motion.section>

        {sport.maintenance && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -8 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            className="mb-8 overflow-hidden"
          >
            <div className="flex items-start gap-4 rounded-2xl border border-amber-500/20 bg-amber-500/[0.045] px-5 py-4">
              <div className="mt-0.5 rounded-xl bg-amber-500/10 p-2 text-amber-300">
                <ShieldAlert size={18} />
              </div>
              <div>
                <p className="text-sm font-bold text-amber-300">Maintenance notice</p>
                <p className="mt-1 text-sm leading-6 text-zinc-500">
                  {sport.maintenanceMessage ||
                    "This sport is temporarily unavailable."}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* ============================================================
            MAIN TWO-COLUMN EXPERIENCE
        ============================================================ */}
        <div className="grid items-start gap-6">
          {/* RESOURCES + EQUIPMENT */}
          <motion.section
            id="resources"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.55 }}
            className="relative overflow-hidden rounded-[2rem] border border-zinc-800/90 bg-[#081827]"
          >
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-px"
              style={{
                background: `linear-gradient(90deg, transparent, ${accent.text}, transparent)`,
                opacity: 0.35,
              }}
            />

            <div className="p-6 md:p-8">
              {/* RESOURCE HEADER */}
              <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className="rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em]"
                      style={{ borderColor: accent.border, background: accent.bg, color: accent.text }}
                    >
                      {sport.resourceType || "Court"}
                    </span>
                    <p className="text-[10px] font-black uppercase tracking-[0.28em] text-zinc-500">
                      Resources
                    </p>
                  </div>
                  <h2 className="mt-2 text-2xl font-black tracking-tight md:text-3xl">
                    Choose a resource
                  </h2>
                </div>

                <div className="flex items-center gap-3">
  <button
    type="button"
    aria-label="Open booking summary"
    onClick={() => setBookingSummaryOpen(true)}
    className="relative flex h-12 w-12 items-center justify-center rounded-2xl border bg-[#071522] transition hover:scale-105"
style={{
  borderColor: accent.border,
  color: accent.text,
  boxShadow: `0 0 30px ${accent.glow}`,
}}
  >
    <motion.div
  animate={{
    y: [0, -2, 0],
    rotate: [0, 2, -2, 0],
  }}
  transition={{
    duration: 2.8,
    repeat: Infinity,
    ease: "easeInOut",
  }}
  className="relative"
>
  <motion.div
    className="absolute -inset-2 rounded-full border"
style={{ borderColor: accent.border }}
    animate={{ scale: [0.9, 1.15, 0.9], opacity: [0.35, 0.7, 0.35] }}
    transition={{ duration: 2.2, repeat: Infinity }}
  />
  <ClipboardList size={24} strokeWidth={1.8} />
</motion.div>

    {(selectedResource || selectedSlot || selectedGearCount > 0) && (
      <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#a8f0b0] px-1 text-[9px] font-black text-[#06131d]">
        {Number(Boolean(selectedResource)) +
          Number(Boolean(selectedSlot)) +
          selectedGearCount}
      </span>
    )}
  </button>

  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-zinc-600">
    <span className="h-2 w-2 rounded-full bg-[#a8f0b0]" />
    {availableCourtCount}/{totalCourtCount}
  </div>
</div>
              </div>

              {/* COURTS — VERTICAL, CLEAN, NO GIANT BOXES */}
              <div className="overflow-hidden rounded-2xl border border-zinc-800/80">
                {resourceRows.length > 0 ? (
                  resourceRows.map((resource, index) => (
                    <motion.div
                      key={resource.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.045, duration: 0.35 }}
                      whileHover={{
                        x: 3,
                        backgroundColor: "rgba(255,255,255,0.018)",
                      }}
                     className="group border-b border-zinc-800/70 px-4 py-2.5 last:border-b-0 md:px-4"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex min-w-0 items-center gap-3">
  <ResourceIcon />

  <motion.span
                            animate={
                              resource.visualStatus === "available"
                                ? { scale: [1, 1.22, 1], opacity: [0.7, 1, 0.7] }
                                : { scale: 1, opacity: 1 }
                            }
                            transition={{
                              duration: 2.2,
                              repeat:
                                resource.visualStatus === "available" ? Infinity : 0,
                            }}
                            className={`h-2.5 w-2.5 shrink-0 rounded-full ${statusDotClass(
                              resource.visualStatus
                            )}`}
                          />

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="truncate text-sm font-bold text-zinc-100">
                                {resource.name}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                          <span
                            className={`hidden text-[10px] font-black uppercase tracking-[0.14em] sm:inline ${statusClass(
                              resource.visualStatus
                            )}`}
                          >
                            {statusLabel(resource.visualStatus)}
                          </span>

                          {resource.visualStatus === "available" ? (
                            selectedResource?.id === resource.id ? (
                              <>
                                <span className="hidden rounded-xl border px-3 py-2 text-[9px] font-black uppercase tracking-[0.14em] md:inline"
style={{
  borderColor: accent.border,
  background: accent.bg,
  color: accent.text,
}}>
                                  Selected
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setSelectedResource(null)}
                                  className="rounded-xl border border-zinc-800 bg-[#06111f]/85 px-3 py-2 text-[9px] font-black uppercase tracking-[0.14em] text-zinc-400 transition hover:text-white"
style={{
  borderColor: undefined,
}}
                                >
                                  Change
                                </button>                              </>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setSelectedResource(resource)}
                                className="rounded-xl border px-3 py-2 text-[9px] font-black uppercase tracking-[0.14em] transition hover:-translate-y-0.5"
                                style={{
                                  borderColor: accent.border,
                                  background: accent.bg,
                                  color: accent.text,
                                }}
                              >
                                {selectedResource ? "Change" : "Select"}
                              </button>
                            )
                          ) : (
                            <span
                              className={`text-[9px] font-black uppercase tracking-[0.14em] ${statusClass(
                                resource.visualStatus
                              )}`}
                            >
                              {statusLabel(resource.visualStatus)}
                            </span>
                          )}
                        </div>
                      </div>

                      {resource.maintenanceMessage &&
                        resource.visualStatus === "maintenance" && (
                          <p className="mt-2 pl-5 text-xs text-amber-300/70">
                            {resource.maintenanceMessage}
                          </p>
                        )}
                    </motion.div>
                  ))
                ) : (
                  <div className="px-5 py-7 text-sm text-zinc-600">
                    No resource records are configured for this sport yet.
                  </div>
                )}
              </div>

              {/* EQUIPMENT */}
              <div className="mt-9 border-t border-zinc-800/80 pt-8">
                <div className="mb-5 flex items-end justify-between gap-4">
                  <div>
                    <p
                      className="text-[10px] font-black uppercase tracking-[0.28em]"
                      style={{ color: accent.text }}
                    >
                      Equipment
                    </p>
                    <h2 className="mt-2 text-2xl font-black tracking-tight">Gear</h2>
                  </div>
                  <Dumbbell size={18} className="text-zinc-700" />
                </div>

                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
  {sport.gears?.length ? (
    sport.gears.map((gear, index) => {
      const quantity = selectedGear[gear.id] || 0;
      const available = Math.max(0, gear.availableQuantity);
      const disabled = available <= 0 || sport.maintenance;

      return (
        <motion.div
          key={gear.id}
          initial={{ opacity: 0, y: 7 }}
          animate={{ opacity: disabled ? 0.5 : 1, y: 0 }}
          transition={{
            delay: 0.18 + index * 0.045,
            duration: 0.35,
          }}
          whileHover={!disabled ? { y: -2 } : undefined}
          className="rounded-xl border border-zinc-800/70 bg-[#05090a] px-3.5 py-3"
          style={{
            borderColor:
              quantity > 0 ? accent.border : "rgba(255,255,255,0.07)",
            boxShadow:
              quantity > 0
                ? `0 0 24px ${accent.glow}`
                : undefined,
          }}
        >
          <div className="flex items-center gap-3">
            <SmartGearIconV2
  name={gear.name}
  accent={accent}
/>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-zinc-100">
                {gear.name}
              </p>

              {gear.description && (
                <p className="mt-0.5 truncate text-[10px] text-zinc-600">
                  {gear.description}
                </p>
              )}

              <p
                className="mt-1 text-[9px] font-black uppercase tracking-[0.14em]"
                style={{
                  color: disabled
                    ? "#52525b"
                    : accent.text,
                }}
              >
                {disabled
                  ? "Unavailable"
                  : `${available} available`}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-1.5">
              <button
                type="button"
                disabled={disabled || quantity <= 0}
                onClick={() =>
                  decreaseQuantity(gear.id)
                }
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-500 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-25"
              >
                <Minus size={13} />
              </button>

              <motion.span
                key={quantity}
                initial={{ scale: 0.75, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-5 text-center text-sm font-black text-white"
              >
                {quantity}
              </motion.span>

              <button
                type="button"
                disabled={
                  disabled || quantity >= available
                }
                onClick={() =>
                  increaseQuantity(
                    gear.id,
                    available
                  )
                }
                className="flex h-8 w-8 items-center justify-center rounded-lg border text-black transition disabled:cursor-not-allowed disabled:opacity-25"
                style={{
                  borderColor: accent.border,
                  background: disabled
                    ? "#181b19"
                    : accent.solid,
                }}
              >
                <Plus size={13} />
              </button>
            </div>
          </div>
        </motion.div>
      );
    })
  ) : (
    <div className="col-span-full rounded-xl border border-dashed border-zinc-800 px-5 py-6 text-sm text-zinc-600">
      No equipment is configured for this sport.
    </div>
  )}
</div>

                {/* BOOK NOW — intentionally below Equipment and outside the summary popup */}
                <motion.button
                  type="button"
                  disabled={bookingLoading || !bookingReady || sport.maintenance}
                  onClick={() => {
                    if (sport.hasSlotSystem && !selectedSlot) {
                      setSlotPopupOpen(true);
                      setSlotMode("all");
                      setErrorMessage("Choose an available slot first.");
                      return;
                    }

                    setBookingTarget(
                      sport.hasSlotSystem && selectedSlot
                        ? { type: "slot", slot: selectedSlot }
                        : { type: "gear" }
                    );
                  }}
                  whileHover={bookingReady ? { y: -2 } : undefined}
                  whileTap={bookingReady ? { scale: 0.985 } : undefined}
                  className="group relative mt-5 flex w-full items-center justify-between overflow-hidden rounded-2xl px-5 py-4 text-left transition disabled:cursor-not-allowed disabled:bg-zinc-900 disabled:text-zinc-700"
                  style={{
                    background:
                      bookingReady && !sport.maintenance ? accent.solid : undefined,
                    color:
                      bookingReady && !sport.maintenance ? "#071008" : undefined,
                    boxShadow:
                      bookingReady && !sport.maintenance
                        ? `0 18px 50px rgba(${accent.rgb},0.16)`
                        : undefined,
                  }}
                >
                  <span className="relative text-xs font-black uppercase tracking-[0.2em]">
                    {bookingLoading ? "Booking…" : "Book now"}
                  </span>
                  <motion.span
                    animate={bookingReady ? { x: [0, 4, 0] } : { x: 0 }}
                    transition={{ duration: 1.4, repeat: Infinity }}
                  >
                    <ArrowRight size={18} />
                  </motion.span>
                  {bookingReady && !sport.maintenance && (
                    <motion.span
                      animate={{ x: ["-120%", "180%"] }}
                      transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                      className="pointer-events-none absolute inset-y-0 w-16 skew-x-[-18deg] bg-white/15 blur-md"
                    />
                  )}
                </motion.button>
              </div>
            </div>
          </motion.section>

          {/* COMPACT BOOKING SUMMARY LAUNCHER */}
          <div className="hidden lg:block lg:sticky lg:top-6">
            

            {activeBooking && (
              <div className="mt-5 rounded-[1.6rem] border border-[#a8f0b0]/15 bg-[#a8f0b0]/[0.035] px-5 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#a8f0b0]/10 text-[#a8f0b0]">
                      <Check size={15} />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#a8f0b0]">
                        Active booking
                      </p>
                      <p className="mt-1 text-sm font-bold text-zinc-200">
                        {activeBooking.sport?.name || sport.name}
                      </p>
                      <p className="mt-1 text-xs text-zinc-600">
                        {activeBooking.status}
                      </p>
                    </div>
                  </div>

                  {activeBooking.status === "Active" && (
                    <button
                      type="button"
                      disabled={cancelLoading || bookingLoading}
                      onClick={() => cancelBooking(activeBooking.id)}
                      className="rounded-xl border border-red-500/20 bg-red-500/5 px-3 py-2 text-[10px] font-bold text-red-300 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {cancelLoading ? "Cancelling…" : "Cancel"}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* HISTORY — COMPACT, NOT THE MAIN EXPERIENCE */}
        {bookingHistory.length > 0 && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="mt-10"
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-zinc-700">
                  Recent activity
                </p>
                <h3 className="mt-1 text-lg font-black text-zinc-300">Your bookings</h3>
              </div>
            </div>

            <div className="grid gap-2 md:grid-cols-2">
              {bookingHistory.slice(0, 4).map((booking) => (
                <div
                  key={booking.id}
                  className="rounded-2xl border border-zinc-900 bg-[#071522] px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-bold text-zinc-400">
                      {booking.sport?.name || "Sports booking"}
                    </p>
                    <span className="text-[9px] font-black uppercase tracking-[0.14em] text-zinc-700">
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        )}
      </div>

      {/* BOOKING SUMMARY POPUP */}
      <AnimatePresence>
        {bookingSummaryOpen && (
          <BookingSummaryModal
            sport={sport}
            accent={accent}
            selectedSlot={selectedSlot}
            selectedResource={selectedResource}
            selectedGear={selectedGear}
            selectedGearCount={selectedGearCount}
            bookingReady={bookingReady}
            onClose={() => setBookingSummaryOpen(false)}
            onOpenSlots={() => {
              setBookingSummaryOpen(false);
              setSlotMode("all");
              setSlotPopupOpen(true);
            }}
            onChangeResource={() => {
              setBookingSummaryOpen(false);
              document.getElementById("resources")?.scrollIntoView({ behavior: "smooth", block: "center" });
            }}
            onClearSlot={() => setSelectedSlot(null)}
          />
        )}
      </AnimatePresence>

      {/* SLOT POPUP */}
      <SlotPopup
        open={slotPopupOpen}
        sportName={sport.name}
        accent={accent}
        slots={visibleSlots}
        allSlotCount={slots.length}
        availableSlotCount={availableSlotCount}
        teamReservedSlotCount={teamReservedSlotCount}
        mode={slotMode}
        loading={slotsLoading}
        selectedSlotId={selectedSlot?.id ?? null}
        onModeChange={setSlotMode}
        onClose={() => setSlotPopupOpen(false)}
        onSelect={(slot) => {
          if (slotUnavailable(slot) || sport.maintenance) return;
          setSelectedSlot(slot);
          setSlotPopupOpen(false);
        }}
      />

      {/* BOOKING CONFIRMATION */}
      <AnimatePresence>
        {bookingTarget && (
          <ConfirmationModal
            sport={sport}
            accent={accent}
            target={bookingTarget}
            selectedSlot={selectedSlot}
            selectedResource={selectedResource}
            selectedGear={selectedGear}
            onClose={() => setBookingTarget(null)}
            onConfirm={submitBooking}
            loading={bookingLoading}
          />
        )}
      </AnimatePresence>

      {/* SUCCESS */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: 18, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 10, x: "-50%" }}
            className="fixed bottom-5 left-1/2 z-[130] w-[calc(100%-2rem)] max-w-md"
          >
            <div className="flex items-center gap-3 rounded-2xl border border-[#a8f0b0]/20 bg-[#091b2d]/95 px-4 py-3 shadow-2xl backdrop-blur-xl">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#a8f0b0]/10 text-[#a8f0b0]">
                <Check size={15} />
              </div>
              <p className="text-sm font-semibold text-[#d7ffdc]">{successMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ERROR */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: 18, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 10, x: "-50%" }}
            className="fixed bottom-5 left-1/2 z-[130] w-[calc(100%-2rem)] max-w-lg"
          >
            <div className="flex items-center gap-3 rounded-2xl border border-red-500/20 bg-[#0b1727]/95 px-4 py-3 shadow-2xl backdrop-blur-xl">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-300">
                <X size={15} />
              </div>
              <p className="min-w-0 flex-1 text-sm font-semibold text-red-100">
                {errorMessage}
              </p>
              <button
                type="button"
                onClick={() => setErrorMessage("")}
                className="text-zinc-600 transition hover:text-white"
              >
                <X size={15} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

async function safeJson(response: Response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

function LoadingState() {
  return (
    <main className="min-h-screen bg-[#040b16] text-white">
      <Navbar onOpenMobileSidebar={() => {}} />
      <div className="mx-auto max-w-7xl px-5 py-10 md:px-8">
        <div className="animate-pulse space-y-6">
          <div className="h-5 w-24 rounded-full bg-zinc-900" />
          <div className="h-52 rounded-[2rem] bg-zinc-900/80" />
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_350px]">
            <div className="h-[620px] rounded-[2rem] bg-zinc-900/70" />
            <div className="h-[430px] rounded-[2rem] bg-zinc-900/70" />
          </div>
        </div>
      </div>
    </main>
  );
}
function SportHeroArtwork({
  accent,
  sportName,
}: {
  accent: Accent;
  sportName: string;
}) {
  const kind = getSportVisualKind(sportName);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, x: 15 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="relative h-56 w-[320px] overflow-visible"
      aria-hidden="true"
    >
      {/* Ambient glow */}
      <motion.div
        animate={{
          scale: [0.92, 1.08, 0.92],
          opacity: [0.18, 0.32, 0.18],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute right-8 top-8 h-40 w-40 rounded-full blur-3xl"
        style={{ background: accent.glow }}
      />

      {/* Decorative orbit */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          duration: 24,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute right-2 top-4 h-48 w-48 rounded-full border border-dashed"
        style={{ borderColor: accent.border }}
      />

      <motion.div
        animate={{ rotate: -360 }}
        transition={{
          duration: 32,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute right-10 top-12 h-32 w-32 rounded-full border border-dotted"
        style={{ borderColor: accent.border }}
      />

      {/* Actual sport artwork */}
      <motion.div
        animate={{
          y: [0, -5, 0],
          rotate: [0, 1.2, 0, -1.2, 0],
        }}
        transition={{
          duration: 5.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute inset-0 flex items-center justify-center"
        style={{
          filter: `drop-shadow(0 0 18px ${accent.glow})`,
        }}
      >
        <SportHeroGraphic kind={kind} accent={accent} />
      </motion.div>
    </motion.div>
  );
}

function SportHeroGraphic({
  kind,
  accent,
}: {
  kind: SportVisualKind;
  accent: Accent;
}) {
  const stroke = accent.text;
  const glow = accent.glow;

  const commonProps = {
    fill: "none",
    stroke,
    strokeWidth: 3,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  return (
    <svg
      viewBox="0 0 320 220"
      className="h-full w-full"
      aria-hidden="true"
    >
      <defs>
        <filter id="sport-art-glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* CRICKET */}
      {kind === "cricket" && (
        <g filter="url(#sport-art-glow)">
          <motion.g
            animate={{ rotate: [-1.5, 1.5, -1.5] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            style={{ transformOrigin: "150px 120px" }}
          >
            <path
              d="M118 42 L170 154"
              {...commonProps}
              strokeWidth="8"
            />
            <path
              d="M106 50 L121 42 L181 157 L165 164 Z"
              {...commonProps}
              strokeWidth="2.5"
            />
            <path
              d="M163 155 L176 180"
              {...commonProps}
              strokeWidth="8"
            />
          </motion.g>

          <motion.circle
            cx="218"
            cy="72"
            r="18"
            fill={glow}
            stroke={stroke}
            strokeWidth="3"
            animate={{
              x: [0, 5, 0],
              y: [0, -4, 0],
            }}
            transition={{
              duration: 3.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          <path
            d="M210 59 Q218 72 210 85 M218 55 Q226 72 218 89"
            {...commonProps}
            strokeWidth="2"
          />

          <circle
            cx="218"
            cy="72"
            r="30"
            {...commonProps}
            opacity="0.25"
            strokeDasharray="3 7"
          />
        </g>
      )}

      {/* BADMINTON */}
      {kind === "badminton" && (
        <g filter="url(#sport-art-glow)">
          <motion.g
            animate={{ rotate: [-2, 2, -2] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
            style={{ transformOrigin: "125px 105px" }}
          >
            <ellipse
              cx="112"
              cy="78"
              rx="35"
              ry="48"
              transform="rotate(-28 112 78)"
              {...commonProps}
            />
            <path d="M135 116 L190 178" {...commonProps} strokeWidth="7" />
            <path d="M93 42 L151 106" {...commonProps} strokeWidth="1.8" />
            <path d="M78 106 Q111 93 143 93" {...commonProps} strokeWidth="1.8" />
          </motion.g>

          <motion.g
            animate={{
              x: [0, 8, 0],
              y: [0, -5, 0],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <path d="M211 64 L242 87 L226 103 L198 80 Z" {...commonProps} />
            <path d="M211 64 L218 104" {...commonProps} strokeWidth="2" />
            <path d="M221 71 L229 104" {...commonProps} strokeWidth="2" />
            <path d="M231 78 L237 94" {...commonProps} strokeWidth="2" />
            <circle cx="210" cy="61" r="5" fill={stroke} stroke="none" />
          </motion.g>
        </g>
      )}

      {/* TENNIS */}
      {kind === "tennis" && (
        <g filter="url(#sport-art-glow)">
          <motion.g
            animate={{ rotate: [-2, 2, -2] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
            style={{ transformOrigin: "125px 105px" }}
          >
            <ellipse
              cx="112"
              cy="82"
              rx="38"
              ry="50"
              transform="rotate(-32 112 82)"
              {...commonProps}
              strokeWidth="4"
            />
            <path d="M139 121 L194 180" {...commonProps} strokeWidth="8" />
            <path d="M92 43 Q116 63 137 91" {...commonProps} strokeWidth="1.8" />
            <path d="M78 75 Q105 91 131 112" {...commonProps} strokeWidth="1.8" />
          </motion.g>

          <motion.circle
            cx="222"
            cy="70"
            r="17"
            fill={glow}
            stroke={stroke}
            strokeWidth="3"
            animate={{
              x: [0, 7, 0],
              y: [0, -6, 0],
            }}
            transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
          />

          <path
            d="M214 57 Q226 70 214 83"
            {...commonProps}
            strokeWidth="2"
          />
        </g>
      )}

      {/* BASKETBALL */}
      {kind === "basketball" && (
        <g filter="url(#sport-art-glow)">
          <motion.circle
            cx="150"
            cy="108"
            r="58"
            fill={glow}
            stroke={stroke}
            strokeWidth="4"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          />
          <path d="M92 108 H208" {...commonProps} />
          <path d="M150 50 C125 75 125 141 150 166" {...commonProps} />
          <path d="M150 50 C175 75 175 141 150 166" {...commonProps} />
          <path d="M105 67 C130 83 143 105 150 166" {...commonProps} />
        </g>
      )}

      {/* FOOTBALL */}
      {kind === "football" && (
        <g filter="url(#sport-art-glow)">
          <motion.g
            animate={{
              rotate: [0, 3, 0, -3, 0],
              y: [0, -3, 0],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            style={{ transformOrigin: "150px 110px" }}
          >
            <path
              d="M150 48 L199 77 L188 136 L150 170 L112 136 L101 77 Z"
              fill={glow}
              stroke={stroke}
              strokeWidth="4"
            />
            <path d="M150 48 L166 91 L150 110 L133 91 Z" {...commonProps} />
            <path d="M133 91 L112 136" {...commonProps} />
            <path d="M166 91 L188 136" {...commonProps} />
            <path d="M150 110 L150 170" {...commonProps} />
          </motion.g>
        </g>
      )}

      {/* VOLLEYBALL */}
      {kind === "volleyball" && (
        <g filter="url(#sport-art-glow)">
          <motion.circle
            cx="150"
            cy="105"
            r="58"
            fill={glow}
            stroke={stroke}
            strokeWidth="4"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          />
          <path d="M150 47 Q180 75 180 105 Q180 135 150 163" {...commonProps} />
          <path d="M150 47 Q120 75 120 105 Q120 135 150 163" {...commonProps} />
          <path d="M93 105 Q122 88 150 105 Q178 122 207 105" {...commonProps} />
        </g>
      )}

      {/* TABLE TENNIS */}
      {kind === "table-tennis" && (
        <g filter="url(#sport-art-glow)">
          <motion.g
            animate={{ rotate: [-2, 2, -2] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            style={{ transformOrigin: "120px 105px" }}
          >
            <path
              d="M83 64 Q105 39 136 54 Q162 67 157 98 Q152 129 124 143 Q95 153 78 128 Q63 101 83 64 Z"
              fill={glow}
              stroke={stroke}
              strokeWidth="4"
            />
            <path d="M126 137 L185 184" {...commonProps} strokeWidth="9" />
          </motion.g>

          <motion.circle
            cx="224"
            cy="75"
            r="13"
            fill={stroke}
            stroke="none"
            animate={{
              x: [0, 6, 0],
              y: [0, -5, 0],
            }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
          />
        </g>
      )}

      {/* BASEBALL */}
      {kind === "baseball" && (
        <g filter="url(#sport-art-glow)">
          <motion.g
            animate={{ rotate: [-2, 2, -2] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            style={{ transformOrigin: "140px 115px" }}
          >
            <path d="M105 48 L177 164" {...commonProps} strokeWidth="10" />
            <path d="M94 54 L105 48 L187 164 L176 170 Z" {...commonProps} />
          </motion.g>

          <motion.circle
            cx="218"
            cy="72"
            r="19"
            fill={glow}
            stroke={stroke}
            strokeWidth="3"
            animate={{ x: [0, 6, 0], y: [0, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />

          <path d="M210 58 Q220 67 226 82" {...commonProps} strokeWidth="1.8" />
          <path d="M226 58 Q216 70 211 85" {...commonProps} strokeWidth="1.8" />
        </g>
      )}

      {/* HOCKEY */}
      {kind === "hockey" && (
        <g filter="url(#sport-art-glow)">
          <motion.path
            d="M112 46 L151 153 Q158 173 181 173 L208 173"
            {...commonProps}
            strokeWidth="9"
            animate={{ rotate: [-1, 1, -1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            style={{ transformOrigin: "150px 110px" }}
          />
          <motion.circle
            cx="213"
            cy="174"
            r="13"
            fill={stroke}
            stroke="none"
            animate={{ x: [0, 8, 0] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
          />
        </g>
      )}

      {/* GOLF */}
      {kind === "golf" && (
        <g filter="url(#sport-art-glow)">
          <motion.path
            d="M118 45 L178 169"
            {...commonProps}
            strokeWidth="7"
            animate={{ rotate: [-2, 2, -2] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            style={{ transformOrigin: "145px 110px" }}
          />
          <path d="M101 46 Q120 38 138 48 L126 68 Q110 63 96 68 Z" {...commonProps} />
          <motion.circle
            cx="215"
            cy="150"
            r="14"
            fill={glow}
            stroke={stroke}
            strokeWidth="3"
            animate={{ x: [0, 8, 0], y: [0, -2, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          <path d="M207 178 H246" {...commonProps} />
          <path d="M226 164 V178" {...commonProps} />
        </g>
      )}

      {/* SWIMMING */}
      {kind === "swimming" && (
        <g filter="url(#sport-art-glow)">
          <motion.circle
            cx="150"
            cy="73"
            r="15"
            fill={stroke}
            stroke="none"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          />
          <motion.path
            d="M105 112 Q130 91 153 110 Q177 129 204 105"
            {...commonProps}
            strokeWidth="7"
            animate={{ x: [0, 5, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          <path d="M96 139 Q125 120 154 139 Q183 158 215 135" {...commonProps} />
          <path d="M82 165 Q113 146 143 165 Q173 184 222 159" {...commonProps} />
        </g>
      )}

      {/* COMBAT SPORTS */}
      {kind === "combat" && (
        <g filter="url(#sport-art-glow)">
          <motion.g
            animate={{ y: [0, -4, 0], rotate: [-1, 1, -1] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <path
              d="M108 78 Q102 58 118 50 Q136 43 146 59 L150 82 L137 98 L116 95 Z"
              fill={glow}
              stroke={stroke}
              strokeWidth="4"
            />
            <path
              d="M192 78 Q198 58 182 50 Q164 43 154 59 L150 82 L163 98 L184 95 Z"
              fill={glow}
              stroke={stroke}
              strokeWidth="4"
            />
          </motion.g>
          <path d="M150 42 V168" {...commonProps} opacity="0.3" />
        </g>
      )}

      {/* ATHLETICS */}
      {kind === "athletics" && (
        <g filter="url(#sport-art-glow)">
          <motion.g
            animate={{ x: [0, 5, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <circle cx="142" cy="57" r="12" fill={stroke} stroke="none" />
            <path d="M142 70 L132 111 L164 126" {...commonProps} strokeWidth="6" />
            <path d="M132 111 L108 141" {...commonProps} strokeWidth="6" />
            <path d="M132 88 L166 78" {...commonProps} strokeWidth="6" />
            <path d="M164 126 L194 145" {...commonProps} strokeWidth="6" />
          </motion.g>

          <path d="M80 170 Q150 140 235 170" {...commonProps} />
          <path d="M92 185 Q155 158 224 185" {...commonProps} />
        </g>
      )}

      {/* DEFAULT */}
      {kind === "default" && (
        <g filter="url(#sport-art-glow)">
          <motion.circle
            cx="150"
            cy="105"
            r="55"
            fill={glow}
            stroke={stroke}
            strokeWidth="4"
            animate={{
              y: [0, -6, 0],
              rotate: [0, 3, 0, -3, 0],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />

          <path d="M95 105 H205" {...commonProps} />
          <path d="M150 50 V160" {...commonProps} />
          <path d="M111 66 Q150 105 189 144" {...commonProps} />
          <path d="M189 66 Q150 105 111 144" {...commonProps} />
        </g>
      )}
    </svg>
  );
}
type GearVisualKind =
  | "bat"
  | "racket"
  | "ball"
  | "shuttle"
  | "shoes"
  | "gloves"
  | "bag"
  | "helmet"
  | "stumps"
  | "net"
  | "default";

function getGearVisualKind(gearName: string): GearVisualKind {
  const name = gearName.trim().toLowerCase();

  if (
    name.includes("bat") ||
    name.includes("stick")
  ) {
    return "bat";
  }

  if (
    name.includes("racket") ||
    name.includes("racquet")
  ) {
    return "racket";
  }

  if (
    name.includes("ball") ||
    name.includes("basketball") ||
    name.includes("football") ||
    name.includes("volleyball") ||
    name.includes("tennis ball")
  ) {
    return "ball";
  }

  if (
    name.includes("shuttle") ||
    name.includes("shuttlecock")
  ) {
    return "shuttle";
  }

  if (
    name.includes("shoe") ||
    name.includes("footwear") ||
    name.includes("spike")
  ) {
    return "shoes";
  }

  if (
    name.includes("glove")
  ) {
    return "gloves";
  }

  if (
    name.includes("bag") ||
    name.includes("kit bag")
  ) {
    return "bag";
  }

  if (
    name.includes("helmet") ||
    name.includes("head guard")
  ) {
    return "helmet";
  }

  if (
    name.includes("stump") ||
    name.includes("wicket")
  ) {
    return "stumps";
  }

  if (
    name.includes("net")
  ) {
    return "net";
  }

  return "default";
}

function SmartGearIconV2({
  name,
  accent,
}: {
  name: string;
  accent: Accent;
}) {
  const kind = getGearVisualKind(name);

  return (
    <div
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border bg-[#070b0c]"
      style={{
        borderColor: accent.border,
        color: accent.text,
        boxShadow: `0 0 18px ${accent.glow}`,
      }}
    >
      <svg
        viewBox="0 0 40 40"
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {kind === "bat" && (
          <>
            <path d="M12 7 L29 31" strokeWidth="4" />
            <path d="M9 9 L13 6 L32 30 L28 33 Z" strokeWidth="1.6" />
          </>
        )}

        {kind === "racket" && (
          <>
            <ellipse
              cx="16"
              cy="14"
              rx="9"
              ry="11"
              transform="rotate(-28 16 14)"
            />
            <path d="M22 22 L33 34" strokeWidth="3" />
            <path d="M11 8 L21 20" strokeWidth="1.2" />
            <path d="M8 16 L20 18" strokeWidth="1.2" />
          </>
        )}

        {kind === "ball" && (
          <>
            <circle cx="20" cy="20" r="13" />
            <path d="M8 20 H32" />
            <path d="M20 7 Q27 20 20 33" />
          </>
        )}

        {kind === "shuttle" && (
          <>
            <path d="M11 8 L29 17 L23 24 L9 14 Z" />
            <path d="M11 8 L15 24" />
            <path d="M18 12 L21 25" />
            <path d="M25 16 L27 21" />
            <circle cx="9" cy="7" r="2.5" fill="currentColor" stroke="none" />
          </>
        )}

        {kind === "shoes" && (
          <>
            <path d="M7 24 Q14 22 18 14 L24 19 Q26 23 33 25 Q36 26 35 31 H8 Q5 29 7 24Z" />
            <path d="M18 17 L23 21" />
            <path d="M15 19 L20 23" />
          </>
        )}

        {kind === "gloves" && (
          <>
            <path d="M10 28 L8 17 Q8 14 10 14 Q12 14 12 17 L13 11 Q14 9 16 10 Q17 10 17 13 L18 10 Q19 8 21 9 Q22 10 22 13 L23 12 Q25 10 26 12 L27 20 Q29 18 31 20 Q33 22 31 25 L27 31 L14 32 Z" />
          </>
        )}

        {kind === "bag" && (
          <>
            <path d="M8 14 H32 V31 H8 Z" />
            <path d="M14 14 Q14 7 20 7 Q26 7 26 14" />
            <path d="M13 20 H27" />
          </>
        )}

        {kind === "helmet" && (
          <>
            <path d="M7 23 Q8 10 20 8 Q32 10 33 23 V27 H7 Z" />
            <path d="M20 8 V23" />
            <path d="M12 12 L16 23" />
            <path d="M28 12 L24 23" />
          </>
        )}

        {kind === "stumps" && (
          <>
            <path d="M11 9 V31" />
            <path d="M20 8 V31" />
            <path d="M29 9 V31" />
            <path d="M9 9 H22" />
            <path d="M18 8 H31" />
          </>
        )}

        {kind === "net" && (
          <>
            <path d="M8 9 V31" />
            <path d="M32 9 V31" />
            <path d="M8 13 H32" />
            <path d="M8 20 H32" />
            <path d="M8 27 H32" />
            <path d="M14 9 V31" />
            <path d="M20 9 V31" />
            <path d="M26 9 V31" />
          </>
        )}

        {kind === "default" && (
          <>
            <circle cx="20" cy="20" r="12" />
            <path d="M12 20 H28" />
            <path d="M20 12 V28" />
          </>
        )}
      </svg>
    </div>
  );
}
function SportLogo({ sportName, accent }: { sportName: string; accent: Accent }) {
  const name = sportName.trim().toLowerCase();
  const stroke = accent.text;

  return (
    <svg
      viewBox="0 0 80 80"
      className="h-14 w-14"
      fill="none"
      stroke={stroke}
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {name === "cricket" && (
        <>
          <path d="M27 12 51 58" />
          <path d="M21 17 28 12 56 61 49 65Z" />
          <path d="M17 61c0-11 8-20 19-20 8 0 15 4 19 10" />
          <circle cx="58" cy="23" r="7" />
        </>
      )}
      {name === "tennis" && (
        <>
          <ellipse cx="31" cy="31" rx="18" ry="23" transform="rotate(-34 31 31)" />
          <path d="m43 46 17 20" />
          <path d="M17 27c8 3 14 8 19 16" />
          <path d="M22 17c9 4 15 10 19 18" />
          <circle cx="61" cy="18" r="6" />
        </>
      )}
      {name === "basketball" && (
        <>
          <circle cx="40" cy="40" r="27" />
          <path d="M13 40h54" />
          <path d="M40 13c8 8 12 17 12 27s-4 19-12 27" />
          <path d="M21 20c11 6 18 17 19 32" />
        </>
      )}
      {name === "football" && (
        <>
          <path d="M40 10 60 22 66 45 50 67 26 67 14 45 20 22Z" />
          <path d="m40 10 10 20-10 15-14-10Z" />
          <path d="m40 45 10 22" />
          <path d="m40 45-14 22" />
          <path d="m30 38 20 0" />
        </>
      )}
      {name === "badminton" && (
        <>
          <ellipse cx="29" cy="27" rx="14" ry="19" transform="rotate(-25 29 27)" />
          <path d="m38 42 18 20" />
          <path d="M19 16 49 40" />
          <path d="M13 57c8-7 15-10 25-12" />
          <path d="M54 15 64 27 58 36 48 24Z" />
        </>
      )}
      {name === "table tennis" && (
        <>
          <path d="M17 20c8-8 24-7 31 2 7 9 4 23-5 30-9 7-23 6-30-3-7-9-5-21 4-29Z" />
          <path d="m44 49 16 17" />
          <path d="M52 12c9 2 14 8 15 17" />
          <circle cx="62" cy="50" r="5" />
        </>
      )}
      {!['cricket','tennis','basketball','football','badminton','table tennis'].includes(name) && (
        <>
          <circle cx="40" cy="40" r="25" />
          <path d="M27 40h26M40 27v26" />
        </>
      )}
    </svg>
  );
}

function BookingSummaryModal({
  sport,
  accent,
  selectedSlot,
  selectedResource,
  selectedGear,
  selectedGearCount,
  bookingReady,
  onClose,
  onOpenSlots,
  onChangeResource,
  onClearSlot,
}: {
  sport: Sport;
  accent: Accent;
  selectedSlot: Slot | null;
  selectedResource: Resource | null;
  selectedGear: Record<number, number>;
  selectedGearCount: number;
  bookingReady: boolean;
  onClose: () => void;
  onOpenSlots: () => void;
  onChangeResource: () => void;
  onClearSlot: () => void;
}) {
  const selectedGearEntries = Object.entries(selectedGear).filter(
    ([, quantity]) => quantity > 0
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[110] flex items-end justify-center bg-black/70 p-4 backdrop-blur-md sm:items-center"
    >
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.98 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-md overflow-hidden rounded-[2rem] border bg-[#081827] shadow-2xl"
        style={{ borderColor: accent.border, boxShadow: `0 30px 100px ${accent.glow}` }}
      >
        <div className="flex items-start justify-between gap-4 border-b border-zinc-800/80 px-5 py-5">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl border bg-[#06111f]"
              style={{ borderColor: accent.border, color: accent.text }}
            >
              <ClipboardList size={18} />
            </div>
            <div>
              <p
                className="text-[10px] font-black uppercase tracking-[0.24em]"
                style={{ color: accent.text }}
              >
                Booking summary
              </p>
              <h2 className="mt-1 text-xl font-black tracking-tight">
                Your session
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close booking summary"
            className="rounded-xl p-2 text-zinc-600 transition hover:bg-white/[0.04] hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-2 p-5">
          <SummaryRow label="Sport" value={sport.name} />

          <div className="rounded-2xl border border-zinc-800/80 bg-[#06111f]/80 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[9px] font-black uppercase tracking-[0.16em] text-zinc-700">
                  Resource
                </p>
                <p className="mt-1 truncate text-sm font-bold text-zinc-200">
                  {selectedResource?.name || "No resource selected"}
                </p>
              </div>

              {selectedResource && (
                <button
                  type="button"
                  onClick={onChangeResource}
                  className="shrink-0 rounded-lg border border-zinc-800 px-2.5 py-1.5 text-[9px] font-black uppercase tracking-[0.12em] text-zinc-500 transition hover:border-cyan-400/30 hover:text-white"
                >
                  Change
                </button>
              )}
            </div>
          </div>

          {sport.hasSlotSystem && (
            <div className="rounded-2xl border border-zinc-800/80 bg-[#06111f]/80 px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.16em] text-zinc-700">
                    Time
                  </p>
                  <p className="mt-1 text-sm font-bold text-zinc-200">
                    {selectedSlot
                      ? `${formatTime(selectedSlot.startTime)} — ${formatTime(selectedSlot.endTime)}`
                      : "No slot selected"}
                  </p>
                </div>

                {selectedSlot ? (
                  <button
                    type="button"
                    onClick={onClearSlot}
                    className="text-zinc-700 transition hover:text-white"
                    aria-label="Clear selected slot"
                  >
                    <X size={15} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onOpenSlots}
                    className="text-[10px] font-black uppercase tracking-[0.14em]"
                    style={{ color: accent.text }}
                  >
                    Choose
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-zinc-800/80 bg-[#06111f]/80 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[9px] font-black uppercase tracking-[0.16em] text-zinc-700">
                Equipment
              </p>
              <span className="text-xs font-black text-zinc-300">
                {selectedGearCount}
              </span>
            </div>

            {selectedGearEntries.length > 0 ? (
              <div className="mt-2 space-y-1.5">
                {selectedGearEntries.map(([gearId, quantity]) => {
                  const gear = sport.gears.find(
                    (item) => item.id === Number(gearId)
                  );
                  return (
                    <div
                      key={gearId}
                      className="flex items-center justify-between gap-3 text-xs"
                    >
                      <span className="truncate text-zinc-500">
                        {gear?.name || "Gear"}
                      </span>
                      <span className="shrink-0 font-black text-zinc-200">
                        × {quantity}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="mt-1 text-xs text-zinc-600">No equipment selected</p>
            )}
          </div>

          <div
            className="flex items-center gap-2 rounded-2xl border px-4 py-3"
            style={{
              borderColor: bookingReady
                ? "rgba(168,240,176,0.18)"
                : "rgba(255,255,255,0.06)",
              background: bookingReady
                ? "rgba(168,240,176,0.035)"
                : "rgba(255,255,255,0.015)",
            }}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                bookingReady ? "bg-[#a8f0b0]" : "bg-zinc-700"
              }`}
            />
            <p
              className={`text-[10px] font-black uppercase tracking-[0.16em] ${
                bookingReady ? "text-[#a8f0b0]" : "text-zinc-600"
              }`}
            >
              {bookingReady ? "Ready to book" : "Selection incomplete"}
            </p>
          </div>

          <p className="pt-1 text-center text-[10px] text-zinc-700">
            Use the Book now button below Equipment to continue.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-zinc-800/80 bg-[#06111f]/80 px-4 py-3">
      <span className="text-[9px] font-black uppercase tracking-[0.16em] text-zinc-700">
        {label}
      </span>
      <span className="truncate text-right text-sm font-bold text-zinc-200">
        {value}
      </span>
    </div>
  );
}

function SlotPopup({
  open,
  sportName,
  accent,
  slots,
  allSlotCount,
  availableSlotCount,
  teamReservedSlotCount,
  mode,
  loading,
  selectedSlotId,
  onModeChange,
  onClose,
  onSelect,
}: {
  open: boolean;
  sportName: string;
  accent: Accent;
  slots: Slot[];
  allSlotCount: number;
  availableSlotCount: number;
  teamReservedSlotCount: number;
  mode: "all" | "available";
  loading: boolean;
  selectedSlotId: number | null;
  onModeChange: (mode: "all" | "available") => void;
  onClose: () => void;
  onSelect: (slot: Slot) => void;
}) {
  const dragX = useMotionValue(0);
  const dragRotate = useTransform(dragX, [-90, 0, 90], [-90, 0, 90]);
  const dragLiquid = useTransform(dragX, [-90, 0, 90], [0.05, 1, 0.05]);
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    if (!open) {
      dragX.set(0);
      setTransitioning(false);
    }
  }, [open, dragX]);

  const completeModeChange = (next: "all" | "available") => {
    if (transitioning || next === mode) return;
    setTransitioning(true);

    window.setTimeout(() => {
      onModeChange(next);
      dragX.set(0);
      setTransitioning(false);
    }, 470);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/65 p-4 backdrop-blur-md"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.97 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-xl overflow-hidden rounded-[2rem] border bg-[#081827] shadow-[0_35px_120px_rgba(0,0,0,0.6)]"
            style={{
              borderColor: mode === "available" ? "rgba(52,211,153,0.22)" : accent.border,
              boxShadow:
                mode === "available"
                  ? "0 35px 120px rgba(16,185,129,0.08)"
                  : `0 35px 120px ${accent.glow}`,
            }}
          >
            {/* Theme wash */}
            <motion.div
              animate={{
                opacity: mode === "available" ? 0.16 : 0.08,
                background:
                  mode === "available"
                    ? "rgba(16,185,129,0.18)"
                    : accent.glow,
              }}
              transition={{ duration: 0.7, ease: "easeInOut" }}
              className="pointer-events-none absolute inset-0"
            />

            <div className="relative p-5 md:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p
                    className="text-[10px] font-black uppercase tracking-[0.28em]"
                    style={{ color: mode === "available" ? "#34d399" : accent.text }}
                  >
                    {sportName} · Time window
                  </p>
                  <h2 className="mt-2 text-2xl font-black tracking-tight">
                    Choose your slot
                  </h2>
                  <p className="mt-1 text-xs text-zinc-600">
                    {loading ? "Updating live availability…" : "Rolling live window"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-zinc-800 bg-[#06111f]/85 text-zinc-600 transition hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              {/* THE PHYSICAL GLASS CONTROLLER */}
              <div className="relative mt-5 overflow-hidden rounded-[1.5rem] border border-zinc-800/80 bg-[#06111f]/85 px-4 py-5">
                <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/25 to-transparent" />

                <div className="relative flex min-h-[170px] items-center justify-center">
                  <motion.div
                    animate={
                      mode === "available"
                        ? { rotate: -90, x: -45, y: 24 }
                        : { rotate: 0, x: 0, y: 0 }
                    }
                    transition={{ duration: 0.52, ease: [0.22, 1, 0.36, 1] }}
                    style={{ rotate: dragRotate }}
                    drag="x"
                    dragConstraints={{ left: -95, right: 95 }}
                    dragElastic={0.16}
                    onDragEnd={(_, info) => {
                      if (transitioning) return;
                      const direction = info.offset.x;
                      if (Math.abs(direction) < 65) {
                        dragX.set(0);
                        return;
                      }

                      completeModeChange(mode === "all" ? "available" : "all");
                    }}
                    whileDrag={{ scale: 1.05, cursor: "grabbing" }}
                    className="relative z-10 h-24 w-16 cursor-grab touch-none"
                    aria-label="Drag the glass to switch slot mode"
                  >
                    {/* Stem */}
                    <div
                      className="absolute bottom-0 left-1/2 h-7 w-1 -translate-x-1/2 rounded-full"
                      style={{ background: mode === "available" ? "#34d399" : accent.text }}
                    />
                    {/* Base */}
                    <div
                      className="absolute bottom-0 left-1/2 h-1.5 w-12 -translate-x-1/2 rounded-full"
                      style={{ background: mode === "available" ? "#34d399" : accent.text }}
                    />
                    {/* Bowl */}
                    <div
                      className="absolute left-1/2 top-0 h-16 w-14 -translate-x-1/2 overflow-hidden rounded-b-[45%] rounded-t-[12%] border-2 bg-white/[0.025]"
                      style={{ borderColor: mode === "available" ? "#34d399" : accent.text }}
                    >
                      {/* Liquid */}
                      <motion.div
                        animate={{
                          scaleY: mode === "available" ? 0.03 : 1,
                          y: mode === "available" ? 44 : 0,
                          opacity: mode === "available" ? 0 : 0.72,
                        }}
                        style={{ scaleY: dragLiquid }}
                        transition={{ duration: 0.48, ease: "easeInOut" }}
                        className="absolute inset-x-1 bottom-1 origin-bottom rounded-b-[38%]"
                      >
                        <div
                          className="absolute inset-0 rounded-b-[38%]"
                          style={{ background: mode === "available" ? "#34d399" : accent.solid }}
                        />
                        <motion.div
                          animate={{ x: ["-25%", "35%", "-25%"] }}
                          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
                          className="absolute left-0 right-0 top-1 h-2 rounded-full bg-white/20 blur-[2px]"
                        />
                      </motion.div>
                    </div>

                    {/* tiny highlight */}
                    <span
                      className="absolute left-3 top-3 h-8 w-1 rounded-full bg-white/10 blur-[1px]"
                    />
                  </motion.div>

                  {/* Floor puddle */}
                  <motion.div
                    animate={{
                      opacity: mode === "available" || transitioning ? 0.6 : 0,
                      scaleX: mode === "available" || transitioning ? 1 : 0.2,
                    }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="absolute bottom-4 left-1/2 h-3 w-40 -translate-x-1/2 rounded-full blur-[2px]"
                    style={{
                      background:
                        mode === "available" ? "rgba(52,211,153,0.48)" : accent.solid,
                    }}
                  />
                  <motion.div
                    animate={{
                      opacity: mode === "available" || transitioning ? 0.34 : 0,
                      scaleX: mode === "available" || transitioning ? 1.1 : 0.2,
                    }}
                    transition={{ duration: 0.65, ease: "easeOut" }}
                    className="absolute bottom-3 left-1/2 h-1 w-28 -translate-x-1/2 rounded-full"
                    style={{
                      background:
                        mode === "available" ? "#34d399" : accent.text,
                    }}
                  />
                </div>

                <motion.div
                  animate={{ opacity: transitioning ? 0.4 : 1 }}
                  className="relative text-center"
                >
                  <motion.p
                    key={mode}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm font-black uppercase tracking-[0.24em]"
                    style={{ color: mode === "available" ? "#34d399" : accent.text }}
                  >
                    {mode === "all" ? "All" : "Available"}
                  </motion.p>
                  <motion.p
                    key={`${mode}-hint`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-1 text-[10px] font-medium text-zinc-700"
                  >
                    {mode === "all" ? "drag to empty" : "drag to fill & pick"}
                  </motion.p>
                </motion.div>
              </div>

              {/* Mode summary */}
              <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-zinc-800/70 bg-[#06111f]/80 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: mode === "available" ? "#34d399" : accent.solid }}
                  />
                  <span className="text-[10px] font-black uppercase tracking-[0.16em] text-zinc-600">
                    {mode === "all" ? `${allSlotCount} slots` : `${availableSlotCount} available`}
                  </span>
                </div>
                {teamReservedSlotCount > 0 && mode === "all" && (
                  <span className="text-[10px] font-bold text-orange-300/70">
                    {teamReservedSlotCount} team reserved
                  </span>
                )}
              </div>

              {/* SLOTS */}
              <div className="mt-4 max-h-[300px] overflow-y-auto pr-1">
                {slots.length > 0 ? (
                  <div className="space-y-2">
                    {slots.map((slot, index) => {
                      const unavailable = slotUnavailable(slot);
                      const selected = selectedSlotId === slot.id;
                      const reserved =
                        slot.isTeamReserved ||
                        slot.slotType?.toLowerCase() === "team_reserved";

                      return (
                        <motion.button
                          type="button"
                          key={slot.id}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: unavailable ? 0.45 : 1, y: 0 }}
                          transition={{ delay: index * 0.025 }}
                          whileHover={!unavailable ? { x: 2 } : undefined}
                          disabled={unavailable}
                          onClick={() => onSelect(slot)}
                          className="flex w-full items-center justify-between gap-4 rounded-2xl border px-4 py-3 text-left transition disabled:cursor-not-allowed"
                          style={{
                            borderColor: selected
                              ? "rgba(52,211,153,0.35)"
                              : unavailable
                                ? "rgba(63,63,70,0.45)"
                                : accent.border,
                            background: selected
                              ? "rgba(16,185,129,0.07)"
                              : unavailable
                                ? "rgba(24,24,27,0.36)"
                                : accent.bg,
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <motion.span
                              animate={
                                !unavailable
                                  ? { scale: [1, 1.2, 1], opacity: [0.65, 1, 0.65] }
                                  : { scale: 1, opacity: 1 }
                              }
                              transition={{ duration: 2.2, repeat: !unavailable ? Infinity : 0 }}
                              className={`h-2 w-2 rounded-full ${
                                reserved
                                  ? "bg-orange-400"
                                  : slot.isBooked
                                    ? "bg-red-400"
                                    : "bg-[#a8f0b0]"
                              }`}
                            />
                            <div>
                              <p className="text-sm font-black text-zinc-200">
                                {formatTime(slot.startTime)} — {formatTime(slot.endTime)}
                              </p>
                              <p className="mt-0.5 text-[9px] font-black uppercase tracking-[0.15em] text-zinc-700">
                                {reserved
                                  ? slot.teamName || "Team reserved"
                                  : slot.isBooked
                                    ? "Booked"
                                    : "Open slot"}
                              </p>
                            </div>
                          </div>

                          <span
                            className={`text-[9px] font-black uppercase tracking-[0.14em] ${
                              selected
                                ? "text-[#a8f0b0]"
                                : reserved
                                  ? "text-orange-300"
                                  : slot.isBooked
                                    ? "text-red-300"
                                    : "text-[#a8f0b0]"
                            }`}
                          >
                            {selected
                              ? "Selected"
                              : reserved
                                ? "Reserved"
                                : slot.isBooked
                                  ? "Booked"
                                  : "Available"}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-zinc-800 px-5 py-8 text-center">
                    <Clock3 className="mx-auto text-zinc-700" size={20} />
                    <p className="mt-3 text-sm font-bold text-zinc-500">No slots in this window</p>
                    <p className="mt-1 text-xs text-zinc-700">
                      The live slot window will update automatically.
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between gap-3 text-[9px] font-black uppercase tracking-[0.14em] text-zinc-700">
                <span>5–6 hour rolling window</span>
                <span>{loading ? "Updating" : "Live"}</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ConfirmationModal({
  sport,
  accent,
  target,
  selectedSlot,
  selectedResource,
  selectedGear,
  onClose,
  onConfirm,
  loading,
}: {
  sport: Sport;
  accent: Accent;
  target: Exclude<BookingTarget, null>;
  selectedSlot: Slot | null;
  selectedResource: Resource | null;
  selectedGear: Record<number, number>;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}) {
  const gearItems = Object.entries(selectedGear).filter(([, quantity]) => quantity > 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[125] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md"
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 14, scale: 0.98 }}
        className="w-full max-w-md rounded-[2rem] border border-zinc-800 bg-[#081827] p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p
              className="text-[10px] font-black uppercase tracking-[0.25em]"
              style={{ color: accent.text }}
            >
              Confirm
            </p>
            <h2 className="mt-2 text-2xl font-black">Ready to book?</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-700 transition hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-6 space-y-2">
          <div className="rounded-2xl border border-zinc-800/80 bg-[#06111f]/80 px-4 py-3">
            <p className="text-[9px] font-black uppercase tracking-[0.16em] text-zinc-700">
              Sport
            </p>
            <p className="mt-1 text-sm font-bold text-zinc-200">{sport.name}</p>
          </div>

          {selectedResource && (
            <div className="rounded-2xl border border-zinc-800/80 bg-[#06111f]/80 px-4 py-3">
              <p className="text-[9px] font-black uppercase tracking-[0.16em] text-zinc-700">
                Resource
              </p>
              <p className="mt-1 text-sm font-bold text-zinc-200">
                {selectedResource.name}
              </p>
            </div>
          )}

          {target.type === "slot" && selectedSlot && (
            <div className="rounded-2xl border border-zinc-800/80 bg-[#06111f]/80 px-4 py-3">
              <p className="text-[9px] font-black uppercase tracking-[0.16em] text-zinc-700">
                Time
              </p>
              <p className="mt-1 text-sm font-bold text-zinc-200">
                {formatTime(selectedSlot.startTime)} — {formatTime(selectedSlot.endTime)}
              </p>
            </div>
          )}

          <div className="rounded-2xl border border-zinc-800/80 bg-[#06111f]/80 px-4 py-3">
            <p className="text-[9px] font-black uppercase tracking-[0.16em] text-zinc-700">
              Gear
            </p>
            <p className="mt-1 text-sm font-bold text-zinc-200">
              {gearItems.length > 0
                ? gearItems
                    .map(([id, quantity]) => {
                      const gear = sport.gears.find((item) => item.id === Number(id));
                      return `${gear?.name || "Gear"} × ${quantity}`;
                    })
                    .join(", ")
                : "No additional gear"}
            </p>
          </div>
        </div>

        <motion.button
          type="button"
          disabled={loading}
          onClick={onConfirm}
          whileTap={{ scale: 0.985 }}
          className="mt-6 flex w-full items-center justify-between rounded-2xl px-5 py-4 text-xs font-black uppercase tracking-[0.18em] text-black disabled:opacity-50"
          style={{ background: accent.solid }}
        >
          <span>{loading ? "Booking…" : "Confirm booking"}</span>
          <ArrowRight size={17} />
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
