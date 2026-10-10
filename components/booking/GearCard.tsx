"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Minus, Plus, Package } from "lucide-react";
import type { Gear } from "@/types";

type GearCardProps = {
  gear: Gear;
  quantity: number;
  onChange: (gearId: number, next: number) => void;
};

export default function GearCard({ gear, quantity, onChange }: GearCardProps) {
  const reduce = useReducedMotion();
  const max = Math.max(0, gear.availableQuantity);
  const unavailable = max === 0;

  return (
    <div
      className={`flex min-h-[44px] items-center justify-between gap-3 rounded-xl border px-3 py-2.5 ${
        unavailable ? "border-zinc-800/60 bg-zinc-900/40 opacity-60" : "border-zinc-800 bg-[#081827]/70"
      }`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-cyan-400/20 bg-cyan-400/[0.06] text-cyan-300">
          <Package size={16} aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-white">{gear.name}</p>
          <p className="text-[11px] text-zinc-500">
            {unavailable ? "Unavailable" : `${max} available`}
            {gear.description ? ` · ${gear.description}` : ""}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2" role="group" aria-label={`${gear.name} quantity`}>
        <button
          type="button"
          onClick={() => onChange(gear.id, Math.max(0, quantity - 1))}
          disabled={quantity <= 0}
          aria-label={`Decrease ${gear.name}`}
          className="flex h-11 w-11 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-400 outline-none transition hover:text-white focus-visible:ring-2 focus-visible:ring-cyan-400/60 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <Minus size={14} />
        </button>
        <div className="relative w-6 overflow-hidden text-center" aria-live="polite">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={quantity}
              initial={reduce ? false : { opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: 6 }}
              transition={{ duration: 0.15 }}
              className="block text-sm font-black text-white"
            >
              {quantity}
            </motion.span>
          </AnimatePresence>
        </div>
        <button
          type="button"
          onClick={() => onChange(gear.id, Math.min(max, quantity + 1))}
          disabled={unavailable || quantity >= max}
          aria-label={`Increase ${gear.name}`}
          className="flex h-11 w-11 items-center justify-center rounded-lg border border-cyan-400/40 bg-cyan-400/[0.08] text-cyan-300 outline-none transition hover:bg-cyan-400/[0.15] focus-visible:ring-2 focus-visible:ring-cyan-400/60 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}
