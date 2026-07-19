"use client";
import { useState } from "react";
import SlotCard from "@/components/ui/SlotCard";
import { slots } from "@/constants/slots";
import DashboardLayout from "@/components/layout/DashboardLayout";
import DashboardCard from "@/components/ui/DashboardCard";
import StatsCard from "@/components/ui/StatsCard";
export default function StudentDashboard() {
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [booked, setBooked] = useState(false);
  const handleBooking = async () => {

  setLoading(true);

  await new Promise((resolve) =>
    setTimeout(resolve, 2000)
  );

  setLoading(false);
  setBooked(true);
};
{
  selectedSlot && !booked && (

    <button
      onClick={handleBooking}
      disabled={loading}
      className={`mt-6 px-8 py-4 rounded-xl font-semibold transition-all duration-300
      ${
        loading
          ? "bg-zinc-700 text-zinc-400 cursor-not-allowed"
          : "bg-white text-black hover:bg-gray-300"
      }`}
    >

      {
        loading
          ? "Processing Booking..."
          : "Confirm Booking"
      }

    </button>

  )
}
  return (
    
    <DashboardLayout title="Student Dashboard">

      <p className="text-gray-400 mb-12">
        Access sports availability, bookings, and passes.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <DashboardCard
          title="Sports Access"
          description="Check available sports and equipment."
        />

        <DashboardCard
          title="Slot Booking"
          description="Reserve training and activity slots."
        />

        <DashboardCard
          title="Swimming Pass"
          description="Purchase and manage swimming access passes."
        />

      </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

            <StatsCard
                title="Available Sports"
                value="12"
            />

            <StatsCard
                title="Booked Slots"
                value="3"
            />

            <StatsCard
                title="Swimming Pass"
                value="Active"
            />

            </div>
                    <div className="mb-10">

            <h2 className="text-3xl font-bold mb-6">
                Swimming Slot Booking
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {slots.map((slot) => (
                <SlotCard
                    key={slot.id}
                    time={slot.time}
                    available={slot.available}
                    selected={selectedSlot === slot.id}
                    onClick={() => setSelectedSlot(slot.id)}
                />
                ))}

            </div>

            </div>

            {
        booked && (
            <div className="mt-8 bg-green-500/10 border border-green-500 rounded-2xl p-6">

            <h2 className="text-2xl font-bold text-green-400 mb-2">
                Slot Selected
            </h2>

            <p className="text-gray-300">
                Your swimming slot has been selected successfully.
            </p>

            </div>
        )
        }
    </DashboardLayout>
    
  );
}