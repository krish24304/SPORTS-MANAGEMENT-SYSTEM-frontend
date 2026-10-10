"use client";

import { motion } from "framer-motion";
import {
  CalendarCheck,
  CheckCircle2,
  Clock3,
  Loader2,
  RotateCcw,
} from "lucide-react";

export type NextBooking = {
  id: number;
  status: string;
  sportName: string;
  startTime: string | null;
  endTime: string | null;
};

type Props = {
  booking: NextBooking | null;
  loading: boolean;
  loadError: string;
  needsSignIn: boolean;
  actionError: string;
  returning: boolean;
  onRequestReturn: (bookingId: number) => void;
  onRetry: () => void;
};

function formatWhen(startIso: string | null, endIso: string | null) {
  if (!startIso) return "Time not set";

  const start = new Date(startIso);
  const isToday = start.toDateString() === new Date().toDateString();
  const day = isToday
    ? "Today"
    : start.toLocaleDateString([], { weekday: "short", day: "numeric", month: "short" });
  const time = (value: Date) =>
    value.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

  return endIso
    ? `${day} · ${time(start)} – ${time(new Date(endIso))}`
    : `${day} · ${time(start)}`;
}

export default function NextBookingCard({
  booking,
  loading,
  loadError,
  needsSignIn,
  actionError,
  returning,
  onRequestReturn,
  onRetry,
}: Props) {
  if (loading) {
    return (
      <div className="rounded-3xl border border-zinc-800/80 bg-[#090b0b] p-5 text-sm text-zinc-500">
        Loading your booking…
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-zinc-800 bg-[#090b0b] p-5 text-sm text-zinc-400">
        <span>{loadError}</span>
        {!needsSignIn && (
          <button
            type="button"
            onClick={onRetry}
            className="rounded-xl border border-zinc-700 px-3 py-1.5 text-xs font-semibold text-zinc-300 transition hover:border-emerald-400/40 hover:text-emerald-300"
          >
            Try again
          </button>
        )}
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="rounded-3xl border border-dashed border-zinc-800 bg-[#090b0b] p-5 text-sm text-zinc-500">
        You have no upcoming bookings.
      </div>
    );
  }

  const isReturnRequested = booking.status === "return_requested";
  const hasEnded = booking.endTime !== null && new Date(booking.endTime).getTime() <= Date.now();

  return (
    <div className="space-y-3">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="group relative overflow-hidden rounded-3xl border border-zinc-800/80 bg-[#090b0b] p-5 shadow-[0_15px_45px_rgba(0,0,0,0.18)] transition-all duration-300 hover:border-emerald-400/15"
      >
        <div className="relative flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-400/10 bg-emerald-400/5 text-emerald-400/80">
              <CalendarCheck size={20} />
            </div>

            <div>
              <h3 className="font-semibold text-white">{booking.sportName}</h3>

              <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-zinc-500">
                <span className="flex items-center gap-1">
                  <Clock3 size={13} />
                  {formatWhen(booking.startTime, booking.endTime)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {isReturnRequested ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1.5 text-xs font-medium text-yellow-400">
                Waiting for staff verification
              </span>
            ) : hasEnded ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-400">
                Slot ended · return needed
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/15 bg-emerald-400/4.5 px-3 py-1.5 text-xs font-medium text-emerald-300/80">
                <CheckCircle2 size={13} />
                Confirmed
              </span>
            )}

            {booking.status === "active" && (
              <button
                type="button"
                onClick={() => onRequestReturn(booking.id)}
                disabled={returning}
                className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-700 px-3 py-1.5 text-xs font-semibold text-zinc-300 transition hover:border-emerald-400/40 hover:text-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {returning ? <Loader2 size={13} className="animate-spin" /> : <RotateCcw size={13} />}
                {returning ? "Requesting…" : "Request Return"}
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {actionError && (
        <p role="alert" className="rounded-xl border border-red-500/20 bg-red-500/4 px-4 py-2.5 text-xs text-red-300">
          {actionError}
        </p>
      )}
    </div>
  );
}
