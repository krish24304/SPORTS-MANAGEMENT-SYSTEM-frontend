"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AlertTriangle, Box, CalendarDays, Check, CheckCircle2, ClipboardCheck, Clock, IdCard, Loader2, Maximize2, Minus, Plus, ShieldCheck, Undo2, X } from "lucide-react";

import IdPhoto from "@/components/ui/IdPhoto";

import { ReturnRow, requestLabel, totalItems } from "./returnUtils";

export type ConditionError = Error & { status?: number };

// How many of each booked gear came back damaged or were lost. The rest return to stock.
export type DamageItem = { gearId: number; damaged: number; lost: number };

type Props = {
  row: ReturnRow | null;
  onClose: () => void;
  onCondition: (row: ReturnRow, condition: "good" | "damaged", details?: { items: DamageItem[]; note: string }) => Promise<void>;
};

type Counts = Record<number, { damaged: number; lost: number }>;

// The same gear can appear twice in a booking; count it once.
function bookedGears(row: ReturnRow) {
  const map = new Map<number, { gearId: number; name: string; quantity: number }>();
  row.gearItems.forEach((item) => {
    const existing = map.get(item.gearId);
    if (existing) existing.quantity += item.quantity;
    else map.set(item.gearId, { ...item });
  });
  return [...map.values()];
}

function Stepper({ value, max, onChange, label, tone }: { value: number; max: number; onChange: (n: number) => void; label: string; tone: "red" | "amber" }) {
  const color = tone === "red" ? "text-red-200 border-red-400/30 bg-red-500/10" : "text-amber-200 border-amber-400/30 bg-amber-500/10";
  return (
    <div className="flex items-center justify-center gap-1.5">
      <button type="button" aria-label={`Less ${label}`} onClick={() => onChange(value - 1)} disabled={value <= 0} className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-500 disabled:opacity-30">
        <Minus size={14} />
      </button>
      <span aria-label={label} className={`flex h-8 min-w-[2.5rem] items-center justify-center rounded-lg border px-2 text-sm font-black ${value > 0 ? color : "border-zinc-800 bg-black/40 text-zinc-500"}`}>{value}</span>
      <button type="button" aria-label={`More ${label}`} onClick={() => onChange(value + 1)} disabled={value >= max} className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-500 disabled:opacity-30">
        <Plus size={14} />
      </button>
    </div>
  );
}

