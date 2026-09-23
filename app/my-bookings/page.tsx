"use client";

import { useEffect, useState } from "react";
import {
  CalendarCheck,
  Clock3,
  RotateCcw,
  X,
  CheckCircle2,
} from "lucide-react";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { getUser } from "@/lib/auth";

type Booking = {
  id: number;
  status: string;
  bookingType?: string;
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

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      const user = getUser();

      if (!user?.id) {
        setBookings([]);
        return;
      }

      const response = await fetch(
        `http://localhost:5000/bookings/${user.id}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch bookings");
      }

      const data = await response.json();

      setBookings(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Bookings error:", error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const cancelBooking = async (bookingId: number) => {
    if (!confirm("Cancel this booking?")) return;

    try {
      const response = await fetch(
        `http://localhost:5000/cancel-booking/${bookingId}`,
        {
          method: "PUT",
        }
      );

      if (!response.ok) {
        throw new Error("Cancel failed");
      }

      alert("Booking cancelled.");
      fetchBookings();
    } catch (error) {
      console.error(error);
      alert("Could not cancel booking.");
    }
  };

  const returnGear = async (bookingId: number) => {
    try {
      const response = await fetch(
        `http://localhost:5000/return-request/${bookingId}`,
        {
          method: "PUT",
        }
      );

      if (!response.ok) {
        throw new Error("Return failed");
      }

      alert("Return request sent.");
      fetchBookings();
    } catch (error) {
      console.error(error);
      alert("Could not send return request.");
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="My Bookings">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 text-sm text-zinc-500">
          Loading bookings...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="My Bookings">
      <div className="space-y-7">

        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
              <CalendarCheck size={21} />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white">
                My Bookings
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Manage your active sports bookings.
              </p>
            </div>
          </div>
        </div>

        {bookings.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-10 text-center">
            <CalendarCheck
              size={32}
              className="mx-auto text-zinc-700"
            />

            <p className="mt-3 text-sm text-zinc-500">
              You don't have any bookings yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {bookings.map((booking) => {
              const status =
                booking.status?.toLowerCase();

              return (
                <div
                  key={booking.id}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.15em] text-zinc-600">
                        Booking #{booking.id}
                      </p>

                      <h3 className="mt-2 text-xl font-bold text-white">
                        {booking.sport?.name ||
                          "Unknown Sport"}
                      </h3>
                    </div>

                    <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
                      {booking.status}
                    </span>
                  </div>

                  <div className="mt-5 space-y-3 text-sm">
                    {booking.slot && (
                      <div className="flex items-center gap-2 text-zinc-400">
                        <Clock3 size={15} />

                        <span>
                          {new Date(
                            booking.slot.startTime || ""
                          ).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          –{" "}
                          {new Date(
                            booking.slot.endTime || ""
                          ).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    )}

                    <p>
                      <span className="text-zinc-500">
                        Type:{" "}
                      </span>

                      <span className="text-zinc-200">
                        {booking.bookingType ||
                          "Slot + Gear"}
                      </span>
                    </p>

                    {booking.bookedAt && (
                      <p>
                        <span className="text-zinc-500">
                          Booked:{" "}
                        </span>

                        <span className="text-zinc-300">
                          {new Date(
                            booking.bookedAt
                          ).toLocaleString()}
                        </span>
                      </p>
                    )}

                    {booking.returnedAt && (
                      <p>
                        <span className="text-zinc-500">
                          Returned:{" "}
                        </span>

                        <span className="text-emerald-400">
                          {new Date(
                            booking.returnedAt
                          ).toLocaleString()}
                        </span>
                      </p>
                    )}
                  </div>

                  {status === "active" && (
                    <div className="mt-6 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          cancelBooking(booking.id)
                        }
                        className="inline-flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-500/20"
                      >
                        <X size={15} />
                        Cancel
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          returnGear(booking.id)
                        }
                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-emerald-400"
                      >
                        <RotateCcw size={15} />
                        Request Return
                      </button>
                    </div>
                  )}

                  {status === "return_requested" && (
                    <div className="mt-6 rounded-xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-400">
                      Waiting for staff verification.
                    </div>
                  )}

                  {status === "completed" && (
                    <div className="mt-6 flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
                      <CheckCircle2 size={16} />
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