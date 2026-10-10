"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";

export type BookingSuccessInfo = {
  sport: string;
  time: string;
  resource: string;
};

type BookingSuccessProps = {
  info: BookingSuccessInfo;
  onBookAnother: () => void;
};

export default function BookingSuccess({ info, onBookAnother }: BookingSuccessProps) {
  const reduce = useReducedMotion();

  return (
    <motion.section
      role="status"
      aria-live="polite"
      initial={reduce ? false : { opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
      className="mx-auto max-w-md rounded-[1.5rem] border border-cyan-400/25 bg-[#081827]/90 p-6 text-center shadow-[0_0_40px_rgba(102,182,212,0.15)]"
    >
      <motion.div
        initial={reduce ? false : { scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, delay: reduce ? 0 : 0.1 }}
        className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-cyan-400/40 bg-cyan-400/[0.12] text-cyan-300"
      >
        <Check size={26} aria-hidden="true" />
      </motion.div>

      <h2 className="mt-4 text-xl font-black text-white">Booking confirmed</h2>

      <dl className="mt-5 space-y-2 text-left text-sm">
        <Row label="Sport" value={info.sport} />
        <Row label="Time" value={info.time} />
        <Row label="Resource" value={info.resource} />
      </dl>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/my-bookings"
          className="flex min-h-[44px] flex-1 items-center justify-center rounded-xl bg-cyan-400 px-4 text-sm font-black text-[#05070A] outline-none focus-visible:ring-2 focus-visible:ring-white/70"
        >
          View my bookings
        </Link>
        <button
          type="button"
          onClick={onBookAnother}
          className="min-h-[44px] flex-1 rounded-xl border border-zinc-700 px-4 text-sm font-bold text-zinc-200 outline-none hover:text-white focus-visible:ring-2 focus-visible:ring-cyan-400/60"
        >
          Book another session
        </button>
      </div>
    </motion.section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-zinc-800 bg-[#06111f]/80 px-4 py-2.5">
      <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">{label}</dt>
      <dd className="text-right font-semibold text-white">{value}</dd>
    </div>
  );
}
