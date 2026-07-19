"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";

export default function StaffDashboard() {

  const [sports, setSports] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [maxCapacity, setMaxCapacity] =
  useState(10);
  const [selectedSport, setSelectedSport] =
    useState<number | null>(null);

  const [showGearModal, setShowGearModal] =
    useState(false);

  const [showSlotModal, setShowSlotModal] =
    useState(false);

  const [gearName, setGearName] =
    useState("");

  const [gearQuantity, setGearQuantity] =
    useState(1);

  const [slotStart, setSlotStart] =
    useState("");

  const [slotEnd, setSlotEnd] =
    useState("");

  const [slotType, setSlotType] =
    useState("Student");

  const [teamName, setTeamName] =
    useState("");

  const [reservedCourts, setReservedCourts] =
    useState(1);
  // FETCH DATA

  const fetchData = async () => {

    try {

      const sportsResponse = await fetch(
        "http://localhost:5000/sports"
      );

      const sportsData =
  await sportsResponse.json();

if (Array.isArray(sportsData)) {

  setSports(sportsData);

} else {

  console.log(
    "Invalid sports response:",
    sportsData
  );

  setSports([]);

} 

      const bookingResponse = await fetch(
        "http://localhost:5000/all-bookings"
      );

      const bookingData =
        await bookingResponse.json();

      setBookings(bookingData);

    } catch (error) {

      console.log(error);

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {

    fetchData();

  }, []);

  // ADD GEAR

  const handleAddGear = async () => {

    if (!selectedSport) {

      alert("Select sport");

      return;

    }

    try {

      await fetch(
        "http://localhost:5000/gears",
        {

          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({

            name: gearName,

            totalQuantity: gearQuantity,

            availableQuantity: gearQuantity,

            damagedQuantity: 0,

            sportId: selectedSport,

          }),

        }
      );

      alert("Gear Added");

      setShowGearModal(false);

      setGearName("");

      setGearQuantity(1);

      fetchData();

    } catch (error) {

      console.log(error);

    }

  };

  // ADD SLOT

  const handleAddSlot = async () => {

    if (!selectedSport) {

      alert("Select sport");

      return;

    }

    try {

      await fetch(
        "http://localhost:5000/slots",
        {

          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            name: teamName,
            startTime: new Date(slotStart).toISOString(),
            endTime: new Date(slotEnd).toISOString(),

            available: true,

            type: slotType,

            sportId: selectedSport,
            maxCapacity,
            reservedCourts,

          }),

        }
      );

      alert("Slot Added");

      setShowSlotModal(false);

      setSlotStart("");

      setSlotEnd("");

      setReservedCourts(1);

      fetchData();

    } catch (error) {

      console.log(error);

    }

  };

  // TOGGLE MAINTENANCE
  const toggleMaintenance = async (
    sportId: number,
    currentStatus: boolean
  ) => {

    const message = !currentStatus
      ? prompt("Enter maintenance message") || ""
      : "";

    try {

      await fetch(
        `http://localhost:5000/sports-maintenance/${sportId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            maintenance: !currentStatus,
            maintenanceMessage: message,
          }),
        }
      );

      fetchData();

    } catch (error) {
      console.log(error);
    }
  };

  // CANCEL BOOKING

  const cancelBooking = async (
    bookingId: number
  ) => {

    try {

      await fetch(
        `http://localhost:5000/cancel-booking/${bookingId}`,
        {
          method: "PUT",
        }
      );

      alert("Booking Cancelled");

      fetchData();

    } catch (error) {

      console.log(error);

    }

  };

  // APPROVE RETURN

  const approveReturn = async (bookingId: number) => {

    try {

      await fetch(
        `http://localhost:5000/approve-return/${bookingId}`,
        {
          method: "PUT",
        }
      );

      alert("Return Approved");

    } catch (error) {

      console.log(error);

    }

  };

  // STATS

  const totalSports = sports.length;

  const totalBookings =
    bookings.length;

  const activeBookings =
    bookings.filter(
      (b) => b.status === "Active"
    ).length;

  const cancelledBookings =
    bookings.filter(
      (b) => b.status === "Cancelled"
    ).length;

  const totalGears = Array.isArray(sports)
  ? sports.reduce(
      (acc, sport) =>
        acc + (sport.gears?.length || 0),
      0
    )
  : 0;
  const recentBookings =  bookings.filter((booking) =>booking.status === "Active" || booking.status ===  "Return Pending");

