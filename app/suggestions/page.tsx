"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  Clock3,
  Lightbulb,
  Loader2,
  MessageSquarePlus,
  Plus,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";

import DashboardLayout from "@/components/layout/DashboardLayout";

type Suggestion = {
  id: number;
  message: string;
  displayName?: string;
  date?: string;
  time?: string;
  createdAt?: string;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const MAX_LENGTH = 1000;

function formatDate(item: Suggestion) {
  if (item.createdAt) {
    const date = new Date(item.createdAt);

    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
      });
    }
  }

  return item.date || "Recently";
}

function formatTime(item: Suggestion) {
  if (item.createdAt) {
    const date = new Date(item.createdAt);

    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "2-digit",
      });
    }
  }

  return item.time || "";
}

export default function SuggestionsPage() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);

  const [composerOpen, setComposerOpen] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const loadSuggestions = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/anonymous-requests`,
        {
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load suggestions");
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        setSuggestions([]);
        return;
      }

      const sorted = [...data].sort((a, b) => {
        return (
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
        );
      });

      setSuggestions(sorted);
    } catch (err) {
      console.error(err);
      setError("Unable to load suggestions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuggestions();
  }, []);

  const submitSuggestion = async () => {
    const cleanMessage = message.trim();

    if (!cleanMessage) return;

    if (cleanMessage.length > MAX_LENGTH) return;

    try {
      setSubmitting(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/anonymous-requests`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: cleanMessage,
            displayName: displayName.trim() || undefined,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to submit suggestion");
      }

      const created = await response.json();

      setSuggestions((current) => [
        created,
        ...current,
      ]);

      setMessage("");
      setDisplayName("");
      setComposerOpen(false);
      setSuccess(true);

      window.setTimeout(() => {
        setSuccess(false);
      }, 3200);
    } catch (err) {
      console.error(err);

      setError(
        "Something went wrong while publishing your suggestion."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout title="Share a Suggestion">
      <div className="relative mx-auto w-full max-w-6xl pb-16">

        {/* =====================================================
            AMBIENT PAGE LIGHT
        ====================================================== */}

        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute left-[35%] top-[12%] h-[420px] w-[420px] rounded-full bg-emerald-500/[0.025] blur-[120px]" />

          <div className="absolute right-[10%] top-[40%] h-[300px] w-[300px] rounded-full bg-amber-400/[0.018] blur-[100px]" />
        </div>

        {/* =====================================================
            HERO
        ====================================================== */}

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="
            relative overflow-hidden
            rounded-[32px]
            border border-white/[0.07]
            bg-[#090b0b]
            shadow-[0_25px_80px_rgba(0,0,0,0.22)]
          "
        >
          {/* glow */}

          <div className="
            pointer-events-none absolute
            -right-24 -top-28
            h-80 w-80
            rounded-full
            bg-emerald-400/[0.075]
            blur-[90px]
          " />

          <div className="
            pointer-events-none absolute
            -bottom-32 -left-24
            h-72 w-72
            rounded-full
            bg-amber-400/[0.025]
            blur-[90px]
          " />

          {/* top light */}

          <div className="
            pointer-events-none absolute
            left-1/2 top-0
            h-px w-[65%]
            -translate-x-1/2
            bg-gradient-to-r
            from-transparent
            via-emerald-400/40
            to-transparent
          " />

          <div className="relative px-6 py-7 md:px-9 md:py-9">

            <div className="
              flex flex-col
              gap-7
              lg:flex-row
              lg:items-end
              lg:justify-between
            ">

              {/* LEFT */}

              <div className="max-w-2xl">

                <div className="
                  mb-5 flex items-center gap-2
                ">
                  <div className="
                    flex h-7 w-7
                    items-center justify-center
                    rounded-lg
                    border border-emerald-400/15
                    bg-emerald-400/[0.06]
                    text-emerald-300
                  ">
                    <Sparkles size={13} />
                  </div>

                  <span className="
                    text-[9px]
                    font-bold
                    uppercase
                    tracking-[0.24em]
                    text-emerald-400
                  ">
                    Student Voice
                  </span>
                </div>

                <h1 className="
                  text-3xl
                  font-black
                  tracking-[-0.04em]
                  text-white
                  md:text-4xl
                ">
                  Make Sports Block
                  <span className="text-zinc-600">
                    {" "}better.
                  </span>
                </h1>

                <p className="
                  mt-4
                  max-w-xl
                  text-sm
                  leading-7
                  text-zinc-500
                  md:text-[15px]
                ">
                  Speak freely.
                  <span className="text-zinc-400">
                    {" "}Stay anonymous.
                  </span>
                </p>

                {/* PRIVACY PILL */}

                <div className="
                  mt-6
                  inline-flex
                  items-center gap-2.5
                  rounded-full
                  border
                  border-amber-400/10
                  bg-amber-400/[0.035]
                  px-3.5 py-2
                ">
                  <ShieldCheck
                    size={14}
                    className="text-amber-300"
                  />

                  <span className="
                    text-[10px]
                    font-medium
                    text-zinc-500
                  ">
                    Anonymous by design
                  </span>
                </div>
              </div>

              {/* ACTION */}

              <motion.button
                type="button"
                onClick={() => {
                  setComposerOpen(true);
                  setError("");
                }}
                whileHover={{
                  y: -3,
                  scale: 1.015,
                }}
                whileTap={{
                  scale: 0.97,
                }}
                className="
                  group
                  relative
                  flex
                  shrink-0
                  items-center
                  gap-3
                  overflow-hidden
                  rounded-2xl
                  border
                  border-emerald-400/20
                  bg-emerald-400/[0.08]
                  px-5 py-3.5
                  text-sm
                  font-semibold
                  text-emerald-300
                  shadow-[0_0_30px_rgba(16,185,129,0.05)]
                  transition-all
                  hover:border-emerald-400/35
                  hover:bg-emerald-400/[0.13]
                  hover:shadow-[0_0_35px_rgba(16,185,129,0.1)]
                "
              >
                <span className="
                  pointer-events-none
                  absolute inset-y-0
                  -left-[100%]
                  w-[60%]
                  skew-x-[-20deg]
                  bg-gradient-to-r
                  from-transparent
                  via-white/[0.08]
                  to-transparent
                  transition-all
                  duration-700
                  group-hover:left-[140%]
                " />

                <span className="
                  relative flex h-7 w-7
                  items-center justify-center
                  rounded-lg
                  bg-emerald-400/10
                ">
                  <Plus
                    size={16}
                    className="
                      transition-transform
                      duration-300
                      group-hover:rotate-90
                    "
                  />
                </span>

                <span className="relative">
                  Share your idea
                </span>
              </motion.button>
            </div>
            </div>
        </motion.section>
        {/* =====================================================
            SUCCESS
        ====================================================== */}

        <AnimatePresence>
          {success && (
            <motion.div
              initial={{
                opacity: 0,
                y: -10,
                scale: 0.98,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: -10,
                scale: 0.98,
              }}
              className="
                mt-5
                flex items-center gap-3
                rounded-2xl
                border
                border-emerald-400/15
                bg-emerald-400/[0.05]
                px-4 py-3.5
                text-sm
                text-emerald-300
              "
            >
              <span className="
                flex h-7 w-7
                items-center justify-center
                rounded-full
                bg-emerald-400/10
              ">
                <Check size={14} />
              </span>

              <span>
                Your idea is now part of the community wall.
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* =====================================================
            ERROR
        ====================================================== */}

        {error && (
          <div className="
            mt-5
            rounded-2xl
            border border-red-400/10
            bg-red-400/[0.04]
            px-4 py-3
            text-xs
            text-red-300
          ">
            {error}
          </div>
        )}

        {/* =====================================================
            WALL HEADER
        ====================================================== */}

        <div className="
          mt-10
          flex items-end
          justify-between
          gap-4
        ">
          <div>
            <p className="
              text-[9px]
              font-bold
              uppercase
              tracking-[0.22em]
              text-zinc-700
            ">
              Community wall
            </p>

            <h2 className="
              mt-1.5
              text-xl
              font-bold
              tracking-tight
              text-white
            ">
              What people are saying
            </h2>
          </div>

          {!loading && suggestions.length > 0 && (
            <span className="
              rounded-full
              border border-white/[0.05]
              bg-white/[0.02]
              px-3 py-1.5
              text-[9px]
              font-medium
              text-zinc-600
            ">
              Latest first
            </span>
          )}
        </div>

        {/* =====================================================
            LOADING
        ====================================================== */}

        {loading && (
          <div className="
            mt-5
            grid
            gap-4
            md:grid-cols-2
          ">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="
                  h-52
                  animate-pulse
                  rounded-[24px]
                  border border-white/[0.05]
                  bg-white/[0.018]
                "
              />
            ))}
          </div>
        )}

        {/* =====================================================
    EMPTY
====================================================== */}
{!loading && suggestions.length === 0 && (
  <motion.div
    initial={{
      opacity: 0,
      y: 15,
    }}
    animate={{
      opacity: 1,
      y: 0,
    }}
    className="
      mt-5
      overflow-hidden
      rounded-[28px]
      border border-white/[0.06]
      bg-[#090b0b]
      px-6 py-16
      text-center
    "
  >
    <div
      className="
        relative mx-auto
        flex h-16 w-16
        items-center justify-center
        rounded-[20px]
        border
        border-emerald-400/10
        bg-emerald-400/[0.04]
        text-emerald-400/70
      "
    >
      <div
        className="
          absolute inset-0
          rounded-[20px]
          bg-emerald-400/[0.04]
          blur-xl
        "
      />

      <Lightbulb
        size={25}
        className="relative"
        strokeWidth={1.5}
      />
    </div>

    <h3
      className="
        mt-5
        text-base
        font-semibold
        text-zinc-300
      "
    >
      The wall is quiet.
    </h3>

    <p
      className="
        mx-auto mt-2
        max-w-sm
        text-xs
        leading-6
        text-zinc-600
      "
    >
      Maybe your idea should be the first one people see.
    </p>

    <button
      type="button"
      onClick={() => setComposerOpen(true)}
      className="
        mt-5
        text-xs
        font-semibold
        text-emerald-400
        transition-colors
        hover:text-emerald-300
      "
    >
      Share the first idea
    </button>
  </motion.div>
)}
{/* =====================================================
    SUGGESTIONS
====================================================== */}

{!loading && suggestions.length > 0 && (
  <motion.section
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
    className="mx-auto mt-10 w-full max-w-4xl"
  >
    {/* Section heading */}

    <div className="mb-6 flex items-end justify-between px-1">
      <div>
        <div className="mb-2 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]" />

          <span className="text-[9px] font-semibold uppercase tracking-[0.28em] text-emerald-400/70">
            Student voice
          </span>
        </div>

        <h2 className="text-xl font-semibold tracking-tight text-white">
          People are saying
        </h2>
      </div>

      <span className="pb-1 text-[9px] uppercase tracking-[0.2em] text-zinc-700">
        {suggestions.length}{" "}
        {suggestions.length === 1 ? "idea" : "ideas"}
      </span>
    </div>

    {/* Suggestions */}

    <div className="space-y-4">
      {suggestions.map((suggestion, index) => (
        <motion.article
          key={suggestion.id}
          initial={{
            opacity: 0,
            y: 22,
            scale: 0.985,
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          transition={{
            duration: 0.45,
            delay: Math.min(index, 6) * 0.07,
            ease: "easeOut",
          }}
          whileHover={{
            y: -3,
          }}
          className="
            group
            relative
            overflow-hidden
            rounded-[22px]
            border
            border-white/[0.07]
            bg-[#090c0c]
            px-5
            py-5
            shadow-[0_15px_45px_rgba(0,0,0,0.22)]
            transition-all
            duration-300
            hover:border-emerald-400/[0.16]
            hover:bg-[#0b0f0f]
            hover:shadow-[0_20px_60px_rgba(0,0,0,0.35)]
            sm:px-6
            sm:py-6
          "
        >
          {/* Soft ambient glow */}

          <div
            className="
              pointer-events-none
              absolute
              -right-24
              -top-24
              h-48
              w-48
              rounded-full
              bg-emerald-400/[0.045]
              blur-3xl
              opacity-0
              transition-opacity
              duration-500
              group-hover:opacity-100
            "
          />

          {/* Top row */}

          <div className="relative flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">

              {/* Display-name avatar */}

              <motion.div
                whileHover={{ scale: 1.06 }}
                className="
                  relative
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  overflow-hidden
                  rounded-[13px]
                  border
                  border-emerald-400/[0.12]
                  bg-emerald-400/[0.045]
                  text-emerald-400/75
                "
              >
                <div
                  className="
                    absolute
                    h-6
                    w-6
                    rounded-full
                    bg-emerald-400/[0.12]
                    blur-lg
                  "
                />

                <Lightbulb
                  size={17}
                  strokeWidth={1.7}
                  className="relative"
                />
              </motion.div>

              {/* Name */}

              <div className="min-w-0">
                <p
                  className="
                    truncate
                    text-[11px]
                    font-semibold
                    text-zinc-200
                    transition-colors
                    duration-200
                    group-hover:text-white
                  "
                >
                  {suggestion.displayName || "Student"}
                </p>

                <div className="mt-1 flex items-center gap-1.5">
                  <span className="text-[9px] text-zinc-600">
                    shared a suggestion
                  </span>

                  <span className="h-0.5 w-0.5 rounded-full bg-zinc-700" />

                  <span className="text-[9px] text-emerald-400/45">
                    private identity
                  </span>
                </div>
              </div>
            </div>

            {/* Date */}

            <div className="flex shrink-0 items-center gap-2">
              <motion.span
                animate={{
                  opacity: [0.35, 0.8, 0.35],
                }}
                transition={{
                  duration: 2.6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="
                  h-1.5
                  w-1.5
                  rounded-full
                  bg-emerald-400/75
                  shadow-[0_0_9px_rgba(52,211,153,0.45)]
                "
              />

              <span className="text-[9px] text-zinc-700">
                {suggestion.createdAt
                  ? new Date(
                      suggestion.createdAt
                    ).toLocaleDateString()
                  : ""}
              </span>
            </div>
          </div>

          {/* Suggestion body */}

          <div className="relative mt-5">
            <p
              className="
                max-w-3xl
                text-[14px]
                leading-7
                text-zinc-300
                transition-colors
                duration-300
                group-hover:text-zinc-200
              "
            >
              {suggestion.message}
            </p>
          </div>

          {/* Bottom accent */}

          <div className="relative mt-5 flex items-center justify-between border-t border-white/[0.05] pt-4">
            <div className="flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-emerald-400/50" />

              <span className="text-[8px] uppercase tracking-[0.18em] text-zinc-700">
                Community suggestion
              </span>
            </div>

            <motion.div
              initial={{ width: 20, opacity: 0.25 }}
              whileHover={{ width: 42, opacity: 0.8 }}
              className="
                h-px
                bg-gradient-to-r
                from-emerald-400/60
                to-transparent
              "
            />
          </div>

          {/* Hover border glow */}

          <div
            className="
              pointer-events-none
              absolute
              inset-0
              rounded-[22px]
              border
              border-emerald-400/0
              transition-all
              duration-500
              group-hover:border-emerald-400/[0.04]
            "
          />
        </motion.article>
      ))}
    </div>
  </motion.section>
)}

        {/* =====================================================
            MOBILE FLOATING ACTION
        ====================================================== */}

        <motion.button
          type="button"
          onClick={() => setComposerOpen(true)}
          whileTap={{ scale: 0.92 }}
          className="
            fixed
            bottom-6
            right-6
            z-30
            flex h-12 w-12
            items-center justify-center
            rounded-full
            border
            border-emerald-400/20
            bg-[#0b0e0e]
            text-emerald-300
            shadow-[0_10px_35px_rgba(0,0,0,0.5)]
            md:hidden
          "
        >
          <MessageSquarePlus size={19} />
        </motion.button>

        {/* =====================================================
            COMPOSER
        ====================================================== */}

        <AnimatePresence>
          {composerOpen && (
            <>
              {/* backdrop */}

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => {
                  if (!submitting) {
                    setComposerOpen(false);
                  }
                }}
                className="
                  fixed
                  inset-0
                  z-[60]
                  bg-black/75
                  backdrop-blur-md
                "
              />

              {/* modal */}

              <motion.div
                initial={{
                  opacity: 0,
                  y: 30,
                  scale: 0.96,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  y: 20,
                  scale: 0.97,
                }}
                transition={{
                  type: "spring",
                  stiffness: 350,
                  damping: 28,
                }}
                className="
                  fixed
                  left-1/2
                  top-1/2
                  z-[61]
                  w-[calc(100%-24px)]
                  max-w-[580px]
                  -translate-x-1/2
                  -translate-y-1/2
                  overflow-hidden
                  rounded-[28px]
                  border
                  border-white/[0.08]
                  bg-[#090b0b]
                  shadow-[0_40px_120px_rgba(0,0,0,0.8)]
                "
              >
                {/* ambient */}

                <div className="
                  pointer-events-none
                  absolute
                  -right-24
                  -top-24
                  h-64
                  w-64
                  rounded-full
                  bg-emerald-400/[0.065]
                  blur-3xl
                " />

                {/* header */}

                <div className="
                  relative
                  flex
                  items-center
                  justify-between
                  border-b
                  border-white/[0.06]
                  px-5
                  py-5
                ">
                  <div className="
                    flex items-center gap-3
                  ">
                    <div className="
                      flex h-10 w-10
                      items-center
                      justify-center
                      rounded-xl
                      border
                      border-emerald-400/15
                      bg-emerald-400/[0.06]
                      text-emerald-300
                    ">
                      <Lightbulb size={18} />
                    </div>

                    <div>
                      <h3 className="
                        text-[15px]
                        font-semibold
                        text-white
                      ">
                        What's on your mind?
                      </h3>

                      <p className="
                        mt-0.5
                        text-[10px]
                        text-zinc-600
                      ">
                        Share it with the community.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() =>
                      setComposerOpen(false)
                    }
                    className="
                      flex h-8 w-8
                      items-center
                      justify-center
                      rounded-lg
                      text-zinc-600
                      transition-colors
                      hover:bg-white/[0.04]
                      hover:text-zinc-300
                      disabled:opacity-40
                    "
                  >
                    <X size={17} />
                  </button>
                </div>

                {/* body */}

<div className="relative px-5 py-5">

  {/* display name */}

  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.08, duration: 0.35 }}
    className="mb-4"
  >

    <div className="
      mb-2
      flex
      items-center
      justify-between
    ">

      <label className="
        text-[10px]
        font-semibold
        uppercase
        tracking-[0.16em]
        text-zinc-500
      ">
        Display name
      </label>

      <span className="
        text-[9px]
        text-zinc-700
      ">
        Optional
      </span>

    </div>


    <input
      type="text"
      value={displayName}
      onChange={(event) => {
        if (event.target.value.length <= 30) {
          setDisplayName(event.target.value);
        }
      }}
      placeholder="e.g. CampusVoice"
      maxLength={30}
      className="
        w-full
        rounded-xl
        border
        border-white/[0.07]
        bg-white/[0.02]
        px-4
        py-3
        text-sm
        text-zinc-200
        outline-none
        placeholder:text-zinc-700
        transition-all
        duration-300
        focus:border-emerald-400/25
        focus:bg-emerald-400/[0.025]
        focus:ring-1
        focus:ring-emerald-400/10
      "
    />


    <p className="
      mt-1.5
      text-[9px]
      text-zinc-700
    ">
      Choose any name. Your real account name won't appear.
    </p>

  </motion.div>


  {/* suggestion */}

  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.14, duration: 0.35 }}
  >

    <div className="
      mb-2
      flex
      items-center
      justify-between
    ">

      <label className="
        text-[10px]
        font-semibold
        uppercase
        tracking-[0.16em]
        text-zinc-500
      ">
        Your suggestion
      </label>

      <span className="
        text-[9px]
        text-zinc-700
      ">
        {message.length}/{MAX_LENGTH}
      </span>

    </div>


    <motion.textarea
      autoFocus
      value={message}
      onChange={(event) => {

        if (
          event.target.value.length <= MAX_LENGTH
        ) {
          setMessage(event.target.value);
        }

      }}
      placeholder="Write your suggestion..."
      rows={6}

      whileFocus={{
        scale: 1.005,
      }}

      transition={{
        duration: 0.2,
      }}

      className="
        w-full
        resize-none
        rounded-2xl
        border
        border-white/[0.07]
        bg-white/[0.02]
        px-4
        py-4
        text-sm
        leading-7
        text-zinc-200
        outline-none
        placeholder:text-zinc-700
        transition-all
        duration-300
        focus:border-emerald-400/25
        focus:bg-emerald-400/[0.018]
        focus:ring-1
        focus:ring-emerald-400/10
      "
    />

  </motion.div>


  {/* privacy note */}

  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2, duration: 0.35 }}
    className="
      mt-4
      flex
      items-start
      gap-3
      rounded-xl
      border
      border-amber-400/[0.08]
      bg-amber-400/[0.025]
      px-3.5
      py-3
    "
  >

    <div className="
      mt-0.5
      flex
      h-7
      w-7
      shrink-0
      items-center
      justify-center
      rounded-lg
      bg-amber-400/[0.06]
      text-amber-400/70
    ">
      <ShieldCheck size={14} />
    </div>

    <div>

      <p className="
        text-[10px]
        font-medium
        text-zinc-400
      ">
        Your identity stays private
      </p>

      <p className="
        mt-0.5
        text-[9px]
        leading-5
        text-zinc-700
      ">
        Only your chosen display name is shown with the suggestion.
      </p>

    </div>

  </motion.div>


  {/* actions */}

  <div className="
    mt-5
    flex
    items-center
    justify-end
    gap-3
  ">

    <button
      type="button"
      disabled={submitting}
      onClick={() => {
        if (!submitting) {
          setComposerOpen(false);
        }
      }}
      className="
        rounded-xl
        px-4
        py-2.5
        text-xs
        font-medium
        text-zinc-600
        transition-all
        duration-200
        hover:bg-white/[0.035]
        hover:text-zinc-300
        disabled:opacity-40
      "
    >
      Cancel
    </button>


    <motion.button
      type="button"
      disabled={
        submitting ||
        !message.trim()
      }
      whileHover={{
        scale: 1.02,
      }}
      whileTap={{
        scale: 0.97,
      }}
      className="
        flex
        items-center
        gap-2
        rounded-xl
        border
        border-emerald-400/15
        bg-emerald-400/[0.07]
        px-4
        py-2.5
        text-xs
        font-semibold
        text-emerald-300
        shadow-[0_0_25px_rgba(52,211,153,0.04)]
        transition-all
        duration-300
        hover:border-emerald-400/25
        hover:bg-emerald-400/[0.11]
        hover:shadow-[0_0_30px_rgba(52,211,153,0.1)]
        disabled:cursor-not-allowed
        disabled:opacity-30
      "
    >

      {submitting ? (
        <>
          <Loader2
            size={14}
            className="animate-spin"
          />
          Publishing...
        </>
      ) : (
        <>
          <MessageSquarePlus size={14} />
          Publish suggestion
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
