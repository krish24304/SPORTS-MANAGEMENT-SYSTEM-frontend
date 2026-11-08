"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  ChevronDown,
  History,
  Layers,
  Loader2,
  Eraser,
  Eye,
  RefreshCw,
  Search,
  Trash2,
  Wrench,
  X,
} from "lucide-react";

import { API_BASE_URL } from "@/lib/config";
import { authFetch } from "@/lib/auth";

type DamageLog = {
  id: number;
  action: "damaged" | "lost" | "repaired" | "written_off";
  quantity: number;
  source: "return" | "issued" | "manual";
  bookingId: number | null;
  studentName: string | null;
  actorName: string | null;
  note: string | null;
  createdAt: string;
};

type DamagedGear = {
  id: number;
  name: string;
  sport: { id: number; name: string };
  totalQuantity: number;
  availableQuantity: number;
  damagedQuantity: number;
  inUse: number;
  untrackedDamaged: number;
  lastDamagedAt: string | null;
  logs: DamageLog[];
};

type Totals = { damagedUnits: number; gearTypes: number; repairedThisMonth: number; writtenOffThisMonth: number; lostThisMonth: number };

type ActionMode = "repaired" | "written_off";

// Damage is recorded from returns (Return Requests). Staff can mark units repaired or write them off;
// the admin reads the records and is the only one who can clear the history (it clears it for everyone).
type Props = { open: boolean; onClose: () => void; role: "staff" | "admin" };

const formatDate = (value: string) =>
  new Date(value).toLocaleString(undefined, { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });

function logSentence(log: DamageLog) {
  const units = `${log.quantity} unit${log.quantity === 1 ? "" : "s"}`;
  if (log.action === "repaired") return `${units} repaired and back in stock`;
  if (log.action === "written_off") return `${units} removed from stock (beyond repair)`;
  if (log.action === "lost") return `${units} lost${log.studentName ? ` by ${log.studentName}` : ""} (removed from stock)`;
  if (log.source === "return") return `${units} returned damaged${log.studentName ? ` by ${log.studentName}` : ""}`;
  if (log.source === "issued") return `${units} issued gear came back damaged${log.studentName ? ` from ${log.studentName}` : ""}`;
  return `${units} reported damaged`;
}

async function fetchDamageList() {
  const res = await authFetch(`${API_BASE_URL}/gear-damage`, { cache: "no-store" });
  if (!res.ok) throw new Error(await readError(res, "Could not load damaged gear."));
  return res.json();
}

function loadErrorMessage(err: unknown) {
  return err instanceof TypeError ? "Could not reach the server. Check that the backend is running." : (err as Error).message;
}

async function readError(res: Response, fallback: string) {
  const data = await res.json().catch(() => null);
  return data?.message || fallback;
}

