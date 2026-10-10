"use client";

import { useReducedMotion, motion } from "framer-motion";
import { CheckCircle2, Wrench, CircleDot } from "lucide-react";

export type BookingResource = {
  id: number;
  name: string;
  type: string;
  status: string;
};

type ResourceCardProps = {
  resource: BookingResource;
  selected: boolean;
  onSelect: (resource: BookingResource) => void;
};

function resourceState(status: string) {
  const value = status.toLowerCase();
  if (value.includes("maintenance")) return "maintenance" as const;
  if (value.includes("book") || value.includes("busy")) return "busy" as const;
  return "available" as const;
}

export default function ResourceCard({ resource, selected, onSelect }: ResourceCardProps) {
  const reduce = useReducedMotion();
  const state = resourceState(resource.status);
  const selectable = state === "available";

  const label =
    state === "maintenance" ? "Maintenance" : state === "busy" ? "Busy" : "Available";
  const Icon = state === "maintenance" ? Wrench : state === "busy" ? CircleDot : CheckCircle2;

  return (
    <motion.button
      type="button"
      onClick={() => selectable && onSelect(resource)}
      aria-pressed={selected}
      aria-disabled={!selectable}
      disabled={!selectable}
      aria-label={`${resource.name}, ${label}`}
      whileHover={reduce || !selectable ? undefined : { y: -2 }}
      transition={{ duration: 0.18 }}
      className={`flex min-h-[44px] w-full items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400/60 disabled:cursor-not-allowed ${
        selected
          ? "border-cyan-400/70 bg-cyan-400/[0.08] shadow-[0_0_18px_rgba(102,182,212,0.2)]"
          : selectable
            ? "border-zinc-800 bg-[#081827]/70 hover:border-cyan-400/30"
            : "border-zinc-800/60 bg-zinc-900/40 opacity-60"
      }`}
    >
      <span className="text-sm font-bold text-white">{resource.name}</span>
      <span
        className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.12em] ${
          state === "available"
            ? "text-cyan-300"
            : state === "busy"
              ? "text-zinc-400"
              : "text-amber-300"
        }`}
      >
        <Icon size={12} aria-hidden="true" />
        {selected ? "Selected" : label}
      </span>
    </motion.button>
  );
}
