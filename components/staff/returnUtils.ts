import { Crosshair, MapPin, Package, Swords, Table2, CircleDot, Target, type LucideIcon } from "lucide-react";

export type ReturnRow = {
  id: number;
  student: string;
  sport: string;
  court: string;
  gear: string;
  gearItems: { gearId: number; name: string; quantity: number }[];
  resourceType: string;
  reason: string;
  borrowTime: string;
  requestTime: string;
  requestedAt: string | null;
  idCard: string | null;
  status: string;
};

export function getGearVisual(name: string): { Icon: LucideIcon; color: string; ring: string } {
  const n = name.toLowerCase();
  if (/ball|stack/.test(n)) return { Icon: CircleDot, color: "text-cyan-300", ring: "border-cyan-400/30 bg-cyan-400/10" };
  if (/racket|racquet|bat|stick/.test(n)) return { Icon: Swords, color: "text-amber-300", ring: "border-amber-400/30 bg-amber-400/10" };
  if (/stump/.test(n)) return { Icon: Crosshair, color: "text-emerald-300", ring: "border-emerald-400/30 bg-emerald-400/10" };
  if (/pool|snooker|cue/.test(n)) return { Icon: Target, color: "text-violet-300", ring: "border-violet-400/30 bg-violet-400/10" };
  if (/table|\btt\b/.test(n)) return { Icon: Table2, color: "text-sky-300", ring: "border-sky-400/30 bg-sky-400/10" };
  return { Icon: Package, color: "text-pink-300", ring: "border-pink-400/30 bg-pink-500/10" };
}

export function primaryVisual(row: ReturnRow) {
  if (row.gearItems.length === 0) return { Icon: MapPin, color: "text-pink-300", ring: "border-pink-400/30 bg-pink-500/10" };
  return getGearVisual(row.gearItems[0].name);
}

export function requestLabel(id: number) {
  return `REQ #${String(id).padStart(4, "0")}`;
}

export function totalItems(row: ReturnRow) {
  return row.gearItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
}

