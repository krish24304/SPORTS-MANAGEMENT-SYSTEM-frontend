"use client";

import { motion, useReducedMotion } from "framer-motion";

export default function Skeleton({ rows = 3, height = "h-14" }: { rows?: number; height?: string }) {
  const reduce = useReducedMotion();
  return (
    <div className="space-y-2" aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className={`relative ${height} overflow-hidden rounded-2xl border border-zinc-800/70 bg-zinc-900/40`}
        >
          {!reduce && (
            <motion.div
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "linear", delay: index * 0.1 }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent"
            />
          )}
        </div>
      ))}
    </div>
  );
}
