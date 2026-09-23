"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

import SearchModal from "@/components/ui/SearchModal";

type Notice = {
  id: number;
  title: string;
  message: string;
  type?: string;
  sportId?: number | null;
  createdAt: string;
  sport?: {
    name: string;
  } | null;
};

interface HeaderProps {
  onOpenMobileSidebar: () => void;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const VIEWED_STORAGE_KEY = "sports-block-viewed-announcements";

function SearchIcon({
  className = "h-5 w-5",
}: {
  className?: string;
}) {
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

function BellIcon({
  className = "h-5 w-5",
}: {
  className?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M10 21h4" />
    </svg>
  );
}

function MenuIcon({
  className = "h-5 w-5",
}: {
  className?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function UserIcon({
  className = "h-5 w-5",
}: {
  className?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c1.5-4 5-6 8-6s6.5 2 8 6" />
    </svg>
  );
}

function getPageTitle(pathname: string) {
  if (pathname === "/student") return "Home";
  if (pathname === "/sports") return "Sports";

  if (pathname.startsWith("/sports/")) {
    const sport = pathname
      .split("/")
      .filter(Boolean)
      .pop()
      ?.replace(/-/g, " ");

    if (!sport) return "Sports";

    return sport
      .split(" ")
      .map(
        (word) =>
          word.charAt(0).toUpperCase() + word.slice(1)
      )
      .join(" ");
  }

  if (pathname === "/my-bookings") return "My Bookings";
  if (pathname === "/equipment") return "Equipment";
  if (pathname === "/swimming-pass") return "Swimming Pass";
  if (pathname === "/history") return "History";
  if (pathname === "/announcements") return "Announcements";
  if (pathname === "/profile") return "Profile";
  if (pathname === "/suggestions") return "Suggestion";

  return "Sports Block";
}

function formatRelativeTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) return "Just now";

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

function getNoticeIcon(type?: string) {
  switch (type?.toLowerCase()) {
    case "maintenance":
      return "🛠️";

    case "booking":
      return "📅";

    case "sport":
      return "🏃";

    case "equipment":
      return "🏸";

    case "urgent":
      return "⚠️";

    default:
      return "🔔";
  }
}

export default function Header({
  onOpenMobileSidebar,
}: HeaderProps) {
  const pathname = usePathname();

  const notificationRef = useRef<HTMLDivElement>(null);

  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] =
    useState(false);

  const [notices, setNotices] = useState<Notice[]>([]);
  const [viewedIds, setViewedIds] = useState<number[]>([]);

  /*
   * Load locally viewed announcements.
   */
  useEffect(() => {
    try {
      const stored = localStorage.getItem(
        VIEWED_STORAGE_KEY
      );

      if (!stored) return;

      const parsed = JSON.parse(stored);

      if (Array.isArray(parsed)) {
        setViewedIds(
          parsed.map(Number).filter(Number.isFinite)
        );
      }
    } catch {
      // Ignore malformed local storage.
    }
  }, []);

  /*
   * Fetch announcements.
   */
  useEffect(() => {
    let cancelled = false;

    const fetchAnnouncements = async () => {
      try {
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

        if (!cancelled) {
          setNotices(
            Array.isArray(data) ? data : []
          );
        }
      } catch (error) {
        console.error(
          "HEADER ANNOUNCEMENTS ERROR:",
          error
        );
      }
    };

    fetchAnnouncements();

    /*
     * Small refresh interval so a newly created
     * announcement can appear without refreshing
     * the whole page.
     */
    const interval = window.setInterval(
      fetchAnnouncements,
      30000
    );

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  /*
   * Sort newest first.
   */
  const sortedNotices = useMemo(() => {
    return [...notices].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    );
  }, [notices]);

  /*
   * Only unread/unviewed announcements appear
   * inside the bell.
   */
  const unreadNotices = useMemo(() => {
    return sortedNotices.filter(
      (notice) =>
        !viewedIds.includes(Number(notice.id))
    );
  }, [sortedNotices, viewedIds]);

  /*
   * Keep the popup intentionally small.
   */
  const popupNotices = unreadNotices.slice(0, 4);

  const unreadCount = unreadNotices.length;

  /*
   * Persist viewed state.
   */
  const saveViewedIds = (ids: number[]) => {
    setViewedIds(ids);

    try {
      localStorage.setItem(
        VIEWED_STORAGE_KEY,
        JSON.stringify(ids)
      );
    } catch {
      // Ignore storage errors.
    }
  };

  /*
   * When the popup closes, everything that was
   * shown in the popup becomes viewed.
   *
   * It does NOT disappear from /announcements.
   */
  const closeNotificationPopup = () => {
    if (popupNotices.length > 0) {
      const idsToMarkViewed = popupNotices.map(
        (notice) => Number(notice.id)
      );

      const merged = Array.from(
        new Set([
          ...viewedIds,
          ...idsToMarkViewed,
        ])
      );

      saveViewedIds(merged);
    }

    setNotificationsOpen(false);
  };

  /*
   * Clicking an announcement inside the popup
   * simply marks that item viewed.
   *
   * We do NOT navigate away.
   */
  const handleNotificationClick = (
    id: number
  ) => {
    const merged = Array.from(
      new Set([...viewedIds, id])
    );

    saveViewedIds(merged);
  };

  /*
   * Keyboard shortcuts.
   */
  useEffect(() => {
    const handleKeyDown = (
      event: KeyboardEvent
    ) => {
      const target =
        event.target as HTMLElement | null;

      const isTyping =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;

      if (isTyping) return;

      if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "k"
      ) {
        event.preventDefault();

        setSearchOpen(true);
        setNotificationsOpen(false);
      }

      if (event.key === "/") {
        event.preventDefault();

        setSearchOpen(true);
        setNotificationsOpen(false);
      }

      if (event.key === "Escape") {
        setSearchOpen(false);

        if (notificationsOpen) {
          closeNotificationPopup();
        }
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    notificationsOpen,
    popupNotices,
    viewedIds,
  ]);

  /*
   * Close popup when clicking outside.
   */
  useEffect(() => {
    const handleOutsideClick = (
      event: MouseEvent
    ) => {
      if (!notificationRef.current) return;

      if (
        !notificationRef.current.contains(
          event.target as Node
        )
      ) {
        closeNotificationPopup();
      }
    };

    if (notificationsOpen) {
      document.addEventListener(
        "mousedown",
        handleOutsideClick
      );
    }

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, [
    notificationsOpen,
    popupNotices,
    viewedIds,
  ]);

  const pageTitle = getPageTitle(pathname);

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-zinc-950/90 backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">

          {/* LEFT */}

          <div className="flex min-w-0 items-center gap-3">
            <motion.button
              type="button"
              onClick={onOpenMobileSidebar}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.94 }}
              className="
                flex h-9 w-9 items-center justify-center
                rounded-lg
                text-zinc-500
                transition-all
                hover:bg-white/[0.05]
                hover:text-white
                md:hidden
              "
              aria-label="Open navigation"
            >
              <MenuIcon className="h-5 w-5" />
            </motion.button>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">
                {pageTitle}
              </p>

              <p className="hidden text-[11px] text-zinc-600 sm:block">
                Sports Block
              </p>
            </div>
          </div>

          {/* RIGHT */}

          <div className="flex items-center gap-2 sm:gap-3">

            {/* SEARCH */}

            <motion.button
              type="button"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => {
                setSearchOpen(true);
                setNotificationsOpen(false);
              }}
              className="
                hidden h-9 w-9
                items-center justify-center
                rounded-lg
                text-zinc-500
                transition-colors
                hover:bg-white/[0.05]
                hover:text-white
                sm:flex
              "
              aria-label="Search"
            >
              <SearchIcon className="h-[18px] w-[18px]" />
            </motion.button>

            {/* =====================================================
                BELL + POPUP
            ===================================================== */}

            <div
  ref={notificationRef}
  className="relative"
>
  <motion.button
    type="button"
    onClick={(event) => {
      event.preventDefault();
      event.stopPropagation();

      setNotificationsOpen((current) => !current);
      setSearchOpen(false);
    }}
    className={`relative flex h-9 w-9 items-center justify-center rounded-lg transition-all ${
      notificationsOpen
        ? "bg-emerald-500/10 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.08)]"
        : "text-zinc-500 hover:bg-white/[0.05] hover:text-white"
    }`}
    aria-label="Announcements"
    aria-expanded={notificationsOpen}
  >
    <BellIcon className="h-[18px] w-[18px]" />

    {unreadCount > 0 && (
      <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-400 px-1 text-[9px] font-black leading-none text-black">
        {unreadCount > 9 ? "9+" : unreadCount}
      </span>
    )}
  </motion.button>

  

              {/* POPUP */}

              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: -8,
                      scale: 0.97,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: 1,
                    }}
                    exit={{
                      opacity: 0,
                      y: -8,
                      scale: 0.97,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 420,
                      damping: 28,
                    }}
                    className="
                      absolute
                      right-0
                      top-[calc(100%+10px)]
                      z-50
                      w-[min(370px,calc(100vw-24px))]
                      origin-top-right
                    "
                  >
                    <div
                      className="
                        overflow-hidden
                        rounded-2xl
                        border
                        border-zinc-800
                        bg-zinc-950/95
                        shadow-[0_25px_80px_rgba(0,0,0,0.55)]
                        backdrop-blur-2xl
                      "
                    >

