"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";

export default function BookingsPage() {

  const [bookings, setBookings] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  const fetchBookings = async () => {

    try {

      const user = JSON.parse(
        localStorage.getItem("user") || "{}"
      );

      if (!user?.id) {

        setLoading(false);

        return;

      }

      const response = await fetch(
        `http://localhost:5000/bookings/${user.id}`
      );

      const data =
        await response.json();

      if (Array.isArray(data)) {

  setBookings(data);

} else {

  console.log(data);

  setBookings([]);

}

    } catch (error) {

      console.log(error);

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {

    fetchBookings();

  }, []);

  // CANCEL BOOKING

  const cancelBooking = async (
    bookingId: number
  ) => {

    try {

      const response = await fetch(

        `http://localhost:5000/cancel-booking/${bookingId}`,

        {
          method: "PUT",
        }

      );

      if (!response.ok) {

        throw new Error(
          "Cancel failed"
        );

      }

      alert("Booking Cancelled");

      fetchBookings();

    } catch (error) {

      console.log(error);

      alert("Cancel Failed");

    }

  };

  if (loading) {

    return (

      <main className="min-h-screen bg-black text-white">

        <Navbar />

        <div className="p-10 text-3xl">
          Loading...
        </div>

      </main>

    );

  }

  return (

    <main className="min-h-screen bg-black text-white">

      <Navbar />

      <div className="max-w-7xl mx-auto px-8 py-10">

        <h1 className="text-4xl md:text-6xl font-black mb-12">

          My Bookings

        </h1>

        {bookings.length === 0 ? (

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-10 text-zinc-400 text-xl">

            No bookings found

          </div>

        ) : (

          <div className="grid gap-8">

            {bookings.map((booking: any) => (

              <div
                key={booking.id}
                className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8"
              >

                {/* TOP */}

                <div className="flex justify-between items-start mb-6">

                  <div>

                    <h2 className="text-4xl font-black mb-2">

                      {booking.sport?.name}

                    </h2>

                    <p className="text-zinc-400">

                      Booking ID #{booking.id}

                    </p>

                  </div>

                  <div
                    className={`px-5 py-2 rounded-2xl font-bold ${
                      booking.status === "Active"
                        ? "bg-green-500 text-black"
                        : booking.status === "Return Pending"
                        ? "bg-yellow-500 text-black"
                        : booking.status === "Returned"
                        ? "bg-blue-500 text-black"
                        : "bg-zinc-700"
                    }`}
                  >

                    {booking.status}

                  </div>

                </div>

                {/* SLOT */}

                {booking.slot && (

                  <div className="mb-6">

                    <h3 className="text-xl font-black mb-3">

                      Slot Timing

                    </h3>

                    <div className="bg-black border border-zinc-800 rounded-2xl p-5">

                      <p className="text-lg">

                        {new Date(
                          booking.slot.startTime
                        ).toLocaleDateString()}

                      </p>

                      <p className="text-zinc-400 mt-2">

                        {new Date(
                          booking.slot.startTime
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}

                        {" - "}

                        {new Date(
                          booking.slot.endTime
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}

                      </p>

                    </div>

                  </div>

                )}

                {/* GEARS */}

                {Array.isArray(booking.gears) &&
                  booking.gears.length > 0 && (

                  <div className="mb-6">

                    <h3 className="text-xl font-black mb-3">

                      Issued Gears

                    </h3>

                    <div className="space-y-3">

                      {booking.gears.map(
                        (
                          gear: any,
                          index: number
                        ) => (

                          <div
                            key={index}
                            className="bg-black border border-zinc-800 rounded-2xl p-4 flex justify-between"
                          >

                            <span className="font-bold">

                              {gear.name || "Gear Name"}

                            </span>

                            <span className="text-zinc-400">

                              Qty:
                              {" "}
                              {gear.quantity || 0}

                            </span>

                          </div>

                        )
                      )}

                    </div>

                  </div>

                )}

                {/* TYPE */}

                <div className="flex gap-4 flex-wrap mb-6">

                  <div className="bg-black border border-zinc-800 px-5 py-3 rounded-2xl">

                    {booking.gearOnly
                      ? "Gear Only Booking"
                      : "Slot + Gear Booking"}

                  </div>

                </div>

                {/* BUTTONS */}

                <div className="flex flex-wrap gap-4">

                  {booking.status ===
                    "Active" && (

                    <button
                      onClick={() =>
                        cancelBooking(
                          booking.id
                        )
                      }
                      className="bg-red-500 hover:bg-red-600 transition px-8 py-4 rounded-2xl text-lg font-bold"
                    >

                      Cancel Booking

                    </button>

                  )}

                  {booking.status ===
                    "Return Pending" && (

                    <div className="bg-yellow-500/20 text-yellow-400 px-6 py-4 rounded-2xl font-bold">

                      Waiting For Staff Verification

                    </div>

                  )}

                  {booking.status ===
                    "Active" && (

                    <button
                      onClick={async () => {

                        try {

                          await fetch(
                            `http://localhost:5000/return-request/${booking.id}`,
                            {
                              method: "PUT",
                            }
                          );

                          fetchBookings();

                        } catch (error) {

                          console.log(error);

                        }

                      }}
                      className="bg-yellow-500 hover:bg-yellow-600 transition px-8 py-4 rounded-2xl text-lg font-bold text-black"
                    >

                      Return Gear

                    </button>

                  )}

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    </main>

  );

}