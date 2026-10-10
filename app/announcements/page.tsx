"use client";

import { useEffect, useMemo, useState } from "react";
import { authFetch } from "@/lib/auth";
import { AnimatePresence, motion } from "framer-motion";
import {
  Megaphone,
  Trophy,
  CalendarDays,
  Info,
  Clock3,
} from "lucide-react";

import DashboardLayout from "@/components/layout/DashboardLayout";

type Announcement = {
  id: number;
  title: string;
  message: string;
  category: "Sport" | "General" | "Event";
  sport?: string;
  staffOnly?: boolean;
  createdAt: string;
  expiresAt: string;
  unread: boolean;
};

type NoticeResponse = {
  id: number;
  title: string;
  message: string;
  type: string;
  audience: string;
  createdAt: string;
  expiresAt: string | null;
  isRead: boolean;
  sport?: { name: string } | null;
};

function toCategory(type: string): Announcement["category"] {
  const value = type.toLowerCase();
  if (value === "sport") return "Sport";
  if (value === "event") return "Event";
  return "General";
}

function relativeTime(value: string) {
  const diff = Date.now() - new Date(value).getTime();
  if (Number.isNaN(diff)) return value;
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.round(hours / 24);
  return days === 1 ? "Yesterday" : `${days} days ago`;
}

function toAnnouncement(notice: NoticeResponse): Announcement {
  return {
    id: notice.id,
    title: notice.title,
    message: notice.message,
    category: toCategory(notice.type),
    sport: notice.sport?.name,
    createdAt: relativeTime(notice.createdAt),
    expiresAt: notice.expiresAt ?? "9999-12-31T23:59:59",
    unread: !notice.isRead,
    staffOnly: notice.audience === "staff_admin",
  };
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const response = await authFetch(`${API_BASE_URL}/notices`, { cache: "no-store" });
        if (!response.ok) throw new Error("Failed to load announcements");
        const data: NoticeResponse[] = await response.json();
        if (cancelled) return;
        setAnnouncements(Array.isArray(data) ? data.map(toAnnouncement) : []);
        setLoadError("");
      } catch {
        if (!cancelled) setLoadError("Unable to load announcements right now.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * Hide announcements after their expiry time (expiresAt comes from the
   * backend Notice model; notices without an expiry never expire).
   */
  const activeAnnouncements = useMemo(() => {
    const now = new Date();

    return announcements.filter(
      (announcement) =>
        new Date(announcement.expiresAt) > now
    );
  }, [announcements]);

  const openAnnouncement = async (id: number) => {
    setAnnouncements((current) =>
      current.map((announcement) =>
        announcement.id === id
          ? {
              ...announcement,
              unread: false,
            }
          : announcement
      )
    );

    try {
      await authFetch(`${API_BASE_URL}/notices/${id}/read`, { method: "POST" });
    } catch (error) {
      console.error("MARK ANNOUNCEMENT READ ERROR:", error);
    }
  };

  return (
    <DashboardLayout title="Announcements">
      <div className="space-y-8">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: 12,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.4,
          }}
          className="max-w-3xl"
        >
          <div className="flex items-center gap-3">

            {/* ICON */}

            <motion.div
              whileHover={{
                scale: 1.05,
                rotate: -3,
              }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 18,
              }}
              className="
                flex
                h-11
                w-11
                shrink-0
                items-center
                justify-center
                rounded-2xl
                border
                border-emerald-400/20
                bg-emerald-500/10
                text-emerald-400
                shadow-[0_0_25px_rgba(16,185,129,0.08)]
              "
            >
              <Megaphone size={20} />
            </motion.div>

            {/* TITLE */}

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
                Updates
              </p>

              <h2 className="mt-1 text-3xl font-black tracking-tight text-white md:text-4xl">
                Announcements
              </h2>
            </div>

          </div>

          <p className="mt-4 text-sm leading-6 text-zinc-500">
            Stay updated with what&apos;s happening around
            Sports Block.
          </p>
        </motion.div>


        {/* =====================================================
            ANNOUNCEMENTS
        ===================================================== */}

        <div className="max-w-3xl">

          <AnimatePresence mode="popLayout">

            {activeAnnouncements.map(
              (announcement, index) => (
                <AnnouncementCard
                  key={announcement.id}
                  announcement={announcement}
                  index={index}
                  onOpen={() =>
                    openAnnouncement(
                      announcement.id
                    )
                  }
                />
              )
            )}

          </AnimatePresence>


          {/* =================================================
              EMPTY STATE
          ================================================= */}

          {loadError && (
            <p role="alert" className="rounded-2xl border border-red-500/25 bg-red-500/[0.05] px-5 py-4 text-sm text-red-200">
              {loadError}
            </p>
          )}

          {loading && !loadError && (
            <p className="text-sm text-zinc-500" aria-busy="true">Loading announcements…</p>
          )}

          {!loading && !loadError && activeAnnouncements.length === 0 && (
            <motion.div
              initial={{
                opacity: 0,
                y: 10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              className="
                rounded-2xl
                border
                border-dashed
                border-zinc-800
                bg-zinc-950/40
                px-6
                py-14
                text-center
              "
            >
              <Megaphone
                size={28}
                className="mx-auto text-zinc-700"
              />

              <p className="mt-4 font-semibold text-zinc-300">
                No announcements
              </p>

              <p className="mt-1 text-sm text-zinc-600">
                There are no active announcements right now.
              </p>
            </motion.div>
          )}

        </div>

      </div>
    </DashboardLayout>
  );
}


