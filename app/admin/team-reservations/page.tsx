"use client";

import { useEffect, useState } from "react";

export default function TeamReservationsPage() {
  const [purpose, setPurpose] =
  useState("");
  const [sports, setSports] =
    useState<any[]>([]);

  const [reservations, setReservations] =
    useState<any[]>([]);

  const [teamName, setTeamName] =
    useState("");

  const [sportId, setSportId] =
    useState("");

  const [startTime, setStartTime] =
    useState("");

  const [endTime, setEndTime] =
    useState("");

  const fetchData = async () => {

    const sportsRes =
      await fetch(
        "http://localhost:5000/sports"
      );

    const sportsData =
      await sportsRes.json();

    setSports(sportsData);

    const reservationsRes =
      await fetch(
        "http://localhost:5000/team-reservations"
      );

    const reservationsData =
      await reservationsRes.json();

    setReservations(
      reservationsData
    );

  };

  useEffect(() => {

    fetchData();

  }, []);

  const createReservation =
    async () => {
      if (
      !teamName ||
      !sportId ||
      !startTime ||
      !endTime
    ) {
      alert("Fill all fields");
      return;
    }
      const user =
        JSON.parse(
          localStorage.getItem(
            "user"
          ) || "{}"
        );

      const response =
        await fetch(
          "http://localhost:5000/team-reservations",
          {

            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({

              teamName,
              purpose,
              
              sportId:
                Number(sportId),

              startTime,

              endTime,

              bookedById:
                user.id,

            }),

          }
        );

      if (response.ok) {

        alert(
          "Reservation Created"
        );

        setTeamName("");

        setSportId("");

        setStartTime("");

        setEndTime("");

        fetchData();

      }

    };

  const deleteReservation =
    async (id: number) => {

      await fetch(

        `http://localhost:5000/team-reservations/${id}`,

        {
          method: "DELETE",
        }

      );

      fetchData();

    };

  return (

    <main className="min-h-screen bg-black text-white p-10">

      <h1 className="text-5xl font-black mb-10">

        Team Reservations

      </h1>

      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 mb-10">

        <div className="grid md:grid-cols-2 gap-6">

          <input
            placeholder="Team Name"
            value={teamName}
            onChange={(e) =>
              setTeamName(
                e.target.value
              )
            }
            className="bg-zinc-800 rounded-2xl p-4"
          />
          <input
  placeholder="Purpose (Practice, Match, Tournament etc.)"
  value={purpose}
  onChange={(e) =>
    setPurpose(e.target.value)
  }
  className="bg-zinc-800 rounded-2xl p-4"
/>
          <select
            value={sportId}
            onChange={(e) =>
              setSportId(
                e.target.value
              )
            }
            className="bg-zinc-800 rounded-2xl p-4"
          >

            <option value="">
              Select Sport
            </option>

            {sports.map(
              (sport) => (

                <option
                  key={sport.id}
                  value={sport.id}
                >
                  {sport.name}
                </option>

              )
            )}

          </select>

          <div>
  <label className="block mb-2 font-bold">
    Start Date & Time
  </label>

  <input
    type="datetime-local"
    value={startTime}
    onChange={(e) =>
      setStartTime(e.target.value)
    }
    className="bg-zinc-800 rounded-2xl p-4 w-full"
  />
</div>

<div>
  <label className="block mb-2 font-bold">
    End Date & Time
  </label>

  <input
    type="datetime-local"
    value={endTime}
    onChange={(e) =>
      setEndTime(e.target.value)
    }
    className="bg-zinc-800 rounded-2xl p-4 w-full"
  />
</div>

        </div>

        <button
          onClick={
            createReservation
          }
          className="mt-6 bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-2xl font-bold"
        >

          Create Reservation

        </button>

      </div>

      <div className="space-y-4">

        {reservations.map(
          (reservation) => (

            <div
              key={reservation.id}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex justify-between"
            >

              <div>

                <h2 className="text-2xl font-black">

                  {
                    reservation.teamName
                  }

                </h2>

                <p>

                  {
                    reservation.sport
                      ?.name
                  }

                </p>

                <p>

                  {new Date(
                    reservation.startTime
                  ).toLocaleString()}

                </p>

                <p>

                  {new Date(
                    reservation.endTime
                  ).toLocaleString()}

                </p>

              </div>

              <button
                onClick={() =>
                  deleteReservation(
                    reservation.id
                  )
                }
                className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-xl"
              >

                Delete

              </button>

            </div>

          )
        )}

      </div>

    </main>

  );

}