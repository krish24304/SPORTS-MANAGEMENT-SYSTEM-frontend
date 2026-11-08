import { redirect } from "next/navigation";

// Slot generation lives on the Operations page; this old route just forwards there.
export default function StaffSlotsPage() {
  redirect("/staff/operations");
}
