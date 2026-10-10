"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Loader2,
  MapPin,
  Package,
  RefreshCw,
  Search,
  Timer,
  Undo2,
  X,
  XCircle,
} from "lucide-react";

import { getAuthHeaders, getAuthToken } from "@/lib/auth";

const API = "http://localhost:5000";

type GearItem = { gearId: number; quantity: number };

type StaffBooking = {
  id: number;
  status: string;
  bookingType: string;
  sportId: number;
  resourceUnitId: number | null;
  gearsBooked: GearItem[] | null;
  notes: string | null;
  bookedAt: string;
  returnRequestedAt: string | null;
  startTime: string | null;
  endTime: string | null;
  user?: { name: string; rollNo: string | null; email: string } | null;
  sport?: { name: string } | null;
  slot?: { startTime: string; endTime: string } | null;
};

type SportApi = {
  id: number;
  name: string;
  gears?: { id: number; name: string }[];
  resourceUnits?: { id: number; name: string }[];
};

type Toast = { id: number; tone: "success" | "error"; text: string };
type PendingCancel = number | null;

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

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function getStatusView(status: string, startMs: number | null, endMs: number | null, now: number) {
  if (status === "return_requested") {
    return { label: "Return requested", tone: "amber", pulse: true };
  }
  if (startMs === null) {
    return { label: "Gear out", tone: "emerald", pulse: false };
  }
  if (endMs !== null && now >= endMs) {
    return { label: "Slot ended · return needed", tone: "amber", pulse: false };
  }
  if (now < startMs) {
    return { label: `Starts in ${formatDuration(startMs - now)}`, tone: "cyan", pulse: false };
  }
  return { label: "In progress", tone: "emerald", pulse: true };
}

const TONE: Record<string, string> = {
  cyan: "border-cyan-400/25 bg-cyan-400/10 text-cyan-300",
  emerald: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300",
  amber: "border-amber-400/25 bg-amber-400/10 text-amber-300",
};