/* =========================================================
   ANNOUNCEMENT CARD
   ========================================================= */

function AnnouncementCard({
  announcement,
  index,
  onOpen,
}: {
  announcement: Announcement;
  index: number;
  onOpen: () => void;
}) {
  const Icon =
    announcement.category === "Sport"
      ? Trophy
      : announcement.category === "Event"
        ? CalendarDays
        : Info;

  return (
    <motion.button
      type="button"
      layout
      onClick={onOpen}
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
        duration: 0.32,
        delay: index * 0.06,
      }}
      whileHover={{
        y: -2,
      }}
      whileTap={{
        scale: 0.995,
      }}
      className="
        group
        mb-4
        w-full
        rounded-2xl
        border
        border-zinc-800
        bg-zinc-950/80
        p-4
        text-left
        shadow-[0_15px_45px_rgba(0,0,0,0.12)]
        transition-all
        duration-300
        hover:border-emerald-500/20
        hover:bg-zinc-900/80
        hover:shadow-[0_20px_55px_rgba(0,0,0,0.20)]
      "
    >

      <div className="flex items-start gap-3">

        {/* =================================================
            ICON
        ================================================= */}

        <motion.div
          whileHover={{
            scale: 1.06,
          }}
          transition={{
            type: "spring",
            stiffness: 350,
            damping: 20,
          }}
          className="
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-emerald-500/10
            text-emerald-400
            transition-all
            duration-300
            group-hover:bg-emerald-500
            group-hover:text-black
          "
        >
          <Icon size={17} />
        </motion.div>


        {/* =================================================
            CONTENT
        ================================================= */}

        <div className="min-w-0 flex-1">

          {/* TITLE */}

          <div className="flex items-center gap-2">

            <span
              className="
                h-1.5
                w-1.5
                shrink-0
                rounded-full
                bg-emerald-400
                shadow-[0_0_7px_rgba(52,211,153,0.7)]
              "
            />

            <h3 className="
              min-w-0
              truncate
              text-sm
              font-semibold
              text-zinc-100
              transition-colors
              group-hover:text-emerald-300
            ">
              {announcement.title}
            </h3>

            {/* NEW */}

            {announcement.unread && (
              <motion.span
                initial={{
                  opacity: 0,
                  scale: 0.8,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
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
              </motion.span>
            )}

          </div>


          {/* SPORT / CATEGORY */}

          <p className="mt-1 text-[11px] font-medium text-zinc-600">
            {announcement.sport ||
              announcement.category}
            {announcement.staffOnly && (
              <span className="ml-2 rounded-full border border-amber-400/25 bg-amber-400/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-300">
                Staff &amp; Admin
              </span>
            )}
          </p>


          {/* MESSAGE */}

          <p className="
            mt-3
            max-w-2xl
            text-sm
            leading-5
            text-zinc-500
            transition-colors
            group-hover:text-zinc-400
          ">
            {announcement.message}
          </p>


          {/* TIME */}

          <div className="
            mt-3
            flex
            items-center
            gap-1.5
            text-[11px]
            text-zinc-700
          ">
            <Clock3 size={12} />

            <span>
              {announcement.createdAt}
            </span>
          </div>

        </div>

      </div>

    </motion.button>
  );
}