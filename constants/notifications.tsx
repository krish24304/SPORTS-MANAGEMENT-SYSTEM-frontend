"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  CalendarDays,
  Dumbbell,
  Megaphone,
  ShieldAlert,
  Wrench,
} from "lucide-react";

type Notice = {
  id: number;
  title: string;
  message: string;
  type: string;
  sportId: number | null;
  createdAt: string;
  sport?: {
    name: string;
  } | null;
};

type FormattedNotice = Notice & {
  date: string;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function Notifications() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_BASE_URL}/notices`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch notifications");
        }

        const data = await response.json();

        setNotices(
          Array.isArray(data)
            ? [...data].sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime()
              )
            : []
        );
      } catch (err) {
        console.error("NOTIFICATIONS ERROR:", err);
        setError("Unable to load notifications.");
      } finally {
        setLoading(false);
      }
    };

    fetchNotices();
  }, []);

  const formattedNotices = useMemo<FormattedNotice[]>(() => {
    return [...notices]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      )
      .map((notice) => ({
        ...notice,
        date: formatDate(notice.createdAt),
      }));
  }, [notices]);

  return (
    <div className="w-full">
      {/* PAGE HEADER */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
            <Bell size={19} />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Announcements
            </h1>

            <p className="mt-1 text-sm text-zinc-500">
              Important updates from Sports Block.
            </p>
          </div>
        </div>
      </motion.div>

      {/* LOADING */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((item) => (
            <motion.div
              key={item}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5"
            >
              <div className="animate-pulse">
                <div className="flex gap-4">
                  <div className="h-10 w-10 shrink-0 rounded-xl bg-zinc-900" />

                  <div className="min-w-0 flex-1">
                    <div className="h-4 w-2/5 rounded bg-zinc-900" />
                    <div className="mt-3 h-3 w-full rounded bg-zinc-900" />
                    <div className="mt-2 h-3 w-4/5 rounded bg-zinc-900" />
                    <div className="mt-4 h-3 w-20 rounded bg-zinc-900" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ERROR */}
      {!loading && error && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-red-500/20 bg-red-500/[0.05] p-5"
        >
          <div className="flex items-start gap-3">
            <ShieldAlert
              size={19}
              className="mt-0.5 shrink-0 text-red-400"
            />

            <div>
              <p className="font-medium text-red-300">
                Unable to load announcements
              </p>

              <p className="mt-1 text-sm text-red-400/70">
                {error}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* EMPTY */}
      {!loading && !error && formattedNotices.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-zinc-800 bg-zinc-950 px-6 py-14 text-center"
        >
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900 text-zinc-600">
            <Bell size={20} />
          </div>

          <h2 className="mt-4 text-base font-semibold text-zinc-300">
            No announcements
          </h2>

          <p className="mt-1 text-sm text-zinc-600">
            You&apos;re all caught up.
          </p>
        </motion.div>
      )}

      {/* ANNOUNCEMENTS */}
      {!loading && !error && formattedNotices.length > 0 && (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {formattedNotices.map((notice, index) => (
              <NotificationCard
                key={notice.id}
                notice={notice}
                index={index}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function NotificationCard({
  notice,
  index,
}: {
  notice: FormattedNotice;
  index: number;
}) {
  const isSportNotice = !!notice.sportId;

  return (
    <motion.article
      layout
      initial={{
        opacity: 0,
        y: 14,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      exit={{
        opacity: 0,
        y: -10,
      }}
      transition={{
        duration: 0.3,
        delay: index * 0.045,
      }}
      whileHover={{
        y: -2,
      }}
      className="group relative w-full max-w-3xl rounded-2xl border border-zinc-800 bg-zinc-950 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.18)] transition-colors duration-300 hover:border-zinc-700 hover:bg-zinc-900/80 md:p-6"
    >
      {/* SUBTLE HOVER GLOW */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-emerald-500/[0.02] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative flex items-start gap-4">
        {/* ICON */}
        <div
          className={`
            flex h-10 w-10 shrink-0 items-center justify-center rounded-xl
            border transition-all duration-300 group-hover:scale-105
            ${
              notice.type?.toLowerCase() === "urgent"
                ? "border-red-500/20 bg-red-500/10 text-red-400"
                : notice.type?.toLowerCase() === "maintenance"
                  ? "border-amber-500/20 bg-amber-500/10 text-amber-400"
                  : "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
            }
          `}
        >
          {getNoticeIcon(notice.type)}
        </div>

        {/* CONTENT */}
        <div className="min-w-0 flex-1">
          {/* TOP ROW */}
          <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
            <h2 className="text-sm font-semibold text-zinc-100 transition-colors group-hover:text-emerald-300 md:text-base">
              {notice.title}
            </h2>

            <span className="shrink-0 text-[11px] text-zinc-600">
              {notice.date}
            </span>
          </div>

          {/* MESSAGE */}
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
            {notice.message}
          </p>

          {/* FOOTER */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {isSportNotice && notice.sport?.name ? (
              <span className="inline-flex items-center rounded-full border border-emerald-500/15 bg-emerald-500/[0.06] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-400">
                {notice.sport.name}
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                General
              </span>
            )}

            <span className="text-[10px] text-zinc-700">•</span>

            <span className="text-[10px] text-zinc-600">
              Sports Block
            </span>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function getNoticeIcon(type: string) {
  switch (type?.toLowerCase()) {
    case "maintenance":
      return <Wrench size={18} />;

    case "booking":
      return <CalendarDays size={18} />;

    case "sport":
      return <Dumbbell size={18} />;

    case "equipment":
      return <Dumbbell size={18} />;

    case "urgent":
      return <ShieldAlert size={18} />;

    default:
      return <Megaphone size={18} />;
  }
}

function formatDate(value: string) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) {
    return "Just now";
  }

  if (diff < hour) {
    const minutes = Math.floor(diff / minute);
    return `${minutes} min ago`;
  }

  if (diff < day) {
    const hours = Math.floor(diff / hour);
    return `${hours} hr ago`;
  }

  if (diff < 7 * day) {
    const days = Math.floor(diff / day);
    return `${days} day${days === 1 ? "" : "s"} ago`;
  }

  return date.toLocaleDateString();
}