export default function StaffBookingsPage() {
  const reduceMotion = useReducedMotion();

  const [bookings, setBookings] = useState<StaffBooking[]>([]);
  const [sports, setSports] = useState<SportApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [pendingCancel, setPendingCancel] = useState<PendingCancel>(null);
  const [declineFor, setDeclineFor] = useState<number | null>(null);
  const [declineNote, setDeclineNote] = useState("");
  const [search, setSearch] = useState("");
  const [sportFilter, setSportFilter] = useState("");
  const [toast, setToast] = useState<Toast | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const showToast = useCallback((tone: Toast["tone"], text: string) => {
    const id = Date.now();
    setToast({ id, tone, text });
    window.setTimeout(() => setToast((current) => (current?.id === id ? null : current)), 3500);
  }, []);

  const load = useCallback(async () => {
    if (!getAuthToken()) {
      setLoadError("Not signed in on this browser. Sign in as staff to manage bookings.");
      setLoading(false);
      return;
    }

    try {
      setLoadError("");
      const [bookingsRes, sportsRes] = await Promise.all([
        fetch(`${API}/bookings/active`, { headers: getAuthHeaders(), cache: "no-store" }),
        fetch(`${API}/sports`, { cache: "no-store" }),
      ]);

      if (!bookingsRes.ok) {
        throw new Error(
          bookingsRes.status === 401 || bookingsRes.status === 403
            ? "Your staff session has ended or does not have access to bookings."
            : "Could not load bookings right now."
        );
      }

      const bookingData = await bookingsRes.json();
      const sportData = sportsRes.ok ? await sportsRes.json() : [];
      setBookings(Array.isArray(bookingData) ? bookingData : []);
      setSports(Array.isArray(sportData) ? sportData : []);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Could not load bookings right now.");
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
    sports.forEach((sport) => (sport.resourceUnits ?? []).forEach((unit) => names.set(unit.id, unit.name)));
    return names;
  }, [sports]);

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();

    return bookings
      .filter((booking) => {
        const matchesName = !term || (booking.user?.name ?? "").toLowerCase().includes(term);
        const matchesSport = !sportFilter || booking.sport?.name === sportFilter;
        return matchesName && matchesSport;
      })
      .map((booking) => {
        const startIso = booking.startTime ?? booking.slot?.startTime ?? null;
        const endIso = booking.endTime ?? booking.slot?.endTime ?? null;
        return {
          booking,
          startMs: startIso ? new Date(startIso).getTime() : null,
          endMs: endIso ? new Date(endIso).getTime() : null,
        };
      })
      .sort((a, b) => {
        const aReturn = a.booking.status === "return_requested" ? 0 : 1;
        const bReturn = b.booking.status === "return_requested" ? 0 : 1;
        if (aReturn !== bReturn) return aReturn - bReturn;
        const aTime = new Date(a.booking.returnRequestedAt ?? a.booking.bookedAt).getTime();
        const bTime = new Date(b.booking.returnRequestedAt ?? b.booking.bookedAt).getTime();
        return bTime - aTime;
      });
  }, [bookings, search, sportFilter]);

  const returnRows = rows.filter((row) => row.booking.status === "return_requested");
  const currentRows = rows.filter((row) => row.booking.status !== "return_requested");

  const sportNames = useMemo(
    () => Array.from(new Set(bookings.map((booking) => booking.sport?.name).filter(Boolean))) as string[],
    [bookings]
  );

  const runAction = async (bookingId: number, action: "accept" | "decline" | "cancel", note = "") => {
    const endpoint =
      action === "accept"
        ? `${API}/approve-return/${bookingId}`
        : action === "decline"
          ? `${API}/decline-return/${bookingId}`
          : `${API}/bookings/${bookingId}/cancel`;
    const method = action === "cancel" ? "POST" : "PUT";

    setBusyId(bookingId);
    try {
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: action === "decline" ? JSON.stringify({ note }) : undefined,
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong. Please try again.");
      }

      setPendingCancel(null);
      setDeclineFor(null);
      setDeclineNote("");
      showToast(
        "success",
        action === "accept"
          ? "Return accepted. The equipment is back in stock."
          : action === "decline"
            ? "Return declined. The booking is active again."
            : "Booking cancelled. Its slot and equipment are released."
      );
      await load();
    } catch (error) {
      showToast("error", error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <main className="min-h-screen bg-[#050607] px-6 py-10 text-white md:px-10">
      <div className="mx-auto max-w-6xl space-y-10">
        <motion.header
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
        >
          <div>
            <Link href="/staff" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 transition hover:text-emerald-300">
              <ArrowLeft size={13} /> Staff dashboard
            </Link>
            <h1 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">Bookings desk</h1>
            <p className="mt-2 text-sm text-zinc-500">Accept or decline return requests, and cancel current bookings.</p>
            <Link href="/staff/operations" className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-2 text-xs font-semibold text-zinc-300 transition hover:border-emerald-400/40 hover:text-emerald-300">Operations: history, issued gear, slots, resources</Link>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Stat label="Current" value={currentRows.length} />
            <Stat label="Return requests" value={returnRows.length} tone="amber" />
            <motion.button
              type="button"
              onClick={refresh}
              disabled={refreshing}
              whileHover={reduceMotion ? undefined : { scale: 1.04 }}
              whileTap={reduceMotion ? undefined : { scale: 0.96 }}
              className="inline-flex h-14 items-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-950 px-5 text-sm font-semibold text-zinc-300 transition hover:border-emerald-400/40 hover:text-emerald-300 disabled:opacity-60"
            >
              <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
              {refreshing ? "Refreshing…" : "Refresh"}
            </motion.button>
          </div>
        </motion.header>

        <div className="grid gap-3 md:grid-cols-[1fr_220px]">
          <div className="relative">
            <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by student name…"
              className="h-12 w-full rounded-2xl border border-zinc-800 bg-zinc-950 pl-11 pr-4 text-sm text-white outline-none transition focus:border-emerald-500/50"
            />
          </div>
          <select
            value={sportFilter}
            onChange={(event) => setSportFilter(event.target.value)}
            className="h-12 rounded-2xl border border-zinc-800 bg-zinc-950 px-4 text-sm text-zinc-300 outline-none transition focus:border-emerald-500/50"
          >
            <option value="">All sports</option>
            {sportNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>

        {loading && (
          <div className="grid gap-5 md:grid-cols-2">
            {[0, 1].map((key) => (
              <div key={key} className="h-56 animate-pulse rounded-3xl border border-zinc-800 bg-zinc-950" />
            ))}
          </div>
        )}

        {!loading && loadError && (
          <div className="flex items-center gap-3 rounded-3xl border border-zinc-800 bg-zinc-950 p-6 text-sm text-zinc-400">
            <AlertTriangle size={18} className="text-amber-400" />
            {loadError}
          </div>
        )}

        {!loading && !loadError && (
          <>
            <Section
              title="Return requests"
              accent="amber"
              subtitle="Students who have sent their equipment back. Check it, then accept or decline."
              count={returnRows.length}
            >
              <AnimatePresence mode="popLayout">
                {returnRows.map(({ booking, startMs, endMs }, index) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    startMs={startMs}
                    endMs={endMs}
                    now={now}
                    index={index}
                    gearNames={gearNames}
                    resourceNames={resourceNames}
                    busy={busyId === booking.id}
                    confirmingCancel={pendingCancel === booking.id}
                    declining={declineFor === booking.id}
                    declineNote={declineNote}
                    onNoteChange={setDeclineNote}
                    onAskDecline={() => {
                      setDeclineFor(booking.id);
                      setDeclineNote("");
                    }}
                    onKeepDecline={() => setDeclineFor(null)}
                    onConfirmDecline={() => runAction(booking.id, "decline", declineNote)}
                    reduceMotion={!!reduceMotion}
                    onAccept={() => runAction(booking.id, "accept")}
                    onAskCancel={() => setPendingCancel(booking.id)}
                    onKeep={() => setPendingCancel(null)}
                    onConfirmCancel={() => runAction(booking.id, "cancel")}
                  />
                ))}
              </AnimatePresence>
              {returnRows.length === 0 && <EmptyNote text="No return requests right now." />}
            </Section>

            <Section
              title="Current bookings"
              accent="cyan"
              subtitle="Everything students have booked and not yet returned."
              count={currentRows.length}
            >
              <AnimatePresence mode="popLayout">
                {currentRows.map(({ booking, startMs, endMs }, index) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    startMs={startMs}
                    endMs={endMs}
                    now={now}
                    index={index}
                    gearNames={gearNames}
                    resourceNames={resourceNames}
                    busy={busyId === booking.id}
                    confirmingCancel={pendingCancel === booking.id}
                    declining={declineFor === booking.id}
                    declineNote={declineNote}
                    onNoteChange={setDeclineNote}
                    onAskDecline={() => {
                      setDeclineFor(booking.id);
                      setDeclineNote("");
                    }}
                    onKeepDecline={() => setDeclineFor(null)}
                    onConfirmDecline={() => runAction(booking.id, "decline", declineNote)}
                    reduceMotion={!!reduceMotion}
                    onAccept={() => runAction(booking.id, "accept")}
                    onAskCancel={() => setPendingCancel(booking.id)}
                    onKeep={() => setPendingCancel(null)}
                    onConfirmCancel={() => runAction(booking.id, "cancel")}
                  />
                ))}
              </AnimatePresence>
              {currentRows.length === 0 && <EmptyNote text="No current bookings." />}
            </Section>
          </>
        )}
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            role="status"
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12 }}
            className={`fixed bottom-6 right-6 z-[120] flex max-w-sm items-start gap-3 rounded-2xl border px-5 py-4 text-sm shadow-[0_20px_60px_rgba(0,0,0,0.5)] backdrop-blur-xl ${
              toast.tone === "success"
                ? "border-emerald-400/25 bg-emerald-950/80 text-emerald-200"
                : "border-red-400/25 bg-red-950/80 text-red-200"
            }`}
          >
            {toast.tone === "success" ? <CheckCircle2 size={18} className="mt-0.5 shrink-0" /> : <XCircle size={18} className="mt-0.5 shrink-0" />}
            <span>{toast.text}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: "amber" }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 px-5 py-3">
      <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">{label}</p>
      <p className={`mt-1 text-2xl font-black ${tone === "amber" ? "text-amber-300" : "text-white"}`}>{value}</p>
    </div>
  );
}

