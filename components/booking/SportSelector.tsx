"use client";

import type { Sport } from "@/types";
import SportCard from "./SportCard";
import Skeleton from "./Skeleton";

type SportSelectorProps = {
  sports: Sport[];
  loading: boolean;
  selectedId: number | null;
  onSelect: (sport: Sport) => void;
};

export default function SportSelector({ sports, loading, selectedId, onSelect }: SportSelectorProps) {
  return (
    <section aria-labelledby="sport-heading" className="space-y-3">
      <h2 id="sport-heading" className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">
        1 · Choose a sport
      </h2>

      {loading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <Skeleton rows={3} height="h-32" />
        </div>
      ) : sports.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-800 p-8 text-center text-sm text-zinc-500">
          No sports are available right now.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {sports.map((sport) => (
            <SportCard
              key={sport.id}
              sport={sport}
              selected={selectedId === sport.id}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </section>
  );
}
