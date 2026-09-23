"use client";

import {
  ArrowRight,
  CircleCheck,
  CircleX,
  Boxes,
} from "lucide-react";
import { motion } from "framer-motion";

type ResourceType = {
  id: number;
  name: string;
  total: number;
  available: number;
  units: {
    id: number;
    name: string;
    status: string;
  }[];
};

type SportCardProps = {
  name: string;
  resourceTypes: ResourceType[];
  status: string;
  isDimmed?: boolean;
  onHoverStart?: () => void;
  onHoverEnd?: () => void;
  onClick?: () => void;
};

export default function SportCard({
  name,
  resourceTypes,
  status,
  isDimmed = false,
  onHoverStart,
  onHoverEnd,
  onClick,
}: SportCardProps) {
  const totalResources = resourceTypes.reduce(
    (sum, resource) => sum + resource.total,
    0
  );

  const availableResources = resourceTypes.reduce(
    (sum, resource) => sum + resource.available,
    0
  );

  const isAvailable =
    status.toLowerCase() === "available" ||
    availableResources > 0;

  return (
    <motion.div
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
      animate={{
        y: isDimmed ? 2 : 0,
        scale: isDimmed ? 0.975 : 1,
        opacity: isDimmed ? 0.42 : 1,
        filter: isDimmed ? "blur(2px)" : "blur(0px)",
      }}
      whileHover={{
        y: -10,
        scale: 1.018,
      }}
      transition={{
        type: "spring",
        stiffness: 280,
        damping: 24,
        mass: 0.8,
      }}
      className="
        group relative
        flex h-[480px] w-full
        flex-col overflow-hidden
        rounded-[30px]
        border border-zinc-800/90
        bg-[#080b0a]
        text-left
        shadow-[0_18px_50px_rgba(0,0,0,0.28)]
        outline-none
        transition-[border-color,box-shadow]
        duration-500
        hover:border-emerald-500/45
        hover:shadow-[0_28px_70px_rgba(0,0,0,0.4),0_0_45px_rgba(16,185,129,0.1)]
      "
    >
      {/* =====================================================
          AMBIENT GLOW
      ===================================================== */}

      <motion.div
        initial={{
          opacity: 0,
          scale: 0.8,
        }}
        whileHover={{
          opacity: 1,
          scale: 1.08,
        }}
        transition={{
          duration: 0.7,
          ease: "easeOut",
        }}
        className="
          pointer-events-none
          absolute -right-28 -top-28
          h-64 w-64
          rounded-full
          bg-emerald-500/[0.075]
          blur-3xl
        "
      />

      <motion.div
        initial={{
          opacity: 0,
        }}
        whileHover={{
          opacity: 1,
        }}
        transition={{
          duration: 0.8,
        }}
        className="
          pointer-events-none
          absolute -bottom-32 -left-24
          h-56 w-56
          rounded-full
          bg-emerald-500/[0.035]
          blur-3xl
        "
      />

      {/* =====================================================
          TOP ACCENT
      ===================================================== */}

      <motion.div
        initial={{
          scaleX: 0,
          opacity: 0,
        }}
        whileHover={{
          scaleX: 1,
          opacity: 1,
        }}
        transition={{
          duration: 0.5,
          ease: "easeOut",
        }}
        className="
          pointer-events-none
          absolute left-8 right-8 top-0
          h-px
          origin-center
          bg-gradient-to-r
          from-transparent
          via-emerald-400/70
          to-transparent
        "
      />

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="relative z-10 shrink-0 px-7 pt-7">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p
              className="
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.24em]
                text-zinc-600
              "
            >
              Sport
            </p>

            <motion.h2
              className="
                mt-2
                truncate
                text-[29px]
                font-bold
                leading-none
                tracking-[-0.035em]
                text-white
                transition-colors
                duration-300
                group-hover:text-emerald-300
              "
            >
              {name}
            </motion.h2>
          </div>

          {/* =================================================
              STATUS
          ================================================= */}

          <motion.div
            animate={{
              y: [0, -1, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className={`
              flex shrink-0 items-center gap-2
              rounded-full
              border
              px-3 py-1.5
              text-[11px]
              font-semibold
              ${
                isAvailable
                  ? "border-emerald-500/20 bg-emerald-500/[0.07] text-emerald-400"
                  : "border-zinc-700/70 bg-zinc-900/70 text-zinc-500"
              }
            `}
          >
            <span
              className={`
                relative h-1.5 w-1.5 rounded-full
                ${
                  isAvailable
                    ? "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]"
                    : "bg-zinc-600"
                }
              `}
            />

            {isAvailable ? (
              <CircleCheck size={12} />
            ) : (
              <CircleX size={12} />
            )}

            <span>
              {isAvailable ? "Available" : "Unavailable"}
            </span>
          </motion.div>
        </div>
      </div>

      {/* =====================================================
          RESOURCE SECTION
      ===================================================== */}

      <div className="relative z-10 mx-6 mt-7 min-h-0 flex-1">
        <div
          className="
            flex h-full
            flex-col
            overflow-hidden
            rounded-[23px]
            border border-zinc-800/80
            bg-zinc-950/80
            shadow-inner
          "
        >
          {/* RESOURCE HEADER */}

          <div className="flex shrink-0 items-center justify-between px-5 py-4">
            <div className="flex items-center gap-2.5">
              <motion.div
                whileHover={{
                  rotate: 8,
                  scale: 1.1,
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 15,
                }}
                className="
                  flex h-7 w-7
                  items-center justify-center
                  rounded-lg
                  bg-emerald-500/[0.08]
                  text-emerald-400
                "
              >
                <Boxes size={15} />
              </motion.div>

              <div>
                <p
                  className="
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-[0.2em]
                    text-zinc-600
                  "
                >
                  Resources
                </p>

                <p className="mt-0.5 text-[11px] text-zinc-600">
                  Equipment & facilities
                </p>
              </div>
            </div>

            {/* AVAILABLE / TOTAL */}

            <div
              className="
                rounded-lg
                border border-emerald-500/10
                bg-emerald-500/[0.04]
                px-2.5 py-1.5
              "
            >
              <span className="text-sm font-semibold text-emerald-400">
                {availableResources}
              </span>

              <span className="mx-1 text-zinc-700">
                /
              </span>

              <span className="text-sm font-medium text-zinc-500">
                {totalResources}
              </span>
            </div>
          </div>

          {/* RESOURCE LIST */}

          <div className="min-h-0 flex-1 overflow-hidden px-3 pb-3">
            <div className="flex h-full flex-col gap-2">
              {resourceTypes.map((resource, index) => {
                const resourceAvailable =
                  resource.available > 0;

                return (
                  <motion.div
                    key={resource.id}
                    initial={{
                      opacity: 0,
                      y: 8,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      duration: 0.35,
                      delay: index * 0.05,
                    }}
                    whileHover={{
                      x: 3,
                      scale: 1.01,
                    }}
                    className="
                      group/resource
                      relative
                      flex min-h-[62px]
                      items-center
                      justify-between
                      overflow-hidden
                      rounded-2xl
                      border border-zinc-800/60
                      bg-zinc-900/35
                      px-4
                      transition-colors
                      duration-300
                      hover:border-emerald-500/15
                      hover:bg-emerald-500/[0.035]
                    "
                  >
                    {/* RESOURCE HOVER GLOW */}

                    <motion.div
                      initial={{
                        opacity: 0,
                      }}
                      whileHover={{
                        opacity: 1,
                      }}
                      className="
                        pointer-events-none
                        absolute inset-y-0 left-0
                        w-20
                        bg-emerald-500/[0.035]
                        blur-xl
                      "
                    />

                    {/* RESOURCE NAME */}

                    <div className="relative z-10 flex min-w-0 items-center gap-3">
                      <motion.span
                        animate={{
                          scale: resourceAvailable
                            ? [1, 1.18, 1]
                            : 1,
                        }}
                        transition={{
                          duration: 2.8,
                          repeat: Infinity,
                          repeatDelay: 2,
                        }}
                        className={`
                          h-1.5 w-1.5
                          shrink-0
                          rounded-full
                          ${
                            resourceAvailable
                              ? "bg-emerald-400 shadow-[0_0_9px_rgba(52,211,153,0.7)]"
                              : "bg-zinc-700"
                          }
                        `}
                      />

                      <span
                        className="
                          truncate
                          text-[17px]
                          font-medium
                          tracking-[-0.015em]
                          text-zinc-200
                          transition-colors
                          duration-300
                          group-hover/resource:text-white
                        "
                      >
                        {resource.name}
                      </span>
                    </div>

                    {/* COUNT */}

                    <div className="relative z-10 ml-4 shrink-0">
                      <span
                        className={`
                          text-[16px]
                          font-semibold
                          ${
                            resourceAvailable
                              ? "text-emerald-400"
                              : "text-zinc-500"
                          }
                        `}
                      >
                        {resource.available}
                      </span>

                      <span className="mx-1 text-zinc-700">
                        /
                      </span>

                      <span className="text-[15px] text-zinc-500">
                        {resource.total}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          FIXED VIEW SPORT FOOTER

          IMPORTANT:
          ONLY THIS BUTTON IS CLICKABLE.
          Clicking anywhere else on the card does nothing.
      ===================================================== */}

      <div
        className="
          relative z-10
          mt-5
          flex h-[78px]
          shrink-0
          items-center
          justify-between
          border-t border-zinc-800/60
          px-7
        "
      >
        <motion.button
          type="button"
          onClick={() => {
            onClick?.();
          }}
          whileHover={{
            x: 2,
          }}
          whileTap={{
            scale: 0.98,
          }}
          className="
            group/view
            flex w-full
            items-center
            justify-between
            rounded-xl
            py-2
            text-left
            outline-none
            focus-visible:ring-2
            focus-visible:ring-emerald-500/40
          "
          aria-label={`View ${name} sport`}
        >
          <motion.span
            className="
              text-sm
              font-medium
              text-zinc-500
              transition-colors
              duration-300
              group-hover/view:text-emerald-300
            "
          >
            View sport
          </motion.span>

          <motion.span
            whileHover={{
              scale: 1.08,
              x: 3,
            }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 18,
            }}
            className="
              flex h-11 w-11
              shrink-0
              items-center justify-center
              rounded-full
              border border-zinc-700/80
              bg-zinc-900/30
              text-zinc-500
              transition-all
              duration-300
              group-hover/view:border-emerald-500/40
              group-hover/view:bg-emerald-500/[0.08]
              group-hover/view:text-emerald-400
              group-hover/view:shadow-[0_0_24px_rgba(16,185,129,0.14)]
            "
          >
            <ArrowRight
              size={17}
              className="
                transition-transform
                duration-300
                group-hover/view:translate-x-0.5
              "
            />
          </motion.span>
        </motion.button>
      </div>

      {/* =====================================================
          BOTTOM ACCENT
      ===================================================== */}

      <motion.div
        initial={{
          scaleX: 0,
          opacity: 0,
        }}
        whileHover={{
          scaleX: 1,
          opacity: 1,
        }}
        transition={{
          duration: 0.5,
          ease: "easeOut",
        }}
        className="
          pointer-events-none
          absolute bottom-0 left-8 right-8
          h-px
          origin-center
          bg-gradient-to-r
          from-transparent
          via-emerald-400/60
          to-transparent
        "
      />
    </motion.div>
  );
}