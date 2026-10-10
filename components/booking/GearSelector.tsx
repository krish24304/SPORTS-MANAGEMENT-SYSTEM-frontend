"use client";

import type { Gear } from "@/types";
import GearCard from "./GearCard";
import Skeleton from "./Skeleton";

type GearSelectorProps = {
  gears: Gear[];
  loading: boolean;
  selectedGear: Record<number, number>;
  onChange: (gearId: number, next: number) => void;
};

export default function GearSelector({ gears, loading, selectedGear, onChange }: GearSelectorProps) {
  return (
    <section aria-labelledby="gear-heading" className="space-y-3">
      <h2 id="gear-heading" className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">
        4 · Need equipment?
      </h2>

      {loading ? (
        <Skeleton rows={2} height="h-14" />
      ) : gears.length === 0 ? (
        <p className="text-sm text-zinc-500">No equipment is configured for this sport.</p>
      ) : (
        <div className="space-y-2">
          {gears.map((gear) => (
            <GearCard
              key={gear.id}
              gear={gear}
              quantity={selectedGear[gear.id] ?? 0}
              onChange={onChange}
            />
          ))}
          {Object.values(selectedGear).every((qty) => qty === 0) && (
            <p className="text-xs text-zinc-600">No additional gear selected.</p>
          )}
        </div>
      )}
    </section>
  );
}
