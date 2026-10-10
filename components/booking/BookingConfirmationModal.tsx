"use client";

import Modal from "@/components/Modal";
import type { Gear, Slot, Sport } from "@/types";
import type { BookingResource } from "./ResourceCard";
import { formatTime, slotDurationMinutes } from "./utils";

type BookingConfirmationModalProps = {
  open: boolean;
  sport: Sport;
  slot: Slot | null;
  resource: BookingResource | null;
  gears: Gear[];
  selectedGear: Record<number, number>;
  submitting: boolean;
  error: string;
  onConfirm: () => void;
  onClose: () => void;
};

export default function BookingConfirmationModal({
  open,
  sport,
  slot,
  resource,
  gears,
  selectedGear,
  submitting,
  error,
  onConfirm,
  onClose,
}: BookingConfirmationModalProps) {
  const gearLines = gears
    .filter((gear) => (selectedGear[gear.id] ?? 0) > 0)
    .map((gear) => `${selectedGear[gear.id]} × ${gear.name}`);
  const duration = slot ? slotDurationMinutes(slot) : 0;

  return (
    <Modal open={open} onClose={onClose} title="Confirm booking" size="sm">
      <div className="space-y-3">
        <Row label="Sport" value={sport.name} />
        {slot && <Row label="Date & time" value={`${formatTime(slot.startTime)} — ${formatTime(slot.endTime)}`} />}
        {resource && <Row label="Resource" value={resource.name} />}
        <Row label="Equipment" value={gearLines.length ? gearLines.join(", ") : "None"} />
        {duration > 0 && <Row label="Duration" value={`${duration} min`} />}
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-xl border border-red-500/25 bg-red-500/[0.06] px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      )}

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          className="min-h-[44px] rounded-xl border border-zinc-700 px-5 text-sm font-bold text-zinc-300 outline-none transition hover:text-white focus-visible:ring-2 focus-visible:ring-cyan-400/60 disabled:opacity-50"
        >
          Go back
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={submitting}
          aria-busy={submitting}
          className="min-h-[44px] rounded-xl bg-cyan-400 px-5 text-sm font-black text-[#05070A] outline-none transition hover:bg-cyan-300 focus-visible:ring-2 focus-visible:ring-white/70 disabled:cursor-wait disabled:opacity-60"
        >
          {submitting ? "Confirming…" : "Confirm booking"}
        </button>
      </div>
    </Modal>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-zinc-800 bg-[#06111f]/80 px-4 py-3">
      <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">{label}</span>
      <span className="text-right text-sm font-semibold text-white">{value}</span>
    </div>
  );
}
