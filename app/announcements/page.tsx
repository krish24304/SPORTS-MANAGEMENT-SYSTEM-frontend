"use client";

import { useMemo, useState } from "react";
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
  createdAt: string;
  expiresAt: string;
  unread: boolean;
};

const announcementData: Announcement[] = [
  {
    id: 1,
    title: "Basketball court maintenance",
    message:
      "Court 2 will be unavailable tomorrow from 10 AM to 2 PM due to maintenance.",
    category: "Sport",
    sport: "Basketball",
    createdAt: "10 min ago",
    expiresAt: "2026-12-31T23:59:59",
    unread: true,
  },
  {
    id: 2,
    title: "Badminton registration is open",
    message:
      "Registration is now open for the upcoming inter-college badminton tournament.",
    category: "Event",
    sport: "Badminton",
    createdAt: "1 hour ago",
    expiresAt: "2026-12-31T23:59:59",
    unread: true,
  },
  {
    id: 3,
    title: "New football practice schedule",
    message:
      "The updated football practice schedule is now available for students.",
    category: "Sport",
    sport: "Football",
    createdAt: "3 hours ago",
    expiresAt: "2026-12-31T23:59:59",
    unread: false,
  },
  {
    id: 4,
    title: "Equipment return reminder",
    message:
      "Students currently holding sports equipment are reminded to return it after use.",
    category: "General",
    createdAt: "Yesterday",
    expiresAt: "2026-12-31T23:59:59",
    unread: false,
  },
];

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] =
    useState(announcementData);

  /*
   * Hide announcements after their expiry time.
   *
   * This is currently frontend/mock behaviour.
   * Later the backend Notice model will provide expiresAt.
   */
  const activeAnnouncements = useMemo(() => {
    const now = new Date();

    return announcements.filter(
      (announcement) =>
        new Date(announcement.expiresAt) > now
    );
  }, [announcements]);

  const openAnnouncement = (id: number) => {
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

          {activeAnnouncements.length === 0 && (
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