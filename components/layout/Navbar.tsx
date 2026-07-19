"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getUser, logout } from "@/lib/auth";

export default function Navbar() {

  const [mounted, setMounted] = useState(false);

  const [user, setUser] = useState<any>(null);

  useEffect(() => {

    setMounted(true);

    const currentUser = getUser();

    setUser(currentUser);

  }, []);

  if (!mounted) {

    return null;

  }

  return (

    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-black/80 backdrop-blur-xl">

      <div className="max-w-7xl mx-auto px-8 py-5 flex items-center justify-between">

        {/* LOGO */}

        <Link
          href="/sports"
          className="text-3xl font-black tracking-tight"
        >

          Sports Management System

        </Link>

        {/* NAVIGATION */}

        <div className="flex items-center gap-5">

          <Link
            href="/sports"
            className="text-zinc-300 hover:text-white transition"
          >
            Sports
          </Link>

          <Link
            href="/history"
            className="text-zinc-300 hover:text-white transition"
          >
            History
          </Link>

          <Link
            href="/profile"
            className="text-zinc-300 hover:text-white transition"
          >
            Profile
          </Link>

          {user?.role === "admin" && (

            <Link
              href="/admin"
              className="text-zinc-300 hover:text-white transition"
            >
              Admin
            </Link>

          )}

          {user?.role === "staff" && (

            <Link
              href="/staff"
              className="text-zinc-300 hover:text-white transition"
            >
              Staff
            </Link>

          )}

          {/* USER INFO */}

          {user ? (

            <div className="flex items-center gap-4 ml-4">

              <div className="text-right">

                <p className="text-sm font-bold">
                  {user.name}
                </p>

                <p className="text-xs text-zinc-400">
                  {user.role}
                </p>

              </div>

              <button
                onClick={() => {

                  logout();

                  window.location.href = "/login";

                }}
                className="bg-red-500 hover:bg-red-400 transition px-5 py-2 rounded-xl font-semibold"
              >

                Logout

              </button>

            </div>

          ) : (

            <Link
              href="/login"
              className="bg-white text-black px-5 py-2 rounded-xl font-semibold"
            >

              Login

            </Link>

          )}

        </div>

      </div>

    </header>

  );

}