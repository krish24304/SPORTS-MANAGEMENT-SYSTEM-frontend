"use client";

import { useEffect, useMemo, useState } from "react";
import { History, RotateCcw, Search } from "lucide-react";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { getUser } from "@/lib/auth";

type Booking = {
  id: number;
  status: string;
  bookingType?: string;
  gearOnly?: boolean;
  createdAt?: string;
  bookedAt?: string;
  returnedAt?: string;
  sport?: {
    name?: string;
  };
  slot?: {
    startTime?: string;
    endTime?: string;
  };
};

export default function HistoryPage() {
  const [history, setHistory] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchName, setSearchName] = useState("");
  const [selectedSport, setSelectedSport] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const fetchHistory = async () => {
    try {
      const user = getUser();

      if (!user?.id) {
        setHistory([]);
        return;
      }

      const response = await fetch(
        `http://localhost:5000/bookings/${user.id}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch history");
      }

      const data = await response.json();

      setHistory(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("History error:", error);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleReturnRequest = async (bookingId: number) => {
    try {
      const response = await fetch(
        `http://localhost:5000/return-request/${bookingId}`,
        {
          method: "PUT",
        }
      );

      if (!response.ok) {
        throw new Error("Return request failed");
      }

      alert("Return request sent.");
      fetchHistory();
    } catch (error) {
      console.error(error);
      alert("Return request failed.");
    }
  };

  const sports = useMemo(() => {
    return Array.from(
      new Set(
        history
          .map((booking) => booking.sport?.name)
          .filter(Boolean)
      )
    ) as string[];
  }, [history]);

  const statuses = useMemo(() => {
    return Array.from(
      new Set(history.map((booking) => booking.status))
    );
  }, [history]);

  const filteredBookings = useMemo(() => {
    return history.filter((booking) => {
      const sportName = booking.sport?.name || "";

      const matchesName = sportName
        .toLowerCase()
        .includes(searchName.toLowerCase());

      const matchesSport = selectedSport
        ? sportName === selectedSport
        : true;

      const matchesStatus = selectedStatus
        ? booking.status === selectedStatus
        : true;

      const rawDate =
        booking.bookedAt || booking.createdAt;

      const bookingDate = rawDate
        ? new Date(rawDate)
        : null;

      const matchesFrom = fromDate
        ? bookingDate
          ? bookingDate >= new Date(`${fromDate}T00:00:00`)
          : false
        : true;

      const matchesTo = toDate
        ? bookingDate
          ? bookingDate <= new Date(`${toDate}T23:59:59`)
          : false
        : true;

      return (
        matchesName &&
        matchesSport &&
        matchesStatus &&
        matchesFrom &&
        matchesTo
      );
    });
  }, [
    history,
    searchName,
    selectedSport,
    selectedStatus,
    fromDate,
    toDate,
  ]);

  if (loading) {
    return (
      <DashboardLayout title="History">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 text-zinc-400">
          Loading history...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="History">
      <div className="space-y-8">

        {/* HEADER */}

        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
              <History size={21} />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white">
                Booking History
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                View your previous sports activity and returns.
              </p>
            </div>
          </div>
        </div>

        {/* FILTERS */}

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
          <div className="mb-4 flex items-center gap-2">
            <Search size={17} className="text-zinc-500" />

            <h3 className="text-sm font-semibold text-white">
              Filter history
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5">

            <input
              value={searchName}
              onChange={(event) =>
                setSearchName(event.target.value)
              }
              placeholder="Search sport..."
              className="h-10 rounded-xl border border-zinc-800 bg-zinc-950 px-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-emerald-500/50"
            />

            <select
              value={selectedSport}
              onChange={(event) =>
                setSelectedSport(event.target.value)
              }
              className="h-10 rounded-xl border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-300 outline-none focus:border-emerald-500/50"
            >
              <option value="">All sports</option>

              {sports.map((sport) => (
                <option key={sport} value={sport}>
                  {sport}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(event) =>
                setSelectedStatus(event.target.value)
              }
              className="h-10 rounded-xl border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-300 outline-none focus:border-emerald-500/50"
            >
              <option value="">All statuses</option>

              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={fromDate}
              onChange={(event) =>
                setFromDate(event.target.value)
              }
              className="h-10 rounded-xl border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-300 outline-none focus:border-emerald-500/50"
            />

            <input
              type="date"
              value={toDate}
              onChange={(event) =>
                setToDate(event.target.value)
              }
              className="h-10 rounded-xl border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-300 outline-none focus:border-emerald-500/50"
            />

          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-zinc-500">
              Showing {filteredBookings.length} of{" "}
              {history.length} bookings
            </p>

            <button
              type="button"
              onClick={() => {
                setSearchName("");
                setSelectedSport("");
                setSelectedStatus("");
                setFromDate("");
                setToDate("");
              }}
              className="text-xs text-zinc-500 transition hover:text-emerald-400"
            >
              Clear filters
            </button>
          </div>
        </section>

        {/* BOOKINGS */}

        {filteredBookings.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-10 text-center">
            <History
              size={30}
              className="mx-auto text-zinc-700"
            />

            <p className="mt-3 text-sm text-zinc-500">
              No matching booking history found.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

            {filteredBookings.map((item) => {
              const status = item.status?.toLowerCase();

              const isActive = status === "active";
              const isPending =
                status === "return_requested" ||
                status === "return pending";
              const isCompleted =
                status === "completed" ||
                status === "returned";

              return (
                <div
                  key={item.id}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5"
                >
                  <div className="flex items-start justify-between gap-4">

                    <div>
                      <p className="text-xs uppercase tracking-[0.15em] text-zinc-600">
                        Booking #{item.id}
                      </p>

                      <h3 className="mt-2 text-xl font-bold text-white">
                        {item.sport?.name || "Unknown Sport"}
                      </h3>
                    </div>

                    <span className="rounded-full border border-zinc-700 bg-zinc-950 px-3 py-1 text-xs font-medium text-zinc-300">
                      {item.status}
                    </span>
                  </div>

                  <div className="mt-5 space-y-3 text-sm">

                    <p>
                      <span className="text-zinc-500">
                        Type:{" "}
                      </span>

                      <span className="text-zinc-200">
                        {item.gearOnly
                          ? "Gear Only"
                          : item.bookingType || "Slot + Gear"}
                      </span>
                    </p>

                    {item.slot && (
                      <p>
                        <span className="text-zinc-500">
                          Slot:{" "}
                        </span>

                        <span className="text-emerald-400">
                          {new Date(
                            item.slot.startTime || ""
                          ).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          –{" "}
                          {new Date(
                            item.slot.endTime || ""
                          ).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </p>
                    )}

                    {(item.bookedAt || item.createdAt) && (
                      <p>
                        <span className="text-zinc-500">
                          Booked:{" "}
                        </span>

                        <span className="text-zinc-300">
                          {new Date(
                            item.bookedAt || item.createdAt || ""
                          ).toLocaleString()}
                        </span>
                      </p>
                    )}

                    {item.returnedAt && (
                      <p>
                        <span className="text-zinc-500">
                          Returned:{" "}
                        </span>

                        <span className="text-emerald-400">
                          {new Date(
                            item.returnedAt
                          ).toLocaleString()}
                        </span>
                      </p>
                    )}

                  </div>

                  {isActive && (
                    <button
                      type="button"
                      onClick={() =>
                        handleReturnRequest(item.id)
                      }
                      className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-emerald-400"
                    >
                      <RotateCcw size={15} />
                      Request Return
                    </button>
                  )}

                  {isPending && (
                    <div className="mt-6 rounded-xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-400">
                      Waiting for staff verification.
                    </div>
                  )}

                  {isCompleted && (
                    <div className="mt-6 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
                      Booking completed.
                    </div>
                  )}
                </div>
              );
            })}

          </div>
        )}
      </div>
    </DashboardLayout>
  );
}