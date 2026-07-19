"use client";
import { useState, useEffect } from "react";

export default function StaffSlotsPage() {
const [sports, setSports] =
  useState<any[]>([]);

const [
  selectedSport,
  setSelectedSport,
] = useState("");

const [
  slots,
  setSlots,
] = useState<any[]>([]);
useEffect(() => {

  fetch(
    "http://localhost:5000/sports"
  )
    .then((res) => res.json())
    .then((data) =>
      setSports(data)
    );

}, []);
useEffect(() => {

  if (!selectedSport) return;

  fetch(
    `http://localhost:5000/slots/${selectedSport}`
  )
    .then((res) => res.json())
    .then((data) =>
      setSlots(data)
    );

}, [selectedSport]);
  return (

    <main className="min-h-screen bg-black text-white p-10">

      <h1 className="text-5xl font-black mb-10">

        Slot Management

      </h1>
      
        <select

  value={selectedSport}

  onChange={(e) =>
    setSelectedSport(
      e.target.value
    )
  }

  className="
    bg-zinc-900
    border
    border-zinc-800
    rounded-2xl
    px-4
    py-3
    mb-8
  "

>

  <option value="">
    Select Sport
  </option>

  {sports.map((sport) => (

    <option
      key={sport.id}
      value={sport.id}
    >

      {sport.name}

    </option>

  ))}

</select>
<div className="space-y-4">

  {slots.map((slot:any) => (

    <div
      key={slot.id}
      className="
        bg-zinc-900
        border
        border-zinc-800
        rounded-3xl
        p-6
      "
    >
      <div className="flex justify-between items-center">

        <div>

          <p className="text-lg font-bold">

            {new Date(
              slot.startTime
            ).toLocaleString()}

          </p>

          <p className="text-zinc-400">

            End:

            {" "}

            {new Date(
              slot.endTime
            ).toLocaleString()}

          </p>

        </div>

        <div>

          <p>

            Type:

            {" "}

            {slot.slotType}

          </p>

          <p>

            Status:

            {" "}

            {slot.isActive
              ? "Active"
              : "Disabled"}

          </p>
                <div className="flex gap-3 mt-3">

  <button
    onClick={async () => {

      await fetch(
        `http://localhost:5000/slots/toggle/${slot.id}`,
        {
          method: "PUT",
        }
      );

      const response =
        await fetch(
          `http://localhost:5000/slots/${selectedSport}`
        );

      const data =
        await response.json();

      setSlots(data);

    }}
    className="
      bg-yellow-500
      text-black
      px-4
      py-2
      rounded-xl
      font-bold
    "
  >
    {slot.isActive
      ? "Disable"
      : "Enable"}
  </button>

  <button
    onClick={async () => {

      const confirmed =
        confirm(
          "Delete this slot?"
        );

      if (!confirmed) return;

      await fetch(
        `http://localhost:5000/slots/${slot.id}`,
        {
          method: "DELETE",
        }
      );

      const response =
        await fetch(
          `http://localhost:5000/slots/${selectedSport}`
        );

      const data =
        await response.json();

      setSlots(data);

    }}
    className="
      bg-red-500
      hover:bg-red-600
      text-white
      px-4
      py-2
      rounded-xl
      font-bold
    "
  >
    Delete
  </button>

</div>


        </div>

      </div>

    </div>

  ))}

</div>
    </main>

  );

}