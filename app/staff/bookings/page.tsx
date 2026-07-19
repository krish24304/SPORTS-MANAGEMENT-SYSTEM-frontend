"use client";

import { useEffect, useState } from "react";

export default function StaffBookingsPage() {

  const [bookings, setBookings] =
    useState<any[]>([]);
    const [
  returnRequests,
  setReturnRequests,
] = useState<any[]>([]);
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

const [sports, setSports] =
  useState<any[]>([]);
  const [
  selectedBooking,
  setSelectedBooking,
] = useState<any>(null);
const [
  studentHistory,
  setStudentHistory,
] = useState<any>(null);
const fetchStudentHistory =
  async (userId: number) => {

    try {

      const response =
        await fetch(
          `http://localhost:5000/students/${userId}/history`
        );

      const data =
        await response.json();

      setStudentHistory(data);

    } catch (error) {

      console.log(error);

    }

  };
const fetchBookings = async () => {

  try {

    const response =
      await fetch(
        "http://localhost:5000/bookings/active"
      );

    const data =
      await response.json();

    setBookings(data);

    const pendingReturnsResponse =
  await fetch(
    "http://localhost:5000/returns/pending"
  );

const pendingReturns =
  await pendingReturnsResponse.json();

setReturnRequests(
  pendingReturns
);

  } catch (error) {

    console.log(error);

  }

};

const approveReturn = async (bookingId: number) => {
  try {
    const response = await fetch(
  `http://localhost:5000/approve-return/${bookingId}`,
  {
    method: "PUT",
  }
);

    if (!response.ok) {
      throw new Error("Failed to approve return");
    }

    await fetchBookings();
  } catch (error) {
    console.log(error);
  }
};

  useEffect(() => {

  fetchBookings();

  fetch(
    "http://localhost:5000/sports"
  )
    .then((res) => res.json())
    .then((data) => setSports(data));

}, []);
 
 const filteredBookings =
  bookings.filter((booking) => {

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
    
    <main className="min-h-screen bg-black text-white p-10">
        
      <h1 className="text-5xl font-black mb-10">
        Current Bookings
      </h1>
      {returnRequests.length > 0 && (

  <div className="mb-10">

    <h2 className="text-3xl font-black mb-5 text-yellow-400">

      Return Requests

    </h2>

    <div className="space-y-4">

      {returnRequests.map(
        (booking) => (

          <div
            key={booking.id}
            className="
              bg-zinc-900
              border
              border-yellow-500
              rounded-3xl
              p-6
              flex
              justify-between
              items-center
            "
          >

            <div>

              <h3 className="text-xl font-bold">

                {booking.user.name}

              </h3>

              <p>

                {booking.sport.name}

              </p>

            </div>

            <button

              onClick={() =>
                approveReturn(
                  booking.id
                )
              }

              className="
                bg-green-500
                px-5
                py-3
                rounded-2xl
                font-bold
              "
            >

              Approve Return

            </button>

          </div>

        )
      )}

    </div>

  </div>

)}
        <div className="grid md:grid-cols-5 gap-4 mb-8">

  <input
    placeholder="Search Student"
    value={searchName}
    onChange={(e) =>
      setSearchName(e.target.value)
    }
    className="bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3"
  />

  <select
    value={selectedSport}
    onChange={(e) =>
      setSelectedSport(e.target.value)
    }
    className="bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3"
  >

    <option value="">
      All Sports
    </option>

    {sports.map((sport) => (

      <option
        key={sport.id}
        value={sport.name}
      >
        {sport.name}
      </option>

    ))}

  </select>

  <select
    value={selectedStatus}
    onChange={(e) =>
      setSelectedStatus(e.target.value)
    }
    className="bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3"
  >

    <option value="">
      All Status
    </option>

    <option value="active">
      Active
    </option>

    <option value="cancelled">
  Cancelled
</option>

<option value="completed">
  Completed
</option>

<option value="return_requested">
  Return Requested
</option>

  </select>

  <input
    type="date"
    value={fromDate}
    onChange={(e) =>
      setFromDate(e.target.value)
    }
    className="bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3"
  />

  <input
    type="date"
    value={toDate}
    onChange={(e) =>
      setToDate(e.target.value)
    }
    className="bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3"
  />

</div>
      <div className="grid md:grid-cols-2 gap-8">

  {/* LEFT SIDE - BOOKINGS LIST */}

  <div className="space-y-4">

    {filteredBookings.map((booking) => (

      <div
        key={booking.id}
        onClick={() =>
          setSelectedBooking(booking)
        }
        className="
          bg-zinc-900
          border border-zinc-800
          rounded-2xl
          p-4
          cursor-pointer
          hover:border-blue-500
          transition
        "
      >

        <div className="flex justify-between">

          <div>

            <h2 className="text-xl font-black">
              {booking.user.name}
            </h2>

            <p className="text-zinc-400">
              {booking.sport.name}
            </p>

            <p className="text-sm text-zinc-500">
              {new Date(
                booking.bookedAt
              ).toLocaleDateString()}
            </p>

          </div>

          <div className="text-right">

            {booking.gearsBooked?.length ? (

              <p className="text-green-400">
                Gear Booking
              </p>

            ) : (

              <p className="text-blue-400">
                Slot Booking
              </p>

            )}

          </div>

        </div>

      </div>

    ))}

  </div>

  {/* RIGHT SIDE - DETAILS */}

  <div>

    {selectedBooking ? (

      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">

        <h2 className="text-3xl font-black mb-6">
          Booking Details
        </h2>

        <div className="space-y-3">

          <p>
            <span className="font-bold">
              Name:
            </span>
            {" "}
            {selectedBooking.user.name}
          </p>

          <p>
            <span className="font-bold">
              Email:
            </span>
            {" "}
            {selectedBooking.user.email}
          </p>

          <p>
            <span className="font-bold">
              Role:
            </span>
            {" "}
            {selectedBooking.user.role}
          </p>
            <button
  onClick={() =>
    fetchStudentHistory(
      selectedBooking.user.id
    )
  }
  className="
    mt-4
    bg-blue-500
    hover:bg-blue-600
    px-5
    py-3
    rounded-2xl
    font-bold
  "
>
  View Student History
</button>
          <p>
            <span className="font-bold">
              Sport:
            </span>
            {" "}
            {selectedBooking.sport.name}
          </p>

          <p>
            <span className="font-bold">
              Booking Type:
            </span>
            {" "}
            {selectedBooking.bookingType}
          </p>

          <p>
            <span className="font-bold">
              Status:
            </span>
            {" "}
            {selectedBooking.status}
          </p>

          <p>
            <span className="font-bold">
              Booked On:
            </span>
            {" "}
            {new Date(
              selectedBooking.bookedAt
            ).toLocaleString()}
          </p>

          {selectedBooking.slot && (

            <p>

              <span className="font-bold">
                Slot:
              </span>

              {" "}

              {new Date(
                selectedBooking.slot.startTime
              ).toLocaleTimeString()}

              {" - "}

              {new Date(
                selectedBooking.slot.endTime
              ).toLocaleTimeString()}

            </p>

          )}

        </div>
          {studentHistory && (

  <div
    className="
      mt-8
      bg-zinc-950
      border border-zinc-800
      rounded-3xl
      p-8
    "
  >

    <h2 className="text-3xl font-black mb-6">

      Student History

    </h2>

    <p className="mb-4">

      Total Bookings:

      {" "}

      {studentHistory.bookings.length}

    </p>

    <div className="space-y-3">

      {studentHistory.bookings.map(
        (booking: any) => (

          <div
            key={booking.id}
            className="
              border border-zinc-800
              rounded-2xl
              p-4
            "
          >

            <p>

              {booking.sport.name}

            </p>

            <p className="text-zinc-400">

              {booking.status}

            </p>

          </div>

        )
      )}

    </div>

  </div>

)}

        {selectedBooking.gearsBooked?.length > 0 && (

          <div className="mt-6">

            <p className="font-bold text-lg mb-3">
              Booked Gears
            </p>

            <div className="space-y-2">

              {selectedBooking.gearsBooked.map(
                (gear:any) => (

                  <div
                    key={gear.gearId}
                    className="
                      bg-black
                      border border-zinc-800
                      rounded-xl
                      p-3
                    "
                  >

                    Gear ID:
                    {" "}
                    {gear.gearId}

                    {" × "}

                    {gear.quantity}

                  </div>

                )
              )}

            </div>

          </div>

        )}

        {selectedBooking.user.idCardPhoto && (

          <div className="mt-6">

            <p className="font-bold text-lg mb-3">
              ID Card
            </p>

            <img
              src={selectedBooking.user.idCardPhoto}
              alt="ID Card"
              className="
                w-64
                rounded-2xl
                border border-zinc-700
              "
            />

          </div>

        )}

      </div>

    ) : (

      <div
        className="
          bg-zinc-900
          border border-zinc-800
          rounded-3xl
          p-8
          text-zinc-500
        "
      >
        Select a booking to view details
      </div>
    )}
  </div>

</div>
    </main>
  );
}