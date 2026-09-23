"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AnimatePresence,
  motion,
} from "framer-motion";
import {
  Bell,
  CalendarDays,
  ChevronRight,
  Clock3,
  Dumbbell,
  Wrench,
  X,
} from "lucide-react";

import {
  getViewedNoticeIds,
  markNoticesAsViewed,
} from "@/lib/noticeState";

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

type NotificationPanelProps = {
  open: boolean;
  onClose: () => void;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";

export default function NotificationPanel({
  open,
  onClose,
}: NotificationPanelProps) {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    const fetchNotices = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          `${API_BASE_URL}/notices`,
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            "Failed to fetch announcements"
          );
        }

        const data = await response.json();

        setNotices(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (error) {
        console.error(
          "NOTIFICATION PANEL ERROR:",
          error
        );

        setNotices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotices();
  }, [open]);

  const unreadNotices = useMemo(() => {
    const viewedIds = getViewedNoticeIds();

    return [...notices]
      .filter(
        (notice) =>
          !viewedIds.includes(notice.id)
      )
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      );
  }, [notices]);

  const handleClose = () => {
    if (unreadNotices.length > 0) {
      markNoticesAsViewed(
        unreadNotices.map(
          (notice) => notice.id
        )
      );
    }

    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* BACKDROP */}

          <motion.button
            type="button"
            aria-label="Close notifications"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="
              fixed
              inset-0
              z-40
              cursor-default
              bg-black/20
              md:bg-transparent
            "
          />

          {/* PANEL */}

          <motion.div
            initial={{
              opacity: 0,
              y: -8,
              scale: 0.98,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: -8,
              scale: 0.98,
            }}
            transition={{
              duration: 0.18,
              ease: "easeOut",
            }}
            className="
              fixed
              right-3
              top-[68px]
              z-50
              w-[calc(100vw-24px)]
              max-w-[390px]
              overflow-hidden
              rounded-2xl
              border
              border-zinc-800
              bg-zinc-950
              shadow-[0_25px_80px_rgba(0,0,0,0.45)]
              sm:right-5
              md:right-8
            "
          >
            {/* HEADER */}

            <div
              className="
                flex
                items-center
                justify-between
                border-b
                border-zinc-800
                px-4
                py-3.5
              "
            >
              <div className="flex items-center gap-3">
                <div
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-xl
                    bg-emerald-500/10
                    text-emerald-400
                  "
                >
                  <Bell size={17} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-white">
                    Announcements
                  </p>

                  <p className="text-[11px] text-zinc-600">
                    {unreadNotices.length > 0
                      ? `${unreadNotices.length} new update${
                          unreadNotices.length === 1
                            ? ""
                            : "s"
                        }`
                      : "You're all caught up"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-lg
                  text-zinc-600
                  transition
                  hover:bg-white/[0.05]
                  hover:text-zinc-300
                "
                aria-label="Close announcements"
              >
                <X size={16} />
              </button>
            </div>

            {/* CONTENT */}

            <div className="max-h-[420px] overflow-y-auto">
              {loading && (
                <div className="space-y-3 p-4">
                  {[1, 2].map((item) => (
                    <div
                      key={item}
                      className="
                        animate-pulse
                        rounded-xl
                        border
                        border-zinc-800
                        bg-zinc-900/50
                        p-4
                      "
                    >
                      <div className="h-3 w-32 rounded bg-zinc-800" />

                      <div className="mt-3 h-3 w-full rounded bg-zinc-800" />

                      <div className="mt-2 h-3 w-3/4 rounded bg-zinc-800" />
                    </div>
                  ))}
                </div>
              )}

              {!loading &&
                unreadNotices.length === 0 && (
                  <div className="px-5 py-12 text-center">
                    <motion.div
                      initial={{
                        scale: 0.8,
                        opacity: 0,
                      }}
                      animate={{
                        scale: 1,
                        opacity: 1,
                      }}
                      className="
                        mx-auto
                        flex
                        h-12
                        w-12
                        items-center
                        justify-center
                        rounded-full
                        bg-emerald-500/10
                        text-emerald-400
                      "
                    >
                      <Bell size={20} />
                    </motion.div>

                    <p className="mt-4 text-sm font-semibold text-zinc-300">
                      All caught up
                    </p>

                    <p className="mt-1 text-xs text-zinc-600">
                      No new announcements right now.
                    </p>
                  </div>
                )}

              {!loading &&
                unreadNotices.length > 0 && (
                  <div className="space-y-2 p-3">
                    {unreadNotices.map(
                      (notice, index) => (
                        <NoticeItem
                          key={notice.id}
                          notice={notice}
                          index={index}
                        />
                      )
                    )}
                  </div>
                )}
            </div>

            {/* FOOTER */}

            {unreadNotices.length > 0 && (
              <div
                className="
                  border-t
                  border-zinc-800
                  px-4
                  py-3
                "
              >
                <button
                  type="button"
                  onClick={handleClose}
                  className="
                    flex
                    w-full
                    items-center
                    justify-between
                    text-xs
                    font-medium
                    text-zinc-500
                    transition
                    hover:text-emerald-400
                  "
                >
                  <span>
                    Close and mark as viewed
                  </span>

                  <ChevronRight size={14} />
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function NoticeItem({
  notice,
  index,
}: {
  notice: Notice;
  index: number;
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 8,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        delay: index * 0.04,
        duration: 0.2,
      }}
      className="
        group
        rounded-xl
        border
        border-zinc-800
        bg-zinc-900/50
        p-3.5
        transition
        hover:border-emerald-500/20
        hover:bg-zinc-900
      "
    >
      <div className="flex gap-3">
        <div
          className="
            flex
            h-8
            w-8
            shrink-0
            items-center
            justify-center
            rounded-lg
            bg-emerald-500/10
            text-emerald-400
          "
        >
          {getNoticeIcon(notice.type)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold leading-5 text-zinc-200">
              {notice.title}
            </p>

            <span
              className="
                shrink-0
                rounded-full
                bg-emerald-500/10
                px-2
                py-0.5
                text-[9px]
                font-bold
                uppercase
                tracking-wider
                text-emerald-400
              "
            >
              New
            </span>
          </div>

          {notice.sport?.name && (
            <p className="mt-0.5 text-[10px] font-medium text-emerald-500/70">
              {notice.sport.name}
            </p>
          )}

          <p className="mt-2 line-clamp-3 text-xs leading-5 text-zinc-500">
            {notice.message}
          </p>

          <div className="mt-2 flex items-center gap-1.5 text-[10px] text-zinc-700">
            <Clock3 size={11} />

            {formatDate(notice.createdAt)}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function getNoticeIcon(type: string) {
  switch (type?.toLowerCase()) {
    case "maintenance":
      return <Wrench size={15} />;

    case "booking":
      return <CalendarDays size={15} />;

    case "sport":
      return <Dumbbell size={15} />;

    case "equipment":
      return <Dumbbell size={15} />;

    default:
      return <Bell size={15} />;
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
  const diff =
    now.getTime() - date.getTime();

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) {
    return "Just now";
  }

  if (diff < hour) {
    return `${Math.floor(
      diff / minute
    )} min ago`;
  }

  if (diff < day) {
    return `${Math.floor(
      diff / hour
    )} hr ago`;
  }

  if (diff < 7 * day) {
    const days = Math.floor(
      diff / day
    );

    return `${days} day${
      days === 1 ? "" : "s"
    } ago`;
  }

  return date.toLocaleDateString();
}