"use client";

import { API_BASE_URL, ID_PHOTO_TYPES, checkIdPhoto, fileUrl } from "@/lib/config";
import { useRef, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Mail, Hash, Phone, ShieldCheck, FileText, Maximize2, X, Upload, Loader2, KeyRound } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import IdPhoto from "@/components/ui/IdPhoto";
import ChangePasswordModal from "@/components/ui/ChangePasswordModal";
import { authFetch, getUser, saveUser } from "@/lib/auth";


export default function ProfilePage() {
  // The stored user only exists in the browser; on the server this is null.
  const isBrowser = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const [updatedUser, setUser] = useState<ReturnType<typeof getUser>>(null);
  const user = updatedUser ?? (isBrowser ? getUser() : null);
  const [enlarged, setEnlarged] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const idCardUrl = fileUrl(user?.idCardPhoto);

  const uploadIdCard = async (file: File) => {
    const problem = checkIdPhoto(file);
    if (problem) {
      setUploadMessage({ type: "error", text: problem });
      return;
    }
    setUploading(true);
    setUploadMessage(null);
    try {
      const form = new FormData();
      form.append("idCard", file);
      const res = await authFetch(`${API_BASE_URL}/users/me/id-card`, { method: "PUT", body: form });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setUploadMessage({ type: "error", text: data?.message || "Could not upload the photo." });
        return;
      }
      // Keep the sign-in token; only the photo changes.
      const current = getUser();
      if (!current) {
        setUploadMessage({ type: "error", text: "Please sign in again." });
        return;
      }
      const updated = { ...current, idCardPhoto: data.idCardPhoto };
      saveUser(updated);
      setUser(updated);
      setUploadMessage({ type: "success", text: "ID card photo saved." });
    } catch {
      setUploadMessage({ type: "error", text: "Could not reach the server. Please try again." });
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  };
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
                  <motion.button
                    type="button"
                    onClick={() => setChangePasswordOpen(true)}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    className="group mt-3 inline-flex items-center gap-1.5 rounded-full border border-zinc-700/80 bg-zinc-900/70 px-3 py-1.5 text-xs font-semibold text-zinc-300 shadow-sm transition-colors hover:border-emerald-500/40 hover:bg-emerald-500/10 hover:text-emerald-300"
                  >
                    <KeyRound size={12} className="text-emerald-400 transition-transform group-hover:-rotate-12" />
                    Change password
                  </motion.button>
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
                      <IdPhoto path={idCardUrl} alt="Uploaded ID card" className="h-28 w-44 object-cover transition group-hover:scale-105" />
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

                <input
                  ref={fileInput}
                  type="file"
                  accept={ID_PHOTO_TYPES.join(",")}
                  className="sr-only"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadIdCard(file);
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileInput.current?.click()}
                  disabled={uploading}
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs font-bold text-emerald-300 transition hover:bg-emerald-500/20 disabled:opacity-60"
                >
                  {uploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                  {uploading ? "Uploading…" : idCardUrl ? "Replace photo" : "Upload ID card"}
                </button>
                <p className="mt-1.5 text-center text-[10px] text-zinc-600">JPG, PNG or WEBP · up to 5 MB</p>
                {uploadMessage && (
                  <p
                    role={uploadMessage.type === "error" ? "alert" : "status"}
                    className={`mt-2 max-w-[220px] text-center text-xs font-semibold ${uploadMessage.type === "error" ? "text-red-300" : "text-emerald-300"}`}
                  >
                    {uploadMessage.text}
                  </p>
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
      <ChangePasswordModal open={changePasswordOpen} onClose={() => setChangePasswordOpen(false)} />
    </DashboardLayout>
  );
}