function Section({
  title,
  subtitle,
  accent,
  count,
  children,
}: {
  title: string;
  subtitle: string;
  accent: "amber" | "cyan";
  count: number;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className={`text-xl font-bold ${accent === "amber" ? "text-amber-300" : "text-cyan-300"}`}>{title}</h2>
          <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>
        </div>
        <span className="rounded-full border border-zinc-800 bg-zinc-950 px-3 py-1 text-xs text-zinc-400">{count}</span>
      </div>
      <div className="grid gap-5 md:grid-cols-2">{children}</div>
    </section>
  );
}

function EmptyNote({ text }: { text: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-zinc-800 bg-zinc-950/60 px-6 py-10 text-center text-sm text-zinc-500 md:col-span-2">
      {text}
    </div>
  );
}

type CardProps = {
  booking: StaffBooking;
  startMs: number | null;
  endMs: number | null;
  now: number;
  index: number;
  gearNames: Map<number, string>;
  resourceNames: Map<number, string>;
  busy: boolean;
  confirmingCancel: boolean;
  declining: boolean;
  declineNote: string;
  onNoteChange: (value: string) => void;
  onAskDecline: () => void;
  onKeepDecline: () => void;
  onConfirmDecline: () => void;
  reduceMotion: boolean;
  onAccept: () => void;
  onAskCancel: () => void;
  onKeep: () => void;
  onConfirmCancel: () => void;
};