                      {/* HEADER */}

                      <div className="flex items-center justify-between border-b border-zinc-800/80 px-4 py-3.5">
                        <div>
                          <p className="text-sm font-semibold text-white">
                            Recent announcements
                          </p>

                          <p className="mt-0.5 text-[11px] text-zinc-600">
                            {unreadCount > 0
                              ? `${unreadCount} unread`
                              : "You're all caught up"}
                          </p>
                        </div>

                        {unreadCount > 0 && (
                          <span
                            className="
                              rounded-full
                              border
                              border-emerald-500/20
                              bg-emerald-500/10
                              px-2 py-1
                              text-[10px]
                              font-bold
                              uppercase
                              tracking-wider
                              text-emerald-400
                            "
                          >
                            New
                          </span>
                        )}
                      </div>

                      {/* LIST */}

                      {popupNotices.length > 0 ? (
                        <div className="p-2">
                          {popupNotices.map(
                            (notice, index) => (
                              <motion.button
                                key={notice.id}
                                type="button"
                                initial={{
                                  opacity: 0,
                                  x: 10,
                                }}
                                animate={{
                                  opacity: 1,
                                  x: 0,
                                }}
                                transition={{
                                  delay:
                                    index * 0.045,
                                }}
                                onClick={() =>
                                  handleNotificationClick(
                                    notice.id
                                  )
                                }
                                className="
                                  group
                                  flex w-full
                                  items-start
                                  gap-3
                                  rounded-xl
                                  p-3
                                  text-left
                                  transition-all
                                  hover:bg-white/[0.04]
                                "
                              >

                                {/* ICON */}

                                <div
                                  className="
                                    mt-0.5
                                    flex h-9 w-9
                                    shrink-0
                                    items-center justify-center
                                    rounded-xl
                                    border
                                    border-emerald-500/10
                                    bg-emerald-500/10
                                    text-sm
                                    transition-all
                                    group-hover:border-emerald-500/20
                                    group-hover:bg-emerald-500/15
                                  "
                                >
                                  {getNoticeIcon(
                                    notice.type
                                  )}
                                </div>

                                {/* CONTENT */}

                                <div className="min-w-0 flex-1">
                                  <div className="flex items-start justify-between gap-2">
                                    <p
                                      className="
                                        truncate
                                        text-xs
                                        font-semibold
                                        text-zinc-200
                                        transition-colors
                                        group-hover:text-emerald-300
                                      "
                                    >
                                      {notice.title}
                                    </p>

                                    <span
                                      className="
                                        shrink-0
                                        rounded-full
                                        bg-emerald-500/10
                                        px-1.5 py-0.5
                                        text-[8px]
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
                                    <p className="mt-0.5 text-[9px] font-medium uppercase tracking-wider text-emerald-500/70">
                                      {notice.sport.name}
                                    </p>
                                  )}

                                  <p
                                    className="
                                      mt-1
                                      line-clamp-2
                                      text-[11px]
                                      leading-relaxed
                                      text-zinc-500
                                    "
                                  >
                                    {notice.message}
                                  </p>

                                  <p className="mt-1.5 text-[10px] text-zinc-700">
                                    {formatRelativeTime(
                                      notice.createdAt
                                    )}
                                  </p>
                                </div>
                              </motion.button>
                            )
                          )}
                        </div>
                      ) : (
                        <div className="px-5 py-8 text-center">
                          <motion.div
                            animate={{
                              y: [0, -2, 0],
                            }}
                            transition={{
                              duration: 2.5,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                            className="
                              mx-auto
                              flex h-10 w-10
                              items-center justify-center
                              rounded-xl
                              bg-emerald-500/10
                              text-emerald-400
                            "
                          >
                            <BellIcon className="h-5 w-5" />
                          </motion.div>

                          <p className="mt-3 text-sm font-medium text-zinc-300">
                            No new announcements
                          </p>

                          <p className="mt-1 text-xs text-zinc-600">
                            You&apos;re all caught up.
                          </p>
                        </div>
                      )}

                      {/* FOOTER */}

                      <div className="border-t border-zinc-800/80 p-2">
                        <Link
                          href="/announcements"
                          onClick={() => {
                            closeNotificationPopup();
                          }}
                          className="
                            flex
                            items-center
                            justify-center
                            rounded-xl
                            px-3 py-2.5
                            text-xs
                            font-semibold
                            text-emerald-400
                            transition-all
                            hover:bg-emerald-500/10
                            hover:text-emerald-300
                          "
                        >
                          View all announcements
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* DIVIDER */}

            <div className="mx-1 hidden h-6 w-px bg-white/[0.06] sm:block" />

            {/* PROFILE */}

            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                window.location.href = "/profile";
              }}
              className="
                flex items-center gap-2
                rounded-lg
                px-1.5 py-1.5
                text-left
                transition-colors
                hover:bg-white/[0.04]
              "
              aria-label="Open profile"
            >
              <div
                className="
                  flex h-8 w-8
                  items-center justify-center
                  rounded-full
                  border
                  border-emerald-500/20
                  bg-emerald-500/10
                  text-emerald-400
                "
              >
                <UserIcon className="h-4 w-4" />
              </div>

              <div className="hidden leading-none lg:block">
                <p className="text-xs font-medium text-zinc-200">
                  Student
                </p>

                <p className="mt-1 text-[10px] text-zinc-600">
                  Profile
                </p>
              </div>
            </motion.button>
          </div>
        </div>
      </header>

      <SearchModal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
    </>
  );
}