export default function DamagedGearModal({ open, onClose, role }: Props) {
  const canManage = role === "staff";
  const canClear = role === "admin";
  const reduceMotion = useReducedMotion();
  const [gears, setGears] = useState<DamagedGear[]>([]);
  const [totals, setTotals] = useState<Totals | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [sport, setSport] = useState("All");
  const [expanded, setExpanded] = useState<number | null>(null);

  // Repair / remove form, one gear at a time.
  const [actionFor, setActionFor] = useState<{ gearId: number; mode: ActionMode } | null>(null);
  const [actionQty, setActionQty] = useState(1);

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [flash, setFlash] = useState("");

  const applyData = useCallback((data: { gears?: DamagedGear[]; totals?: Totals }) => {
    setGears(Array.isArray(data.gears) ? data.gears : []);
    setTotals(data.totals ?? null);
  }, []);

  // Refresh button and after each change.
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      applyData(await fetchDamageList());
    } catch (err) {
      setError(loadErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [applyData]);

  // Opened: clear any half-filled form and show the loader (React's "adjust state on prop change").
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setLoading(true);
      setError("");
      setActionFor(null);
      setFormError("");
    }
  }

  // Fetch when the popup opens. State is only set once the request answers.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    fetchDamageList()
      .then((data) => {
        if (!cancelled) applyData(data);
      })
      .catch((err) => {
        if (!cancelled) setError(loadErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, applyData]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !saving) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, saving, onClose]);

  const showFlash = (text: string) => {
    setFlash(text);
    window.setTimeout(() => setFlash(""), 3000);
  };

  const clearHistory = async (gear?: DamagedGear) => {
    if (saving) return;
    const question = gear
      ? `Clear the history for ${gear.name}? The damaged count (${gear.damagedQuantity}) stays; only the detailed entries are deleted.`
      : "Clear ALL damage history for every gear, for admin and staff? Damaged counts stay; only the detailed entries are deleted. This cannot be undone.";
    if (!window.confirm(question)) return;
    setSaving(true);
    setError("");
    try {
      const res = await authFetch(`${API_BASE_URL}/gear-damage/history${gear ? `?gearId=${gear.id}` : ""}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await readError(res, "Could not clear the history."));
      const data = await res.json().catch(() => null);
      showFlash(data?.message || "History cleared");
      if (gear) setExpanded(null);
      await load();
    } catch (err) {
      setError(err instanceof TypeError ? "Could not reach the server." : (err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const startAction = (gear: DamagedGear, mode: ActionMode) => {
    setActionFor({ gearId: gear.id, mode });
    setActionQty(1);
    setFormError("");
  };

  const submitAction = async (gear: DamagedGear) => {
    if (!actionFor || saving) return;
    if (!Number.isInteger(actionQty) || actionQty < 1 || actionQty > gear.damagedQuantity) {
      return setFormError(`Enter a number from 1 to ${gear.damagedQuantity}.`);
    }
    if (actionFor.mode === "written_off" && !window.confirm(`Remove ${actionQty} × ${gear.name}? They will be taken out of the total stock.`)) return;
    setSaving(true);
    setFormError("");
    try {
      const res = await authFetch(`${API_BASE_URL}/gears/${gear.id}/damage/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: actionFor.mode, quantity: actionQty }),
      });
      if (!res.ok) throw new Error(await readError(res, "Could not update the gear."));
      showFlash(actionFor.mode === "repaired" ? `${actionQty} × ${gear.name} back in stock` : `${actionQty} × ${gear.name} removed`);
      setActionFor(null);
      await load();
    } catch (err) {
      setFormError(err instanceof TypeError ? "Could not reach the server." : (err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const sports = useMemo(() => Array.from(new Set(gears.map((g) => g.sport.name))).sort(), [gears]);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return gears.filter((g) => {
      const matchesSport = sport === "All" || g.sport.name === sport;
      const haystack = [g.name, g.sport.name, ...g.logs.map((l) => `${l.studentName ?? ""} ${l.actorName ?? ""} ${l.note ?? ""}`)]
        .join(" ")
        .toLowerCase();
      return matchesSport && (!term || haystack.includes(term));
    });
  }, [gears, search, sport]);

  const currentlyDamaged = visible.filter((g) => g.damagedQuantity > 0);
  const cleared = visible.filter((g) => g.damagedQuantity === 0);

  const renderGear = (gear: DamagedGear, index: number) => {
    const isOpen = expanded === gear.id;
    const pct = (n: number) => (gear.totalQuantity > 0 ? (n / gear.totalQuantity) * 100 : 0);
    const acting = actionFor?.gearId === gear.id ? actionFor.mode : null;

    return (
      <motion.li
        key={gear.id}
        layout={!reduceMotion}
        initial={reduceMotion ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: Math.min(index * 0.04, 0.3) }}
        className={`rounded-[24px] border bg-gradient-to-br from-zinc-900/80 to-zinc-950 p-5 transition-colors ${
          gear.damagedQuantity > 0 ? "border-red-500/20 hover:border-red-400/40" : "border-zinc-800 hover:border-zinc-700"
        }`}
      >
        <div className="flex flex-wrap items-center gap-4">
          <div
            className={`flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl border ${
              gear.damagedQuantity > 0 ? "border-red-400/30 bg-red-500/10 text-red-300" : "border-zinc-700 bg-zinc-800/50 text-zinc-400"
            }`}
          >
            <span className="text-2xl font-black leading-none">{gear.damagedQuantity}</span>
            <span className="mt-1 text-[9px] font-bold uppercase tracking-wider">damaged</span>
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="truncate text-xl font-black text-white">{gear.name}</h3>
            <p className="text-sm text-zinc-500">
              {gear.sport.name} · {gear.damagedQuantity} of {gear.totalQuantity} damaged
              {gear.lastDamagedAt ? ` · last on ${formatDate(gear.lastDamagedAt)}` : ""}
            </p>
            <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-zinc-800" aria-hidden>
              <div className="bg-emerald-500/80" style={{ width: `${pct(gear.availableQuantity)}%` }} />
              <div className="bg-sky-500/80" style={{ width: `${pct(gear.inUse)}%` }} />
              <div className="bg-red-500/90" style={{ width: `${pct(gear.damagedQuantity)}%` }} />
            </div>
            <p className="mt-1.5 text-xs text-zinc-500">
              <span className="text-emerald-400">{gear.availableQuantity} available</span> ·{" "}
              <span className="text-sky-400">{gear.inUse} in use</span> ·{" "}
              <span className="text-red-400">{gear.damagedQuantity} damaged</span>
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {canManage && gear.damagedQuantity > 0 && (
              <>
                <button
                  type="button"
                  onClick={() => startAction(gear, "repaired")}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm font-bold text-emerald-300 hover:bg-emerald-500/20"
                >
                  <Wrench size={14} /> Repaired
                </button>
                <button
                  type="button"
                  onClick={() => startAction(gear, "written_off")}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm font-bold text-zinc-300 hover:border-red-500/40 hover:text-red-300"
                >
                  <Trash2 size={14} /> Remove
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => setExpanded(isOpen ? null : gear.id)}
              aria-expanded={isOpen}
              className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm font-bold text-zinc-300 hover:border-zinc-500"
            >
              <History size={14} /> History
              <ChevronDown size={14} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {acting && (
            <motion.div
              key="action"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className={`mt-4 rounded-2xl border p-4 ${acting === "repaired" ? "border-emerald-500/25 bg-emerald-500/5" : "border-red-500/25 bg-red-500/5"}`}>
                <p className="text-sm font-semibold text-zinc-200">
                  {acting === "repaired" ? "How many are fixed and ready to lend again?" : "How many are beyond repair? They will be removed from the total."}
                </p>
                <div className="mt-3 flex flex-wrap gap-3">
                  <input
                    type="number"
                    min={1}
                    max={gear.damagedQuantity}
                    value={actionQty}
                    onChange={(e) => setActionQty(Number(e.target.value))}
                    className="h-11 w-24 rounded-xl border border-zinc-700 bg-black/40 px-3 text-white outline-none focus:border-zinc-500"
                    aria-label="Quantity"
                  />
                  <button type="button" onClick={() => setActionFor(null)} disabled={saving} className="h-11 rounded-xl border border-zinc-700 px-4 text-sm font-semibold text-zinc-300 hover:border-zinc-500">
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => submitAction(gear)}
                    disabled={saving}
                    className={`inline-flex h-11 items-center gap-2 rounded-xl px-4 text-sm font-bold text-black disabled:opacity-60 ${
                      acting === "repaired" ? "bg-emerald-400 hover:bg-emerald-300" : "bg-red-400 hover:bg-red-300"
                    }`}
                  >
                    {saving && <Loader2 size={14} className="animate-spin" />}
                    {acting === "repaired" ? "Put back in stock" : "Remove"}
                  </button>
                </div>
                {formError && <p role="alert" className="mt-3 text-sm font-semibold text-red-300">{formError}</p>}
              </div>
            </motion.div>
          )}

          {isOpen && (
            <motion.div
              key="history"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <ol className="mt-4 space-y-2 border-l border-zinc-800 pl-4">
                {gear.logs.map((log) => (
                  <li key={log.id} className="relative">
                    <span
                      className={`absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full ${
                        log.action === "damaged" ? "bg-red-400" : log.action === "lost" ? "bg-amber-400" : log.action === "repaired" ? "bg-emerald-400" : "bg-zinc-500"
                      }`}
                    />
                    <p className="text-sm text-zinc-200">{logSentence(log)}</p>
                    <p className="text-xs text-zinc-500">
                      {formatDate(log.createdAt)}
                      {log.actorName ? ` · recorded by ${log.actorName}` : ""}
                      {log.bookingId ? ` · booking #${log.bookingId}` : ""}
                    </p>
                    {log.note && <p className="mt-1 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs text-zinc-300">“{log.note}”</p>}
                  </li>
                ))}
                {gear.untrackedDamaged > 0 && (
                  <li className="relative">
                    <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-zinc-600" />
                    <p className="text-sm text-zinc-400">
                      {gear.untrackedDamaged} damaged unit{gear.untrackedDamaged === 1 ? "" : "s"} without saved details (recorded earlier or history cleared)
                    </p>
                  </li>
                )}
                {gear.logs.length === 0 && gear.untrackedDamaged === 0 && <li className="text-sm text-zinc-500">No history yet.</li>}
              </ol>
              {canClear && gear.logs.length > 0 && (
                <button
                  type="button"
                  onClick={() => clearHistory(gear)}
                  disabled={saving}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs font-bold text-zinc-400 hover:border-red-500/40 hover:text-red-300 disabled:opacity-50"
                >
                  <Eraser size={13} /> Clear history for {gear.name}
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.li>
    );
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="damaged-gear"
          role="dialog"
          aria-modal="true"
          aria-labelledby="damaged-gear-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => !saving && onClose()}
          className="fixed inset-0 z-[240] flex items-center justify-center bg-black/85 p-3 backdrop-blur-2xl sm:p-6"
        >
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            onClick={(event) => event.stopPropagation()}
            className="relative flex max-h-[92vh] w-full max-w-[1100px] flex-col overflow-hidden rounded-[30px] border border-red-500/25 bg-gradient-to-br from-[#140a0a] via-[#080808] to-[#0d0808] text-white shadow-[0_0_140px_rgba(239,68,68,.16)] sm:rounded-[38px]"
          >
            {!reduceMotion && (
              <motion.div
                aria-hidden
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="pointer-events-none absolute right-[-80px] top-[-80px] h-[300px] w-[300px] rounded-full bg-red-500/15 blur-[120px]"
              />
            )}

            <header className="relative flex items-start justify-between gap-4 border-b border-red-500/15 px-6 pb-5 pt-6 sm:px-9">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-red-400/30 bg-red-500/10 text-red-300 shadow-[0_0_30px_rgba(239,68,68,.25)]">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-red-400/80">Equipment condition</p>
                  <h2 id="damaged-gear-title" className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">
                    Damaged <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">Gear</span>
                  </h2>
                  <p className="mt-1 text-sm text-zinc-500">
                    {canManage
                      ? "Damage and losses recorded from returns. Mark items repaired or remove them."
                      : "Damage and losses recorded by staff from returns. You can view and clear the history."}
                  </p>
                  {canClear && (
                    <span className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-xs font-bold text-zinc-400">
                      <Eye size={12} /> View &amp; clear only
                    </span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="rounded-2xl border border-zinc-800 bg-zinc-900/90 p-3 text-zinc-400 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-300"
              >
                <X size={18} />
              </button>
            </header>

            {totals && (
              <div className="relative grid grid-cols-2 gap-3 border-b border-red-500/10 px-6 py-4 sm:grid-cols-5 sm:px-9">
                {[
                  { label: "Damaged units", value: totals.damagedUnits, tone: "text-red-300" },
                  { label: "Gear types affected", value: totals.gearTypes, tone: "text-orange-300" },
                  { label: "Repaired this month", value: totals.repairedThisMonth, tone: "text-emerald-300" },
                  { label: "Lost this month", value: totals.lostThisMonth, tone: "text-amber-300" },
                  { label: "Removed this month", value: totals.writtenOffThisMonth, tone: "text-zinc-300" },
                ].map((tile) => (
                  <div key={tile.label} className="rounded-2xl border border-zinc-800 bg-black/30 px-4 py-3">
                    <p className={`text-2xl font-black ${tile.tone}`}>{tile.value}</p>
                    <p className="text-[11px] uppercase tracking-wider text-zinc-500">{tile.label}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="relative flex flex-col gap-3 border-b border-red-500/10 px-6 py-4 sm:flex-row sm:px-9">
              <div className="relative flex-1">
                <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search gear, student, staff or note…"
                  className="h-12 w-full rounded-2xl border border-zinc-800 bg-black/40 pl-11 pr-4 text-sm text-white outline-none transition focus:border-red-500/50"
                />
              </div>
              <div className="relative">
                <Layers size={15} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                <select
                  value={sport}
                  onChange={(event) => setSport(event.target.value)}
                  className="h-12 w-full appearance-none rounded-2xl border border-zinc-800 bg-black/40 pl-11 pr-8 text-sm text-zinc-200 outline-none focus:border-red-500/50 sm:w-48"
                >
                  <option value="All">All sports</option>
                  {sports.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={load}
                disabled={loading}
                aria-label="Refresh"
                className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-zinc-800 bg-black/40 px-4 text-sm font-semibold text-zinc-300 hover:border-red-500/40 disabled:opacity-60"
              >
                <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
              </button>
              {canClear && (
                <button
                  type="button"
                  onClick={() => clearHistory()}
                  disabled={saving || !gears.some((g) => g.logs.length > 0)}
                  title="Delete all detailed history entries for everyone. Damaged counts stay."
                  className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-zinc-800 bg-black/40 px-4 text-sm font-semibold text-zinc-300 hover:border-red-500/40 hover:text-red-300 disabled:opacity-40"
                >
                  <Eraser size={15} /> Clear all history
                </button>
              )}
            </div>

            <div className="relative flex-1 overflow-y-auto px-6 py-5 sm:px-9">

              {error ? (
                <div role="alert" className="rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm font-semibold text-red-300">
                  {error}
                </div>
              ) : loading && gears.length === 0 ? (
                <div className="flex items-center justify-center gap-3 py-20 text-zinc-500">
                  <Loader2 className="animate-spin" size={20} /> Loading damaged gear…
                </div>
              ) : visible.length === 0 ? (
                <div className="py-20 text-center">
                  <p className="text-5xl">🛡️</p>
                  <h3 className="mt-4 text-2xl font-black">{gears.length === 0 ? "No damaged gear" : "Nothing matches your search"}</h3>
                  <p className="mt-2 text-zinc-500">
                    {gears.length === 0 ? "Gear marked lost or damaged in Return Requests will be listed here." : "Try a different name or sport."}
                  </p>
                </div>
              ) : (
                <>
                  {currentlyDamaged.length > 0 && <ul className="space-y-4">{currentlyDamaged.map(renderGear)}</ul>}
                  {cleared.length > 0 && (
                    <>
                      <p className="mb-3 mt-8 text-xs font-black uppercase tracking-[0.2em] text-zinc-600">All fixed · history only</p>
                      <ul className="space-y-4">{cleared.map(renderGear)}</ul>
                    </>
                  )}
                </>
              )}
            </div>

            <AnimatePresence>
              {flash && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-2xl border border-emerald-500/30 bg-zinc-950 px-5 py-3 text-sm font-bold text-emerald-300 shadow-[0_0_40px_rgba(16,185,129,.2)]"
                >
                  {flash}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
