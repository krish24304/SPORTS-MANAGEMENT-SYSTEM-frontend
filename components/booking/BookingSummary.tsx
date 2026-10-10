"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { Gear, Slot, Sport } from "@/types";
import type { BookingResource } from "./ResourceCard";
import { formatTime, slotDurationMinutes } from "./utils";

type BookingSummaryProps = {
  sport: Sport | null;
  slot: Slot | null;
  resource: BookingResource | null;
  gears: Gear[];
  selectedGear: Record<number, number>;
  canContinue: boolean;
  hint: string;
  onContinue: () => void;
};

export default function BookingSummary({
  sport,
  slot,
  resource,
  gears,
  selectedGear,
  canContinue,
  hint,
  onContinue,
}: BookingSummaryProps) {
  const reduce = useReducedMotion();
  const gearLines = gears
    .filter((gear) => (selectedGear[gear.id] ?? 0) > 0)
    .map((gear) => ({ id: gear.id, name: gear.name, qty: selectedGear[gear.id] ?? 0 }));
  const duration = slot ? slotDurationMinutes(slot) : 0;

  return (
    <aside
      aria-labelledby="summary-heading"
      className="rounded-[1.5rem] border border-cyan-400/15 bg-[#081827]/85 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl lg:sticky lg:top-6"
    >
      <h2 id="summary-heading" className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">
        Booking summary
      </h2>

      <dl className="mt-4 space-y-3 text-sm">
        <SummaryRow label="Sport" value={sport?.name ?? "Not selected"} />
        {sport?.hasSlotSystem && (
          <SummaryRow
            label="Time"
            value={slot ? `${formatTime(slot.startTime)} — ${formatTime(slot.endTime)}` : "Not selected"}
          />
        )}
        {(sport?.resources?.length ?? 0) > 0 || resource ? (
          <SummaryRow label="Resource" value={resource?.name ?? "Not selected"} />
        ) : null}
        <SummaryRow
          label="Equipment"
          value={
            gearLines.length === 0
              ? "None"
              : gearLines.map((line) => `${line.qty} × ${line.name}`).join(", ")
          }
        />
        {duration > 0 && <SummaryRow label="Duration" value={`${duration} min`} />}
      </dl>

      <motion.button
        type="button"
        onClick={onContinue}
        disabled={!canContinue}
        whileHover={reduce || !canContinue ? undefined : { scale: 1.01 }}
        whileTap={reduce || !canContinue ? undefined : { scale: 0.98 }}
        transition={{ duration: 0.15 }}
        className="mt-5 flex min-h-[48px] w-full items-center justify-between rounded-2xl bg-cyan-400 px-5 py-3.5 text-sm font-black text-[#05070A] outline-none transition focus-visible:ring-2 focus-visible:ring-white/70 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
      >
        Continue to confirmation
        <ArrowRight size={16} aria-hidden="true" />
      </motion.button>

      <p className="mt-2 text-[11px] text-zinc-500" aria-live="polite">
        {canContinue ? "Ready to confirm." : hint}
      </p>
    </aside>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">{label}</dt>
      <dd className="text-right font-semibold text-white">{value}</dd>
    </div>
  );
}
