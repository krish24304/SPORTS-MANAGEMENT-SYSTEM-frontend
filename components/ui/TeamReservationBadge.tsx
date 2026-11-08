
type Reservation = { teamName: string; startDateTime: string; endDateTime: string };

export type TeamReservationSummary = {
  status: "reserved" | "upcoming" | "free";
  current: Reservation | null;
  next: Reservation | null;
  upcomingCount: number;
};

const time = (value: string) =>
  new Date(value).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });

const dayAndTime = (value: string) => {
  const date = new Date(value);
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  const day =
    date.toDateString() === today.toDateString()
      ? "Today"
      : date.toDateString() === tomorrow.toDateString()
        ? "Tomorrow"
        : date.toLocaleDateString(undefined, {
            weekday: "short",
            day: "numeric",
            month: "short",
          });

  return `${day}, ${time(value)}`;
};

// Shows whether a team has the sport reserved right now, later, or not at all.
export default function TeamReservationBadge({
  summary,
}: {
  summary?: TeamReservationSummary | null;
}) {
  const base =
    "px-3 py-1 rounded-full border text-sm font-semibold text-right transition-all duration-300 ease-in-out";

  if (summary?.status === "reserved" && summary.current) {
    const more = summary.upcomingCount - 1;

    return (
      <span
        className={`${base} bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/15 hover:border-amber-400/50`}
        title={`${summary.current.teamName} until ${time(summary.current.endDateTime)}${more > 0 ? ` · ${more} more booked` : ""}`}
      >
        Reserved now · until {time(summary.current.endDateTime)}
      </span>
    );
  }

  if (summary?.status === "upcoming" && summary.next) {
    const more = summary.upcomingCount - 1;

    return (
      <span
        className={`${base} bg-sky-500/10 text-sky-300 border-sky-500/30 hover:bg-sky-500/15 hover:border-sky-400/50`}
        title={`${summary.next.teamName}${more > 0 ? ` · ${more} more booked` : ""}`}
      >
        Next: {dayAndTime(summary.next.startDateTime)}
        {more > 0 ? ` (+${more})` : ""}
      </span>
    );
  }

  return (
    <span
      className={`${base} bg-blue-500/10 text-blue-300 border-blue-500/30 hover:bg-blue-500/15 hover:border-blue-400/50`}
    >
      Not Reserved
    </span>
  );
}
