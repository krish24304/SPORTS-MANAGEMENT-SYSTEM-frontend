"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AlertTriangle, CalendarPlus, CheckCircle2, Clock3, Loader2, RefreshCw, Trash2, Users, XCircle } from "lucide-react";

import { authFetch, getAuthToken } from "@/lib/auth";

const API = "http://localhost:5000";

type ResourceUnit = { id: number; name: string; status: string };
type Sport = { id: number; name: string; resourceUnits?: ResourceUnit[] };

type Reservation = {
  id: number;
  teamName: string;
  purpose: string | null;
  startDateTime: string;
  endDateTime: string;
  durationMinutes: number;
  sport?: { name: string } | null;
  resourcesUnit?: { resourceUnit?: { name: string } | null }[];
};

type Toast = { id: number; tone: "success" | "error"; text: string };

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString([], { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
}

export default function TeamReservationsPanel({ title, subtitle }: { title: string; subtitle: string }) {
  const reduceMotion = useReducedMotion();

  const [sports, setSports] = useState<Sport[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const [teamName, setTeamName] = useState("");
  const [purpose, setPurpose] = useState("");
  const [sportId, setSportId] = useState("");
  const [resourceIds, setResourceIds] = useState<number[]>([]);
  const [startLocal, setStartLocal] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("60");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [formError, setFormError] = useState("");
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = useCallback((tone: Toast["tone"], text: string) => {
    const id = Date.now();
    setToast({ id, tone, text });
    window.setTimeout(() => setToast((current) => (current?.id === id ? null : current)), 3500);
  }, []);

  const load = useCallback(async () => {
    if (!getAuthToken()) {
      setLoadError("Not signed in on this browser. Sign in as staff or admin to manage team reservations.");
      setLoading(false);
      return;
    }

    try {
      setLoadError("");
      const [sportsRes, reservationsRes] = await Promise.all([
        authFetch(`${API}/sports`, { cache: "no-store" }),
        authFetch(`${API}/team-reservations`, { cache: "no-store" }),
      ]);

      if (!reservationsRes.ok) {
        throw new Error(
          reservationsRes.status === 401 || reservationsRes.status === 403
            ? "Your session has ended or your account cannot manage team reservations."
            : "Could not load team reservations right now."
        );
      }

      const sportData = sportsRes.ok ? await sportsRes.json() : [];
      const reservationData = await reservationsRes.json();
      setSports(Array.isArray(sportData) ? sportData : []);
      setReservations(Array.isArray(reservationData) ? reservationData : []);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Could not load team reservations right now.");
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  useEffect(() => {
    load();
  }, [load]);

  const selectedSport = useMemo(() => sports.find((sport) => String(sport.id) === sportId) ?? null, [sports, sportId]);
  const availableUnits = (selectedSport?.resourceUnits ?? []).filter((unit) => unit.status === "available");

  const toggleResource = (id: number) => {
    setResourceIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };

  const resetForm = () => {
    setTeamName("");
    setPurpose("");
    setSportId("");
    setResourceIds([]);
    setStartLocal("");
    setDurationMinutes("60");
    setMessage("");
  };

  const submit = async () => {
    setFormError("");

    const duration = Number(durationMinutes);
    if (!teamName.trim()) return setFormError("Enter a team name.");
    if (!sportId) return setFormError("Choose a sport.");
    if (!startLocal) return setFormError("Choose a start date and time.");
    if (!Number.isInteger(duration) || duration < 15 || duration > 600) {
      return setFormError("Duration must be a whole number of minutes from 15 to 600.");
    }
    if (resourceIds.length === 0) return setFormError("Select at least one court or resource.");

    const start = new Date(startLocal);
    if (Number.isNaN(start.getTime())) return setFormError("The start date and time is not valid.");

    setSubmitting(true);
    try {
      const response = await authFetch(`${API}/team-reservations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamName: teamName.trim(),
          purpose: purpose.trim() || undefined,
          reservationMessage: message.trim() || undefined,
          sportId: Number(sportId),
          startDateTime: start.toISOString(),
          durationMinutes: duration,
          resourceUnitIds: resourceIds,
        }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Could not create the reservation.");
      }

      resetForm();
      showToast("success", "Team reservation created.");
      await load();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Could not create the reservation.");
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (id: number) => {
    setDeletingId(id);
    try {
      const response = await authFetch(`${API}/team-reservations/${id}`, { method: "DELETE" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || "Could not delete the reservation.");
      showToast("success", "Reservation deleted. Its courts are free again.");
      await load();
    } catch (error) {
      showToast("error", error instanceof Error ? error.message : "Could not delete the reservation.");
    } finally {
      setDeletingId(null);
    }
  };

  const inputClass =
    "w-full rounded-2xl border border-zinc-800 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-500/50";

  return (
    <main className="min-h-screen bg-[#050607] px-6 py-10 text-white md:px-10">
      <div className="mx-auto max-w-6xl space-y-10">
        <motion.header
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
        >
          <div>
            <h1 className="text-4xl font-black tracking-tight md:text-5xl">{title}</h1>
            <p className="mt-2 text-sm text-zinc-500">{subtitle}</p>
          </div>
          <motion.button
            type="button"
            onClick={refresh}
            disabled={refreshing}
            whileHover={reduceMotion ? undefined : { scale: 1.04 }}
            whileTap={reduceMotion ? undefined : { scale: 0.96 }}
            className="inline-flex h-12 items-center gap-2 self-start rounded-2xl border border-zinc-800 bg-zinc-950 px-5 text-sm font-semibold text-zinc-300 transition hover:border-emerald-400/40 hover:text-emerald-300 disabled:opacity-60"
          >
            <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Refreshing…" : "Refresh"}
          </motion.button>
        </motion.header>

        {loading && <div className="h-48 animate-pulse rounded-3xl border border-zinc-800 bg-zinc-950" />}

        {!loading && loadError && (
          <div className="flex items-center gap-3 rounded-3xl border border-zinc-800 bg-zinc-950 p-6 text-sm text-zinc-400">
            <AlertTriangle size={18} className="text-amber-400" />
            {loadError}
          </div>
        )}

        {!loading && !loadError && (
          <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
            <motion.section
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-5 rounded-3xl border border-zinc-800 bg-zinc-950 p-6"
            >
              <h2 className="flex items-center gap-2 text-lg font-bold text-emerald-300">
                <CalendarPlus size={18} /> New reservation
              </h2>

              <input className={inputClass} placeholder="Team name" value={teamName} onChange={(e) => setTeamName(e.target.value)} />
              <input className={inputClass} placeholder="Purpose (practice, match, tournament…)" value={purpose} onChange={(e) => setPurpose(e.target.value)} />

              <select
                className={inputClass}
                value={sportId}
                onChange={(e) => {
                  setSportId(e.target.value);
                  setResourceIds([]);
                }}
              >
                <option value="">Choose a sport</option>
                {sports.map((sport) => (
                  <option key={sport.id} value={sport.id}>
                    {sport.name}
                  </option>
                ))}
              </select>

              {selectedSport && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Courts and resources</p>
                  {availableUnits.length === 0 ? (
                    <p className="text-sm text-zinc-600">No available courts for this sport right now.</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {availableUnits.map((unit) => {
                        const selected = resourceIds.includes(unit.id);
                        return (
                          <motion.button
                            key={unit.id}
                            type="button"
                            onClick={() => toggleResource(unit.id)}
                            whileTap={reduceMotion ? undefined : { scale: 0.96 }}
                            className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                              selected
                                ? "border-emerald-400/50 bg-emerald-400/10 text-emerald-200"
                                : "border-zinc-800 bg-black/40 text-zinc-400 hover:border-zinc-600"
                            }`}
                          >
                            {unit.name}
                          </motion.button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-1">
                  <span className="text-xs text-zinc-500">Start</span>
                  <input type="datetime-local" className={inputClass} value={startLocal} onChange={(e) => setStartLocal(e.target.value)} />
                </label>
                <label className="space-y-1">
                  <span className="text-xs text-zinc-500">Duration (minutes)</span>
                  <input type="number" min={15} max={600} step={15} className={inputClass} value={durationMinutes} onChange={(e) => setDurationMinutes(e.target.value)} />
                </label>
              </div>

              <textarea className={`${inputClass} min-h-20`} placeholder="Note for staff (optional)" value={message} onChange={(e) => setMessage(e.target.value)} />

              <AnimatePresence>
                {formError && (
                  <motion.p
                    role="alert"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-2.5 text-sm text-red-300"
                  >
                    {formError}
                  </motion.p>
                )}
              </AnimatePresence>

              <motion.button
                type="button"
                onClick={submit}
                disabled={submitting}
                whileHover={reduceMotion ? undefined : { scale: 1.02 }}
                whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 px-5 py-3 text-sm font-bold text-black shadow-[0_10px_30px_rgba(52,211,153,0.2)] disabled:opacity-60"
              >
                {submitting && <Loader2 size={15} className="animate-spin" />}
                {submitting ? "Reserving…" : "Create reservation"}
              </motion.button>
            </motion.section>

            <section className="space-y-4">
              <h2 className="flex items-center gap-2 text-lg font-bold text-cyan-300">
                <Users size={18} /> Upcoming reservations
              </h2>

              {reservations.length === 0 && (
                <div className="rounded-3xl border border-dashed border-zinc-800 bg-zinc-950/60 px-6 py-10 text-center text-sm text-zinc-500">
                  No team reservations yet.
                </div>
              )}

              <AnimatePresence mode="popLayout">
                {reservations.map((reservation, index) => (
                  <motion.article
                    key={reservation.id}
                    layout={!reduceMotion}
                    initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduceMotion ? undefined : { opacity: 0, scale: 0.96 }}
                    transition={{ delay: reduceMotion ? 0 : index * 0.04 }}
                    className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="truncate text-lg font-bold">{reservation.teamName}</p>
                        <p className="mt-0.5 text-xs text-zinc-500">
                          {reservation.sport?.name ?? "Sport"}
                          {reservation.purpose ? ` · ${reservation.purpose}` : ""}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => remove(reservation.id)}
                        disabled={deletingId === reservation.id}
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-red-500/25 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-500/20 disabled:opacity-50"
                      >
                        {deletingId === reservation.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                        Delete
                      </button>
                    </div>

                    <p className="mt-4 flex items-center gap-2 text-sm text-zinc-400">
                      <Clock3 size={14} className="text-zinc-500" />
                      {formatWhen(reservation.startDateTime)} · {reservation.durationMinutes} min
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {(reservation.resourcesUnit ?? []).map((link, i) => (
                        <span key={i} className="rounded-lg bg-zinc-800 px-2.5 py-1 text-xs text-zinc-300">
                          {link.resourceUnit?.name ?? "Court"}
                        </span>
                      ))}
                    </div>
                  </motion.article>
                ))}
              </AnimatePresence>
            </section>
          </div>
        )}
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            role="status"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className={`fixed bottom-6 right-6 z-[120] flex max-w-sm items-start gap-3 rounded-2xl border px-5 py-4 text-sm shadow-[0_20px_60px_rgba(0,0,0,0.5)] ${
              toast.tone === "success"
                ? "border-emerald-400/25 bg-emerald-950/90 text-emerald-200"
                : "border-red-400/25 bg-red-950/90 text-red-200"
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
