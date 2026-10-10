"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Loader2,
  MapPin,
  Package,
  RefreshCw,
  Timer,
  Undo2,
  X,
} from "lucide-react";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAuthHeaders, getAuthToken, getUser } from "@/lib/auth";

const API = "http://localhost:5000";
const CURRENT_STATUSES = ["active", "return_requested"];

type GearItem = { gearId: number; quantity: number };

type BookingApi = {
  id: number;
  status: string;
  bookingType: string;
  sportId: number;
  slotId: number | null;
  resourceUnitId: number | null;
  gearsBooked: GearItem[] | null;
  notes: string | null;
  returnDeclinedAt: string | null;
  returnDeclineNote: string | null;
  bookedAt: string;
  startTime: string | null;
  endTime: string | null;
  sport?: { name: string } | null;
  slot?: { startTime: string; endTime: string } | null;
};

type SportApi = {
  id: number;
  name: string;
  gears?: { id: number; name: string }[];
  resourceUnits?: { id: number; name: string }[];
};

type PendingAction = { id: number; action: "return" | "cancel" };
type Toast = { id: number; tone: "success" | "error"; text: string };

function formatDay(value: Date) {
  return value.toLocaleDateString([], { weekday: "short", day: "numeric", month: "short" });
}

function formatTime(value: Date) {
  return value.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function formatDuration(ms: number) {
  const hours = Math.floor(ms / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

function getPhase(status: string, startMs: number | null, endMs: number | null, now: number) {
  if (status === "return_requested") {
    return { label: "Waiting for staff verification", tone: "amber", pulse: true };
  }
  if (startMs === null) {
    return { label: "Gear out · return when finished", tone: "emerald", pulse: false };
  }
  if (endMs !== null && now >= endMs) {
    return { label: "Slot ended · return needed", tone: "amber", pulse: false };
  }
  if (now < startMs) {
    return { label: `Starts in ${formatDuration(startMs - now)}`, tone: "cyan", pulse: false };
  }
  return { label: "In progress", tone: "emerald", pulse: true };
}

const TONE_CLASSES: Record<string, string> = {
  cyan: "border-cyan-400/25 bg-cyan-400/10 text-cyan-300",
  emerald: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300",
  amber: "border-amber-400/25 bg-amber-400/10 text-amber-300",
};

export default function MyBookingsPage() {
  const reduceMotion = useReducedMotion();

  const [bookings, setBookings] = useState<BookingApi[]>([]);
  const [sports, setSports] = useState<SportApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [pending, setPending] = useState<PendingAction | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [now, setNow] = useState(() => Date.now());


  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const showToast = useCallback((tone: Toast["tone"], text: string) => {
    const id = Date.now();
    setToast({ id, tone, text });
    window.setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, 3500);
  }, []);

  const load = useCallback(async () => {
    const user = getUser();
    if (!user || !getAuthToken()) {
      setLoadError("Not signed in on this browser. Your bookings will appear once you sign in.");
      setLoading(false);
      return;
    }

    try {
      setLoadError("");
      const [bookingsRes, sportsRes] = await Promise.all([
        fetch(`${API}/users/${user.id}/bookings`, { headers: getAuthHeaders(), cache: "no-store" }),
        fetch(`${API}/sports`, { cache: "no-store" }),
      ]);

      if (!bookingsRes.ok) {
        throw new Error(
          bookingsRes.status === 401
            ? "Your session has ended. Your bookings will appear once you sign in again."
            : "Could not load your bookings right now."
        );
      }

      const bookingData = await bookingsRes.json();
      const sportData = sportsRes.ok ? await sportsRes.json() : [];

      setBookings(Array.isArray(bookingData) ? bookingData : []);
      setSports(Array.isArray(sportData) ? sportData : []);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Could not load your bookings right now.");
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setNow(Date.now());
    setRefreshing(false);
  }, [load]);

  useEffect(() => {
    load();
  }, [load]);

  const gearNames = useMemo(() => {
    const names = new Map<number, string>();
    sports.forEach((sport) => (sport.gears ?? []).forEach((gear) => names.set(gear.id, gear.name)));
    return names;
  }, [sports]);

  const resourceNames = useMemo(() => {
    const names = new Map<number, string>();
    sports.forEach((sport) =>
      (sport.resourceUnits ?? []).forEach((unit) => names.set(unit.id, unit.name))
    );
    return names;
  }, [sports]);

  const current = useMemo(() => {
    return bookings
      .filter((booking) => CURRENT_STATUSES.includes(booking.status.toLowerCase()))
      .map((booking) => ({
        booking,
        startMs: (booking.startTime ?? booking.slot?.startTime)
          ? new Date(booking.startTime ?? booking.slot!.startTime).getTime()
          : null,
        endMs: (booking.endTime ?? booking.slot?.endTime)
          ? new Date(booking.endTime ?? booking.slot!.endTime).getTime()
          : null,
      }))
      .sort((a, b) => {
        if (a.startMs === null) return 1;
        if (b.startMs === null) return -1;
        return a.startMs - b.startMs;
      })
      .slice(0, 1);
  }, [bookings]);

  const totalGearUnits = current.reduce(
    (sum, { booking }) =>
      sum + (booking.gearsBooked ?? []).reduce((inner, item) => inner + item.quantity, 0),
    0
  );

  const runAction = async (booking: BookingApi, action: PendingAction["action"]) => {
    setBusyId(booking.id);
    try {
      const response = await fetch(
        action === "cancel" ? `${API}/bookings/${booking.id}/cancel` : `${API}/return-request/${booking.id}`,
        {
          method: action === "cancel" ? "POST" : "PUT",
          headers: getAuthHeaders(),
        }
      );
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Request failed. Please try again.");
      }

      setPending(null);
      showToast(
        "success",
        action === "cancel" ? "Booking cancelled." : "Return sent. Staff will verify it shortly."
      );
      await load();
    } catch (error) {
      showToast("error", error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <DashboardLayout title="My Bookings">
      <div className="space-y-8">
        <motion.header
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between"
        >
          <div className="flex items-center gap-4">
            <motion.div
              whileHover={reduceMotion ? undefined : { rotate: -6, scale: 1.05 }}
              className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-300 shadow-[0_0_30px_rgba(52,211,153,0.12)]"
            >
              <CalendarCheck size={22} />
            </motion.div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400/80">
                Your activity
              </p>
              <p className="mt-1 text-sm text-zinc-500">
                Current and upcoming slots and gear. Past bookings are in History.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {!loading && !loadError && current.length > 0 && (
              <>
                <SummaryChip label="Active" value={current.length} />
                <SummaryChip label="Gear items out" value={totalGearUnits} />
              </>
            )}
            <motion.button
              type="button"
              onClick={refresh}
              disabled={refreshing}
              whileHover={reduceMotion ? undefined : { scale: 1.04 }}
              whileTap={reduceMotion ? undefined : { scale: 0.96 }}
              className="inline-flex h-12 items-center gap-2 rounded-2xl border border-zinc-800 bg-[#090b0b] px-5 text-sm font-semibold text-zinc-300 transition hover:border-emerald-400/40 hover:text-emerald-300 disabled:opacity-60"
            >
              <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
              {refreshing ? "Refreshing…" : "Refresh"}
            </motion.button>
          </div>
        </motion.header>

        {loading && <BookingSkeleton />}

        {!loading && loadError && (
          <div className="rounded-3xl border border-zinc-800 bg-[#090b0b] p-8 text-sm text-zinc-400">
            <div className="flex items-center gap-3">
              <AlertTriangle size={18} className="text-amber-400" />
              {loadError}
            </div>
          </div>
        )}

        {!loading && !loadError && current.length === 0 && (
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative overflow-hidden rounded-3xl border border-dashed border-zinc-800 bg-[#090b0b] px-6 py-16 text-center"
          >
            <div className="pointer-events-none absolute left-1/2 top-0 h-40 w-40 -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl" />
            <CalendarCheck size={34} className="relative mx-auto text-zinc-700" />
            <p className="relative mt-4 text-lg font-semibold text-zinc-200">
              No current or upcoming bookings
            </p>
            <p className="relative mt-1 text-sm text-zinc-500">
              Book a slot or gear and it will show up here.
            </p>
            <Link
              href="/booking"
              className="relative mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-emerald-400"
            >
              Book now
              <ArrowRight size={15} />
            </Link>
          </motion.div>
        )}

        {!loading && !loadError && current.length > 0 && (
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <AnimatePresence mode="popLayout">
              {current.map(({ booking, startMs, endMs }, index) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  startMs={startMs}
                  endMs={endMs}
                  now={now}
                  index={index}
                  gearNames={gearNames}
                  resourceNames={resourceNames}
                  pending={pending?.id === booking.id ? pending.action : null}
                  busy={busyId === booking.id}
                  reduceMotion={!!reduceMotion}
                  onAsk={(action) => setPending({ id: booking.id, action })}
                  onCancelAsk={() => setPending(null)}
                  onConfirm={(action) => runAction(booking, action)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12 }}
            role="status"
            className={`fixed bottom-6 right-6 z-[120] flex max-w-sm items-start gap-3 rounded-2xl border px-5 py-4 text-sm shadow-[0_20px_60px_rgba(0,0,0,0.5)] backdrop-blur-xl ${
              toast.tone === "success"
                ? "border-emerald-400/25 bg-emerald-950/80 text-emerald-200"
                : "border-red-400/25 bg-red-950/80 text-red-200"
            }`}
          >
            {toast.tone === "success" ? <CheckCircle2 size={18} className="mt-0.5 shrink-0" /> : <AlertTriangle size={18} className="mt-0.5 shrink-0" />}
            <span>{toast.text}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}

function SummaryChip({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-[#090b0b] px-5 py-3">
      <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-black text-white">{value}</p>
    </div>
  );
}

function BookingSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      {[0, 1].map((key) => (
        <div key={key} className="h-72 animate-pulse rounded-3xl border border-zinc-800 bg-[#090b0b]" />
      ))}
    </div>
  );
}

type CardProps = {
  booking: BookingApi;
  startMs: number | null;
  endMs: number | null;
  now: number;
  index: number;
  gearNames: Map<number, string>;
  resourceNames: Map<number, string>;
  pending: PendingAction["action"] | null;
  busy: boolean;
  reduceMotion: boolean;
  onAsk: (action: PendingAction["action"]) => void;
  onCancelAsk: () => void;
  onConfirm: (action: PendingAction["action"]) => void;
};

function BookingCard({
  booking,
  startMs,
  endMs,
  now,
  index,
  gearNames,
  resourceNames,
  pending,
  busy,
  reduceMotion,
  onAsk,
  onCancelAsk,
  onConfirm,
}: CardProps) {
  const status = booking.status.toLowerCase();
  const isGearOnly = booking.bookingType === "gear" || startMs === null;
  const hasEnded = endMs !== null && now >= endMs;
  const phase = getPhase(status, startMs, endMs, now);
  const gearItems = booking.gearsBooked ?? [];
  const gearTotal = gearItems.reduce((sum, item) => sum + item.quantity, 0);
  const resourceName = booking.resourceUnitId ? resourceNames.get(booking.resourceUnitId) : null;

  const accent = isGearOnly
    ? { glow: "bg-emerald-500/30", bar: "from-emerald-400 to-teal-500", chip: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300" }
    : { glow: "bg-cyan-500/30", bar: "from-cyan-400 to-sky-500", chip: "border-cyan-400/25 bg-cyan-400/10 text-cyan-300" };

  return (
    <motion.article
      layout={!reduceMotion}
      initial={reduceMotion ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduceMotion ? undefined : { opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.4, delay: reduceMotion ? 0 : index * 0.06 }}
      whileHover={reduceMotion ? undefined : { y: -3 }}
      className="group relative overflow-hidden rounded-3xl border border-zinc-800 bg-[#090b0b] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] transition-colors hover:border-zinc-700"
    >
      <div className={`pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full blur-3xl opacity-30 transition-opacity duration-500 group-hover:opacity-50 ${accent.glow}`} />
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accent.bar}`} />

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider ${accent.chip}`}>
              {isGearOnly ? "Gear only" : "Slot booking"}
            </span>
            <span className="text-[11px] text-zinc-600">#{booking.id}</span>
          </div>
          <h3 className="mt-3 text-2xl font-bold text-white">{booking.sport?.name || "Sport"}</h3>
        </div>

        <span
          className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${TONE_CLASSES[phase.tone]}`}
        >
          <span className="relative flex h-2 w-2">
            {phase.pulse && !reduceMotion && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-60" />
            )}
            <span className="relative inline-flex h-2 w-2 rounded-full bg-current" />
          </span>
          {phase.label}
        </span>
      </div>

      <div className="relative mt-6 grid gap-4 md:grid-cols-2">
        {startMs !== null && (
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/60 p-4">
            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
              <CalendarDays size={13} /> Slot
            </p>
            <p className="mt-2 text-base font-semibold text-zinc-100">{formatDay(new Date(startMs))}</p>
            <p className="mt-1 flex items-center gap-2 text-sm text-zinc-400">
              <Clock3 size={14} className="text-zinc-500" />
              {formatTime(new Date(startMs))}
              {endMs !== null && <> – {formatTime(new Date(endMs))}</>}
            </p>
            {endMs !== null && (
              <>
                <p className="mt-2 flex items-center gap-2 text-xs text-zinc-600">
                  <Timer size={12} />
                  {formatDuration(endMs - startMs)} long
                </p>
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-zinc-800">
                  <motion.div
                    initial={reduceMotion ? false : { width: 0 }}
                    animate={{
                      width: `${Math.min(100, Math.max(0, ((now - startMs) / (endMs - startMs)) * 100))}%`,
                    }}
                    transition={{ duration: 0.9, ease: "easeOut" }}
                    className={`h-full rounded-full bg-gradient-to-r ${accent.bar}`}
                  />
                </div>
                <p className="mt-1.5 text-[10px] uppercase tracking-wider text-zinc-600">
                  Slot progress
                </p>
              </>
            )}
          </div>
        )}

        <div className={`rounded-2xl border border-zinc-800/80 bg-zinc-950/60 p-4 ${startMs === null ? "md:col-span-2" : ""}`}>
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
            <Package size={13} /> Equipment
          </p>

          {gearItems.length === 0 ? (
            <p className="mt-3 text-sm text-zinc-600">No gear on this booking.</p>
          ) : (
            <>
              <ul className="mt-3 space-y-2">
                {gearItems.map((item) => (
                  <li key={item.gearId} className="flex items-center justify-between gap-3 text-sm">
                    <span className="truncate text-zinc-300">
                      {gearNames.get(item.gearId) ?? `Gear #${item.gearId}`}
                    </span>
                    <span className="shrink-0 rounded-lg bg-zinc-800 px-2.5 py-0.5 text-xs font-semibold text-zinc-200">
                      × {item.quantity}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex items-center justify-between border-t border-zinc-800 pt-3 text-xs">
                <span className="text-zinc-500">Total items out</span>
                <span className="font-bold text-white">{gearTotal}</span>
              </div>
            </>
          )}

          {resourceName && (
            <p className="mt-3 flex items-center gap-2 text-sm text-zinc-400">
              <MapPin size={14} className="text-zinc-500" />
              {resourceName}
            </p>
          )}
        </div>
      </div>

      {booking.returnDeclineNote && status === "active" && (
        <div className="relative mt-4 rounded-2xl border border-amber-400/25 bg-amber-400/5 px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-300">Return declined by staff</p>
          <p className="mt-1 text-sm text-amber-100">{booking.returnDeclineNote}</p>
          <p className="mt-1 text-xs text-amber-200/60">Fix the issue, then request the return again.</p>
        </div>
      )}

      {booking.notes && (
        <p className="relative mt-4 rounded-xl bg-zinc-950/60 px-4 py-3 text-xs text-zinc-500">
          Note: {booking.notes}
        </p>
      )}

      <div className="relative mt-6 min-h-[52px]">
        <AnimatePresence mode="wait" initial={false}>
          {pending ? (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="flex flex-col gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-500/5 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <p className="text-sm text-zinc-300">
                {pending === "cancel" ? "Cancel this booking? This cannot be undone." : "Send a return request to staff?"}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onCancelAsk}
                  disabled={busy}
                  className="rounded-xl border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:border-zinc-500 disabled:opacity-50"
                >
                  Keep
                </button>
                <button
                  type="button"
                  onClick={() => onConfirm(pending)}
                  disabled={busy}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-emerald-400 disabled:opacity-60"
                >
                  {busy && <Loader2 size={14} className="animate-spin" />}
                  {pending === "cancel" ? "Yes, cancel" : "Yes, return"}
                </button>
              </div>
            </motion.div>
          ) : status === "return_requested" ? (
            <motion.div
              key="waiting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3 rounded-2xl border border-amber-400/20 bg-amber-400/5 px-4 py-3 text-sm text-amber-300"
            >
              <Loader2 size={16} className={reduceMotion ? "" : "animate-spin"} />
              Return sent. Waiting for staff to verify the equipment.
            </motion.div>
          ) : (
            <motion.div key="actions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-wrap gap-3">
              <motion.button
                type="button"
                whileHover={reduceMotion ? undefined : { scale: 1.03 }}
                whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                onClick={() => onAsk("return")}
                className="group/return relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 px-4 py-2.5 text-sm font-semibold text-black shadow-[0_10px_30px_rgba(52,211,153,0.25)] transition hover:shadow-[0_14px_40px_rgba(52,211,153,0.35)]"
              >
                <Undo2 size={15} className="transition-transform duration-300 group-hover/return:-translate-x-1" />
                {hasEnded ? "Return now" : "Request return"}
              </motion.button>
              {!hasEnded && (
                <button
                  type="button"
                  onClick={() => onAsk("cancel")}
                  className="inline-flex items-center gap-2 rounded-xl border border-red-400/30 px-4 py-2.5 text-sm font-semibold text-red-300 transition hover:bg-red-500/10"
                >
                  Cancel booking
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.article>
  );
}
