"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, Check, Clock3, GraduationCap, Loader2, Plus, Send, ShieldCheck, UserCog, X } from "lucide-react";

import {
  SUGGESTION_MAX_LENGTH,
  Suggestion,
  fetchSuggestionFeed,
  formatSuggestionDate,
  formatSuggestionTime,
  isNewSuggestion,
  markSuggestionsSeen,
  postSuggestion,
  toDayKey,
  todayKey,
} from "@/lib/suggestions";

type Props = {
  open: boolean;
  onClose: () => void;
};

// The anonymous request board shared by staff and admins. It shows student
// suggestions plus staff-only ones; nobody's identity is ever attached.
export default function AnonymousRequestsModal({ open, onClose }: Props) {
  const [items, setItems] = useState<Suggestion[]>([]);
  const [lastSeenAt, setLastSeenAt] = useState<string | null>(null);
  const [ownIds, setOwnIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const [composing, setComposing] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const feed = await fetchSuggestionFeed("board");
      setItems(feed.items);
      setLastSeenAt(feed.lastSeenAt);
      void markSuggestionsSeen();
    } catch (err) {
      console.error(err);
      setError("Could not load requests. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    setDateFilter("");
    setOwnIds([]);
    void load();
  }, [open, load]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (composing) setComposing(false);
      else onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, composing, onClose]);

  const isFresh = (item: Suggestion) => !ownIds.includes(item.id) && isNewSuggestion(item, lastSeenAt);

  const visible = useMemo(
    () => (dateFilter ? items.filter((item) => toDayKey(item.createdAt) === dateFilter) : items),
    [items, dateFilter]
  );
  const unread = useMemo(() => items.filter(isFresh).length, [items, lastSeenAt, ownIds]); // eslint-disable-line react-hooks/exhaustive-deps

  const send = async () => {
    const text = message.trim();
    if (text.length < 3) return;
    try {
      setSending(true);
      setError("");
      const created = await postSuggestion(text);
      setItems((current) => [created, ...current]);
      setOwnIds((current) => [...current, created.id]);
      setMessage("");
      setComposing(false);
      setSent(true);
      window.setTimeout(() => setSent(false), 2800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not post your request.");
    } finally {
      setSending(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="requests-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4 backdrop-blur-xl"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(event) => event.stopPropagation()}
            className="relative flex h-[88vh] w-full max-w-[900px] flex-col overflow-hidden rounded-[32px] border border-orange-500/20 bg-gradient-to-br from-zinc-950 via-black to-zinc-950 shadow-[0_0_70px_rgba(249,115,22,.18)]"
          >
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-yellow-500/5" />
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-orange-500/10 blur-3xl" />

            {/* HEADER */}
            <div className="relative shrink-0 px-6 pb-5 pt-7 sm:px-8">
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/80 text-zinc-400 transition-all hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400"
              >
                <X size={18} />
              </button>

              <div className="flex flex-wrap items-center gap-3 pr-12">
                <h2 className="bg-gradient-to-r from-yellow-300 via-orange-400 to-orange-500 bg-clip-text text-4xl font-black text-transparent sm:text-5xl">
                  Anonymous Requests
                </h2>
                <AnimatePresence>
                  {unread > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 15 }}
                      className="flex items-center gap-2 rounded-full border border-orange-400/30 bg-orange-500/15 px-3 py-1 text-xs font-bold text-orange-300"
                    >
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-400" />
                      </span>
                      {unread} new
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>

              <p className="mt-2 flex items-center gap-2 text-sm text-zinc-500">
                <ShieldCheck size={14} className="text-orange-400/70" />
                Nobody can tell who wrote these. They disappear after 2 months.
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <label className="flex h-12 items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-4 text-sm text-zinc-300 transition focus-within:border-orange-500 hover:border-zinc-700">
                  <CalendarDays size={16} className="text-orange-400" />
                  <input
                    type="date"
                    value={dateFilter}
                    max={todayKey()}
                    onChange={(event) => {
                      const value = event.target.value;
                      setDateFilter(value && value > todayKey() ? "" : value);
                    }}
                    className="bg-transparent text-sm text-zinc-200 outline-none [color-scheme:dark]"
                  />
                </label>

                <AnimatePresence>
                  {dateFilter && (
                    <motion.button
                      type="button"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      onClick={() => setDateFilter("")}
                      className="flex h-12 items-center gap-1.5 rounded-xl border border-zinc-800 px-4 text-sm text-zinc-400 transition hover:border-orange-500/40 hover:text-orange-300"
                    >
                      <X size={14} /> Clear
                    </motion.button>
                  )}
                </AnimatePresence>

                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setComposing(true);
                  }}
                  className="group relative ml-auto flex h-12 items-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-yellow-400 via-orange-500 to-orange-600 px-6 font-black text-black shadow-[0_0_30px_rgba(249,115,22,.35)] transition-all duration-300 hover:scale-105"
                >
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
                  <Plus size={18} className="relative" />
                  <span className="relative">New Request</span>
                </button>
              </div>

              <AnimatePresence>
                {sent && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-300"
                  >
                    <Check size={14} /> Posted anonymously to the staff board.
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* LIST */}
            <div className="relative flex-1 space-y-4 overflow-y-auto px-6 pb-8 sm:px-8">
              {loading && items.length === 0 &&
                [1, 2, 3].map((n) => <div key={n} className="h-32 animate-pulse rounded-[28px] border border-zinc-800 bg-zinc-900/50" />)}

              {error && !composing && (
                <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>
              )}

              {!loading && !error && visible.length === 0 && (
                <div className="py-16 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-orange-500/20 bg-orange-500/10 text-orange-400">
                    <ShieldCheck size={26} />
                  </div>
                  <p className="mt-4 font-semibold text-zinc-300">
                    {dateFilter ? "Nothing was posted on this day." : "No requests yet."}
                  </p>
                  <p className="mt-1 text-sm text-zinc-600">
                    {dateFilter ? "Pick another date or clear the filter." : "New student and staff requests will show up here."}
                  </p>
                </div>
              )}

              {visible.map((item, index) => {
                const fresh = isFresh(item);
                const fromStaff = item.scope === "staff";
                return (
                  <motion.article
                    key={item.id}
                    initial={{ opacity: 0, y: 26 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index, 8) * 0.05 }}
                    className={`group relative overflow-hidden rounded-[28px] border bg-gradient-to-br from-zinc-900 to-zinc-950 p-6 shadow-[0_0_30px_rgba(249,115,22,.08)] transition-all duration-300 hover:-translate-y-1 hover:border-orange-500/35 ${
                      fresh ? "border-orange-500/40" : "border-orange-500/15"
                    }`}
                  >
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-orange-500/5 via-transparent to-yellow-500/5 opacity-0 transition group-hover:opacity-100" />

                    <div className="relative flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-orange-500/20 bg-orange-500/10 text-orange-300">
                          {fromStaff ? <UserCog size={22} /> : <GraduationCap size={22} />}
                        </div>
                        <div>
                          <h3 className="text-lg font-black text-white">{fromStaff ? "Anonymous Staff" : "Anonymous Student"}</h3>
                          <p className="text-xs text-zinc-500">Identity hidden</p>
                        </div>
                      </div>

                      {fresh ? (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 400, damping: 14, delay: 0.15 }}
                          className="flex items-center gap-2 rounded-full bg-orange-500/15 px-3 py-1.5 text-xs font-bold text-orange-300"
                        >
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75" />
                            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-orange-400" />
                          </span>
                          New
                        </motion.span>
                      ) : (
                        <span className="rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-400">Seen</span>
                      )}
                    </div>

                    <p className="relative mt-5 whitespace-pre-wrap break-words text-[16px] leading-8 text-zinc-300">{item.message}</p>

                    <div className="relative mt-5 flex flex-wrap gap-2.5">
                      <span className="flex items-center gap-2 rounded-full bg-zinc-800 px-3.5 py-1.5 text-xs text-zinc-400">
                        <CalendarDays size={12} /> {formatSuggestionDate(item.createdAt)}
                      </span>
                      <span className="flex items-center gap-2 rounded-full bg-zinc-800 px-3.5 py-1.5 text-xs text-zinc-400">
                        <Clock3 size={12} /> {formatSuggestionTime(item.createdAt)}
                      </span>
                    </div>
                  </motion.article>
                );
              })}
            </div>

            {/* COMPOSER */}
            <AnimatePresence>
              {composing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => !sending && setComposing(false)}
                  className="absolute inset-0 z-20 flex items-center justify-center bg-black/85 p-5 backdrop-blur-md"
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.92, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.94 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    onClick={(event) => event.stopPropagation()}
                    className="relative w-full max-w-[640px] overflow-hidden rounded-[28px] border border-orange-500/25 bg-gradient-to-br from-zinc-950 via-black to-zinc-950 p-7 shadow-[0_0_80px_rgba(249,115,22,.22)]"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-2xl font-black text-white">New Anonymous Request</h3>
                        <p className="mt-1 text-sm text-zinc-500">Only staff and admins will see this. Your name is never stored.</p>
                      </div>
                      <button
                        type="button"
                        disabled={sending}
                        onClick={() => setComposing(false)}
                        aria-label="Close"
                        className="rounded-lg p-2 text-zinc-500 transition hover:bg-zinc-800 hover:text-white"
                      >
                        <X size={18} />
                      </button>
                    </div>

                    <textarea
                      autoFocus
                      value={message}
                      onChange={(event) => setMessage(event.target.value.slice(0, SUGGESTION_MAX_LENGTH))}
                      placeholder="Write your request, suggestion or thought..."
                      rows={7}
                      className="mt-5 w-full resize-none rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5 text-[15px] leading-7 text-zinc-200 outline-none transition placeholder:text-zinc-600 focus:border-orange-500/60"
                    />
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs text-zinc-600">
                        {message.length}/{SUGGESTION_MAX_LENGTH}
                      </span>
                      {error && composing && <span className="text-xs text-red-300">{error}</span>}
                    </div>

                    <button
                      type="button"
                      disabled={sending || message.trim().length < 3}
                      onClick={() => void send()}
                      className="group relative mt-6 flex h-14 w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-yellow-400 via-orange-500 to-orange-600 font-black text-black shadow-[0_0_30px_rgba(249,115,22,.3)] transition-all duration-300 hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
                    >
                      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
                      {sending ? (
                        <Loader2 size={18} className="relative animate-spin" />
                      ) : (
                        <Send size={17} className="relative" />
                      )}
                      <span className="relative">{sending ? "Posting..." : "Post Anonymously"}</span>
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
