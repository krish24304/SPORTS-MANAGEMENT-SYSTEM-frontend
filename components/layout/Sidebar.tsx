"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Home,
  Trophy,
  CalendarCheck,
  Dumbbell,
  History,
  Megaphone,
  User,
  MessageSquarePlus,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
} from "lucide-react";

import { clearUser } from "@/lib/auth";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navigationItems = [
  {
    label: "Home",
    href: "/student",
    icon: Home,
  },
  {
    label: "Sports",
    href: "/sports",
    icon: Trophy,
  },
  {
    label: "My Bookings",
    href: "/my-bookings",
    icon: CalendarCheck,
  },
  {
    label: "Equipment",
    href: "/equipment",
    icon: Dumbbell,
  },
  {
    label: "History",
    href: "/history",
    icon: History,
  },
  {
    label: "Announcements",
    href: "/announcements",
    icon: Megaphone,
  },
  {
    label: "Profile",
    href: "/profile",
    icon: User,
  },
];

export default function Sidebar({
  collapsed,
  onToggle,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const isItemActive = (href: string) =>
    pathname === href ||
    pathname.startsWith(`${href}/`);

  const handleLogout = () => {
    clearUser();
    router.push("/login");
  };

  return (
    <motion.aside
      initial={false}
      animate={{
        width: collapsed ? 76 : 250,
      }}
      transition={{
        duration: 0.22,
        ease: "easeOut",
      }}
      className="relative flex h-screen shrink-0 flex-col overflow-visible border-r border-zinc-800 bg-[#080b09]"
    >
      {/* =====================================================
          BRAND
      ===================================================== */}

      <div
        className={`flex h-20 shrink-0 items-center border-b border-zinc-800 ${
          collapsed
            ? "justify-center"
            : "justify-between px-5"
        }`}
      >
        <Link
          href="/student"
          className={`group flex items-center ${
            collapsed ? "justify-center" : "gap-3"
          }`}
        >
          {/* BRAND MARK */}

<motion.div
  whileHover={{
    scale: 1.08,
    rotate: -3,
  }}
  whileTap={{
    scale: 0.96,
  }}
  transition={{
    type: "spring",
    stiffness: 400,
    damping: 18,
  }}
  className="
    group/logo
    relative
    flex
    h-11
    w-11
    shrink-0
    items-center
    justify-center
    overflow-visible
    rounded-2xl
    border
    border-zinc-800
    bg-zinc-950
    text-emerald-400
    shadow-[0_0_22px_rgba(16,185,129,0.08)]
    transition-all
    duration-300
    hover:border-emerald-500/40
    hover:shadow-[0_0_28px_rgba(16,185,129,0.18)]
  "
>
  {/* soft green glow */}

  <motion.span
    animate={{
      opacity: [0.08, 0.18, 0.08],
      scale: [0.9, 1, 0.9],
    }}
    transition={{
      duration: 2.8,
      repeat: Infinity,
      ease: "easeInOut",
    }}
    className="
      pointer-events-none
      absolute
      inset-1
      rounded-xl
      bg-emerald-400
      blur-md
    "
  />

  {/* subtle rotating outer ring */}

  <motion.span
    animate={{
      rotate: 360,
    }}
    transition={{
      duration: 12,
      repeat: Infinity,
      ease: "linear",
    }}
    className="
      pointer-events-none
      absolute
      -inset-[3px]
      rounded-[17px]
      border
      border-dashed
      border-emerald-400/20
    "
  />

  {/* animated neon sweep */}

  <motion.span
    initial={{
      x: "-150%",
      opacity: 0,
    }}
    animate={{
      x: "150%",
      opacity: [0, 1, 0],
    }}
    transition={{
      duration: 2.4,
      repeat: Infinity,
      repeatDelay: 4,
      ease: "easeInOut",
    }}
    className="
      pointer-events-none
      absolute
      inset-y-0
      left-0
      w-1/3
      skew-x-[-20deg]
      rounded-full
      bg-gradient-to-r
      from-transparent
      via-emerald-300/30
      to-transparent
    "
  />

  {/* icon */}

  <motion.div
    animate={{
      y: [0, -1.5, 0],
    }}
    transition={{
      duration: 2.6,
      repeat: Infinity,
      ease: "easeInOut",
    }}
    className="
      relative
      z-10
      flex
      items-center
      justify-center
    "
  >
    <Trophy
      size={23}
      strokeWidth={1.9}
      className="
        drop-shadow-[0_0_6px_rgba(52,211,153,0.45)]
        transition-all
        duration-300
        group-hover/logo:drop-shadow-[0_0_10px_rgba(52,211,153,0.8)]
      "
    />
  </motion.div>

</motion.div>


          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-bold tracking-[0.12em] text-white">
                SPORTS BLOCK
              </p>

              <p className="mt-0.5 text-[11px] text-zinc-500">
                Student Portal
              </p>
            </div>
          )}
        </Link>
      </div>

      {/* =====================================================
          MAIN NAVIGATION
      ===================================================== */}

      <nav className="flex-1 space-y-1.5 overflow-y-auto px-3 py-5">
        {!collapsed && (
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600">
            Navigation
          </p>
        )}

        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = isItemActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative flex h-11 items-center rounded-xl transition-all duration-200 ${
                collapsed
                  ? "justify-center"
                  : "gap-3 px-3"
              } ${
                isActive
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "text-zinc-400 hover:translate-x-0.5 hover:bg-zinc-900 hover:text-white"
              }`}
            >
              {/* ACTIVE INDICATOR */}

              {isActive && (
                <motion.div
                  layoutId="active-sidebar-indicator"
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 35,
                  }}
                  className="absolute left-0 h-6 w-0.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]"
                />
              )}

              {/* ICON */}

              <motion.div
                whileHover={{
                  scale: 1.08,
                }}
                transition={{
                  duration: 0.15,
                }}
                className="shrink-0"
              >
                <Icon
                  size={19}
                  strokeWidth={isActive ? 2 : 1.8}
                  className={
                    isActive
                      ? "text-emerald-400"
                      : "text-zinc-500 transition-colors group-hover:text-zinc-300"
                  }
                />
              </motion.div>

              {!collapsed && (
                <span className="truncate text-sm font-medium">
                  {item.label}
                </span>
              )}

              {/* COLLAPSED TOOLTIP */}

              {collapsed && (
                <span className="pointer-events-none absolute left-full z-50 ml-3 whitespace-nowrap rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs font-medium text-white opacity-0 shadow-xl transition-opacity duration-150 group-hover:opacity-100">
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* =====================================================
          LOWER ACTIONS
      ===================================================== */}

      <div className="shrink-0 space-y-1.5 border-t border-zinc-800 px-3 py-4">

        {/* SUGGESTION */}

        <Link
          href="/suggestions"
          className={`group relative flex h-11 items-center rounded-xl text-zinc-400 transition-all duration-200 hover:bg-zinc-900 hover:text-white ${
            collapsed
              ? "justify-center"
              : "gap-3 px-3"
          }`}
        >
          <MessageSquarePlus
            size={19}
            strokeWidth={1.8}
            className="shrink-0 text-zinc-500 transition-colors group-hover:text-emerald-400"
          />

          {!collapsed && (
            <span className="text-sm font-medium">
              Suggestion
            </span>
          )}

          {collapsed && (
            <span className="pointer-events-none absolute left-full z-50 ml-3 whitespace-nowrap rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs font-medium text-white opacity-0 shadow-xl transition-opacity duration-150 group-hover:opacity-100">
              Suggestion
            </span>
          )}
        </Link>

        {/* LOGOUT */}

        <button
          type="button"
          onClick={handleLogout}
          className={`group relative flex h-11 w-full items-center rounded-xl text-zinc-400 transition-all duration-200 hover:bg-red-500/10 hover:text-red-400 ${
            collapsed
              ? "justify-center"
              : "gap-3 px-3"
          }`}
        >
          <LogOut
            size={19}
            strokeWidth={1.8}
            className="shrink-0 transition-transform duration-200 group-hover:-translate-x-0.5"
          />

          {!collapsed && (
            <span className="text-sm font-medium">
              Logout
            </span>
          )}

          {collapsed && (
            <span className="pointer-events-none absolute left-full z-50 ml-3 whitespace-nowrap rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs font-medium text-white opacity-0 shadow-xl transition-opacity duration-150 group-hover:opacity-100">
              Logout
            </span>
          )}
        </button>
      </div>

      {/* =====================================================
          COLLAPSE BUTTON
      ===================================================== */}

      <motion.button
        type="button"
        onClick={onToggle}
        whileHover={{
          scale: 1.08,
        }}
        whileTap={{
          scale: 0.94,
        }}
        aria-label={
          collapsed
            ? "Expand sidebar"
            : "Collapse sidebar"
        }
        className="absolute -right-3 top-[68px] z-50 flex h-7 w-7 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-zinc-400 shadow-lg transition-colors hover:border-emerald-500/50 hover:text-emerald-400"
      >
        {collapsed ? (
          <PanelLeftOpen size={14} />
        ) : (
          <PanelLeftClose size={14} />
        )}
      </motion.button>

      {/* SUBTLE BOTTOM GLOW */}

      {!collapsed && (
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-emerald-500/[0.025] to-transparent" />
      )}
    </motion.aside>
  );
}