function BookingCard({
  booking,
  startMs,
  endMs,
  now,
  index,
  gearNames,
  resourceNames,
  busy,
  confirmingCancel,
  declining,
  declineNote,
  onNoteChange,
  onAskDecline,
  onKeepDecline,
  onConfirmDecline,
  reduceMotion,
  onAccept,
  onAskCancel,
  onKeep,
  onConfirmCancel,
}: CardProps) {
  const isReturn = booking.status === "return_requested";
  const isGearOnly = booking.bookingType === "gear" || startMs === null;
  const statusView = getStatusView(booking.status, startMs, endMs, now);
  const gearItems = booking.gearsBooked ?? [];
  const gearTotal = gearItems.reduce((sum, item) => sum + item.quantity, 0);
  const resourceName = booking.resourceUnitId ? resourceNames.get(booking.resourceUnitId) : null;
  const studentName = booking.user?.name?.trim() || "Unknown student";

  return (
    <motion.article
      layout={!reduceMotion}
      initial={reduceMotion ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduceMotion ? undefined : { opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.4, delay: reduceMotion ? 0 : index * 0.05 }}
      whileHover={reduceMotion ? undefined : { y: -3 }}
      className={`group relative overflow-hidden rounded-3xl border bg-zinc-950 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] transition-colors ${
        isReturn ? "border-amber-400/30" : "border-zinc-800 hover:border-zinc-700"
      }`}
    >
      <div
        className={`pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full blur-3xl opacity-30 transition-opacity duration-500 group-hover:opacity-50 ${
          isReturn ? "bg-amber-500" : isGearOnly ? "bg-emerald-500" : "bg-cyan-500"
        }`}
      />

      <div className="relative flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900 text-sm font-black text-zinc-200">
            {initials(studentName) || "?"}
          </div>
          <div className="min-w-0">
            <p className="truncate text-lg font-bold text-white">{studentName}</p>
            <p className="truncate text-xs text-zinc-500">
              {booking.user?.rollNo || booking.user?.email || "No college ID"} · {booking.sport?.name || "Sport"}
            </p>
          </div>
        </div>

        <span className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${TONE[statusView.tone]}`}>
          <span className="relative flex h-2 w-2">
            {statusView.pulse && !reduceMotion && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-60" />
            )}
            <span className="relative inline-flex h-2 w-2 rounded-full bg-current" />
          </span>
          {statusView.label}
        </span>
      </div>

      <div className="relative mt-6 grid gap-3 md:grid-cols-2">
        {startMs !== null && (
          <div className="rounded-2xl border border-zinc-800 bg-black/40 p-4">
            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
              <CalendarDays size={13} /> Slot
            </p>
            <p className="mt-2 font-semibold text-zinc-100">{formatDay(new Date(startMs))}</p>
            <p className="mt-1 flex items-center gap-2 text-sm text-zinc-400">
              <Clock3 size={14} className="text-zinc-500" />
              {formatTime(new Date(startMs))}
              {endMs !== null && <> – {formatTime(new Date(endMs))}</>}
            </p>
            {endMs !== null && (
              <p className="mt-2 flex items-center gap-2 text-xs text-zinc-600">
                <Timer size={12} /> {formatDuration(endMs - startMs)} long
              </p>
            )}
          </div>
        )}

        <div className={`rounded-2xl border border-zinc-800 bg-black/40 p-4 ${startMs === null ? "md:col-span-2" : ""}`}>
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
                    <span className="truncate text-zinc-300">{gearNames.get(item.gearId) ?? `Gear #${item.gearId}`}</span>
                    <span className="shrink-0 rounded-lg bg-zinc-800 px-2.5 py-0.5 text-xs font-semibold text-zinc-200">× {item.quantity}</span>
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
              <MapPin size={14} className="text-zinc-500" /> {resourceName}
            </p>
          )}
        </div>
      </div>

      <div className="relative mt-6 min-h-[52px]">
        <AnimatePresence mode="wait" initial={false}>
          {declining ? (
            <motion.div
              key="decline-note"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="flex flex-col gap-3 rounded-2xl border border-amber-400/20 bg-amber-400/5 p-4"
            >
              <p className="text-sm text-zinc-300">Why is this return being declined? The student will see this note.</p>
              <textarea
                value={declineNote}
                onChange={(event) => onNoteChange(event.target.value)}
                maxLength={300}
                rows={2}
                placeholder="e.g. Ball is still missing from the court"
                className="w-full rounded-xl border border-zinc-800 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-amber-400/50"
              />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={onKeepDecline} disabled={busy} className="rounded-xl border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:border-zinc-500 disabled:opacity-50">
                  Back
                </button>
                <button
                  type="button"
                  onClick={onConfirmDecline}
                  disabled={busy || declineNote.trim().length < 3}
                  className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-2 text-sm font-semibold text-black transition hover:bg-amber-300 disabled:opacity-50"
                >
                  {busy && <Loader2 size={14} className="animate-spin" />}
                  Decline return
                </button>
              </div>
            </motion.div>
          ) : confirmingCancel ? (
            <motion.div
              key="confirm-cancel"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="flex flex-col gap-3 rounded-2xl border border-red-400/20 bg-red-500/5 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <p className="text-sm text-zinc-300">Cancel this booking? Its slot and equipment will be released.</p>
              <div className="flex gap-2">
                <button type="button" onClick={onKeep} disabled={busy} className="rounded-xl border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:border-zinc-500 disabled:opacity-50">
                  Keep
                </button>
                <button type="button" onClick={onConfirmCancel} disabled={busy} className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-400 disabled:opacity-60">
                  {busy && <Loader2 size={14} className="animate-spin" />}
                  Yes, cancel booking
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="actions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-wrap gap-3">
              {isReturn && (
                <>
                  <ActionButton onClick={onAccept} disabled={busy} tone="emerald" icon={<CheckCircle2 size={15} />} label="Accept return" busy={busy} />
                  <ActionButton onClick={onAskDecline} disabled={busy} tone="amber" icon={<Undo2 size={15} />} label="Decline" />
                </>
              )}
              <ActionButton onClick={onAskCancel} disabled={busy} tone="red" icon={<X size={15} />} label="Cancel booking" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.article>
  );
}

function ActionButton({
  onClick,
  disabled,
  tone,
  icon,
  label,
  busy,
}: {
  onClick: () => void;
  disabled: boolean;
  tone: "emerald" | "amber" | "red";
  icon: React.ReactNode;
  label: string;
  busy?: boolean;
}) {
  const classes = {
    emerald: "bg-gradient-to-r from-emerald-400 to-teal-500 text-black shadow-[0_10px_30px_rgba(52,211,153,0.25)] hover:shadow-[0_14px_40px_rgba(52,211,153,0.35)]",
    amber: "border border-amber-400/30 bg-amber-400/10 text-amber-300 hover:bg-amber-400/20",
    red: "border border-red-500/25 bg-red-500/10 text-red-300 hover:border-red-400/50 hover:bg-red-500/20",
  }[tone];

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${classes}`}
    >
      {busy ? <Loader2 size={15} className="animate-spin" /> : icon}
      {label}
    </motion.button>
  );
}
