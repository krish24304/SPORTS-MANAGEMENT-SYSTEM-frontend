"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Loader2, RotateCcw, X } from "lucide-react";

type Props = {
  sportName: string;
  submitting: boolean;
  error: string;
  onRequestReturn: () => void;
  onDismiss: () => void;
};

export default function SlotEndedPrompt({
  sportName,
  submitting,
  error,
  onRequestReturn,
  onDismiss,
}: Props) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-labelledby="slot-ended-title"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 p-4"
    >
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-sm rounded-3xl border border-zinc-800 bg-[#090b0b] p-6 shadow-[0_25px_70px_rgba(0,0,0,0.5)]"
      >
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Close"
          className="absolute right-4 top-4 text-zinc-500 transition hover:text-white"
        >
          <X size={18} />
        </button>

        <p className="text-xs font-medium uppercase tracking-[0.18em] text-emerald-400/80">
          Slot finished
        </p>

        <h2 id="slot-ended-title" className="mt-2 text-xl font-semibold text-white">
          Your {sportName} slot has ended
        </h2>

        <p className="mt-2 text-sm text-zinc-500">
          Return the equipment now so staff can verify it.
        </p>

        {error && (
          <p role="alert" className="mt-4 rounded-xl border border-red-500/20 bg-red-500/4 px-4 py-2.5 text-xs text-red-300">
            {error}
          </p>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onRequestReturn}
            disabled={submitting}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-emerald-400 disabled:opacity-60"
          >
            {submitting ? <Loader2 size={15} className="animate-spin" /> : <RotateCcw size={15} />}
            {submitting ? "Sending…" : "Request Return"}
          </button>

          <button
            type="button"
            onClick={onDismiss}
            disabled={submitting}
            className="inline-flex flex-1 items-center justify-center rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-semibold text-zinc-300 transition hover:border-zinc-500 disabled:opacity-60"
          >
            Not now
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
