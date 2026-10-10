"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Mail, Hash, Phone, ShieldCheck, FileText, Maximize2, X } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getUser } from "@/lib/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [enlarged, setEnlarged] = useState(false);

  useEffect(() => {
    setUser(getUser());
  }, []);

  const idCardUrl = user?.idCardPhoto ? `${API_BASE_URL}${user.idCardPhoto}` : null;
  const isPdf = idCardUrl ? /\.pdf$/i.test(idCardUrl) : false;

  const infoFields = [
    { icon: Mail, label: "Email", value: user?.email },
    { icon: Hash, label: "College ID", value: user?.rollNo },
    ...(user?.phone ? [{ icon: Phone, label: "Phone", value: user.phone }] : []),
  ];

  return (
    <DashboardLayout title="">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="overflow-hidden rounded-[32px] border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black shadow-[0_0_60px_rgba(16,185,129,0.08)]"
        >
          {/* Header */}
          <div className="relative overflow-hidden bg-gradient-to-r from-emerald-500/10 via-transparent to-transparent px-6 py-10 sm:px-8">
            <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />

            <div className="relative flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-5">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
                  className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl border border-emerald-500/30 bg-emerald-500/10 text-3xl font-black text-emerald-300 shadow-[0_0_30px_rgba(16,185,129,0.25)]"
                >
                  {(user?.name?.trim().charAt(0) || "?").toUpperCase()}
                  <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-zinc-950 bg-emerald-400" />
                </motion.div>

                <div className="min-w-0">
                  <motion.h2
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 }}
                    className="truncate text-3xl font-black text-white"
                  >
                    {user?.name || "—"}
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-1 flex items-center gap-1.5 text-sm font-semibold capitalize text-emerald-400"
                  >
                    <ShieldCheck size={13} /> {user?.role || "student"}
                  </motion.p>
                </div>
              </div>

              {/* ID card: shown here, and expandable */}
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.25 }}>
                {idCardUrl ? (
                  isPdf ? (
                    <a
                      href={idCardUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="group flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/80 px-5 py-4 transition hover:border-emerald-500/40"
                    >
                      <FileText className="text-emerald-400" size={22} />
                      <div className="text-left">
                        <p className="text-sm font-bold text-white">Uploaded ID Card</p>
                        <p className="text-xs text-zinc-500">Click to open (PDF)</p>
                      </div>
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setEnlarged(true)}
                      className="group relative block overflow-hidden rounded-2xl border border-zinc-800 shadow-lg transition hover:border-emerald-500/40"
                    >
                      <img src={idCardUrl} alt="Uploaded ID card" className="h-28 w-44 object-cover transition group-hover:scale-105" />
                      <span className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/50 group-hover:opacity-100">
                        <span className="flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-1.5 text-[11px] font-semibold text-white">
                          <Maximize2 size={11} /> View ID
                        </span>
                      </span>
                    </button>
                  )
                ) : (
                  <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/50 px-6 py-5 text-center">
                    <p className="text-xs text-zinc-500">No ID card uploaded</p>
                  </div>
                )}
              </motion.div>
            </div>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 sm:p-8">
            {infoFields.map((field, index) => (
              <motion.div
                key={field.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.06 }}
                whileHover={{ y: -2 }}
                className="flex items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 px-5 py-4 transition-colors hover:border-emerald-500/30"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950 text-emerald-400">
                  <field.icon size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">{field.label}</p>
                  <p className="truncate text-sm font-semibold text-zinc-200">{field.value || "—"}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {idCardUrl && !isPdf && enlarged && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setEnlarged(false)}
            className="fixed inset-0 z-[300] flex items-center justify-center bg-black/90 p-6 backdrop-blur-xl"
          >
            <button
              type="button"
              onClick={() => setEnlarged(false)}
              className="absolute right-6 top-6 rounded-xl border border-zinc-700 p-2 text-zinc-300 hover:border-red-500/40 hover:text-red-400"
            >
              <X size={20} />
            </button>
            <motion.img
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              src={idCardUrl}
              alt="Uploaded ID card, full size"
              onClick={(event) => event.stopPropagation()}
              className="max-h-[88vh] max-w-[92vw] rounded-2xl object-contain"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
