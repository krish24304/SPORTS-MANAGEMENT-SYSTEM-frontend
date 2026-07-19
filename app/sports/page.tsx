"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";

interface Gear {
  id: number;
  name: string;
  totalQuantity: number;
  availableQuantity: number;
  damagedQuantity: number;
}

interface Resource {
  id: number;
  name: string;
  type: string;
  totalAvailable: number;
  currentlyAvailable: number;
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
  resources: Resource[];
}

export default function SportsPage() {
  const [sports, setSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSports = async () => {
      try {
        const response = await fetch(
          "http://127.0.0.1:5000/sports"
        );

        const data = await response.json();

        setSports(
          Array.isArray(data) ? data : []
        );
      } catch (error) {
        console.error(
          "Failed to fetch sports:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSports();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-3xl">
            Loading sports...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-10">
        <h1 className="text-4xl md:text-5xl font-black mb-10">
          Sports Arena
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {sports.map((sport) => (
            <Link
              key={sport.id}
              href={`/sports/${sport.id}`}
            >
              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 hover:border-zinc-600 hover:scale-[1.02] transition cursor-pointer h-full">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-4xl font-black">
                    {sport.name}
                  </h2>

                  {sport.maintenance && (
                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                      Maintenance
                    </span>
                  )}
                </div>

                <div className="space-y-4 mb-6">
                  <p className="text-lg text-zinc-300">
                    {sport.hasSlotSystem
                      ? "Available Slots:"
                      : "Available Courts:"}

                    <span className="ml-2 font-bold text-green-400">
                      {sport.availableCourts}/
                      {sport.totalCourts}
                    </span>
                  </p>

                  <p className="text-lg text-zinc-300">
                    Booking System:

                    <span className="ml-2 font-bold text-blue-400">
                      {sport.hasSlotSystem
                        ? `${sport.slotDurationMinutes}min slots`
                        : "Direct booking"}
                    </span>
                  </p>

                  {sport.resources?.length > 0 && (
                    <div>
                      <p className="text-sm font-bold text-yellow-400 mb-2">
                        Resources
                      </p>

                      <div className="space-y-1">
                        {sport.resources
                          .slice(0, 2)
                          .map((resource) => (
                            <p
                              key={resource.id}
                              className="text-sm text-zinc-400"
                            >
                              {resource.name}

                              <span className="ml-2 text-green-400 font-bold">
                                {
                                  resource.currentlyAvailable
                                }
                                /
                                {
                                  resource.totalAvailable
                                }
                              </span>
                            </p>
                          ))}
                      </div>
                    </div>
                  )}

                  {sport.gears?.length > 0 && (
                    <div>
                      <p className="text-sm font-bold text-cyan-400 mb-2">
                        Gears
                      </p>

                      <div className="space-y-1">
                        {sport.gears
                          .slice(0, 3)
                          .map((gear) => (
                            <div
                              key={gear.id}
                              className="text-sm text-zinc-400"
                            >
                              <span>
                                {gear.name}
                              </span>

                              <span className="ml-2 text-green-400 font-bold">
                                Available:
                                {" "}
                                {
                                  gear.availableQuantity
                                }
                              </span>

                              {gear.damagedQuantity >
                                0 && (
                                <span className="ml-2 text-red-400 font-bold">
                                  Damaged:
                                  {" "}
                                  {
                                    gear.damagedQuantity
                                  }
                                </span>
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {sport.maintenance &&
                    sport.maintenanceMessage && (
                      <p className="text-sm text-orange-400 italic">
                        {
                          sport.maintenanceMessage
                        }
                      </p>
                    )}
                </div>

                <button className="w-full bg-white text-black px-6 py-3 rounded-2xl font-bold hover:bg-gray-200 transition">
                  {sport.hasSlotSystem
                    ? "View Slots"
                    : "View & Register"}
                </button>
              </div>
            </Link>
          ))}
        </div>

        {sports.length === 0 && (
          <div className="text-center py-20">
            <p className="text-2xl text-zinc-400">
              No sports available
            </p>
          </div>
        )}
      </div>
    </main>
  );
}