const bookingHistory =  bookings.filter((booking) => booking.status === "Cancelled" || booking.status === "Returned"
  );

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

        {/* HEADER */}

        <div className="mb-12">

          <h1 className="text-6xtext-4xl md:text-5xl font-black mb-4">
            Staff Dashboard
          </h1>

          <p className="text-zinc-400 text-xl">
            Manage sports, gears, slots and bookings
          </p>

        </div>

        {/* STATS */}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6 mb-14">

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">

            <p className="text-zinc-400 mb-3">
              SPORTS
            </p>

            <h2 className="text-5xl font-black">
              {totalSports}
            </h2>

          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">

            <p className="text-zinc-400 mb-3">
              BOOKINGS
            </p>

            <h2 className="text-5xl font-black">
              {totalBookings}
            </h2>

          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">

            <p className="text-zinc-400 mb-3">
              ACTIVE
            </p>

            <h2 className="text-5xl font-black text-green-400">
              {activeBookings}
            </h2>

          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">

            <p className="text-zinc-400 mb-3">
              CANCELLED
            </p>

            <h2 className="text-5xl font-black text-red-400">
              {cancelledBookings}
            </h2>

          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">

            <p className="text-zinc-400 mb-3">
              GEARS
            </p>

            <h2 className="text-5xl font-black">
              {totalGears}
            </h2>

          </div>

        </div>

        {/* SPORTS */}

        <section className="mb-16">

          <h2 className="text-4xl font-black mb-8">
            Sports Management
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

            {Array.isArray(sports) && sports.map((sport) => (

              <div
                key={sport.id}
                className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8"
              >

                <h3 className="text-3xl font-black mb-6">
                  {sport.name}
                </h3>

                <div className="space-y-3 mb-8">

                  <p>
                    Courts:
                    <span className="ml-2 font-bold">
                      {sport.availableCourts}/{sport.totalCourts}
                    </span>
                  </p>

                  <p>
                    Gears:
                    <span className="ml-2 font-bold">
                      {sport.gears.length}
                    </span>
                  </p>

                  <p>
                    Slots:
                    <span className="ml-2 font-bold">
                      {sport.slots.length}
                    </span>
                  </p>

                </div>

                <div className="grid grid-cols-1 gap-4">

                  <button
                    onClick={() => {

                      setSelectedSport(sport.id);

                      setShowGearModal(true);

                    }}
                    className="bg-green-500 hover:bg-green-600 transition py-3 rounded-2xl font-bold"
                  >

                    Add Gear

                  </button>

                  <button
                    onClick={() => {

                      setSelectedSport(sport.id);

                      setShowSlotModal(true);

                    }}
                    className="bg-blue-500 hover:bg-blue-600 transition py-3 rounded-2xl font-bold"
                  >

                    Add Slot

                  </button>

                  <button
                    onClick={() =>
                      toggleMaintenance(
                        sport.id,
                        sport.maintenance
                      )
                    }
                    className={`py-3 rounded-2xl font-bold transition ${
                      sport.maintenance
                        ? "bg-red-500 hover:bg-red-600"
                        : "bg-yellow-500 hover:bg-yellow-600 text-black"
                    }`}
                  >

                    {sport.maintenance
                      ? "Disable Maintenance"
                      : "Enable Maintenance"}

                  </button>

                </div>

              </div>

            ))}

          </div>

        </section>

        {/* BOOKINGS */}

<section>

  <h2 className="text-4xl font-black mb-8">
    Recent Bookings
  </h2>

  <div className="space-y-5">

    {recentBookings
      .sort(
        (a, b) => b.id - a.id
      )
      .map((booking) => (

        <div
          key={booking.id}
          className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 flex justify-between items-center hover:border-zinc-600 transition-all duration-300"
        >

          <div>

            <h3 className="text-2xl font-bold mb-2">

              {booking.sport?.name}

            </h3>

            <p className="text-zinc-400">

              Booking ID #{booking.id}

            </p>

          </div>

          <div className="flex items-center gap-4 min-w-[320px] justify-end flex-wrap">

            {/* STATUS */}

            <span
              className={`px-5 py-3 rounded-full font-bold transition-all duration-300 ${
                booking.status === "Active"
                  ? "bg-green-500/20 text-green-400"
                  : booking.status === "Cancelled"
                  ? "bg-red-500/20 text-red-400"
                  : booking.status === "Return Pending"
                  ? "bg-yellow-500/20 text-yellow-400"
                  : "bg-zinc-700 text-white"
              }`}
            >

              {booking.status}

            </span>

            {/* CANCEL BUTTON */}

            {booking.status === "Active" && (

              <button
                onClick={() =>
                  cancelBooking(booking.id)
                }
                className="bg-red-500 hover:bg-red-600 hover:scale-105 transition-all duration-300 px-5 py-3 rounded-2xl font-bold"
              >

                Cancel

              </button>

            )}

            {/* APPROVE RETURN */}

            {booking.status === "Return Pending" && (

              <button
                onClick={async () => {

                  await approveReturn(
                    booking.id
                  );

                  fetchData();

                }}
                className="bg-green-500 hover:bg-green-600 hover:scale-105 transition-all duration-300 px-5 py-3 rounded-2xl font-bold"
              >

                Approve Return

              </button>

            )}

          </div>

        </div>

      ))}

  </div>

</section>
{/* BOOKING HISTORY */}

