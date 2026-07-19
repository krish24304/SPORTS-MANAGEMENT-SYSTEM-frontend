"use client";

import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { useEffect, useState } from "react";

export default function HomePage() {

  const [sports, setSports] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  // FETCH SPORTS

  const fetchSports = async () => {

    try {

      const response = await fetch(
        "http://localhost:5000/sports"
      );

      const data = await response.json();

      setSports(data);

    } catch (error) {

      console.log(error);

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {

    fetchSports();

  }, []);

  return (

    <main className="min-h-screen bg-black text-white">

      <Navbar />

      {/* HERO */}

      <section className="max-w-7xl mx-auto px-8 py-28">

        <div className="max-w-4xl">

          <div className="inline-block px-5 py-2 rounded-full bg-zinc-900 border border-zinc-800 mb-8">

            <p className="text-sm text-zinc-300">
              College Sports Management Platform
            </p>

          </div>

          <h1 className="text-7xl font-black leading-tight mb-8">

            Smart Sports
            <br />

            Management
            <span className="text-zinc-500">
              {" "}System
            </span>

          </h1>

          <p className="text-2xl text-zinc-400 leading-relaxed mb-12 max-w-3xl">

            Manage sports inventory, slot booking,
            issue-return workflows, courts, and
            student sports activities with a modern platform.

          </p>

          <div className="flex gap-6 flex-wrap">

            <Link href="/sports">

              <button className="px-8 py-4 bg-white text-black rounded-2xl text-lg font-bold hover:scale-105 transition">

                Explore Sports

              </button>

            </Link>

            <Link href="/login">

              <button className="px-8 py-4 border border-zinc-700 rounded-2xl text-lg hover:bg-zinc-900 transition">

                Login

              </button>

            </Link>

            <Link href="/signup">

              <button className="px-8 py-4 bg-green-500 text-white rounded-2xl text-lg font-bold hover:scale-105 transition">

                Sign Up

              </button>

            </Link>

          </div>

        </div>

      </section>

      {/* SPORTS SECTION */}

      <section className="max-w-7xl mx-auto px-8 pb-28">

        <div className="flex items-center justify-between mb-12">

          <h2 className="text-5xl font-black">
            Available Sports
          </h2>

          <Link
            href="/sports"
            className="text-zinc-400 hover:text-white transition"
          >
            View All →
          </Link>

        </div>

        {loading ? (

          <div className="text-2xl text-zinc-400">
            Loading sports...
          </div>

        ) : sports.length === 0 ? (

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-10 text-zinc-400">
            No sports available
          </div>

        ) : (

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">

            {sports.map((sport) => (

              <Link
                href={`/sports/${sport.id}`}
                key={sport.id}
              >

                <div className="group bg-zinc-900 border border-zinc-800 rounded-3xl p-8 hover:border-white hover:-translate-y-1 transition cursor-pointer h-full">

                  {/* TOP */}

                  <div className="flex justify-between items-start mb-8">

                    <div>

                      <h3 className="text-4xl font-black mb-3 group-hover:text-green-400 transition">

                        {sport.name}

                      </h3>

                      <p className="text-zinc-400">
                        Sports Arena
                      </p>

                    </div>

                    <div className="w-4 h-4 rounded-full bg-green-500 animate-pulse" />

                  </div>

                  {/* INFO */}

                  <div className="space-y-5">

                    <div className="flex justify-between items-center">

                      <span className="text-zinc-400">
                        Courts
                      </span>

                      <span className="text-2xl font-black">
                        {sport.availableCourts}/{sport.totalCourts}
                      </span>

                    </div>

                    <div className="flex justify-between items-center">

                      <span className="text-zinc-400">
                        Gears
                      </span>

                      <span className="text-2xl font-black">
                        {sport.gears?.length || 0}
                      </span>

                    </div>

                    <div className="flex justify-between items-center">

                      <span className="text-zinc-400">
                        Slots
                      </span>

                      <span className="text-2xl font-black">
                        {sport.slots?.length || 0}
                      </span>

                    </div>

                  </div>

                  {/* SLOT PREVIEW */}

                  <div className="mt-8">

                    {sport.slots?.length > 0 ? (

                      <div className="bg-black border border-zinc-800 rounded-2xl p-4">

                        <p className="text-sm text-zinc-400 mb-2">
                          NEXT SLOT
                        </p>

                        <p className="font-bold text-lg">

                          {sport.slots[0].startTime}

                          {" - "}

                          {sport.slots[0].endTime}

                        </p>

                      </div>

                    ) : (

                      <div className="bg-black border border-zinc-800 rounded-2xl p-4 text-zinc-500">

                        No active slots

                      </div>

                    )}

                  </div>

                </div>

              </Link>

            ))}

          </div>

        )}

      </section>

      {/* FEATURES */}

      <section className="max-w-7xl mx-auto px-8 pb-28">

        <h2 className="text-5xl font-black mb-16">

          Platform Features

        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-10">

            <h3 className="text-3xl font-bold mb-5">

              Gear Issue Workflow

            </h3>

            <p className="text-zinc-400 text-lg leading-relaxed">

              Students can request sports gears digitally.
              Staff manages approvals and return verification.

            </p>

          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-10">

            <h3 className="text-3xl font-bold mb-5">

              Live Inventory Tracking

            </h3>

            <p className="text-zinc-400 text-lg leading-relaxed">

              Track available, damaged, issued,
              and maintenance gears in real-time.

            </p>

          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-10">

            <h3 className="text-3xl font-bold mb-5">

              Role Based Access

            </h3>

            <p className="text-zinc-400 text-lg leading-relaxed">

              Separate dashboards for students,
              staff, and admin users.

            </p>

          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-10">

            <h3 className="text-3xl font-bold mb-5">

              Smart Slot Booking

            </h3>

            <p className="text-zinc-400 text-lg leading-relaxed">

              Interactive slot booking system
              with live availability tracking.

            </p>

          </div>

        </div>

      </section>
        
    </main>

  );

}
