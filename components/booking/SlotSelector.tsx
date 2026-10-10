"use client";

import type { Slot } from "@/types";
import SlotCard from "./SlotCard";
import Skeleton from "./Skeleton";
import { isSlotBookable } from "./utils";

type SlotSelectorProps = {
  slots: Slot[];
  loading: boolean;
  error: string;
  selectedSlotId: number | null;
  onSelect: (slot: Slot) => void;
  onRetry: () => void;
};

export default function SlotSelector({
  slots,
  loading,
  error,
  selectedSlotId,
  onSelect,
  onRetry,
}: SlotSelectorProps) {
  const available = slots.filter(isSlotBookable).length;

  return (
    <section aria-labelledby="time-heading" className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 id="time-heading" className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">
          2 · Choose your time
        </h2>
        {!loading && !error && slots.length > 0 && (
          <p className="text-[11px] font-semibold text-zinc-500" aria-live="polite">
            {available} of {slots.length} open · rolling 6-hour window
          </p>
        )}
      </div>

      {error ? (
        <div role="alert" className="flex items-center justify-between gap-3 rounded-2xl border border-red-500/25 bg-red-500/[0.05] p-4">
          <p className="text-sm text-red-200">{error}</p>
          <button
            type="button"
            onClick={onRetry}
            className="min-h-[44px] rounded-xl border border-zinc-700 px-4 text-xs font-bold text-zinc-200 outline-none hover:text-white focus-visible:ring-2 focus-visible:ring-cyan-400/60"
          >
            Retry
          </button>
        </div>
      ) : loading && slots.length === 0 ? (
        <Skeleton rows={4} height="h-16" />
      ) : slots.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-800 p-6 text-center">
          <p className="text-sm font-bold text-zinc-400">No slots in this window</p>
          <p className="mt-1 text-xs text-zinc-600">The live slot window will update automatically.</p>
        </div>
      ) : (
        <div role="group" aria-label="Available time slots" className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {slots.map((slot, index) => (
            <SlotCard
              key={slot.id}
              slot={slot}
              index={index}
              selected={selectedSlotId === slot.id}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </section>
  );
}
