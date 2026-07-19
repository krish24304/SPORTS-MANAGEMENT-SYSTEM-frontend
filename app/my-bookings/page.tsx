"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";

export default function BookingsPage() {

  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

      const data = await response.json();

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

        throw new Error("Cancel failed");

      }

      alert("Booking Cancelled");

      fetchBookings();

    } catch (error) {

      console.log(error);

      alert("Cancel Failed");

    }

  };

  // RETURN GEAR

  const returnGear = async (
    bookingId: number
  ) => {

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

      alert("Return Request Sent");

      fetchBookings();

    } catch (error) {

      console.log(error);

      alert("Return Failed");

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

        <h1 className="text-4xl md:text-5xl font-black mb-12">

          My Bookings

        </h1>

        {bookings.length === 0 ? (

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-10 text-zinc-400 text-xl">

            No bookings found

          </div>

        ) : (

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {bookings.map((booking) => (

              <div
                key={booking.id}
                className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8"
              >

                <div className="flex justify-between items-start mb-6">

                  <div>

                    <h2 className="text-4xl font-black mb-2">

                      {booking.sport?.name}

                    </h2>

                    <p className="text-zinc-400">

                      Booking ID #{booking.id}

                    </p>

                  </div>

                  <span className="bg-green-500/20 text-green-400 px-4 py-2 rounded-full font-bold">

                    {booking.status}

                  </span>

                </div>

                <div className="space-y-4 text-lg">

                  <p>

                    <span className="text-zinc-400">
                      Slot:
                    </span>

                    {" "}

                    {booking.slot?.startTime}

                    {" - "}

                    {booking.slot?.endTime}

                  </p>

                  <p>

                    <span className="text-zinc-400">
                      Type:
                    </span>

                    {" "}

                    {booking.bookingType}

                  </p>

                  <p>

  <span className="text-zinc-400">
    Booked:
  </span>

  {" "}

  {new Date(
    booking.bookedAt
  ).toLocaleString()}

</p>

{booking.returnedAt && (

  <p>

    <span className="text-zinc-400">
      Returned:
    </span>

    {" "}

    {new Date(
      booking.returnedAt
    ).toLocaleString()}

  </p>

)}

                </div>

                {booking.status === "active" && (

                  <div className="flex gap-4 mt-8">

                    <button
                      onClick={() =>
                        cancelBooking(booking.id)
                      }
                      className="bg-red-500 hover:bg-red-600 transition px-8 py-4 rounded-2xl text-lg font-bold"
                    >

                      Cancel Booking

                    </button>

                    <button
                      onClick={() =>
                        returnGear(booking.id)
                      }
                      className="bg-yellow-500 hover:bg-yellow-600 transition px-8 py-4 rounded-2xl text-lg font-bold text-black"
                    >

                      Request Return

                    </button>

                  </div>

                )}

                {booking.status === "return_requested" && (

                  <div className="mt-8 bg-yellow-500/20 text-yellow-400 px-6 py-4 rounded-2xl font-bold">

                    Waiting For Staff Verification

                  </div>

                )}

                {booking.status === "completed" && (

                  <div className="mt-8 bg-green-500/20 text-green-400 px-6 py-4 rounded-2xl font-bold">

                    Booking Completed
                    
                  </div>

                )}
{booking.returnedAt && (

  <div className="mt-3 text-green-400">

    Returned At:

    {" "}

    {new Date(
      booking.returnedAt
    ).toLocaleString()}

  </div>

)}
              </div>

            ))}

          </div>

        )}

      </div>

    </main>

  );

}