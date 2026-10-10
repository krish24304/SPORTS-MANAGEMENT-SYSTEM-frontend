"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AlertTriangle, Box, CalendarDays, Check, CheckCircle2, ClipboardCheck, Clock, IdCard, Loader2, Maximize2, ShieldCheck, Undo2, X } from "lucide-react";

import { ReturnRow, requestLabel, totalItems } from "./returnUtils";

export type ConditionError = Error & { status?: number };

type Props = {
  row: ReturnRow | null;
  onClose: () => void;
  onCondition: (row: ReturnRow, condition: "good" | "damaged") => Promise<void>;
};

export default function ReturnDetailsModal({ row, onClose, onCondition }: Props) {
  const reduceMotion = useReducedMotion();
  const [submitting, setSubmitting] = useState<"good" | "damaged" | null>(null);
  const [confirmDamaged, setConfirmDamaged] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<"good" | "damaged" | null>(null);
  const [photoOpen, setPhotoOpen] = useState(false);

  useEffect(() => {
    setSubmitting(null);
    setConfirmDamaged(false);
    setError("");
    setDone(null);
    setPhotoOpen(false);
  }, [row?.id]);

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

  const choose = async (condition: "good" | "damaged") => {
    if (!row || submitting) return;
    if (condition === "damaged" && !confirmDamaged) {
      setConfirmDamaged(true);
      return;
    }
    setError("");
    setSubmitting(condition);
    try {
      await onCondition(row, condition);
      setDone(condition);
      window.setTimeout(onClose, 900);
    } catch (err) {
      const e = err as ConditionError;
      if (e.status === 409) {
        setError("This return was already handled by someone else. The list has been refreshed.");
      } else {
        setError(e instanceof Error ? e.message : "Could not save the return. Please try again.");
      }
      setConfirmDamaged(false);
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
                  <p className="text-xs text-zinc-500">Check the student's uploaded ID card.</p>
                </div>
              </div>

              {photo ? (
                <button
                  type="button"
                  onClick={() => setPhotoOpen(true)}
                  className="group mt-4 flex w-full items-center justify-between gap-4 overflow-hidden rounded-3xl border border-pink-500/20 bg-black/40 p-4 text-left transition hover:border-pink-400/40"
                >
                  <span className="flex items-center gap-4">
                    <img src={photo} alt="Student ID card" className="h-20 w-32 rounded-xl border border-zinc-800 object-cover" />
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
                    <span className="font-bold">{done === "good" ? "Returned in good condition" : "Returned as damaged"}</span>
                  </motion.div>
                ) : confirmDamaged ? (
                  <motion.div key="confirm" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-4 rounded-2xl border border-red-400/30 bg-red-500/5 p-5">
                    <p className="text-sm text-red-200">Mark this as damaged? The equipment will be counted as damaged and will not go back into stock.</p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <button type="button" onClick={() => setConfirmDamaged(false)} disabled={!!submitting} className="rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-semibold text-zinc-300 hover:border-zinc-500 disabled:opacity-50">
                        Go back
                      </button>
                      <motion.button
                        type="button"
                        onClick={() => choose("damaged")}
                        disabled={!!submitting}
                        whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                        className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-400 disabled:opacity-60"
                      >
                        {submitting === "damaged" && <Loader2 size={14} className="animate-spin" />} Yes, mark as damaged
                      </motion.button>
                    </div>
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
                      disabled={!!submitting}
                      whileHover={reduceMotion ? undefined : { y: -2, boxShadow: "0 0 30px rgba(248,113,113,.3)" }}
                      whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-400/40 bg-red-500/10 px-5 py-4 text-sm font-bold text-red-200 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <X size={16} /> Broken / damaged
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.section>
          </motion.div>

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

