"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarDays,
  Check,
  Clock3,
  FilePenLine,
  Lightbulb,
  Loader2,
  MessageSquarePlus,
  Plus,
  Save,
  ShieldCheck,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { getUser } from "@/lib/auth";
import {
  SUGGESTION_MAX_LENGTH,
  Suggestion,
  SuggestionDraft,
  fetchSuggestionFeed,
  formatSuggestionDate,
  formatSuggestionTime,
  isNewSuggestion,
  loadDrafts,
  markSuggestionsSeen,
  postSuggestion,
  saveDrafts,
  toDayKey,
  todayKey,
} from "@/lib/suggestions";

export default function SuggestionsPage() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  // Snapshot of what the user had already seen when the page opened, so "New"
  // markers survive the moment we mark everything as read.
  const [lastSeenAt, setLastSeenAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Ids published during this visit: never flag your own post as "New".
  const [ownIds, setOwnIds] = useState<number[]>([]);
  const [dateFilter, setDateFilter] = useState("");

  const [composerOpen, setComposerOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [drafts, setDrafts] = useState<SuggestionDraft[]>([]);
  const [userId, setUserId] = useState<number | string>("guest");

  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState("");

  const flash = (text: string) => {
    setNotice(text);
    window.setTimeout(() => setNotice(null), 3200);
  };

  const load = useCallback(async () => {
    try {
      setError("");
      const feed = await fetchSuggestionFeed("public");
      setSuggestions(feed.items);
      setLastSeenAt(feed.lastSeenAt);
      void markSuggestionsSeen();
    } catch (err) {
      console.error(err);
      setError("Unable to load suggestions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const id = getUser()?.id ?? "guest";
    setUserId(id);
    setDrafts(loadDrafts(id));
    void load();
  }, [load]);

  const unreadCount = useMemo(
    () => suggestions.filter((item) => !ownIds.includes(item.id) && isNewSuggestion(item, lastSeenAt)).length,
    [suggestions, lastSeenAt, ownIds]
  );

  const visible = useMemo(
    () => (dateFilter ? suggestions.filter((item) => toDayKey(item.createdAt) === dateFilter) : suggestions),
    [suggestions, dateFilter]
  );

  const updateDrafts = (next: SuggestionDraft[]) => {
    setDrafts(next);
    saveDrafts(userId, next);
  };

  const openComposer = (draft?: SuggestionDraft) => {
    setMessage(draft?.message ?? "");
    setEditingDraftId(draft?.id ?? null);
    setError("");
    setComposerOpen(true);
  };

  const closeComposer = () => {
    if (submitting) return;
    setComposerOpen(false);
    setEditingDraftId(null);
    setMessage("");
  };

  const saveDraft = () => {
    const text = message.trim();
    if (!text) return;

    const now = new Date().toISOString();
    if (editingDraftId) {
      updateDrafts(drafts.map((d) => (d.id === editingDraftId ? { ...d, message: text, updatedAt: now } : d)));
    } else {
      updateDrafts([{ id: `${Date.now()}`, message: text, updatedAt: now }, ...drafts]);
    }

    setComposerOpen(false);
    setEditingDraftId(null);
    setMessage("");
    flash("Draft saved. Only you can see it.");
  };

  const publish = async () => {
    const text = message.trim();
    if (text.length < 3) {
      setError("Please write at least a few words.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      const created = await postSuggestion(text);

      setSuggestions((current) => [created, ...current]);
      setOwnIds((current) => [...current, created.id]);
      if (editingDraftId) updateDrafts(drafts.filter((d) => d.id !== editingDraftId));

      setComposerOpen(false);
      setEditingDraftId(null);
      setMessage("");
      flash("Published anonymously. Everyone on the wall can see it now.");
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Something went wrong while publishing your suggestion.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout title="Share a Suggestion">
      <div className="relative mx-auto w-full max-w-6xl pb-16">
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute left-[35%] top-[12%] h-[420px] w-[420px] rounded-full bg-emerald-500/[0.025] blur-[120px]" />
          <div className="absolute right-[10%] top-[40%] h-[300px] w-[300px] rounded-full bg-amber-400/[0.018] blur-[100px]" />
        </div>

        {/* HERO */}
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-[32px] border border-white/[0.07] bg-[#090b0b] shadow-[0_25px_80px_rgba(0,0,0,0.22)]"
        >
          <div className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full bg-emerald-400/[0.075] blur-[90px]" />
          <div className="pointer-events-none absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-amber-400/[0.025] blur-[90px]" />
          <div className="pointer-events-none absolute left-1/2 top-0 h-px w-[65%] -translate-x-1/2 bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" />

          <div className="relative px-6 py-7 md:px-9 md:py-9">
            <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <div className="mb-5 flex flex-wrap items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-emerald-400/15 bg-emerald-400/[0.06] text-emerald-300">
                    <Sparkles size={13} />
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-[0.24em] text-emerald-400">Student Voice</span>

                  <AnimatePresence>
                    {unreadCount > 0 && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="ml-2 inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-bold text-emerald-300"
                      >
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        </span>
                        {unreadCount} new {unreadCount === 1 ? "idea" : "ideas"}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>

                <h1 className="text-3xl font-black tracking-[-0.04em] text-white md:text-4xl">
                  Make Sports Block<span className="text-zinc-600"> better.</span>
                </h1>

                <p className="mt-4 max-w-xl text-sm leading-7 text-zinc-500 md:text-[15px]">
                  Speak freely.<span className="text-zinc-400"> Stay anonymous.</span>
                </p>

                <div className="mt-6 inline-flex items-center gap-2.5 rounded-full border border-amber-400/10 bg-amber-400/[0.035] px-3.5 py-2">
                  <ShieldCheck size={14} className="text-amber-300" />
                  <span className="text-[10px] font-medium text-zinc-500">
                    Nobody can tell who wrote what. Ideas disappear after 2 months.
                  </span>
                </div>
              </div>

              <motion.button
                type="button"
                onClick={() => openComposer()}
                whileHover={{ y: -3, scale: 1.015 }}
                whileTap={{ scale: 0.97 }}
                className="group relative flex shrink-0 items-center gap-3 overflow-hidden rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.08] px-5 py-3.5 text-sm font-semibold text-emerald-300 shadow-[0_0_30px_rgba(16,185,129,0.05)] transition-all hover:border-emerald-400/35 hover:bg-emerald-400/[0.13] hover:shadow-[0_0_35px_rgba(16,185,129,0.1)]"
              >
                <span className="pointer-events-none absolute inset-y-0 -left-[100%] w-[60%] skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/[0.08] to-transparent transition-all duration-700 group-hover:left-[140%]" />

                {/* unread dot, right where the writing starts */}
                {unreadCount > 0 && (
                  <span className="absolute right-3 top-3 flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-300" />
                  </span>
                )}

                <span className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-400/10">
                  <Plus size={16} className="transition-transform duration-300 group-hover:rotate-90" />
                </span>
                <span className="relative pr-3">Share your idea</span>
              </motion.button>
            </div>
          </div>
        </motion.section>

        {/* TOAST / ERROR */}
        <AnimatePresence>
          {notice && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              className="mt-5 flex items-center gap-3 rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.05] px-4 py-3.5 text-sm text-emerald-300"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-400/10">
                <Check size={14} />
              </span>
              <span>{notice}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {error && !composerOpen && (
          <div className="mt-5 rounded-2xl border border-red-400/10 bg-red-400/[0.04] px-4 py-3 text-xs text-red-300">{error}</div>
        )}

        {/* DRAFTS */}
        <AnimatePresence>
          {drafts.length > 0 && (
            <motion.section
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-8 overflow-hidden"
            >
              <div className="mb-3 flex items-center gap-2 px-1">
                <FilePenLine size={14} className="text-amber-300" />
                <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-300/80">
                  Your drafts · {drafts.length}
                </span>
                <span className="text-[10px] text-zinc-700">Only visible to you, on this device</span>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <AnimatePresence initial={false}>
                  {drafts.map((draft) => (
                    <motion.div
                      key={draft.id}
                      layout
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="group flex flex-col justify-between rounded-2xl border border-amber-400/10 bg-amber-400/[0.025] p-4 transition-colors hover:border-amber-400/25"
                    >
                      <p className="line-clamp-3 text-[13px] leading-6 text-zinc-300">{draft.message}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-[10px] text-zinc-600">
                          Saved {formatSuggestionDate(draft.updatedAt)}, {formatSuggestionTime(draft.updatedAt)}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openComposer(draft)}
                            className="rounded-lg border border-emerald-400/20 bg-emerald-400/[0.07] px-3 py-1.5 text-[11px] font-semibold text-emerald-300 transition hover:bg-emerald-400/[0.14]"
                          >
                            Continue
                          </button>
                          <button
                            type="button"
                            aria-label="Discard draft"
                            onClick={() => updateDrafts(drafts.filter((d) => d.id !== draft.id))}
                            className="rounded-lg p-1.5 text-zinc-600 transition hover:bg-red-500/10 hover:text-red-400"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* WALL HEADER + DATE FILTER */}
        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
              <span className="text-[9px] font-semibold uppercase tracking-[0.28em] text-emerald-400/70">Community wall</span>
            </div>
            <h2 className="text-xl font-semibold tracking-tight text-white">What people are saying</h2>
          </div>

          <div className="flex items-center gap-2">
            <label className="relative flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.02] px-3 py-2 text-xs text-zinc-400 transition focus-within:border-emerald-400/30 hover:border-white/15">
              <CalendarDays size={14} className="text-emerald-400/70" />
              <span className="text-[10px] uppercase tracking-wider text-zinc-600">Date</span>
              <input
                type="date"
                value={dateFilter}
                max={todayKey()}
                onChange={(event) => {
                  const value = event.target.value;
                  // Only past (or today's) dates are allowed.
                  setDateFilter(value && value > todayKey() ? "" : value);
                }}
                className="bg-transparent text-xs text-zinc-200 outline-none [color-scheme:dark]"
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
                  className="flex items-center gap-1 rounded-xl border border-white/[0.07] px-3 py-2 text-[11px] text-zinc-400 transition hover:border-emerald-400/30 hover:text-emerald-300"
                >
                  <X size={12} /> Clear
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="h-40 animate-pulse rounded-[24px] border border-white/[0.05] bg-white/[0.018]" />
            ))}
          </div>
        )}

        {/* EMPTY */}
        {!loading && visible.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 overflow-hidden rounded-[28px] border border-white/[0.06] bg-[#090b0b] px-6 py-16 text-center"
          >
            <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-[20px] border border-emerald-400/10 bg-emerald-400/[0.04] text-emerald-400/70">
              <div className="absolute inset-0 rounded-[20px] bg-emerald-400/[0.04] blur-xl" />
              <Lightbulb size={25} className="relative" strokeWidth={1.5} />
            </div>
            <h3 className="mt-5 text-base font-semibold text-zinc-300">
              {dateFilter ? "Nothing was shared on this day." : "The wall is quiet."}
            </h3>
            <p className="mx-auto mt-2 max-w-sm text-xs leading-6 text-zinc-600">
              {dateFilter ? "Try another date, or clear the filter." : "Maybe your idea should be the first one people see."}
            </p>
            <button
              type="button"
              onClick={() => (dateFilter ? setDateFilter("") : openComposer())}
              className="mt-5 text-xs font-semibold text-emerald-400 transition-colors hover:text-emerald-300"
            >
              {dateFilter ? "Clear filter" : "Share the first idea"}
            </button>
          </motion.div>
        )}

        {/* LIST */}
        {!loading && visible.length > 0 && (
          <section className="mx-auto mt-6 w-full max-w-4xl">
            <p className="mb-4 px-1 text-right text-[9px] uppercase tracking-[0.2em] text-zinc-700">
              {visible.length} {visible.length === 1 ? "idea" : "ideas"}
            </p>

            <div className="space-y-4">
              {visible.map((suggestion, index) => {
                const fresh = !ownIds.includes(suggestion.id) && isNewSuggestion(suggestion, lastSeenAt);
                return (
                  <motion.article
                    key={suggestion.id}
                    initial={{ opacity: 0, y: 22, scale: 0.985 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.45, delay: Math.min(index, 6) * 0.07, ease: "easeOut" }}
                    whileHover={{ y: -3 }}
                    className={`group relative overflow-hidden rounded-[22px] border bg-[#090c0c] px-5 py-5 shadow-[0_15px_45px_rgba(0,0,0,0.22)] transition-all duration-300 hover:bg-[#0b0f0f] sm:px-6 ${
                      fresh ? "border-emerald-400/25" : "border-white/[0.07] hover:border-emerald-400/[0.16]"
                    }`}
                  >
                    <div className="pointer-events-none absolute -right-24 -top-24 h-48 w-48 rounded-full bg-emerald-400/[0.045] opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />

                    <div className="relative flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[13px] border border-emerald-400/[0.12] bg-emerald-400/[0.045] text-emerald-400/75">
                          <div className="absolute h-6 w-6 rounded-full bg-emerald-400/[0.12] blur-lg" />
                          <Lightbulb size={17} strokeWidth={1.7} className="relative" />
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-zinc-500">
                          <span className="flex items-center gap-1.5 font-medium text-zinc-300">
                            <CalendarDays size={12} className="text-emerald-400/60" />
                            {formatSuggestionDate(suggestion.createdAt)}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock3 size={12} className="text-zinc-600" />
                            {formatSuggestionTime(suggestion.createdAt)}
                          </span>
                        </div>
                      </div>

                      {fresh && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 400, damping: 14, delay: 0.2 }}
                          className="flex items-center gap-1.5 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-300"
                        >
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                          </span>
                          New
                        </motion.span>
                      )}
                    </div>

                    <p className="relative mt-5 max-w-3xl whitespace-pre-wrap break-words text-[14px] leading-7 text-zinc-300 transition-colors duration-300 group-hover:text-zinc-200">
                      {suggestion.message}
                    </p>
                  </motion.article>
                );
              })}
            </div>
          </section>
        )}

        {/* MOBILE FAB */}
        <motion.button
          type="button"
          onClick={() => openComposer()}
          whileTap={{ scale: 0.92 }}
          className="fixed bottom-6 right-6 z-30 flex h-12 w-12 items-center justify-center rounded-full border border-emerald-400/20 bg-[#0b0e0e] text-emerald-300 shadow-[0_10px_35px_rgba(0,0,0,0.5)] md:hidden"
        >
          <MessageSquarePlus size={19} />
          {unreadCount > 0 && (
            <span className="absolute right-0 top-0 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full border-2 border-[#0b0e0e] bg-emerald-300" />
            </span>
          )}
        </motion.button>

        {/* COMPOSER */}
        <AnimatePresence>
          {composerOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeComposer}
                className="fixed inset-0 z-[60] bg-black/75 backdrop-blur-md"
              />

              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.97 }}
                transition={{ type: "spring", stiffness: 350, damping: 28 }}
                className="fixed left-1/2 top-1/2 z-[61] w-[calc(100%-24px)] max-w-[580px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#090b0b] shadow-[0_40px_120px_rgba(0,0,0,0.8)]"
              >
                <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-emerald-400/[0.065] blur-3xl" />

                <div className="relative flex items-center justify-between border-b border-white/[0.06] px-5 py-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/15 bg-emerald-400/[0.06] text-emerald-300">
                      <Lightbulb size={18} />
                    </div>
                    <div>
                      <h3 className="text-[15px] font-semibold text-white">
                        {editingDraftId ? "Continue your draft" : "What's on your mind?"}
                      </h3>
                      <p className="mt-0.5 text-[10px] text-zinc-600">Share it with the community.</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={submitting}
                    onClick={closeComposer}
                    aria-label="Close"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-600 transition-colors hover:bg-white/[0.04] hover:text-zinc-300 disabled:opacity-40"
                  >
                    <X size={17} />
                  </button>
                </div>

                <div className="relative px-5 py-5">
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">Your suggestion</label>
                    <span className="text-[9px] text-zinc-700">
                      {message.length}/{SUGGESTION_MAX_LENGTH}
                    </span>
                  </div>

                  <textarea
                    autoFocus
                    value={message}
                    onChange={(event) => setMessage(event.target.value.slice(0, SUGGESTION_MAX_LENGTH))}
                    placeholder="Write your suggestion..."
                    rows={6}
                    className="w-full resize-none rounded-2xl border border-white/[0.07] bg-white/[0.02] px-4 py-4 text-sm leading-7 text-zinc-200 outline-none transition-all duration-300 placeholder:text-zinc-700 focus:border-emerald-400/25 focus:bg-emerald-400/[0.018] focus:ring-1 focus:ring-emerald-400/10"
                  />

                  <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-400/[0.08] bg-amber-400/[0.025] px-3.5 py-3">
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-400/[0.06] text-amber-400/70">
                      <ShieldCheck size={14} />
                    </div>
                    <div>
                      <p className="text-[10px] font-medium text-zinc-400">Your identity stays private</p>
                      <p className="mt-0.5 text-[9px] leading-5 text-zinc-600">
                        We don&apos;t store who wrote a suggestion. Others only see the date and time.
                      </p>
                    </div>
                  </div>

                  {error && composerOpen && <p className="mt-3 text-xs text-red-300">{error}</p>}

                  <div className="mt-5 flex flex-wrap items-center justify-end gap-3">
                    <button
                      type="button"
                      disabled={submitting || !message.trim()}
                      onClick={saveDraft}
                      className="flex items-center gap-2 rounded-xl border border-amber-400/15 bg-amber-400/[0.05] px-4 py-2.5 text-xs font-semibold text-amber-300 transition-all hover:bg-amber-400/[0.1] disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <Save size={14} /> Save draft
                    </button>

                    <motion.button
                      type="button"
                      disabled={submitting || message.trim().length < 3}
                      onClick={() => void publish()}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      className="flex items-center gap-2 rounded-xl border border-emerald-400/15 bg-emerald-400/[0.07] px-4 py-2.5 text-xs font-semibold text-emerald-300 shadow-[0_0_25px_rgba(52,211,153,0.04)] transition-all duration-300 hover:border-emerald-400/25 hover:bg-emerald-400/[0.11] disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      {submitting ? (
                        <>
                          <Loader2 size={14} className="animate-spin" /> Publishing...
                        </>
                      ) : (
                        <>
                          <MessageSquarePlus size={14} /> Publish
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
