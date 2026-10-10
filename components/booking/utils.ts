import type { Slot } from "@/types";

export function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function slotDurationMinutes(slot: Slot) {
  const start = new Date(slot.startTime).getTime();
  const end = new Date(slot.endTime).getTime();
  const minutes = Math.round((end - start) / 60000);
  return Number.isFinite(minutes) && minutes > 0 ? minutes : 0;
}

export function isSlotBookable(slot: Slot) {
  return (
    slot.isActive !== false &&
    !slot.isBooked &&
    !slot.isTeamReserved &&
    slot.slotType?.toLowerCase() !== "team_reserved" &&
    slot.bookedCount < slot.maxCapacity
  );
}

export type SlotStatus = "available" | "booked" | "reserved" | "inactive";

export function slotStatus(slot: Slot): SlotStatus {
  if (slot.isActive === false) return "inactive";
  if (slot.isTeamReserved || slot.slotType?.toLowerCase() === "team_reserved")
    return "reserved";
  if (slot.isBooked || slot.bookedCount >= slot.maxCapacity) return "booked";
  return "available";
}
