"use client";
import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import SportCard from "@/components/ui/SportCard";
import { sports } from "@/constants/sports";

export default function SportsPage() {
  const [search, setSearch] = useState("");
  const filteredSports = sports.filter((sport) =>
  sport.name.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <main className="min-h-screen bg-black text-white">

      <Navbar />

      <section className="max-w-6xl mx-auto px-6 py-16">

        <h1 className="text-5xl font-bold mb-12">
          Available Sports
        </h1>
        <input
            type="text"
            placeholder="Search sports..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full mb-10 p-4 rounded-xl bg-zinc-900 border border-zinc-700 text-white outline-none focus:border-white"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

          {filteredSports.map((sport) => (
            <SportCard
              key={sport.id}
              name={sport.name}
              totalGear={sport.totalGear}
              availableGear={sport.availableGear}
              status={sport.status}
            />
          ))}

        </div>

      </section>

    </main>
  );
}