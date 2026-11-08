"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Eye, EyeOff, KeyRound, Loader2, X } from "lucide-react";

import { API_BASE_URL } from "@/lib/config";
import { authFetch } from "@/lib/auth";

type Props = { open: boolean; onClose: () => void };

type Field = "current" | "next" | "confirm";

// Change password for any signed-in user (student, staff, admin).
export default function ChangePasswordModal({ open, onClose }: Props) {
  const [values, setValues] = useState<Record<Field, string>>({ current: "", next: "", confirm: "" });
  const [visible, setVisible] = useState<Record<Field, boolean>>({ current: false, next: false, confirm: false });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  // True only in the browser, so the portal is never rendered on the server.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  // Opened again: start with empty fields.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setValues({ current: "", next: "", confirm: "" });
      setVisible({ current: false, next: false, confirm: false });
      setError("");
      setDone(false);
    }
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !saving) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, saving, onClose]);

  const tooShort = values.next.length > 0 && values.next.length < 8;
  const mismatch = values.confirm.length > 0 && values.confirm !== values.next;

  const submit = async () => {
    if (saving) return;
    if (!values.current || !values.next || !values.confirm) return setError("Please fill in all three fields.");
    if (values.next.length < 8) return setError("New password must be at least 8 characters.");
    if (values.next !== values.confirm) return setError("The new passwords do not match.");
    if (values.next === values.current) return setError("New password must be different from the current one.");

    setSaving(true);
    setError("");
    try {
      const res = await authFetch(`${API_BASE_URL}/auth/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: values.current, newPassword: values.next }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.message || "Could not change the password.");
        return;
      }
      setDone(true);
      window.setTimeout(onClose, 1500);
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const fields: { key: Field; label: string; placeholder: string; autoComplete: string }[] = [
    { key: "current", label: "Current password", placeholder: "Your current password", autoComplete: "current-password" },
    { key: "next", label: "New password", placeholder: "At least 8 characters", autoComplete: "new-password" },
    { key: "confirm", label: "Confirm new password", placeholder: "Type the new password again", autoComplete: "new-password" },
  ];

  if (!mounted) return null;

  // Rendered at the end of <body> so it sits above menus and sidebars.
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="change-password"
          role="dialog"
          aria-modal="true"
          aria-labelledby="change-password-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => !saving && onClose()}
          className="fixed inset-0 z-[400] flex items-center justify-center bg-black/80 p-4 backdrop-blur-xl"
        >
          <motion.form
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            onClick={(event) => event.stopPropagation()}
            onSubmit={(event) => {
              event.preventDefault();
              submit();
            }}
            className="relative w-full max-w-[460px] rounded-[28px] border border-emerald-500/20 bg-gradient-to-br from-zinc-950 via-black to-zinc-950 p-7 text-white shadow-[0_0_80px_rgba(16,185,129,.15)]"
          >
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              aria-label="Close"
              className="absolute right-5 top-5 rounded-xl border border-zinc-800 bg-zinc-900 p-2 text-zinc-400 transition hover:border-red-500/40 hover:text-red-300 disabled:opacity-40"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
                <KeyRound size={20} />
              </div>
              <div>
                <h2 id="change-password-title" className="text-2xl font-black">Change password</h2>
                <p className="text-sm text-zinc-500">You stay signed in on this device.</p>
              </div>
            </div>

            {done ? (
              <div role="status" className="mt-7 flex items-center gap-3 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-5 py-6 font-bold text-emerald-200">
                <CheckCircle2 size={22} /> Password changed. Use the new one next time you log in.
              </div>
            ) : (
              <>
                <div className="mt-6 space-y-4">
                  {fields.map((field) => (
                    <div key={field.key}>
                      <label htmlFor={`pw-${field.key}`} className="mb-2 block text-sm font-semibold text-zinc-300">
                        {field.label}
                      </label>
                      <div className="relative">
                        <input
                          id={`pw-${field.key}`}
                          type={visible[field.key] ? "text" : "password"}
                          autoComplete={field.autoComplete}
                          value={values[field.key]}
                          onChange={(e) => setValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
                          placeholder={field.placeholder}
                          maxLength={128}
                          className="h-12 w-full rounded-xl border border-zinc-800 bg-zinc-900/70 pl-4 pr-12 text-sm outline-none transition focus:border-emerald-500/60"
                        />
                        <button
                          type="button"
                          onClick={() => setVisible((prev) => ({ ...prev, [field.key]: !prev[field.key] }))}
                          aria-label={visible[field.key] ? "Hide password" : "Show password"}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                        >
                          {visible[field.key] ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      {field.key === "next" && tooShort && <p className="mt-1.5 text-xs text-amber-300">At least 8 characters.</p>}
                      {field.key === "confirm" && mismatch && <p className="mt-1.5 text-xs text-amber-300">Does not match the new password.</p>}
                    </div>
                  ))}
                </div>

                {error && (
                  <p role="alert" className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={saving}
                  className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 text-sm font-black text-black transition hover:brightness-110 disabled:opacity-60"
                >
                  {saving && <Loader2 size={16} className="animate-spin" />}
                  {saving ? "Saving…" : "Change password"}
                </button>
              </>
            )}
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
