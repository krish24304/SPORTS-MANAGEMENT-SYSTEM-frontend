"use client";

import TeamReservationsPanel from "@/components/team/TeamReservationsPanel";

export default function AdminTeamReservationsPage() {
  return (
    <TeamReservationsPanel
      title="Team reservations"
      subtitle="Reserve courts and resources for a team at a set time. Overlapping bookings are refused."
    />
  );
}
