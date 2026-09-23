"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

interface SearchResult {
  label: string;
  href: string;
  description: string;
  icon: string;
}

const SEARCH_RESULTS: SearchResult[] = [
  {
    label: "Home",
    href: "/student",
    description: "Dashboard and your upcoming sports activity",
    icon: "home",
  },
  {
    label: "Sports",
    href: "/sports",
    description: "Browse sports and check facility availability",
    icon: "sports",
  },
  {
    label: "My Bookings",
    href: "/my-bookings",
    description: "View and manage your sports bookings",
    icon: "bookings",
  },
  {
    label: "Equipment",
    href: "/equipment",
    description: "Request sports equipment",
    icon: "equipment",
  },
  {
    label: "Swimming Pass",
    href: "/swimming-pass",
    description: "View or purchase a swimming pass",
    icon: "pass",
  },
  {
    label: "History",
    href: "/history",
    description: "View your previous bookings and requests",
    icon: "history",
  },
  {
    label: "Announcements",
    href: "/announcements",
    description: "Sports Block announcements and updates",
    icon: "announcements",
  },
  {
    label: "Profile",
    href: "/profile",
    description: "Manage your student profile",
    icon: "profile",
  },
  {
    label: "Badminton",
    href: "/sports/badminton",
    description: "View badminton courts and available slots",
    icon: "sports",
  },
  {
    label: "Swimming",
    href: "/sports/swimming",
    description: "View swimming lanes and available slots",
    icon: "sports",
  },
  {
    label: "Football",
    href: "/sports/football",
    description: "View football facility and available slots",
    icon: "sports",
  },
  {
    label: "Basketball",
    href: "/sports/basketball",
    description: "View basketball courts and availability",
    icon: "sports",
  },
  {
    label: "Table Tennis",
    href: "/sports/table-tennis",
    description: "View table tennis tables and slots",
    icon: "sports",
  },
];

function SearchIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </svg>
  );
}

function ArrowIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function CommandIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <circle cx="9" cy="9" r="3" />
      <circle cx="15" cy="15" r="3" />
      <path d="M12 6V5a3 3 0 1 0-3 3h1" />
      <path d="M12 18v1a3 3 0 1 0 3-3h-1" />
    </svg>
  );
}

function getIcon(icon: string) {
  switch (icon) {
    case "home":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          className="h-4 w-4"
        >
          <path d="M3 11.5 12 4l9 7.5" />
          <path d="M5 10v10h14V10" />
        </svg>
      );

    case "bookings":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          className="h-4 w-4"
        >
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M3 10h18M8 3v4M16 3v4" />
        </svg>
      );

    case "equipment":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          className="h-4 w-4"
        >
          <path d="M6 4v16M18 4v16M6 9h12M6 15h12" />
        </svg>
      );

    case "pass":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          className="h-4 w-4"
        >
          <path d="M4 15c4-6 12-6 16 0M2 10c5-7 15-7 20 0" />
          <circle
            cx="12"
            cy="18"
            r="1.4"
            fill="currentColor"
            stroke="none"
          />
        </svg>
      );

    case "history":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          className="h-4 w-4"
        >
          <path d="M3 12a9 9 0 1 0 3-6.7" />
          <path d="M3 4v5h5M12 7v5l3 3" />
        </svg>
      );

    case "announcements":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          className="h-4 w-4"
        >
          <path d="M3 11v2a2 2 0 0 0 2 2h1l3 4V5l-3 4H5a2 2 0 0 0-2 2Z" />
          <path d="M15 8a4 4 0 0 1 0 8M18 5a8 8 0 0 1 0 14" />
        </svg>
      );

    case "profile":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          className="h-4 w-4"
        >
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c1.5-4 5-6 8-6s6.5 2 8 6" />
        </svg>
      );

    default:
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          className="h-4 w-4"
        >
          <circle cx="12" cy="12" r="9" />
        </svg>
      );
  }
}

export default function SearchModal({
  open,
  onClose,
}: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const value = query.trim().toLowerCase();

    if (!value) {
      return SEARCH_RESULTS.slice(0, 8);
    }

    return SEARCH_RESULTS.filter((result) => {
      return (
        result.label.toLowerCase().includes(value) ||
        result.description.toLowerCase().includes(value)
      );
    }).slice(0, 8);
  }, [query]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setSelectedIndex(0);
      return;
    }

    const timeout = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 50);

    return () => window.clearTimeout(timeout);
  }, [open]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();

        setSelectedIndex((current) =>
          results.length === 0
            ? 0
            : Math.min(current + 1, results.length - 1)
        );

        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();

        setSelectedIndex((current) =>
          Math.max(current - 1, 0)
        );

        return;
      }

      if (event.key === "Enter" && results[selectedIndex]) {
        event.preventDefault();

        window.location.href = results[selectedIndex].href;
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose, results, selectedIndex]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[10vh]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.16 }}
            className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-white/[0.08] bg-zinc-950 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="Search Sports Block"
          >
            <div className="flex items-center gap-3 border-b border-white/[0.07] px-4">
              <SearchIcon className="h-5 w-5 flex-shrink-0 text-zinc-500" />

              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search sports, bookings, equipment..."
                className="h-14 min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-zinc-600"
              />

              <button
                type="button"
                onClick={onClose}
                className="rounded-md border border-white/[0.08] px-2 py-1 text-[11px] text-zinc-500 transition-colors hover:text-white"
              >
                ESC
              </button>
            </div>

            <div className="max-h-[55vh] overflow-y-auto p-2">
              {results.length === 0 ? (
                <div className="px-4 py-12 text-center">
                  <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.04] text-zinc-500">
                    <SearchIcon className="h-5 w-5" />
                  </div>

                  <p className="text-sm font-medium text-zinc-300">
                    No results found
                  </p>

                  <p className="mt-1 text-xs text-zinc-600">
                    Try searching for a sport, booking, equipment, or page.
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {results.map((result, index) => (
                    <Link
                      key={`${result.href}-${result.label}`}
                      href={result.href}
                      onClick={onClose}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`group flex items-center gap-3 rounded-xl px-3 py-3 transition-colors ${
                        selectedIndex === index
                          ? "bg-emerald-500/[0.09]"
                          : "hover:bg-white/[0.04]"
                      }`}
                    >
                      <div
                        className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${
                          selectedIndex === index
                            ? "bg-emerald-500/15 text-emerald-400"
                            : "bg-white/[0.04] text-zinc-500"
                        }`}
                      >
                        {getIcon(result.icon)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-white">
                          {result.label}
                        </p>

                        <p className="mt-0.5 truncate text-xs text-zinc-600">
                          {result.description}
                        </p>
                      </div>

                      <ArrowIcon
                        className={`h-4 w-4 flex-shrink-0 transition-all ${
                          selectedIndex === index
                            ? "translate-x-0 text-emerald-400 opacity-100"
                            : "-translate-x-1 text-zinc-700 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                        }`}
                      />
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-white/[0.06] px-4 py-3">
              <div className="flex items-center gap-4 text-[11px] text-zinc-600">
                <span className="flex items-center gap-1.5">
                  <CommandIcon className="h-3.5 w-3.5" />
                  Search
                </span>

                <span>↑ ↓ Navigate</span>

                <span>Enter Open</span>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="text-[11px] text-zinc-600 transition-colors hover:text-zinc-300"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}