export default function ReturnDetailsModal({ row, onClose, onCondition }: Props) {
  const reduceMotion = useReducedMotion();
  const [submitting, setSubmitting] = useState<"good" | "damaged" | null>(null);
  const [confirmDamaged, setConfirmDamaged] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<"good" | "damaged" | null>(null);
  const [photoOpen, setPhotoOpen] = useState(false);
  const [counts, setCounts] = useState<Counts>({});
  const [doneSummary, setDoneSummary] = useState("");

  // A different return was opened: start from a clean form (React's "adjust state on prop change").
  const [shownId, setShownId] = useState(row?.id);
  if (row?.id !== shownId) {
    setShownId(row?.id);
    setSubmitting(null);
    setConfirmDamaged(false);
    setError("");
    setDone(null);
    setPhotoOpen(false);
    setCounts({});
    setDoneSummary("");
  }

  useEffect(() => {
    if (!row) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (photoOpen) setPhotoOpen(false);
      else if (!submitting) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [row, photoOpen, submitting, onClose]);

  const gears = row ? bookedGears(row) : [];
  const countFor = (gearId: number) => counts[gearId] ?? { damaged: 0, lost: 0 };
  const setCount = (gearId: number, field: "damaged" | "lost", value: number) => {
    const quantity = gears.find((g) => g.gearId === gearId)?.quantity ?? 0;
    setCounts((prev) => {
      const current = prev[gearId] ?? { damaged: 0, lost: 0 };
      const other = field === "damaged" ? current.lost : current.damaged;
      const next = Math.max(0, Math.min(value, quantity - other));
      return { ...prev, [gearId]: { ...current, [field]: next } };
    });
  };
  const totalDamaged = gears.reduce((sum, g) => sum + countFor(g.gearId).damaged, 0);
  const totalLost = gears.reduce((sum, g) => sum + countFor(g.gearId).lost, 0);

  const choose = async (condition: "good" | "damaged") => {
    if (!row || submitting) return;
    if (condition === "damaged" && !confirmDamaged) {
      setError("");
      setConfirmDamaged(true);
      return;
    }
    if (condition === "damaged" && totalDamaged + totalLost === 0) {
      setError("Set how many are lost or damaged, or close this and choose Good condition.");
      return;
    }
    setError("");
    setSubmitting(condition);
    try {
      await onCondition(
        row,
        condition,
        condition === "damaged"
          ? { items: gears.map((g) => ({ gearId: g.gearId, ...countFor(g.gearId) })), note: "" }
          : undefined
      );
      setDoneSummary(
        condition === "good"
          ? "Returned in good condition"
          : ["Return completed", totalDamaged ? `${totalDamaged} damaged` : "", totalLost ? `${totalLost} lost` : ""]
              .filter(Boolean)
              .join(" · ")
      );
      setConfirmDamaged(false);
      setDone(condition);
      window.setTimeout(onClose, 900);
    } catch (err) {
      const e = err as ConditionError;
      if (e.status === 409) {
        setError("This return was already handled by someone else. The list has been refreshed.");
        setConfirmDamaged(false);
      } else {
        // Keep the lost/damaged popup open so the counts are not lost.
        setError(e instanceof Error ? e.message : "Could not save the return. Please try again.");
      }
    } finally {
      setSubmitting(null);
    }
  };

  const photo = row?.idCard ?? null;

  return (
    <AnimatePresence>
      {row && (
        <motion.div
          key="return-details"
          role="dialog"
          aria-modal="true"
          aria-labelledby="return-details-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => !submitting && onClose()}
          className="fixed inset-0 z-[250] flex items-center justify-center bg-black/85 p-3 backdrop-blur-2xl sm:p-6"
        >
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 45, rotateX: 6 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: 25 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            onClick={(event) => event.stopPropagation()}
            className="relative max-h-[92vh] w-full max-w-[960px] overflow-y-auto rounded-[30px] border border-pink-500/25 bg-gradient-to-br from-[#14090f] via-[#080808] to-[#0d080b] p-6 shadow-[0_0_140px_rgba(236,72,153,.16)] sm:rounded-[38px] sm:p-9"
          >
            {!reduceMotion && (
              <motion.div
                aria-hidden
                animate={{ opacity: [0.4, 0.9, 0.4] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="pointer-events-none absolute left-10 right-10 top-0 h-px bg-gradient-to-r from-transparent via-pink-400 to-transparent"
              />
            )}

            <button
              type="button"
              onClick={onClose}
              disabled={!!submitting}
              aria-label="Close"
              className="absolute right-5 top-5 rounded-2xl border border-zinc-800 bg-zinc-900/90 p-3 text-zinc-500 transition hover:border-pink-500/30 hover:bg-pink-500/10 hover:text-pink-300 disabled:opacity-40"
            >
              <X size={18} />
            </button>

            <header className="flex items-center gap-5 pr-14">
              <motion.div
                whileHover={reduceMotion ? undefined : { rotate: -6, scale: 1.05 }}
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-pink-400/30 bg-pink-500/10 text-pink-300 shadow-[0_0_30px_rgba(236,72,153,.25)]"
              >
                <ClipboardCheck size={26} />
              </motion.div>
              <div>
                <h2 id="return-details-title" className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                  Return <span className="bg-gradient-to-r from-pink-400 to-fuchsia-400 bg-clip-text text-transparent">Details</span>
                </h2>
                <p className="mt-1 text-sm text-zinc-500">Verify the equipment before completing the return · {requestLabel(row.id)}</p>
              </div>
            </header>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="rounded-3xl border border-pink-500/15 bg-zinc-950/60 p-5"
              >
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Student</p>
                <p className="mt-2 text-2xl font-black text-white">{row.student}</p>
                <p className="mt-1 text-xs text-zinc-500">{row.sport}{row.court && row.court !== row.sport ? ` · ${row.court}` : ""}</p>
                <span className="mt-4 inline-flex items-center gap-2 rounded-full border border-pink-400/40 bg-pink-500/10 px-3 py-1 text-xs font-semibold text-pink-200 shadow-[0_0_14px_rgba(236,72,153,.2)]">
                  <Undo2 size={12} /> Return requested
                </span>
              </motion.div>

              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="relative overflow-hidden rounded-3xl border border-pink-500/15 bg-zinc-950/60 p-5"
              >
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Borrowed equipment</p>
                <ul className="mt-3 space-y-2">
                  {row.gearItems.length === 0 && <li className="text-sm text-zinc-400">{row.gear}</li>}
                  {row.gearItems.map((item, index) => (
                    <motion.li
                      key={`${item.gearId}-${index}`}
                      initial={reduceMotion ? false : { opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 + index * 0.06 }}
                      className="flex items-center justify-between gap-3 text-sm"
                    >
                      <span className="flex items-center gap-2 truncate text-zinc-100">
                        <Box size={14} className="shrink-0 text-pink-300" /> {item.name}
                      </span>
                      <span className="shrink-0 rounded-lg bg-pink-500/15 px-2.5 py-0.5 text-xs font-bold text-pink-200">× {item.quantity}</span>
                    </motion.li>
                  ))}
                </ul>
                <p className="mt-3 text-xs text-zinc-500">{totalItems(row)} item{totalItems(row) === 1 ? "" : "s"} to return</p>
              </motion.div>

              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="rounded-3xl border border-pink-500/15 bg-zinc-950/60 p-5"
              >
                <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                  <Clock size={11} /> Borrowed at
                </p>
                <p className="mt-2 text-lg font-bold text-white">{row.borrowTime || "—"}</p>
              </motion.div>

              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-3xl border border-pink-500/15 bg-zinc-950/60 p-5"
              >
                <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                  <CalendarDays size={11} /> Return requested
                </p>
                <p className="mt-2 text-lg font-bold text-white">{row.requestTime || "—"}</p>
                {row.reason && <p className="mt-2 text-xs text-zinc-400">Reason: {row.reason}</p>}
              </motion.div>
            </div>

            <motion.section
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="mt-7"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-pink-400/25 bg-pink-500/10 text-pink-300">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Identity <span className="text-pink-300">verification</span></h3>
                  <p className="text-xs text-zinc-500">Check the student&apos;s uploaded ID card.</p>
                </div>
              </div>

              {photo ? (
                <button
                  type="button"
                  onClick={() => setPhotoOpen(true)}
                  className="group mt-4 flex w-full items-center justify-between gap-4 overflow-hidden rounded-3xl border border-pink-500/20 bg-black/40 p-4 text-left transition hover:border-pink-400/40"
                >
                  <span className="flex items-center gap-4">
                    <IdPhoto path={photo} alt="Student ID card" className="h-20 w-32 rounded-xl border border-zinc-800 object-cover" />
                    <span className="text-sm text-zinc-300">Uploaded ID card</span>
                  </span>
                  <span className="flex items-center gap-2 text-xs font-semibold text-pink-300 transition group-hover:text-pink-200">
                    <Maximize2 size={14} /> View full size
                  </span>
                </button>
              ) : (
                <div className="mt-4 flex flex-col items-center justify-center rounded-3xl border border-dashed border-pink-500/25 bg-black/30 px-6 py-10 text-center">
                  <IdCard size={28} className="text-pink-400" />
                  <p className="mt-3 text-sm font-semibold text-zinc-300">No ID card uploaded</p>
                  <p className="mt-1 text-xs text-zinc-500">Ask the student to upload an ID card on their profile.</p>
                </div>
              )}
            </motion.section>

            <motion.section
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-7"
            >
              <h3 className="text-lg font-black text-white">Return condition</h3>
              <p className="text-xs text-zinc-500">Select the condition of the returned equipment.</p>

              {error && (
                <div role="alert" className="mt-3 flex items-start gap-3 rounded-2xl border border-red-500/25 bg-red-500/5 px-4 py-3 text-sm text-red-200">
                  <AlertTriangle size={16} className="mt-0.5 shrink-0" /> {error}
                </div>
              )}

              <AnimatePresence mode="wait">
                {done ? (
                  <motion.div
                    key="done"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-4 flex items-center justify-center gap-3 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-5 py-6 text-emerald-200"
                  >
                    <motion.span initial={{ scale: 0 }} animate={{ scale: [0, 1.3, 1] }} transition={{ duration: 0.5 }}>
                      <CheckCircle2 size={26} />
                    </motion.span>
                    <span className="font-bold">{doneSummary}</span>
                  </motion.div>
                ) : (
                  <motion.div key="choose" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-4 grid gap-3 sm:grid-cols-2">
                    <motion.button
                      type="button"
                      onClick={() => choose("good")}
                      disabled={!!submitting}
                      whileHover={reduceMotion ? undefined : { y: -2, boxShadow: "0 0 30px rgba(52,211,153,.35)" }}
                      whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-400/40 bg-emerald-400/10 px-5 py-4 text-sm font-bold text-emerald-200 transition hover:bg-emerald-400/20 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {submitting === "good" ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} Good condition
                    </motion.button>
                    <motion.button
                      type="button"
                      onClick={() => choose("damaged")}
                      disabled={!!submitting || gears.length === 0}
                      title={gears.length === 0 ? "This booking has no gear to mark as lost or damaged" : undefined}
                      whileHover={reduceMotion ? undefined : { y: -2, boxShadow: "0 0 30px rgba(248,113,113,.3)" }}
                      whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-400/40 bg-red-500/10 px-5 py-4 text-sm font-bold text-red-200 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <X size={16} /> Broken / damaged / lost
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.section>
          </motion.div>

          <AnimatePresence>
            {confirmDamaged && !done && (
              <motion.div
                key="damage-popup"
                role="dialog"
                aria-modal="true"
                aria-labelledby="damage-popup-title"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={(event) => {
                  event.stopPropagation();
                  if (!submitting) setConfirmDamaged(false);
                }}
                className="fixed inset-0 z-[260] flex items-center justify-center bg-black/80 p-3 backdrop-blur-xl sm:p-6"
              >
                <motion.div
                  initial={reduceMotion ? false : { opacity: 0, y: 30, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={reduceMotion ? undefined : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  onClick={(event) => event.stopPropagation()}
                  className="relative max-h-[90vh] w-full max-w-[680px] overflow-y-auto rounded-[30px] border border-red-500/25 bg-gradient-to-br from-[#140a0a] via-[#080808] to-[#0d0808] p-6 shadow-[0_0_120px_rgba(239,68,68,.18)] sm:p-8"
                >
                  <button
                    type="button"
                    onClick={() => setConfirmDamaged(false)}
                    disabled={!!submitting}
                    aria-label="Close"
                    className="absolute right-5 top-5 rounded-2xl border border-zinc-800 bg-zinc-900/90 p-2.5 text-zinc-500 hover:border-red-500/30 hover:text-red-300 disabled:opacity-40"
                  >
                    <X size={16} />
                  </button>
                  <h3 id="damage-popup-title" className="pr-12 text-2xl font-black text-white">
                    What came back <span className="text-red-300">broken or missing?</span>
                  </h3>
                  <p className="mt-1 text-sm text-zinc-500">
                    {row.student} · {requestLabel(row.id)}. Set how many of each gear are lost or damaged. Everything else goes back into stock.
                  </p>

                  <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-800">
                    <div className="grid grid-cols-[1fr_auto_auto] items-center gap-3 border-b border-zinc-800 bg-zinc-900/60 px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500 sm:grid-cols-[1fr_auto_auto_auto]">
                      <span>Gear</span>
                      <span className="w-[120px] text-center">Lost</span>
                      <span className="w-[120px] text-center">Damaged</span>
                      <span className="hidden w-16 text-center sm:block">Good</span>
                    </div>
                    {gears.map((gear) => {
                      const c = countFor(gear.gearId);
                      const good = gear.quantity - c.damaged - c.lost;
                      return (
                        <div key={gear.gearId} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 border-b border-zinc-900 px-4 py-3 last:border-b-0 sm:grid-cols-[1fr_auto_auto_auto]">
                          <div className="min-w-0">
                            <p className="truncate font-bold text-white">{gear.name}</p>
                            <p className="text-xs text-zinc-500">{gear.quantity} borrowed</p>
                          </div>
                          <div className="w-[120px]">
                            <Stepper label={`${gear.name} lost`} tone="amber" value={c.lost} max={gear.quantity - c.damaged} onChange={(n) => setCount(gear.gearId, "lost", n)} />
                          </div>
                          <div className="w-[120px]">
                            <Stepper label={`${gear.name} damaged`} tone="red" value={c.damaged} max={gear.quantity - c.lost} onChange={(n) => setCount(gear.gearId, "damaged", n)} />
                          </div>
                          <span className="hidden w-16 text-center text-sm font-black text-emerald-300 sm:block">{good}</span>
                        </div>
                      );
                    })}
                  </div>


                  {error && (
                    <p role="alert" className="mt-3 flex items-start gap-2 text-sm font-semibold text-red-300">
                      <AlertTriangle size={15} className="mt-0.5 shrink-0" /> {error}
                    </p>
                  )}

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-zinc-400">
                      <span className="font-bold text-amber-300">{totalLost} lost</span> ·{" "}
                      <span className="font-bold text-red-300">{totalDamaged} damaged</span> ·{" "}
                      <span className="font-bold text-emerald-300">
                        {gears.reduce((sum, g) => sum + g.quantity, 0) - totalLost - totalDamaged} back in stock
                      </span>
                    </p>
                    <div className="flex gap-3">
                      <button type="button" onClick={() => setConfirmDamaged(false)} disabled={!!submitting} className="rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-semibold text-zinc-300 hover:border-zinc-500 disabled:opacity-50">
                        Go back
                      </button>
                      <motion.button
                        type="button"
                        onClick={() => choose("damaged")}
                        disabled={!!submitting || totalLost + totalDamaged === 0}
                        whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                        className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-red-400 disabled:opacity-50"
                      >
                        {submitting === "damaged" && <Loader2 size={14} className="animate-spin" />} Confirm return
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {photoOpen && photo && (
              <motion.div
                key="photo"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={(event) => {
                  event.stopPropagation();
                  setPhotoOpen(false);
                }}
                className="fixed inset-0 z-[260] flex items-center justify-center bg-black/90 p-6"
              >
                <motion.img
                  src={photo}
                  alt="Student ID card, full size"
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className="max-h-[85vh] max-w-full rounded-2xl border border-pink-500/30 object-contain shadow-[0_0_60px_rgba(236,72,153,.25)]"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

