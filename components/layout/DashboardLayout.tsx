"use client";

import Navbar from "./Navbar";
import Link from "next/link";
import { usePathname } from "next/navigation";
type DashboardLayoutProps = {
  title: string;
  children: React.ReactNode;
};

export default function DashboardLayout({
  title,
  children,
}: DashboardLayoutProps) {
    const pathname = usePathname();
  return (
    
    <main className="min-h-screen bg-black text-white">

      <Navbar />

      <div className="flex">

        <aside className="w-64 min-h-screen border-r border-zinc-800 bg-zinc-950 p-6 hidden md:block">

          <h2 className="text-2xl font-bold mb-10">
            Dashboard
          </h2>

          <div className="space-y-3">

            <Link
                href="/student"
                className={`block px-4 py-3 rounded-xl transition-all duration-300
                ${
                pathname === "/student"
                    ? "bg-white text-black"
                    : "text-gray-400 hover:bg-zinc-800 hover:text-white"
                }`}
            >
                Student Dashboard
            </Link>

            <Link
                href="/admin"
                className={`block px-4 py-3 rounded-xl transition-all duration-300
                ${
                pathname === "/admin"
                    ? "bg-white text-black"
                    : "text-gray-400 hover:bg-zinc-800 hover:text-white"
                }`}
            >
                Admin Dashboard
            </Link>

            <Link
                href="/staff"
                className={`block px-4 py-3 rounded-xl transition-all duration-300
                ${
                pathname === "/staff"
                    ? "bg-white text-black"
                    : "text-gray-400 hover:bg-zinc-800 hover:text-white"
                }`}
            >
                Staff Dashboard
            </Link>

            </div>

        </aside>

        <section className="flex-1 px-6 py-16">

          <h1 className="text-5xl font-bold mb-4">
            {title}
          </h1>

          {children}

        </section>

      </div>
      
    </main>
  );
}