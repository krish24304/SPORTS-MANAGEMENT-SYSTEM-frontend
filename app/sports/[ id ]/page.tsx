"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";

interface Slot {
  id: number;
  startTime: string;
  endTime: string;
  slotType: string;
  isBooked: boolean;
  bookedById?: number;
  bookedBy?: { id: number; name: string };
  isTeamReserved: boolean;
}

interface Gear {
  id: number;
  name: string;
  description?: string;
  totalQuantity: number;
  availableQuantity: number;
  damagedQuantity: number;
}

interface Sport {
  id: number;
  name: string;
  hasSlotSystem: boolean;
  slotDurationMinutes: number;
  totalCourts: number;
  availableCourts: number;
  maintenance: boolean;
  maintenanceMessage?: string;
  gears: Gear[];
  slots: Slot[];
}

export default function SportDetailsPage() {
  const [sport, setSport] = useState<Sport | null>(null);
  const [loading, setLoading] =
    useState(true);

  const [selectedGear, setSelectedGear] =
    useState<{
      [key: number]: number;
    }>({});

  const [bookingLoading, setBookingLoading] =
    useState(false);

  const [activeBooking, setActiveBooking] =
    useState<any>(null);

  const [bookingHistory, setBookingHistory] =
    useState<any[]>([]);

  const [selectedDuration, setSelectedDuration] =
    useState(1);

  /* FETCH SPORT */

  const fetchSport = async () => {
    try {
      const currentUrl =
        window.location.pathname;

      const id =
        currentUrl.split("/").pop();

      const response = await fetch(
        `http://localhost:5000/sports/${id}`
      );

      const data =
        await response.json();

      if (response.ok) {
        setSport(data);
      } else {
        setSport(null);
      }
    } catch (error) {
      console.log(error);
      setSport(null);
    }
  };

  /* FETCH BOOKINGS */

  const fetchBookings = async () => {
    try {
      const user = JSON.parse(
        localStorage.getItem("user") || "{}"
      );

      if (!user?.id) return;

      const response = await fetch(
        `http://localhost:5000/users/${user.id}/bookings`
      );

      const data =
        await response.json();

      if (!Array.isArray(data)) return;

      setBookingHistory(data);

      const active = data.find(
        (item: any) =>
          item.status === "Active" ||
          item.status ===
            "Return Pending"
      );

      setActiveBooking(active || null);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      await Promise.all([
        fetchSport(),
        fetchBookings(),
      ]);

      setLoading(false);
    };

    loadData();
  }, []);

  /* GEAR CONTROLS */

  const increaseQuantity = (
    gearId: number,
    available: number
  ) => {
    setSelectedGear((prev) => {
      const current =
        prev[gearId] || 0;

      if (current >= available) {
        return prev;
      }

      return {
        ...prev,
        [gearId]: current + 1,
      };
    });
  };

  const decreaseQuantity = (
    gearId: number
  ) => {
    setSelectedGear((prev) => ({
      ...prev,
      [gearId]:
        prev[gearId] > 0
          ? prev[gearId] - 1
          : 0,
    }));
  };

  /* BOOKING */

  const handleBooking = async (slotId?: number) => {
  try {
    setBookingLoading(true);

    const user = JSON.parse(
      localStorage.getItem("user") || "{}"
    );

    if (!user?.id) {
      alert("Please login");
      return;
    }

    const gearsBooked = Object.entries(selectedGear)
      .filter(([_, quantity]) => Number(quantity) > 0)
      .map(([gearId, quantity]) => ({
        gearId: Number(gearId),
        quantity: Number(quantity),
      }));

    const endpoint = slotId
      ? "http://localhost:5000/bookings/slot"
      : "http://localhost:5000/bookings/gear";

    const payload = slotId
      ? {
          userId: user.id,
          sportId: sport?.id,
          slotId,
          gearsBooked,
          notes: "",
        }
      : {
          userId: user.id,
          sportId: sport?.id,
          gearsBooked,
          notes: "",
        };

    const response = await fetch(endpoint, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Booking failed");
      return;
    }

    alert("Booking successful");

    setSelectedGear({});

    await fetchSport();
    await fetchBookings();

  } catch (error) {
    console.log(error);
    alert("Booking failed");
  } finally {
    setBookingLoading(false);
  }
  
};

  /* CANCEL */

  const cancelBooking =
    async (bookingId: number) => {
      try {
        const response = await fetch(
          `http://localhost:5000/bookings/${bookingId}/cancel`,
          {
            method: "PUT",
          }
        );

        const data =
          await response.json();

        alert(
          data.message ||
            "Booking Cancelled"
        );

        await fetchSport();

        await fetchBookings();
      } catch (error) {
        console.log(error);
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

  if (!sport) {
    return (
      <main className="min-h-screen bg-black text-white">
        <Navbar />

        <div className="p-10 text-3xl text-red-400">
          Sport Not Found
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-8 py-10">
        {/* HEADER */}

        <div className="mb-12">
          <h1 className="text-5xl md:text-7xl font-black mb-8">
            {sport.name}
          </h1>
            {sport.maintenance && (

  <div className="bg-yellow-500/20 border border-yellow-500 rounded-2xl p-4 mb-6">

    <h2 className="font-bold text-yellow-400">
      ⚠ Maintenance Notice

    </h2>

    <p className="text-lg">

      {sport.maintenanceMessage}

    </p>

  </div>

)}
          <div className="grid md:grid-cols-4 gap-5">
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
              <p className="text-zinc-400 mb-2">
                TOTAL
              </p>

              <h2 className="text-5xl font-black">
                {sport.totalCourts}
              </h2>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
              <p className="text-zinc-400 mb-2">
                AVAILABLE
              </p>

              <h2 className="text-5xl font-black text-green-400">
                {
                  sport.availableCourts
                }
              </h2>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
              <p className="text-zinc-400 mb-2">
                STUDENT SLOTS
              </p>

              <h2 className="text-5xl font-black text-blue-400">
                {sport.slots?.filter(
                  (s: any) =>
                    s.slotType === "available"
                ).length || 0}
              </h2>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
              <p className="text-zinc-400 mb-2">
                TEAM SLOTS
              </p>

              <h2 className="text-5xl font-black text-yellow-400">
                {sport.slots?.filter(
                  (s: any) =>
                    s.slotType === "team_reserved"
                ).length || 0}
              </h2>
            </div>
          </div>
        </div>

        {/* ACTIVE BOOKING */}

        {activeBooking && (
          <div className="bg-green-500/10 border border-green-500 rounded-3xl p-8 mb-12">
            <div className="flex flex-wrap gap-6 justify-between items-center">
              <div>
                <p className="text-green-400 font-bold mb-2">
                  ACTIVE BOOKING
                </p>

                <h2 className="text-4xl font-black mb-2">
                  {
                    activeBooking
                      ?.sport?.name
                  }
                </h2>

                <p className="text-zinc-400">
                  Status:
                  {" "}
                  {
                    activeBooking.status
                  }
                </p>
              </div>

              <div className="flex gap-4 flex-wrap">
                {activeBooking.status ===
                  "Active" && (
                  <>
                    <button
                      onClick={() =>
                        cancelBooking(
                          activeBooking.id
                        )
                      }
                      className="bg-red-500 hover:bg-red-600 px-8 py-4 rounded-2xl font-black"
                    >
                      Cancel Booking
                    </button>             
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* GEARS */}

        <section className="mb-20">
          <div className="flex justify-between items-center mb-10 flex-wrap gap-5">
            <h2 className="text-5xl font-black">
              Sports Gears
            </h2>

            <button
              disabled={bookingLoading}
              onClick={() =>
                handleBooking()
              }
              className="bg-white text-black px-8 py-4 rounded-2xl font-black hover:scale-105 transition"
            >
              Book Only Gears
            </button>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
            {sport.gears?.map(
              (gear: any) => {
                const issued =
                  gear.totalQuantity -
                  gear.availableQuantity -
                  gear.damagedQuantity;

                return (
                  <div
                    key={gear.id}
                    className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 hover:border-zinc-600 transition"
                  >
                    <h3 className="text-4xl font-black mb-8">
                      {gear.name}
                    </h3>

                    <div className="space-y-3 text-lg">
                      <p>
                        Total:
                        {" "}
                        {
                          gear.totalQuantity
                        }
                      </p>

                      <p className="text-green-400">
                        Available:
                        {" "}
                        {
                          gear.availableQuantity
                        }
                      </p>

                      <p className="text-yellow-400">
                        Issued:
                        {" "}
                        {issued}
                      </p>

                      <p className="text-red-400">
                        Damaged:
                        {" "}
                        {
                          gear.damagedQuantity
                        }
                      </p>
                    </div>

                    <div className="flex items-center gap-5 mt-10">
                      <button
                        onClick={() =>
                          decreaseQuantity(
                            gear.id
                          )
                        }
                        className="w-14 h-14 rounded-2xl bg-red-500 text-3xl font-black"
                      >
                        -
                      </button>

                      <span className="text-5xl font-black">
                        {selectedGear[
                          gear.id
                        ] || 0}
                      </span>

                      <button
                        onClick={() =>
                          increaseQuantity(
                            gear.id,
                            gear.availableQuantity
                          )
                        }
                        className="w-14 h-14 rounded-2xl bg-green-500 text-3xl font-black"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </section>


      {/* AVAILABLE SLOTS */}

{sport.hasSlotSystem && (
  <section className="mb-20">

    <h2 className="text-5xl font-black mb-10">
      Available Slots
      
    </h2>
<p className="text-zinc-400 mt-2">
  Duration:
  {" "}
  {sport.slotDurationMinutes} mins
</p>
    <div className="grid md:grid-cols-2 gap-8">

      {sport.slots?.map((slot) => {

       const booked = slot.bookedById;

const reserved =
  slot.slotType === "team_reserved";
        return (
          <div
            key={slot.id}
            className={`rounded-3xl p-8 border ${
              reserved
                ? "border-yellow-500 bg-yellow-500/10"
                : booked
                ? "border-red-500 bg-red-500/10"
                : "border-zinc-800 bg-zinc-900"
            }`}
          >

            <h3 className="text-3xl font-black mb-4">

              {new Date(
                slot.startTime
              ).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}

              {" - "}

              {new Date(
                slot.endTime
              ).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}

            </h3>

           {reserved ? (

  <p className="text-yellow-300 font-bold">
    Reserved For Team
  </p>

) : booked ? (

  <p className="text-red-300 font-bold">
    Already Booked
  </p>

) : sport.maintenance ? (

  <div className="space-y-2">

    <p className="text-red-400 font-bold">
      Booking Disabled
    </p>

    <p className="text-sm text-zinc-400">
      {sport.maintenanceMessage}
    </p>

  </div>

) : (

  <button
onClick={()=> handleBooking(slot.id)}
disabled={sport.maintenance}
className={`

${sport.maintenance
? "bg-zinc-700 cursor-not-allowed"
: "bg-blue-600 hover:bg-blue-700"}

`}
>

{sport.maintenance
? "Under Maintenance"
: "Book Slot"}

</button>

)}
          </div>

        );

      })}

    </div>

  </section>
)}
        {/* HISTORY */}

        <section>
          <h2 className="text-5xl font-black mb-10">
            My Booking History
          </h2>

          <div className="space-y-6">
            {bookingHistory.map(
              (booking: any) => (
                <div
                  key={booking.id}
                  className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8"
                >
                  <div className="flex flex-wrap justify-between gap-6">
                    <div>
                      <h3 className="text-3xl font-black mb-2">
                        {
                          booking
                            ?.sport?.name
                        }
                      </h3>

                      <p className="text-zinc-400">
                        Booking ID #
                        {booking.id}
                      </p>
                    </div>

                    <div
                      className={`px-6 py-3 rounded-2xl font-black ${
                        booking.status ===
                        "Active"
                          ? "bg-green-500 text-black"
                          : booking.status ===
                            "Return Pending"
                          ? "bg-yellow-500 text-black"
                          : "bg-blue-500 text-black"
                      }`}
                    >
                      {booking.status}
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </section>
      </div>
    </main>
  );
}