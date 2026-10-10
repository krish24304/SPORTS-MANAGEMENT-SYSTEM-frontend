"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AlertTriangle, CalendarDays, ClipboardCheck, Clock, Eye, FileText, Layers, RefreshCw, Search, X } from "lucide-react";

import { ReturnRow, requestLabel, totalItems } from "./returnUtils";

function StudentAvatar({ name, reduceMotion }: { name: string; reduceMotion: boolean | null }) {
  const initials = name.trim().split(/s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("") || "?";
  return (
    <div className="relative h-16 w-16 shrink-0">
      <motion.div
        aria-hidden
        className="absolute inset-0 rounded-2xl bg-[conic-gradient(from_0deg,#f472b6,#c026d3,#fb7185,#f472b6)] opacity-80"
        animate={reduceMotion ? undefined : { rotate: 360 }}
        transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
      />
      <div className="absolute inset-[2px] flex items-center justify-center rounded-[14px] bg-zinc-950">
        <span className="bg-gradient-to-br from-pink-200 to-fuchsia-400 bg-clip-text text-lg font-black tracking-wide text-transparent">
          {initials}
        </span>
      </div>
    </div>
  );
}

type Props = {
  open: boolean;
  rows: ReturnRow[];
  loading: boolean;
  error: string;
  refreshing: boolean;
  onClose: () => void;
  onRefresh: () => void;
  onReview: (row: ReturnRow) => void;
};

export default function ReturnRequestsModal({ open, rows, loading, error, refreshing, onClose, onRefresh, onReview }: Props) {
  const reduceMotion = useReducedMotion();
  const [search, setSearch] = useState("");
  const [sport, setSport] = useState("All");

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const sports = useMemo(
    () => Array.from(new Set(rows.map((row) => row.sport).filter(Boolean))).sort((a, b) => a.localeCompare(b)),
    [rows]
  );

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return rows.filter((row) => {
      const matchesSport = sport === "All" || row.sport === sport;
      const haystack = [row.student, row.gear, row.sport, row.court, requestLabel(row.id)].join(" ").toLowerCase();
      return matchesSport && (!term || haystack.includes(term));
    });
  }, [rows, search, sport]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="return-requests"
          role="dialog"
          aria-modal="true"
          aria-labelledby="return-requests-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[240] flex items-center justify-center bg-black/85 p-3 backdrop-blur-2xl sm:p-6"
        >
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            onClick={(event) => event.stopPropagation()}
            className="relative flex max-h-[92vh] w-full max-w-[1100px] flex-col overflow-hidden rounded-[30px] border border-pink-500/25 bg-gradient-to-br from-[#140a14] via-[#080808] to-[#0d080b] shadow-[0_0_140px_rgba(236,72,153,.18)] sm:rounded-[38px]"
          >
            {!reduceMotion && (
              <motion.div
                aria-hidden
                animate={{ opacity: [0.35, 0.8, 0.35] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="pointer-events-none absolute right-[-80px] top-[-80px] h-[300px] w-[300px] rounded-full bg-pink-500/15 blur-[120px]"
              />
            )}

            <header className="relative flex items-start justify-between gap-4 border-b border-pink-500/15 px-6 pb-5 pt-6 sm:px-9">
              <div className="flex items-center gap-4">
                <motion.div
                  whileHover={reduceMotion ? undefined : { rotate: -6, scale: 1.05 }}
                  className="flex h-14 w-14 items-center justify-center rounded-2xl border border-pink-400/30 bg-pink-500/10 text-pink-300 shadow-[0_0_30px_rgba(236,72,153,.25)]"
                >
                  <ClipboardCheck size={24} />
                </motion.div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-pink-400/80">Manage &amp; review</p>
                  <h2 id="return-requests-title" className="mt-1 text-3xl font-black tracking-tight text-white sm:text-4xl">
                    Return <span className="bg-gradient-to-r from-pink-400 to-fuchsia-400 bg-clip-text text-transparent">Requests</span>
                  </h2>
                  <p className="mt-1 text-sm text-zinc-500">Review and process equipment returns from students.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="rounded-2xl border border-zinc-800 bg-zinc-900/90 p-3 text-zinc-400 transition hover:border-pink-500/30 hover:bg-pink-500/10 hover:text-pink-300"
              >
                <X size={18} />
              </button>
            </header>

            <div className="relative flex flex-col gap-3 border-b border-pink-500/10 px-6 py-4 sm:flex-row sm:px-9">
              <div className="relative flex-1">
                <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by student, equipment or request ID…"
                  className="h-12 w-full rounded-2xl border border-zinc-800 bg-black/40 pl-11 pr-4 text-sm text-white outline-none transition focus:border-pink-500/50 focus:shadow-[0_0_0_4px_rgba(236,72,153,.08)]"
                />
              </div>
              <div className="relative">
                <Layers size={15} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                <select
                  value={sport}
                  onChange={(event) => setSport(event.target.value)}
                  className="h-12 w-full appearance-none rounded-2xl border border-zinc-800 bg-black/40 pl-11 pr-8 text-sm text-zinc-200 outline-none focus:border-pink-500/50 sm:w-56"
                >
                  <option value="All">All sports</option>
                  {sports.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
              <motion.button
                type="button"
                onClick={onRefresh}
                disabled={refreshing}
                whileHover={reduceMotion ? undefined : { scale: 1.03 }}
                whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-pink-500/30 bg-pink-500/10 px-5 text-sm font-semibold text-pink-200 transition hover:bg-pink-500/20 disabled:opacity-60"
              >
                <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
                {refreshing ? "Refreshing…" : "Refresh"}
              </motion.button>
            </div>

            <div className="relative flex-1 overflow-y-auto px-6 py-5 sm:px-9">
              {error && !loading && (
                <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-red-500/25 bg-red-500/5 px-5 py-4 text-sm text-red-200">
                  <span className="flex items-center gap-3">
                    <AlertTriangle size={17} /> {error}
                  </span>
                  <button type="button" onClick={onRefresh} className="rounded-xl border border-red-400/30 px-3 py-1.5 text-xs font-semibold text-red-200 hover:bg-red-500/10">
                    Try again
                  </button>
                </div>
              )}

              {loading && (
                <div className="space-y-4">
                  {[0, 1, 2].map((key) => (
                    <div key={key} className="h-32 animate-pulse rounded-3xl border border-pink-500/10 bg-zinc-900/40" />
                  ))}
                </div>
              )}

              {!loading && !error && rows.length === 0 && (
                <motion.div initial={reduceMotion ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="py-16 text-center">
                  <motion.div
                    animate={reduceMotion ? undefined : { y: [0, -6, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-pink-500/20 bg-pink-500/5 text-pink-400"
                  >
                    <ClipboardCheck size={32} />
                  </motion.div>
                  <p className="mt-5 text-lg font-bold text-zinc-200">No return requests</p>
                  <p className="mt-1 text-sm text-zinc-500">When a student asks to return equipment, it will appear here.</p>
                </motion.div>
              )}

              {!loading && rows.length > 0 && visible.length === 0 && (
                <p className="py-12 text-center text-sm text-zinc-500">No requests match your search or sport filter.</p>
              )}

              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {visible.map((row, index) => {
                    return (
                      <motion.article
                        key={row.id}
                        layout={!reduceMotion}
                        initial={reduceMotion ? false : { opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={reduceMotion ? undefined : { opacity: 0, x: 30, scale: 0.97 }}
                        transition={{ delay: reduceMotion ? 0 : index * 0.06, duration: 0.4 }}
                        whileHover={reduceMotion ? undefined : { y: -3 }}
                        className="group relative overflow-hidden rounded-3xl border border-pink-500/15 bg-gradient-to-r from-[#170b15]/90 via-zinc-950/80 to-[#0f090e]/90 p-5 transition-colors hover:border-pink-500/35"
                      >
                        <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-pink-400 to-fuchsia-600 opacity-80" />
                        <div className="grid items-center gap-5 md:grid-cols-[auto_1.3fr_1fr_auto] md:gap-6">
                          <div className="flex items-center gap-4">
                            <StudentAvatar name={row.student} reduceMotion={reduceMotion} />
                            <div className="min-w-0">
                              <p className="truncate text-lg font-bold text-white">{row.student}</p>
                              <p className="mt-0.5 text-xs text-zinc-400">
                                {row.sport || "Sport"}
                                {row.court && row.court !== row.sport ? ` · ${row.court}` : ""}
                              </p>
                              <p className="mt-1 text-[11px] font-semibold tracking-wider text-pink-300/80">{requestLabel(row.id)}</p>
                            </div>
                          </div>

                          <div className="min-w-0">
                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">Equipment</p>
                            <p className="mt-1 truncate text-sm font-semibold text-zinc-100">{row.gear}</p>
                            <p className="mt-0.5 text-xs text-zinc-500">{totalItems(row)} item{totalItems(row) === 1 ? "" : "s"}</p>
                          </div>

                          <div className="min-w-0">
                            <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">
                              <FileText size={11} /> Reason
                            </p>
                            <p className="mt-1 line-clamp-2 text-sm text-zinc-300">{row.reason || "No reason given"}</p>
                          </div>

                          <div className="flex items-center justify-between gap-4 md:flex-col md:items-end">
                            <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-amber-300">
                              <span className="relative flex h-2 w-2">
                                {!reduceMotion && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-300 opacity-70" />}
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-300" />
                              </span>
                              Pending
                            </span>
                            <div className="text-right text-xs text-zinc-400">
                              <p className="flex items-center justify-end gap-1.5">
                                <CalendarDays size={12} /> {row.requestTime || "—"}
                              </p>
                            </div>
                            <motion.button
                              type="button"
                              onClick={() => onReview(row)}
                              whileHover={reduceMotion ? undefined : { scale: 1.04 }}
                              whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                              className="inline-flex items-center gap-2 rounded-2xl border border-pink-500/40 bg-pink-500/10 px-5 py-2.5 text-sm font-semibold text-pink-200 shadow-[0_0_20px_rgba(236,72,153,.12)] transition hover:bg-pink-500/20 hover:shadow-[0_0_28px_rgba(236,72,153,.3)]"
                            >
                              <Eye size={15} /> Review
                            </motion.button>
                          </div>
                        </div>
                      </motion.article>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>

            <footer className="relative flex items-center justify-between border-t border-pink-500/10 px-6 py-3 text-xs text-zinc-500 sm:px-9">
              <span className="flex items-center gap-2">
                <Clock size={12} /> Showing {visible.length} of {rows.length} request{rows.length === 1 ? "" : "s"}
              </span>
            </footer>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
