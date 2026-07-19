"use client";

import Navbar from "@/components/layout/Navbar";
import { useEffect, useState } from "react";

export default function ProfilePage() {

  const [user, setUser] = useState<any>(null);
  const [showSportModal, setShowSportModal] =
  useState(false);

const [sportName, setSportName] = useState("");
const [courts, setCourts] = useState(1);
const [hasSlotSystem, setHasSlotSystem] =
  useState(false);

const [slotDurationMinutes, setSlotDurationMinutes] =
  useState(30);
  const [slotCapacity, setSlotCapacity] =
  useState(1);
const handleAddSport = async () => {
  console.log({"Create button clicked": true});
  try {

    await fetch(
      "http://localhost:5000/sports",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          name: sportName,
          totalCourts: courts,
          availableCourts: courts,
          hasSlotSystem: true,
          slotDurationMinutes,
          hasDynamicBooking: true,
        }),
      }
    );

    alert("Sport Added");

    setShowSportModal(false);

    setSportName("");

    setCourts(1);

  } catch (error) {

    console.log(error);

  }

};

useEffect(() => {

  const storedUser =
    localStorage.getItem("user");

  if (storedUser) {

    setUser(JSON.parse(storedUser));

  }

}, []);

  return (

    <main className="min-h-screen bg-black text-white">

      <Navbar />
      
      <div className="max-w-7xl mx-auto px-8 py-10">

        <h1 className="text-5xl font-black mb-10">
          User Profile
        </h1>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 max-w-2xl">

          <div className="space-y-4">

            <div>

              <p className="text-zinc-400 text-sm">
                NAME
              </p>

              <h2 className="text-3xl font-black">
                {user?.name}
              </h2>

            </div>

            <div>

              <p className="text-zinc-400 text-sm">
                EMAIL
              </p>

              <h2 className="text-xl font-bold">
                {user?.email}
              </h2>

            </div>

            <div>

              <p className="text-zinc-400 text-sm">
                ROLE
              </p>

              <h2 className="text-xl font-bold capitalize">
                {user?.role}
              </h2>

            </div>

          </div>

          {/* ID CARD */}

          <div className="mt-10">

            <h2 className="text-3xl font-black mb-6">
              Uploaded ID Card
            </h2>

            {user?.idCardPhoto ? (

              <a
                href={`http://localhost:5000${user.idCardPhoto}`}
                target="_blank"
                className="bg-green-500 hover:bg-green-600 transition px-6 py-4 rounded-2xl font-bold inline-block"
              >

                View Uploaded ID

              </a>

            ) : (

              <p className="text-zinc-400">
                No ID uploaded
              </p>

            )}

          </div>

        </div>

      </div>

    </main>

  );
}