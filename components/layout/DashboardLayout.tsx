"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

type DashboardLayoutProps = {
  title: string;
  children: React.ReactNode;
};

export default function DashboardLayout({
  title,
  children,
}: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      {/* =====================================================
          DESKTOP SIDEBAR
      ===================================================== */}

      <aside
        className={`hidden md:block fixed left-0 top-0 z-50 h-screen transition-all duration-300 ${
          sidebarCollapsed ? "w-20" : "w-[272px]"
        }`}
      >
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() =>
            setSidebarCollapsed((previous) => !previous)
          }
        />
      </aside>

      {/* =====================================================
          MOBILE SIDEBAR
      ===================================================== */}

      <AnimatePresence>
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-[100] md:hidden">
            {/* BACKDROP */}
            <motion.button
              type="button"
              aria-label="Close navigation"
              onClick={() => setMobileSidebarOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />

            {/* SIDEBAR */}
            <motion.aside
              initial={{
                x: -280,
                opacity: 0,
              }}
              animate={{
                x: 0,
                opacity: 1,
              }}
              exit={{
                x: -280,
                opacity: 0,
              }}
              transition={{
                duration: 0.22,
                ease: "easeOut",
              }}
              className="relative z-10 h-full w-[260px]"
            >
              <Sidebar
                collapsed={false}
                onToggle={() => setMobileSidebarOpen(false)}
              />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* =====================================================
          MAIN AREA
      ===================================================== */}

      <div
        className={`min-h-screen transition-all duration-300 ${
          sidebarCollapsed ? "md:ml-20" : "md:ml-[272px]"
        }`}
      >
        {/* TOP NAVBAR */}
        <Navbar
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
        />

        {/* PAGE CONTENT */}
        <section className="px-5 py-7 md:px-8 md:py-8 lg:px-10">
          <div className="mx-auto w-full max-w-[1500px]">
            {/* PAGE TITLE */}
            <div className="mb-8">
              <motion.h1
                initial={{
                  opacity: 0,
                  y: -8,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.25,
                }}
                className="text-3xl font-bold tracking-tight text-white md:text-4xl"
              >
                {title}
              </motion.h1>
            </div>

            {children}
          </div>
        </section>
      </div>
    </main>
  );
}