"use client";

import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-8 py-12">
        <h1 className="text-6xl font-black mb-4">
          Admin Dashboard
        </h1>

        <p className="text-zinc-400 text-xl mb-12">
          Manage Sports, Slots, Team Reservations and Gears
        </p>

        <div className="flex flex-wrap gap-6">
          <button
            onClick={() => router.push("/admin/sports")}
            className="
              bg-white
              text-black
              px-10
              py-5
              rounded-3xl
              font-black
              text-xl
              hover:bg-zinc-200
              transition
            "
          >
            Manage Sports
          </button>

          <button
            onClick={() =>
              router.push("/admin/team-reservations")
            }
            className="
              bg-blue-600
              px-10
              py-5
              rounded-3xl
              font-black
              text-xl
              hover:bg-blue-700
              transition
            "
          >
            Team Reservations
          </button>

          <button
            onClick={() =>
              router.push("/admin/notices")
            }
            className="
              bg-green-600
              px-10
              py-5
              rounded-3xl
              font-black
              text-xl
              hover:bg-green-700
              transition
            "
          >
            Notices
          </button>
        </div>
      </div>
    </main>
  );
}