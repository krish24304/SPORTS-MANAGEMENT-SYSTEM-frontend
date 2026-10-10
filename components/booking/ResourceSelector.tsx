"use client";

import ResourceCard, { type BookingResource } from "./ResourceCard";
import Skeleton from "./Skeleton";

type ResourceSelectorProps = {
  resources: BookingResource[];
  loading: boolean;
  selectedId: number | null;
  onSelect: (resource: BookingResource) => void;
};

export default function ResourceSelector({ resources, loading, selectedId, onSelect }: ResourceSelectorProps) {
  return (
    <section aria-labelledby="resource-heading" className="space-y-3">
      <h2 id="resource-heading" className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">
        3 · Choose your resource
      </h2>

      {loading ? (
        <Skeleton rows={2} height="h-12" />
      ) : resources.length === 0 ? (
        <p className="text-sm text-zinc-500">No resources are configured for this sport.</p>
      ) : (
        <div role="group" aria-label="Resources" className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {resources.map((resource) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              selected={selectedId === resource.id}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </section>
  );
}
