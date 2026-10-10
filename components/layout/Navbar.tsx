"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, Menu, User, ChevronRight, LogOut, Mail, ShieldCheck, UserPlus, FileText, Maximize2, Check, X as XIcon, Phone, Hash } from "lucide-react";
import { authFetch, clearUser, getAuthToken, getUser } from "@/lib/auth";

type NavbarProps = {
  onOpenMobileSidebar?: () => void;
};

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

type SignupRequest = {
  id: number;
  name: string;
  email: string;
  rollNo: string | null;
  phone: string | null;
  idCardPhoto: string | null;
  createdAt: string;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const VIEWED_STORAGE_KEY = "sports-block-viewed-announcements";

function formatRelativeTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();

  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);

  if (diffSeconds < 60) {
    return "Just now";
  }

  const diffMinutes = Math.floor(diffSeconds / 60);

  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  const diffDays = Math.floor(diffHours / 24);

  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }

  return date.toLocaleDateString();
}

export default function Navbar({
  onOpenMobileSidebar = () => {},
}: NavbarProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notices, setNotices] = useState<Notice[]>([]);

  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const [signupRequests, setSignupRequests] = useState<SignupRequest[]>([]);
  const [signupRequestsOpen, setSignupRequestsOpen] = useState(false);
  const [selectedSignupRequest, setSelectedSignupRequest] = useState<SignupRequest | null>(null);
  const [signupActionLoading, setSignupActionLoading] = useState(false);
  const [decliningSignup, setDecliningSignup] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [enlargedIdCard, setEnlargedIdCard] = useState(false);
  const signupRequestsRef = useRef<HTMLDivElement>(null);

  const notificationRef = useRef<HTMLDivElement>(null);

  /*
   * ============================================================
   * MOUNT / USER
   * ============================================================
   */

  useEffect(() => {
    setMounted(true);
    setUser(getUser());
  }, []);

  /*
   * ============================================================
   * LOAD VIEWED ANNOUNCEMENTS
   * ============================================================
   */



  /*
   * ============================================================
   * FETCH ANNOUNCEMENTS
   * ============================================================
   */

  useEffect(() => {
    const currentUser = getUser();

    if (!getAuthToken() || currentUser?.role === "staff" || currentUser?.role === "admin") {
      setNotices([]);
      return;
    }

    let cancelled = false;

    const fetchUnread = async () => {
      try {
        const response = await authFetch(`${API_BASE_URL}/notices/unread`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch announcements");
        }

        const data = await response.json();

        if (!cancelled) {
          setNotices(Array.isArray(data.notices) ? data.notices : []);
        }
      } catch (error) {
        console.error("NAVBAR ANNOUNCEMENTS ERROR:", error);
      }
    };

    fetchUnread();

    const interval = window.setInterval(fetchUnread, 30000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  /*
   * ============================================================
   * SORT ANNOUNCEMENTS
   * ============================================================
   */

  const sortedNotices = useMemo(() => {
    return [...notices].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    );
  }, [notices]);

  /*
   * ============================================================
   * UNREAD ANNOUNCEMENTS
   * ============================================================
   */

  const unreadNotices = useMemo(() => {
    return sortedNotices;
  }, [sortedNotices]);

  const popupNotices = unreadNotices.slice(0, 4);

const unreadCount = unreadNotices.length;

const hasUnread = unreadCount > 0;
  /*
   * ============================================================
   * SAVE VIEWED IDS
   * ============================================================
   */


  /*
   * ============================================================
   * MARK ONE ANNOUNCEMENT AS VIEWED
   * ============================================================
   */

  const handleNotificationClick = async (id: number) => {
    setNotices((current) => current.filter((notice) => Number(notice.id) !== Number(id)));

    try {
      const response = await authFetch(`${API_BASE_URL}/notices/${id}/read`, {
        method: "POST",
      });

      if (!response.ok && response.status !== 404) {
        throw new Error("Could not mark announcement as read");
      }
    } catch (error) {
      console.error("MARK ANNOUNCEMENT READ ERROR:", error);
    }
  };

  /*
   * ============================================================
   * CLOSE POPUP
   * ============================================================
   */

  const closeNotificationPopup = () => {
    setNotificationsOpen(false);
  };

  /*
   * ============================================================
   * CLOSE WHEN CLICKING OUTSIDE
   * ============================================================
   */

  useEffect(() => {
    if (!notificationsOpen) return;

    const handleOutsideClick = (event: MouseEvent) => {
      if (!notificationRef.current) return;

      if (
        !notificationRef.current.contains(
          event.target as Node
        )
      ) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, [notificationsOpen]);

  useEffect(() => {
    if (!profileOpen) return;

    const handleOutsideClick = (event: MouseEvent) => {
      if (!profileRef.current) return;

      if (!profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [profileOpen]);

  useEffect(() => {
    if (!signupRequestsOpen) return;

    const handleOutsideClick = (event: MouseEvent) => {
      if (!signupRequestsRef.current) return;

      if (!signupRequestsRef.current.contains(event.target as Node)) {
        setSignupRequestsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [signupRequestsOpen]);

  // Pending student signups -- staff/admin only.
  useEffect(() => {
    const currentUser = getUser();
    const staffOrAdmin = currentUser?.role === "admin" || currentUser?.role === "staff";

    if (!getAuthToken() || !staffOrAdmin) {
      setSignupRequests([]);
      return;
    }

    let cancelled = false;

    const fetchSignupRequests = async () => {
      try {
        const response = await authFetch(`${API_BASE_URL}/signup-requests`, { cache: "no-store" });
        if (!response.ok) throw new Error("Failed to fetch signup requests");
        const data = await response.json();
        if (!cancelled) setSignupRequests(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("SIGNUP REQUESTS ERROR:", error);
      }
    };

    fetchSignupRequests();
    const interval = window.setInterval(fetchSignupRequests, 30000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  const openSignupRequest = (request: SignupRequest) => {
    setSelectedSignupRequest(request);
    setSignupRequestsOpen(false);
    setDecliningSignup(false);
    setDeclineReason("");
    setEnlargedIdCard(false);
  };

  const approveSignupRequest = async () => {
    if (!selectedSignupRequest) return;
    setSignupActionLoading(true);
    try {
      const response = await authFetch(`${API_BASE_URL}/signup-requests/${selectedSignupRequest.id}/approve`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to approve");
      setSignupRequests((prev) => prev.filter((r) => r.id !== selectedSignupRequest.id));
      setSelectedSignupRequest(null);
    } catch (error) {
      console.error("APPROVE SIGNUP ERROR:", error);
    } finally {
      setSignupActionLoading(false);
    }
  };

  const declineSignupRequest = async () => {
    if (!selectedSignupRequest) return;
    setSignupActionLoading(true);
    try {
      const response = await authFetch(`${API_BASE_URL}/signup-requests/${selectedSignupRequest.id}/decline`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: declineReason.trim() || undefined }),
      });
      if (!response.ok) throw new Error("Failed to decline");
      setSignupRequests((prev) => prev.filter((r) => r.id !== selectedSignupRequest.id));
      setSelectedSignupRequest(null);
      setDecliningSignup(false);
      setDeclineReason("");
    } catch (error) {
      console.error("DECLINE SIGNUP ERROR:", error);
    } finally {
      setSignupActionLoading(false);
    }
  };

  const handleLogout = () => {
    clearUser();
    router.push("/login");
  };

  /*
   * ============================================================
   * HYDRATION
   * ============================================================
   */

  if (!mounted) {
    return (
      <header className="h-[73px] border-b border-zinc-800 bg-zinc-950" />
    );
  }

  const firstName =
    user?.name?.split(" ")[0] || "Student";

  const isStaffOrAdmin = user?.role === "admin" || user?.role === "staff";

  /*
   * ============================================================
   * NAVBAR
   * ============================================================
   */

  return (
    <>
    <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur-xl">
      <div className="flex h-[73px] items-center justify-between px-5 md:px-8">

        {/* =====================================================
            LEFT
        ====================================================== */}

        <div className="flex items-center gap-3">

          {/* MOBILE MENU */}

          <motion.button
            type="button"
            onClick={onOpenMobileSidebar}
            aria-label="Open navigation"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.94 }}
            className="group relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-400 transition-all duration-200 hover:border-emerald-500/40 hover:text-emerald-300 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]"
          >
            <span className="pointer-events-none absolute inset-y-0 -left-[100%] w-[70%] skew-x-[-20deg] bg-gradient-to-r from-transparent via-emerald-400/25 to-transparent transition-all duration-700 ease-out group-hover:left-[130%]" />

            <span className="pointer-events-none absolute inset-0 rounded-xl bg-emerald-400/[0.03] opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

            <Menu
              size={20}
              strokeWidth={2}
              className="relative z-10 transition-all duration-200 group-hover:scale-105 group-hover:drop-shadow-[0_0_5px_rgba(52,211,153,0.9)]"
            />
          </motion.button>

          <div>
            <p className="text-sm font-semibold text-white">
              Sports Block
            </p>

            <p className="text-xs text-zinc-500">
              {user?.role === "admin"
                ? "Admin Portal"
                : user?.role === "staff"
                ? "Staff Portal"
                : "Student Portal"}
            </p>
          </div>
        </div>

        {/* =====================================================
            RIGHT
        ====================================================== */}

        <div className="flex items-center gap-2 sm:gap-3">

          {/* =================================================
              NOTIFICATIONS (students only -- staff/admin manage
              announcements directly from their own dashboards)
          ================================================= */}

          {!isStaffOrAdmin && (

          <div
            ref={notificationRef}
            className="relative"
          >

            {/* BELL BUTTON */}

            <motion.button
              type="button"
              aria-label="Open announcements"
              aria-expanded={notificationsOpen}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();

                setNotificationsOpen(
                  (current) => !current
                );
              }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.94 }}
              className={`group relative flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-200 ${
                notificationsOpen
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.16)]"
                  : "border-transparent text-emerald-400 hover:border-emerald-500/30 hover:bg-emerald-500/10 hover:shadow-[0_0_20px_rgba(16,185,129,0.16)]"
              }`}
            >

              {/* ANIMATED BELL */}
<motion.div
  animate={
    hasUnread || notificationsOpen
      ? {
          rotate: [0, -10, 10, -8, 8, -4, 4, 0],
        }
      : {
          rotate: 0,
        }
  }
  whileHover={{
    rotate: [0, -14, 14, -10, 10, -5, 5, 0],
  }}
  transition={
    hasUnread || notificationsOpen
      ? {
          duration: notificationsOpen ? 1.35 : 0.8,
          repeat: Infinity,
          repeatDelay: notificationsOpen ? 1.8 : 3,
          ease: "easeInOut",
        }
      : {
          duration: 0.4,
        }
  }
  className="relative"
>
  <Bell
    size={20}
    strokeWidth={1.8}
  />
</motion.div>

{/* AMBER NOTIFICATION DOT */}
{hasUnread && (
  <span className="absolute right-[6px] top-[6px] flex h-3 w-3">
    {/* Outer pulse */}
    <motion.span
      animate={{
        scale: [1, 2.2],
        opacity: [0.65, 0],
      }}
      transition={{
        duration: 1.7,
        repeat: Infinity,
        ease: "easeOut",
      }}
      className="
        absolute
        inset-0
        rounded-full
        bg-amber-400
      "
    />

    {/* Main dot */}
    <motion.span
      animate={{
        scale: [1, 1.12, 1],
      }}
      transition={{
        duration: 1.4,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className="
        relative
        h-3
        w-3
        rounded-full
        border-2
        border-zinc-950
        bg-amber-400
        shadow-[0_0_16px_rgba(251,191,36,0.95)]
      "
    />
  </span>
)}



              {/* HOVER LIGHT */}

              <span className="pointer-events-none absolute inset-0 rounded-xl bg-emerald-400/[0.04] opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
            </motion.button>

            {/* =================================================
    PREMIUM NOTIFICATION POPUP
================================================== */}
<AnimatePresence>
  {notificationsOpen && (
    <>
      {/* POPUP POINTER */}
      <motion.div
        initial={{
          opacity: 0,
          y: -5,
          scale: 0.7,
        }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
        }}
        exit={{
          opacity: 0,
          y: -5,
          scale: 0.7,
        }}
        transition={{
          duration: 0.18,
          ease: "easeOut",
        }}
        className="
          pointer-events-none
          absolute
          right-[14px]
          top-[47px]
          z-[101]
          h-3
          w-3
          rotate-45
          border-l
          border-t
          border-white/[0.08]
          bg-[#090b0b]
        "
      />

      <motion.div
        initial={{
          opacity: 0,
          y: -16,
          scale: 0.94,
        }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
        }}
        exit={{
          opacity: 0,
          y: -10,
          scale: 0.97,
        }}
        transition={{
          type: "spring",
          stiffness: 380,
          damping: 28,
          mass: 0.75,
        }}
        onClick={(event) => {
          event.stopPropagation();
        }}
        className="
          absolute
          right-0
          top-full
          z-[100]
          mt-3
          w-[min(420px,calc(100vw-24px))]
          overflow-hidden
          rounded-[26px]
          border
          border-white/[0.08]
          bg-[#090b0b]/95
          shadow-[0_30px_100px_rgba(0,0,0,0.7)]
          backdrop-blur-2xl
        "
      >
        {/* AMBIENT GLOWS */}
        <div
          className="
            pointer-events-none
            absolute
            -right-24
            -top-28
            h-52
            w-52
            rounded-full
            bg-emerald-400/[0.07]
            blur-3xl
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            -left-24
            bottom-0
            h-44
            w-44
            rounded-full
            bg-amber-400/[0.035]
            blur-3xl
          "
        />

        {/* =====================================
            HEADER
        ====================================== */}
        <div className="relative px-5 pb-5 pt-5">
  <div className="flex items-start justify-between">

    <div className="flex items-center gap-3">

      {/* ICON */}
      <div className="relative">
        <motion.div
          animate={
            hasUnread
              ? {
                  boxShadow: [
                    "0 0 0 rgba(16,185,129,0)",
                    "0 0 24px rgba(16,185,129,0.22)",
                    "0 0 0 rgba(16,185,129,0)",
                  ],
                }
              : {}
          }
          transition={{
            duration: 2.4,
            repeat: hasUnread ? Infinity : 0,
            ease: "easeInOut",
          }}
          className="
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-2xl
            border
            border-emerald-400/20
            bg-emerald-400/[0.07]
            text-emerald-300
          "
        >
          <Bell
            size={19}
            strokeWidth={1.8}
          />
        </motion.div>

        {/* AMBER MINI DOT */}
        {hasUnread && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="
              absolute
              -right-1
              -top-1
              h-3
              w-3
              rounded-full
              border-2
              border-[#090b0b]
              bg-amber-400
              shadow-[0_0_12px_rgba(251,191,36,0.8)]
            "
          />
        )}
      </div>

      {/* TEXT */}
      <div>
        <p className="text-[16px] font-semibold tracking-[-0.02em] text-white">
          Notifications
        </p>

        <p className="mt-1 text-[11px] text-zinc-500">
          {hasUnread
            ? `${unreadCount} ${
                unreadCount === 1
                  ? "new announcement"
                  : "new announcements"
              }`
            : "You're all caught up"}
        </p>
      </div>

    </div>

    {/* NEW BADGE */}
    {hasUnread && (
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        className="
          flex
          items-center
          gap-1.5
          rounded-full
          border
          border-amber-400/20
          bg-amber-400/[0.08]
          px-2.5
          py-1.5
          text-[9px]
          font-bold
          uppercase
          tracking-[0.12em]
          text-amber-300
        "
      >
        <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
        New
      </motion.div>
    )}

  </div>
</div>

        {/* =====================================
            NOTIFICATION CONTENT
        ====================================== */}
        <div className="relative px-3 pb-3">
          {popupNotices.length > 0 ? (
            <div className="space-y-2">
              {popupNotices.map(
                (notice, index) => (
                  <motion.button
                    key={notice.id}
                    type="button"
                    initial={{
                      opacity: 0,
                      x: 24,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    transition={{
                      delay:
                        0.08 + index * 0.08,
                      duration: 0.3,
                      ease: "easeOut",
                    }}
                    whileHover={{
                      x: 4,
                      scale: 1.005,
                    }}
                    whileTap={{
                      scale: 0.985,
                    }}
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();

                      handleNotificationClick(
                        notice.id
                      );
                    }}
                    className="
                      group
                      relative
                      w-full
                      overflow-hidden
                      rounded-[20px]
                      border
                      border-white/[0.06]
                      bg-white/[0.025]
                      p-4
                      text-left
                      transition-all
                      duration-300
                      hover:border-emerald-400/20
                      hover:bg-white/[0.05]
                      hover:shadow-[0_14px_35px_rgba(0,0,0,0.25)]
                    "
                  >
                    {/* AMBER UNREAD LINE */}
                    <motion.span
                      initial={{
                        height: 0,
                      }}
                      animate={{
                        height: "62%",
                      }}
                      transition={{
                        delay:
                          0.2 + index * 0.08,
                        duration: 0.4,
                      }}
                      className="
                        absolute
                        left-0
                        top-[19%]
                        w-[3px]
                        rounded-r-full
                        bg-amber-400
                        shadow-[0_0_15px_rgba(251,191,36,0.7)]
                      "
                    />

                    {/* HOVER GLOW */}
                    <span
                      className="
                        pointer-events-none
                        absolute
                        -right-10
                        -top-10
                        h-28
                        w-28
                        rounded-full
                        bg-emerald-400/[0.05]
                        opacity-0
                        blur-3xl
                        transition-opacity
                        duration-500
                        group-hover:opacity-100
                      "
                    />

                    <div className="relative">
                      {/* TOP ROW */}
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          {notice.sport?.name && (
                            <span
                              className="
                                rounded-lg
                                border
                                border-emerald-400/10
                                bg-emerald-400/[0.06]
                                px-2
                                py-1
                                text-[8px]
                                font-bold
                                uppercase
                                tracking-[0.16em]
                                text-emerald-400/85
                              "
                            >
                              {notice.sport.name}
                            </span>
                          )}

                          <span className="text-[10px] text-zinc-700">
                            •
                          </span>

                          <span className="text-[9px] font-medium uppercase tracking-[0.08em] text-zinc-600">
                            {formatRelativeTime(
                              notice.createdAt
                            )}
                          </span>
                        </div>

                        <span
                          className="
                            text-sm
                            text-zinc-700
                            transition-all
                            duration-200
                            group-hover:translate-x-1
                            group-hover:text-amber-300
                          "
                        >
                          →
                        </span>
                      </div>

                      {/* TITLE */}
                      <p
                        className="
                          mt-3
                          text-[15px]
                          font-semibold
                          leading-snug
                          tracking-[-0.015em]
                          text-zinc-100
                          transition-colors
                          group-hover:text-white
                        "
                      >
                        {notice.title}
                      </p>

                      {/* MESSAGE */}
                      <p
                        className="
                          mt-2
                          line-clamp-2
                          text-[11.5px]
                          leading-[1.7]
                          text-zinc-500
                          transition-colors
                          group-hover:text-zinc-400
                        "
                      >
                        {notice.message}
                      </p>

                      {/* BOTTOM INFO */}
                      <div className="mt-4 flex items-center justify-between">
  <div className="flex items-center gap-1.5 text-[10px] text-zinc-600">
    <motion.span
      animate={{
        opacity: [1, 0.45, 1],
        scale: [1, 1.15, 1],
      }}
      transition={{
        duration: 1.8,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className="h-1.5 w-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]"
    />

    <span>New announcement</span>
  </div>

  <span className="text-[10px] text-zinc-700">
    {formatRelativeTime(notice.createdAt)}
  </span>
</div>
                    </div>
                  </motion.button>
                )
              )}
            </div>
          ) : (
            /* =====================================
                EMPTY STATE
            ====================================== */
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
                flex
                flex-col
                items-center
                justify-center
                rounded-[20px]
                border
                border-white/[0.05]
                bg-white/[0.018]
                px-5
                py-9
              "
            >
              <div
                className="
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-2xl
                  border
                  border-white/[0.06]
                  bg-white/[0.025]
                  text-zinc-600
                "
              >
                <Bell
                  size={19}
                  strokeWidth={1.7}
                />
              </div>

              <p className="mt-4 text-[14px] font-medium text-zinc-300">
                Nothing new
              </p>

              <p className="mt-1 text-center text-[11px] text-zinc-600">
                New announcements will appear here.
              </p>
            </motion.div>
          )}
        </div>

        {/* =====================================
            FOOTER
        ====================================== */}
        <div className="relative border-t border-white/[0.06] px-3 py-3">
          <Link
            href="/announcements"
            onClick={() => {
              closeNotificationPopup();
            }}
            className="
              group
              flex
              items-center
              justify-center
              gap-2
              rounded-xl
              px-4
              py-2.5
              text-[11px]
              font-semibold
              text-zinc-400
              transition-all
              duration-200
              hover:bg-emerald-400/[0.07]
              hover:text-emerald-300
            "
          >
            View all announcements

            <span
              className="
                text-emerald-400
                transition-transform
                duration-200
                group-hover:translate-x-1
              "
            >
              →
            </span>
          </Link>
        </div>
      </motion.div>
    </>
  )}
</AnimatePresence>

          </div>

          )}

          {/* =================================================
              SIGNUP REQUESTS (staff/admin only)
          ================================================== */}

          {isStaffOrAdmin && (
            <div ref={signupRequestsRef} className="relative">
              <motion.button
                type="button"
                onClick={() => setSignupRequestsOpen((value) => !value)}
                aria-label="Open signup requests"
                aria-expanded={signupRequestsOpen}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.94 }}
                className="group relative flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-400 transition-all duration-200 hover:border-violet-500/40 hover:text-violet-300 hover:shadow-[0_0_20px_rgba(139,92,246,0.2)]"
              >
                <UserPlus size={18} />
                {signupRequests.length > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-zinc-950 bg-rose-500 px-1 text-[10px] font-bold text-white">
                    {signupRequests.length}
                  </span>
                )}
              </motion.button>

              <AnimatePresence>
                {signupRequestsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -12, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 380, damping: 28, mass: 0.75 }}
                    className="absolute right-0 top-full z-[120] mt-3 w-[min(380px,calc(100vw-24px))] overflow-hidden rounded-[22px] border border-zinc-800 bg-[#090b0b] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)]"
                  >
                    <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
                      <p className="font-bold text-white">Signup Requests</p>
                      <span className="rounded-full bg-violet-500/15 px-2.5 py-0.5 text-xs font-semibold text-violet-300">
                        {signupRequests.length} pending
                      </span>
                    </div>

                    <div className="max-h-[360px] overflow-y-auto">
                      {signupRequests.length === 0 ? (
                        <p className="px-5 py-8 text-center text-sm text-zinc-500">No pending signups.</p>
                      ) : (
                        signupRequests.map((request) => (
                          <button
                            key={request.id}
                            type="button"
                            onClick={() => openSignupRequest(request)}
                            className="flex w-full items-center gap-3 border-b border-zinc-900 px-5 py-3.5 text-left transition-colors hover:bg-zinc-900/60"
                          >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-violet-500/20 bg-violet-500/10 text-sm font-bold text-violet-300">
                              {request.name.trim().charAt(0).toUpperCase() || "?"}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold text-white">{request.name}</p>
                              <p className="truncate text-xs text-zinc-500">{request.rollNo || request.email}</p>
                            </div>
                            <ChevronRight size={16} className="shrink-0 text-zinc-600" />
                          </button>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* =================================================
              PROFILE
          ================================================== */}

          {isStaffOrAdmin ? (

            <div ref={profileRef} className="relative border-l border-zinc-800 pl-2 sm:pl-3">

              <motion.button
                type="button"
                onClick={() => setProfileOpen((value) => !value)}
                aria-label="Open profile menu"
                aria-expanded={profileOpen}
                whileHover={{ scale: 1.02 }}
                className="group flex items-center gap-2 sm:gap-3"
              >

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="relative flex h-9 w-9 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-zinc-400 transition-all duration-200 group-hover:border-emerald-500/40 group-hover:bg-emerald-500/10 group-hover:text-emerald-400"
                >

                  <User size={17} />

                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-zinc-950 bg-emerald-400" />

                </motion.div>

                <div className="hidden sm:block">

                  <p className="text-sm font-medium text-white transition-colors group-hover:text-emerald-300">
                    {firstName}
                  </p>

                  <p className="flex items-center gap-1 text-xs capitalize text-zinc-500">

                    {user?.role || "staff"}

                    <ChevronRight
                      size={11}
                      className={`transition-transform duration-200 ${profileOpen ? "rotate-90" : "group-hover:translate-x-0.5"}`}
                    />

                  </p>

                </div>

              </motion.button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -12, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 380, damping: 28, mass: 0.75 }}
                    className="absolute right-0 top-full z-[100] mt-3 w-[280px] overflow-hidden rounded-[22px] border border-zinc-800 bg-[#090b0b] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)]"
                  >

                    <div className="p-5">

                      <div className="flex items-center gap-3">

                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-emerald-400">
                          <User size={20} />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-base font-bold text-white">
                            {user?.name || "—"}
                          </p>
                          <p className="flex items-center gap-1 text-xs font-semibold capitalize text-emerald-400">
                            <ShieldCheck size={12} />
                            {user?.role || "staff"}
                          </p>
                        </div>

                      </div>

                      {user?.email && (
                        <div className="mt-4 flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-xs text-zinc-400">
                          <Mail size={13} className="shrink-0 text-zinc-500" />
                          <span className="truncate">{user.email}</span>
                        </div>
                      )}

                    </div>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center justify-center gap-2 border-t border-zinc-800 bg-zinc-900/40 px-5 py-3.5 text-sm font-semibold text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
                    >
                      <LogOut size={15} />
                      Log out
                    </button>

                  </motion.div>
                )}
              </AnimatePresence>

            </div>

          ) : (

          <Link
            href="/profile"
            className="group flex items-center gap-2 border-l border-zinc-800 pl-2 sm:gap-3 sm:pl-3"
          >

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative flex h-9 w-9 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-zinc-400 transition-all duration-200 group-hover:border-emerald-500/40 group-hover:bg-emerald-500/10 group-hover:text-emerald-400"
            >

              <User size={17} />

              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-zinc-950 bg-emerald-400" />

            </motion.div>

            <div className="hidden sm:block">

              <p className="text-sm font-medium text-white transition-colors group-hover:text-emerald-300">
                {firstName}
              </p>

              <p className="flex items-center gap-1 text-xs capitalize text-zinc-500">

                {user?.role || "student"}

                <ChevronRight
                  size={11}
                  className="transition-transform duration-200 group-hover:translate-x-0.5"
                />

              </p>

            </div>

          </Link>

          )}

        </div>

      </div>
    </header>

    {/* =================================================
        SIGNUP REQUEST DETAILS (staff/admin only)
    ================================================== */}

    <AnimatePresence>
      {selectedSignupRequest && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSelectedSignupRequest(null)}
          className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 p-6 backdrop-blur-xl"
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-[640px] max-h-[88vh] overflow-y-auto rounded-[32px] border border-violet-500/20 bg-zinc-950 shadow-[0_0_90px_rgba(139,92,246,0.18)]"
          >
            <div className="flex items-start justify-between gap-4 border-b border-zinc-800 p-7">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-violet-500/25 bg-violet-500/10 text-xl font-black text-violet-300">
                  {selectedSignupRequest.name.trim().charAt(0).toUpperCase() || "?"}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white">{selectedSignupRequest.name}</h2>
                  <p className="text-sm text-zinc-500">Signup request</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSignupRequest(null)}
                className="rounded-xl border border-zinc-800 p-2 text-zinc-400 transition hover:border-red-500/40 hover:text-red-400"
              >
                <XIcon size={18} />
              </button>
            </div>

            <div className="space-y-4 p-7">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 px-4 py-3">
                  <Mail size={15} className="shrink-0 text-zinc-500" />
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Email</p>
                    <p className="truncate text-sm text-zinc-200">{selectedSignupRequest.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 px-4 py-3">
                  <Hash size={15} className="shrink-0 text-zinc-500" />
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">College ID</p>
                    <p className="truncate text-sm text-zinc-200">{selectedSignupRequest.rollNo || "—"}</p>
                  </div>
                </div>
                {selectedSignupRequest.phone && (
                  <div className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 px-4 py-3">
                    <Phone size={15} className="shrink-0 text-zinc-500" />
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Phone</p>
                      <p className="truncate text-sm text-zinc-200">{selectedSignupRequest.phone}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 px-4 py-3">
                  <UserPlus size={15} className="shrink-0 text-zinc-500" />
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Submitted</p>
                    <p className="truncate text-sm text-zinc-200">{formatRelativeTime(selectedSignupRequest.createdAt)}</p>
                  </div>
                </div>
              </div>

              <div>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500">ID Card</p>
                {selectedSignupRequest.idCardPhoto ? (
                  /\.pdf$/i.test(selectedSignupRequest.idCardPhoto) ? (
                    <a
                      href={`${API_BASE_URL}${selectedSignupRequest.idCardPhoto}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 px-5 py-4 text-sm font-semibold text-violet-300 transition hover:border-violet-500/40"
                    >
                      <FileText size={18} />
                      Open uploaded ID (PDF)
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setEnlargedIdCard(true)}
                      className="group relative block w-full overflow-hidden rounded-2xl border border-zinc-800"
                    >
                      <img
                        src={`${API_BASE_URL}${selectedSignupRequest.idCardPhoto}`}
                        alt="Uploaded ID card"
                        className="max-h-[260px] w-full object-contain bg-zinc-900"
                      />
                      <span className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/40 group-hover:opacity-100">
                        <span className="flex items-center gap-2 rounded-full bg-black/70 px-4 py-2 text-xs font-semibold text-white">
                          <Maximize2 size={13} /> View full size
                        </span>
                      </span>
                    </button>
                  )
                ) : (
                  <p className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/40 px-5 py-6 text-center text-sm text-zinc-500">
                    No ID card uploaded
                  </p>
                )}
              </div>

              {decliningSignup && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    Reason (optional, shown to the student)
                  </label>
                  <textarea
                    value={declineReason}
                    onChange={(event) => setDeclineReason(event.target.value)}
                    maxLength={300}
                    placeholder="e.g. The uploaded ID card could not be verified."
                    className="h-24 w-full resize-none rounded-2xl border border-red-500/20 bg-zinc-900/60 p-4 text-sm outline-none transition focus:border-red-500/50"
                  />
                </motion.div>
              )}
            </div>

            <div className="flex gap-3 border-t border-zinc-800 p-7">
              {!decliningSignup ? (
                <>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={signupActionLoading}
                    onClick={() => setDecliningSignup(true)}
                    className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl border border-red-500/30 text-sm font-bold text-red-400 transition hover:bg-red-500/10 disabled:opacity-60"
                  >
                    <XIcon size={16} />
                    Decline
                  </motion.button>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={signupActionLoading}
                    onClick={() => void approveSignupRequest()}
                    className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-sm font-bold text-black shadow-[0_0_25px_rgba(16,185,129,0.3)] transition disabled:opacity-60"
                  >
                    <Check size={16} />
                    {signupActionLoading ? "Approving..." : "Approve"}
                  </motion.button>
                </>
              ) : (
                <>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={signupActionLoading}
                    onClick={() => {
                      setDecliningSignup(false);
                      setDeclineReason("");
                    }}
                    className="flex h-12 flex-1 items-center justify-center rounded-2xl border border-zinc-700 text-sm font-bold text-zinc-300 transition hover:border-zinc-500 disabled:opacity-60"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={signupActionLoading}
                    onClick={() => void declineSignupRequest()}
                    className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-red-500 text-sm font-bold text-black transition hover:bg-red-400 disabled:opacity-60"
                  >
                    {signupActionLoading ? "Declining..." : "Confirm Decline"}
                  </motion.button>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    <AnimatePresence>
      {enlargedIdCard && selectedSignupRequest?.idCardPhoto && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setEnlargedIdCard(false)}
          className="fixed inset-0 z-[320] flex items-center justify-center bg-black/90 p-6 backdrop-blur-xl"
        >
          <button
            type="button"
            onClick={() => setEnlargedIdCard(false)}
            className="absolute right-6 top-6 rounded-xl border border-zinc-700 p-2 text-zinc-300 hover:border-red-500/40 hover:text-red-400"
          >
            <XIcon size={20} />
          </button>
          <motion.img
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            src={`${API_BASE_URL}${selectedSignupRequest.idCardPhoto}`}
            alt="Uploaded ID card, full size"
            onClick={(event) => event.stopPropagation()}
            className="max-h-[88vh] max-w-[92vw] rounded-2xl object-contain"
          />
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}