"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Dumbbell, ShieldAlert } from "lucide-react";
import type { Sport } from "@/types";

type SportCardProps = {
  sport: Sport;
  selected: boolean;
  onSelect: (sport: Sport) => void;
};

export default function SportCard({ sport, selected, onSelect }: SportCardProps) {
  const reduce = useReducedMotion();
  const maintenance = Boolean(sport.maintenance);
  const limited = !maintenance && (sport.availableCourts ?? 0) === 0;
  const status = maintenance ? "Maintenance" : limited ? "Limited" : "Available";
  const statusClass = maintenance
    ? "text-amber-300"
    : limited
      ? "text-zinc-400"
      : "text-cyan-300";

  return (
    <motion.button
      type="button"
      onClick={() => !maintenance && onSelect(sport)}
      aria-pressed={selected}
      aria-disabled={maintenance}
      disabled={maintenance}
      whileHover={reduce || maintenance ? undefined : { y: -3 }}
      transition={{ duration: 0.18 }}
      className={`group relative w-full rounded-2xl border p-4 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400/60 disabled:cursor-not-allowed disabled:opacity-50 min-h-[44px] ${
        selected
          ? "border-cyan-400/70 bg-cyan-400/[0.07] shadow-[0_0_24px_rgba(102,182,212,0.25)]"
          : "border-zinc-800 bg-[#081827]/70 hover:border-cyan-400/30"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/[0.06] text-cyan-300">
          {maintenance ? <ShieldAlert size={18} /> : <Dumbbell size={18} />}
        </div>
        {selected && (
          <span className="rounded-full border border-cyan-400/40 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.14em] text-cyan-300">
            Selected
          </span>
        )}
      </div>

      <h3 className="mt-3 text-base font-bold text-white">{sport.name}</h3>
      <p className="mt-0.5 text-xs text-zinc-500">{sport.resourceType || "Resource"}</p>

      {sport.maintenanceMessage && maintenance && (
        <p className="mt-2 text-xs text-amber-200/80">{sport.maintenanceMessage}</p>
      )}

      <p className={`mt-3 text-[11px] font-black uppercase tracking-[0.14em] ${statusClass}`}>
        {status}
      </p>
    </motion.button>
  );
}
