"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Check, Clock3, LockKeyhole, Ban } from "lucide-react";
import type { Slot } from "@/types";
import { formatTime, slotDurationMinutes, slotStatus } from "./utils";

type SlotCardProps = {
  slot: Slot;
  selected: boolean;
  index: number;
  onSelect: (slot: Slot) => void;
};

export default function SlotCard({ slot, selected, index, onSelect }: SlotCardProps) {
  const reduce = useReducedMotion();
  const status = slotStatus(slot);
  const bookable = status === "available";
  const duration = slotDurationMinutes(slot);

  const label =
    status === "available"
      ? "Available"
      : status === "booked"
        ? "Booked"
        : status === "reserved"
          ? slot.teamName || "Team reserved"
          : "Unavailable";

  const Icon =
    status === "available" ? Check : status === "booked" ? LockKeyhole : Ban;

  return (
    <motion.button
      type="button"
      onClick={() => bookable && onSelect(slot)}
      aria-pressed={selected}
      aria-disabled={!bookable}
      disabled={!bookable}
      aria-label={`${formatTime(slot.startTime)} to ${formatTime(slot.endTime)}, ${label}`}
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: bookable ? 1 : 0.5, y: 0 }}
      transition={{ duration: 0.2, delay: reduce ? 0 : index * 0.03 }}
      whileHover={reduce || !bookable ? undefined : { y: -2 }}
      className={`flex min-h-[44px] w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400/60 disabled:cursor-not-allowed ${
        selected
          ? "border-cyan-400/80 bg-cyan-400/[0.10] shadow-[0_0_20px_rgba(102,182,212,0.25)]"
          : bookable
            ? "border-cyan-400/25 bg-[#081827]/80 hover:border-cyan-400/50"
            : "border-zinc-800 bg-zinc-900/40"
      }`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <Clock3 size={15} className={bookable ? "text-cyan-300" : "text-zinc-600"} />
        <div className="min-w-0">
          <p className={`text-sm font-black ${bookable ? "text-white" : "text-zinc-500"}`}>
            {formatTime(slot.startTime)} — {formatTime(slot.endTime)}
          </p>
          <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
            {duration ? `${duration} min` : ""}
            {slot.maxCapacity > 1 ? ` · ${Math.max(0, slot.maxCapacity - slot.bookedCount)} of ${slot.maxCapacity} left` : ""}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        {selected ? (
          <span className="rounded-full border border-cyan-400/50 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.12em] text-cyan-300">
            Selected
          </span>
        ) : (
          <span
            className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.12em] ${
              bookable ? "text-cyan-300" : "text-zinc-500"
            }`}
          >
            <Icon size={12} aria-hidden="true" />
            {label}
          </span>
        )}
      </div>
    </motion.button>
  );
}
