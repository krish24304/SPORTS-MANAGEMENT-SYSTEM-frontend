"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AlertTriangle, CheckCircle2, ChevronDown, Package, Search } from "lucide-react";

import DashboardLayout from "@/components/layout/DashboardLayout";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type GearApi = {
  id: number;
  name: string;
  totalQuantity: number;
  availableQuantity: number;
  damagedQuantity: number;
};

type SportApi = {
  id: number;
  name: string;
  gears?: GearApi[];
};

type Equipment = {
  id: number;
  sport: string;
  name: string;
  total: number;
  available: number;
  inUse: number;
  damaged: number;
};

type FilterType = "all" | "available";

function toEquipment(sports: SportApi[]): Equipment[] {
  return sports.flatMap((sport) =>
    (sport.gears ?? []).map((gear) => {
      const inUse = Math.max(gear.totalQuantity - gear.availableQuantity - gear.damagedQuantity, 0);
      return {
        id: gear.id,
        sport: sport.name,
        name: gear.name,
        total: gear.totalQuantity,
        available: gear.availableQuantity,
        inUse,
        damaged: gear.damagedQuantity,
      };
    })
  );
}

function stockStatus(item: Equipment) {
  if (item.available === 0) return { label: "Out of stock", classes: "border-red-400/25 bg-red-400/10 text-red-300", bar: "bg-red-400" };
  if (item.available <= Math.max(1, Math.ceil(item.total * 0.25))) {
    return { label: "Low stock", classes: "border-amber-400/25 bg-amber-400/10 text-amber-300", bar: "bg-amber-400" };
  }
  return { label: "Available", classes: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300", bar: "bg-emerald-400" };
}

export default function EquipmentPage() {
  const reduceMotion = useReducedMotion();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/sports`, { cache: "no-store" });
        if (!response.ok) throw new Error("Failed to load equipment");
        const data: SportApi[] = await response.json();
        if (!cancelled) {
          setEquipment(Array.isArray(data) ? toEquipment(data) : []);
          setLoadError("");
        }
      } catch {
        if (!cancelled) setLoadError("Unable to load equipment right now.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return equipment.filter((item) => {
      const matchesSearch =
        !query || item.name.toLowerCase().includes(query) || item.sport.toLowerCase().includes(query);
      const matchesFilter = filter === "all" || item.available > 0;
      return matchesSearch && matchesFilter;
    });
  }, [equipment, search, filter]);

  const groups = useMemo(() => {
    const bySport = new Map<string, Equipment[]>();
    filtered.forEach((item) => {
      bySport.set(item.sport, [...(bySport.get(item.sport) ?? []), item]);
    });
    return Array.from(bySport.entries());
  }, [filtered]);

  const totals = useMemo(
    () =>
      filtered.reduce(
        (acc, item) => ({
          total: acc.total + item.total,
          available: acc.available + item.available,
          inUse: acc.inUse + item.inUse,
          damaged: acc.damaged + item.damaged,
        }),
        { total: 0, available: 0, inUse: 0, damaged: 0 }
      ),
    [filtered]
  );

  return (
    <DashboardLayout title="Equipment">
      <div className="space-y-8">
        <motion.header
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">Equipment overview</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-white md:text-4xl">Equipment Overview</h2>
          <p className="mt-2 text-sm text-zinc-500">See what is available to book right now.</p>
        </motion.header>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search size={18} className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-zinc-600" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search equipment or sport..."
              className="h-12 w-full rounded-xl border border-zinc-800 bg-zinc-900/60 pl-11 pr-4 text-sm text-white outline-none transition-all duration-200 placeholder:text-zinc-600 hover:border-zinc-700 focus:border-emerald-500/50 focus:bg-zinc-900 focus:ring-4 focus:ring-emerald-500/5"
            />
          </div>

          <div className="relative">
            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value as FilterType)}
              className="h-12 w-full appearance-none rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 pr-10 text-sm font-medium text-zinc-300 outline-none transition-all hover:border-zinc-700 focus:border-emerald-500/50 sm:w-[170px]"
            >
              <option value="all">All items</option>
              <option value="available">Available only</option>
            </select>
            <ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500" />
          </div>
        </div>

        {!loading && !loadError && filtered.length > 0 && (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <SummaryTile label="Total units" value={totals.total} />
            <SummaryTile label="Available" value={totals.available} tone="emerald" />
            <SummaryTile label="In use" value={totals.inUse} tone="cyan" />
            <SummaryTile label="Damaged" value={totals.damaged} tone="red" />
          </div>
        )}

        {loading && (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2].map((key) => (
              <div key={key} className="h-44 animate-pulse rounded-3xl border border-zinc-800 bg-zinc-950" />
            ))}
          </div>
        )}

        {!loading && loadError && (
          <div className="flex items-center gap-3 rounded-3xl border border-zinc-800 bg-[#090b0b] p-6 text-sm text-zinc-400">
            <AlertTriangle size={18} className="text-amber-400" />
            {loadError}
          </div>
        )}

        {!loading && !loadError && filtered.length === 0 && (
          <div className="rounded-3xl border border-dashed border-zinc-800 bg-[#090b0b] px-6 py-14 text-center">
            <Package size={30} className="mx-auto text-zinc-700" />
            <p className="mt-4 font-semibold text-zinc-300">No equipment found</p>
            <p className="mt-1 text-sm text-zinc-600">Try a different search or change the filter.</p>
          </div>
        )}

        <AnimatePresence>
          {groups.map(([sportName, items], groupIndex) => (
            <motion.section
              key={sportName}
              layout={!reduceMotion}
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, delay: reduceMotion ? 0 : groupIndex * 0.05 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">{sportName}</h3>
                <span className="rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 text-xs text-zinc-500">
                  {items.length} {items.length === 1 ? "item" : "items"}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {items.map((item) => {
                  const status = stockStatus(item);
                  const percent = item.total > 0 ? Math.round((item.available / item.total) * 100) : 0;

                  return (
                    <motion.article
                      key={item.id}
                      whileHover={reduceMotion ? undefined : { y: -3 }}
                      className="group relative overflow-hidden rounded-3xl border border-zinc-800 bg-[#090b0b] p-5 transition-colors hover:border-zinc-700"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-base font-semibold text-white">{item.name}</p>
                          <p className="mt-1 text-xs text-zinc-600">{item.sport}</p>
                        </div>
                        <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${status.classes}`}>
                          {item.available > 0 ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                          {status.label}
                        </span>
                      </div>

                      <div className="mt-5">
                        <div className="flex items-end justify-between text-xs text-zinc-500">
                          <span>Available</span>
                          <span className="text-sm font-bold text-white">
                            {item.available}
                            <span className="text-zinc-600"> / {item.total}</span>
                          </span>
                        </div>
                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-800">
                          <motion.div
                            initial={reduceMotion ? false : { width: 0 }}
                            animate={{ width: `${percent}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className={`h-full rounded-full ${status.bar}`}
                          />
                        </div>
                      </div>

                      <dl className="mt-5 grid grid-cols-3 gap-2 text-center">
                        <div className="rounded-xl bg-zinc-950 py-2.5">
                          <dt className="text-[10px] uppercase tracking-wider text-zinc-600">Total</dt>
                          <dd className="mt-0.5 text-sm font-semibold text-zinc-200">{item.total}</dd>
                        </div>
                        <div className="rounded-xl bg-zinc-950 py-2.5">
                          <dt className="text-[10px] uppercase tracking-wider text-zinc-600">In use</dt>
                          <dd className="mt-0.5 text-sm font-semibold text-cyan-300">{item.inUse}</dd>
                        </div>
                        <div className="rounded-xl bg-zinc-950 py-2.5">
                          <dt className="text-[10px] uppercase tracking-wider text-zinc-600">Damaged</dt>
                          <dd className="mt-0.5 text-sm font-semibold text-red-300">{item.damaged}</dd>
                        </div>
                      </dl>
                    </motion.article>
                  );
                })}
              </div>
            </motion.section>
          ))}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}

function SummaryTile({ label, value, tone }: { label: string; value: number; tone?: "emerald" | "cyan" | "red" }) {
  const valueClass =
    tone === "emerald" ? "text-emerald-300" : tone === "cyan" ? "text-cyan-300" : tone === "red" ? "text-red-300" : "text-white";

  return (
    <div className="rounded-2xl border border-zinc-800 bg-[#090b0b] px-5 py-4">
      <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">{label}</p>
      <p className={`mt-1 text-2xl font-black ${valueClass}`}>{value}</p>
    </div>
  );
}
