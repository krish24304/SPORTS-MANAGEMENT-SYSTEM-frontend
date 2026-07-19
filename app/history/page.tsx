"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";

export default function HistoryPage() {
  const [searchName, setSearchName] =
  useState("");

const [selectedSport, setSelectedSport] =
  useState("");

const [selectedStatus, setSelectedStatus] =
  useState("");

const [fromDate, setFromDate] =
  useState("");

const [toDate, setToDate] =
  useState("");
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {

    try {

      const user = JSON.parse(
        localStorage.getItem("user") || "{}"
      );

      if (!user?.id) 
        setHistory([]);
  setLoading(false);
        return;

      const response = await fetch(
        `http://localhost:5000/bookings/${user.id}`
      );

      const data = await response.json();

console.log(data);

if (Array.isArray(data)) {

  setHistory(data);

} else {

  console.log("History API Error:", data);

  setHistory([]);

}

    } catch (error) {

      console.log(error);

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {

    fetchHistory();

  }, []);

  // RETURN REQUEST

  const handleReturnRequest = async (
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

      fetchHistory();

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
  const filteredBookings =
  history.filter((booking) => {

    const matchesName =
      booking.user.name
        .toLowerCase()
        .includes(
          searchName.toLowerCase()
        );

    const matchesSport =
      selectedSport
        ? booking.sport.name === selectedSport
        : true;

    const matchesStatus =
      selectedStatus
        ? booking.status === selectedStatus
        : true;

    const bookingDate =
      new Date(booking.bookedAt);

    const matchesFrom =
      fromDate
        ? bookingDate >=
          new Date(fromDate)
        : true;

    const matchesTo =
      toDate
        ? bookingDate <=
          new Date(toDate)
        : true;

    return (
      matchesName &&
      matchesSport &&
      matchesStatus &&
      matchesFrom &&
      matchesTo
    );

  });
  return (

    <main className="min-h-screen bg-black text-white">

      <Navbar />

      <div className="max-w-7xl mx-auto px-8 py-10">

        <h1 className="text-7xl font-black mb-4">
          Booking History
        </h1>

        <p className="text-zinc-400 text-2xl mb-12">
          View all your sports activity and returns
        </p>

        {history.length === 0 ? (

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-12 text-zinc-400 text-2xl">

            No booking history found

          </div>

        ) : (

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {Array.isArray(history) &&
            history.map((item) => (

              <div
                key={item.id}
                className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8"
              >

                <div className="flex justify-between items-start mb-6">

                  <div>

                    <h2 className="text-4xl font-black mb-2">
                      {item.sport?.name}
                    </h2>

                    <p className="text-zinc-400">
                      Booking #{item.id}
                    </p>

                  </div>

                  <span
                    className={`px-4 py-2 rounded-full font-bold ${
                      item.status === "Active"
                        ? "bg-green-500/20 text-green-400"
                        : item.status === "Return Pending"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : item.status === "Returned"
                        ? "bg-blue-500/20 text-blue-400"
                        : "bg-zinc-700 text-white"
                    }`}
                  >
                    {item.status}
                  </span>

                </div>

                <div className="space-y-4 text-lg">

                  <p>

                    <span className="text-zinc-400">
                      Booking Type:
                    </span>

                    <span className="ml-2 font-bold">
                      {item.gearOnly
                        ? "Gear Only"
                        : "Slot + Gear"}
                    </span>

                  </p>

                  {item.slot && (

                    <p>

                      <span className="text-zinc-400">
                        Slot:
                      </span>

                      <span className="ml-2 font-bold text-green-400">

                        {new Date(
                          item.slot.startTime
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}

                        {" - "}

                        {new Date(
                          item.slot.endTime
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}

                      </span>

                    </p>

                  )}

                  <p>

                    <span className="text-zinc-400">
                      Created:
                    </span>

                    <span className="ml-2">
                      {new Date(
                        item.createdAt
                      ).toLocaleDateString()}
                    </span>

                  </p>

                </div>

                {item.status === "Active" && (

                  <button
                    onClick={() =>
                      handleReturnRequest(item.id)
                    }
                    className="mt-8 bg-red-500 hover:bg-red-600 transition px-8 py-4 rounded-2xl font-black text-lg"
                  >

                    Send Return Request

                  </button>

                )}

              </div>

            ))}

          </div>

        )}

      </div>

    </main>

  );

}