<section className="mt-20">

  <h2 className="text-4xl font-black mb-8">
    Booking History
  </h2>

  <div className="space-y-5">

    {bookingHistory.length === 0 ? (

      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-16 text-center">

  <h3 className="text-4xl font-black mb-4">
    No Booking History
  </h3>

  <p className="text-zinc-400 text-lg">
    Completed and cancelled bookings
    will appear here.
  </p>

</div>

    ) : (

      bookingHistory
        .sort((a, b) => b.id - a.id)
        .map((booking) => (

          <div
            key={booking.id}
            className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 flex justify-between items-center opacity-80"
          >

            <div>

              <h3 className="text-2xl font-bold mb-2">

                {booking.sport?.name}

              </h3>

              <p className="text-zinc-400">

                Booking ID #{booking.id}

              </p>

            </div>

            <span
              className={`px-5 py-3 rounded-full font-bold ${
                booking.status === "Returned"
                  ? "bg-green-500/20 text-green-400"
                  : "bg-red-500/20 text-red-400"
              }`}
            >

              {booking.status}

            </span>

          </div>

        ))

    )}

  </div>

</section>
      </div>

      {/* ADD GEAR MODAL */}

      {showGearModal && (

        <div className="fixed inset-0 bg-black/70 overflow-y-auto z-50">

  <div className="min-h-screen flex justify-center items-start py-10">

    <div
      className="
      bg-zinc-900
      border border-zinc-800
      rounded-3xl
      p-8
      w-full
      max-w-md
      max-h-[90vh]
      overflow-y-auto
      "
    >

            <h2 className="text-3xl font-black mb-8">
              Add Gear
            </h2>

            <div className="space-y-5">

              <input
                type="text"
                placeholder="Gear Name"
                value={gearName}
                onChange={(e) =>
                  setGearName(e.target.value)
                }
                className="w-full bg-black border border-zinc-700 rounded-2xl px-5 py-4 outline-none"
              />

              <input
                type="number"
                placeholder="Quantity"
                value={gearQuantity}
                onChange={(e) =>
                  setGearQuantity(
                    Number(e.target.value)
                  )
                }
                className="w-full bg-black border border-zinc-700 rounded-2xl px-5 py-4 outline-none"
              />

            </div>

            <div className="flex gap-4 mt-8">

              <button
                onClick={handleAddGear}
                className="flex-1 bg-green-500 py-4 rounded-2xl font-black"
              >

                Add

              </button>

              <button
                onClick={() =>
                  setShowGearModal(false)
                }
                className="flex-1 bg-red-500 py-4 rounded-2xl font-black"
              >

                Cancel

              </button>

            </div>

          </div>

        </div>
        </div>
      )}

      {/* SLOT MODAL */}
      
      {showSlotModal && (
        
        <div className="fixed inset-0 bg-black/70 overflow-y-auto z-50">

  <div className="min-h-screen flex justify-center items-start py-10">

    <div
      className="
      bg-zinc-900
      border border-zinc-800
      rounded-3xl
      p-8
      w-full
      max-w-md
      max-h-[90vh]
      overflow-y-auto
      "
    >
            <h2 className="text-3xl font-black mb-8">
              Add Slot
            </h2>

            <div className="space-y-5">

              <div>
  <label className="block mb-2 font-bold">
    Start Date & Time
  </label>

  <input
    type="datetime-local"
    value={slotStart}
    onChange={(e) =>
      setSlotStart(e.target.value)
    }
    className="w-full bg-black border border-zinc-700 rounded-2xl px-5 py-4"
  />
</div>
              <input
  type="number"
  placeholder="Max Capacity"
  value={maxCapacity}
  onChange={(e) =>
    setMaxCapacity(
      Number(e.target.value)
    )
  }
  className="w-full bg-black border border-zinc-700 rounded-2xl px-5 py-4 outline-none"
/>
      <input
  type="number"
  placeholder="Reserved Courts"
  value={reservedCourts}
  min={1}
  onChange={(e) =>
    setReservedCourts(
      Number(e.target.value)
    )
  }
  className="w-full bg-black border border-zinc-700 rounded-2xl px-5 py-4 outline-none"
/>        
              <input
  type="text"
  placeholder="Slot Name (Example: Football Team Practice)"
  value={teamName}
  onChange={(e) =>
    setTeamName(e.target.value)
  }
  className="w-full bg-black border border-zinc-700 rounded-2xl px-5 py-4"
/>

<select
  value={slotType}
  onChange={(e) =>
    setSlotType(e.target.value)
  }
  className="w-full bg-black border border-zinc-700 rounded-2xl px-5 py-4 outline-none"
>
  <option value="Student">
    Student Slot
  </option>

  <option value="Team">
    Team Reserved Slot
  </option>
</select>

            </div>

            <div className="flex gap-4 mt-8">

              <button
                onClick={handleAddSlot}
                className="flex-1 bg-blue-500 py-4 rounded-2xl font-black"
              >

                Add Slot

              </button>

              <button
                onClick={() =>
                  setShowSlotModal(false)
                }
                className="flex-1 bg-red-500 py-4 rounded-2xl font-black"
              >

                Cancel

              </button>

            </div>

          </div>

        </div>
              </div>
      )}

    </main>

  );

}