"use client";

import { API_BASE_URL, ID_PHOTO_TYPES, checkIdPhoto } from "@/lib/config";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, ImagePlus, X } from "lucide-react";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ROLL_NUMBER = /^(?=.*\d)[a-z0-9][a-z0-9._/-]{2,29}$/;
const COLLEGE_ADDRESS = /^[a-z0-9._-]+@xyzuniversity\.ac\.in$/;
const isCollegeId = (value: string) => {
  const v = value.trim().toLowerCase();
  return ROLL_NUMBER.test(v) || COLLEGE_ADDRESS.test(v);
};

export default function SignupPage() {
  const [idCardFile, setIdCardFile] = useState<File | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);

  // Local preview of the chosen photo; the object URL is released when the photo changes.
  const idCardPreview = useMemo(() => (idCardFile ? URL.createObjectURL(idCardFile) : null), [idCardFile]);
  useEffect(() => {
    return () => {
      if (idCardPreview) URL.revokeObjectURL(idCardPreview);
    };
  }, [idCardPreview]);
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [collegeId, setCollegeId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [done, setDone] = useState(false);
  const [touched, setTouched] = useState({ email: false, collegeId: false, password: false });

  const emailProblem = email.trim() && !EMAIL.test(email.trim()) ? "Enter a valid email address." : "";
  const collegeIdProblem =
    collegeId.trim() && !isCollegeId(collegeId) ? "Use your roll number (e.g. 2024CS123) or college ID (e.g. 2024cs123@xyzuniversity.ac.in)." : "";
  const passwordProblem = password && password.length < 8 ? "At least 8 characters." : "";

  const handleSignup = async () => {
    if (submitting || done) return;
    setTouched({ email: true, collegeId: true, password: true });

    const missing = [
      !name.trim() && "full name",
      !email.trim() && "email",
      !collegeId.trim() && "roll number / college ID",
      !password && "password",
    ].filter(Boolean);
    if (missing.length) {
      setNotice({ type: "error", message: `Please enter your ${missing.join(", ")}.` });
      return;
    }
    const problem = emailProblem || collegeIdProblem || (passwordProblem && "Password must be at least 8 characters.");
    if (problem) {
      setNotice({ type: "error", message: problem });
      return;
    }

    setSubmitting(true);
    setNotice(null);

    try {
      const formData = new FormData();

      formData.append("name", name.trim());
      formData.append("email", email.trim());
      formData.append("collegeId", collegeId.trim());
      formData.append("password", password);

      if (idCardFile) {
        formData.append("profilePicture", idCardFile);
      }

      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        setDone(true);
        setNotice({
          type: "success",
          message: data.message || "Signup request submitted. A staff or admin member will review it before you can log in.",
        });
        setTimeout(() => router.push("/login"), 2200);
      } else {
        setNotice({ type: "error", message: data.message || "Signup Failed" });
      }
    } catch {
      setNotice({ type: "error", message: "Could not reach the server. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-3xl p-10">
        <h1 className="text-5xl font-bold mb-10">Signup</h1>

        <form
          className="space-y-5"
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            handleSignup();
          }}
        >
          <input
            type="text"
            autoComplete="name"
            maxLength={80}
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-4 bg-black border border-zinc-700 rounded-xl outline-none"
          />

          <div>
            <input
              type="email"
              autoComplete="email"
              maxLength={120}
              placeholder="Email (e.g. rahul@gmail.com)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, email: true }))}
              aria-invalid={!!(touched.email && emailProblem)}
              className={`w-full p-4 bg-black border rounded-xl outline-none ${touched.email && emailProblem ? "border-red-500/60" : "border-zinc-700"}`}
            />
            {touched.email && emailProblem && <p className="mt-1.5 text-xs text-red-300">{emailProblem}</p>}
          </div>

          <div>
            <input
              type="text"
              autoComplete="off"
              maxLength={60}
              placeholder="Roll number or college ID (e.g. 2024CS123)"
              value={collegeId}
              onChange={(e) => setCollegeId(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, collegeId: true }))}
              aria-invalid={!!(touched.collegeId && collegeIdProblem)}
              className={`w-full p-4 bg-black border rounded-xl outline-none ${touched.collegeId && collegeIdProblem ? "border-red-500/60" : "border-zinc-700"}`}
            />
            {touched.collegeId && collegeIdProblem ? (
              <p className="mt-1.5 text-xs text-red-300">{collegeIdProblem}</p>
            ) : (
              <p className="mt-1.5 text-xs text-zinc-500">You can log in with this or your email.</p>
            )}
          </div>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              maxLength={128}
              placeholder="Password (at least 8 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, password: true }))}
              aria-invalid={!!(touched.password && passwordProblem)}
              className={`w-full p-4 pr-12 bg-black border rounded-xl outline-none ${touched.password && passwordProblem ? "border-red-500/60" : "border-zinc-700"}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            {touched.password && passwordProblem && <p className="mt-1.5 text-xs text-red-300">{passwordProblem}</p>}
          </div>

          <div>
            <p className="mb-2 text-sm text-zinc-400">College ID card photo (optional, staff check it when you return gear)</p>
            {idCardPreview ? (
              <div className="flex items-center gap-4 rounded-2xl border border-zinc-700 bg-black p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={idCardPreview} alt="Selected ID card" className="h-20 w-32 rounded-xl object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">{idCardFile?.name}</p>
                  <p className="text-xs text-zinc-500">{((idCardFile?.size ?? 0) / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <button
                  type="button"
                  aria-label="Remove photo"
                  onClick={() => {
                    setIdCardFile(null);
                    setFileInputKey((k) => k + 1);
                  }}
                  className="rounded-xl border border-zinc-700 p-2 text-zinc-400 hover:border-red-500/40 hover:text-red-300"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-zinc-700 bg-black px-5 py-4 text-sm text-zinc-400 transition hover:border-green-500/50 hover:text-zinc-200">
                <ImagePlus size={20} className="text-green-400" />
                Choose a photo (JPG, PNG or WEBP, up to 5 MB)
                <input
                  key={fileInputKey}
                  type="file"
                  accept={ID_PHOTO_TYPES.join(",")}
                  className="sr-only"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const problem = checkIdPhoto(file);
                    if (problem) {
                      setNotice({ type: "error", message: problem });
                      setFileInputKey((k) => k + 1);
                      return;
                    }
                    setNotice(null);
                    setIdCardFile(file);
                  }}
                />
              </label>
            )}
          </div>

          {notice && (
            <div
              role="alert"
              className={`rounded-xl border px-5 py-4 text-sm font-medium ${
                notice.type === "success"
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                  : "border-red-500/30 bg-red-500/10 text-red-300"
              }`}
            >
              {notice.message}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || done}
            className="w-full bg-green-600 hover:bg-green-500 transition py-4 rounded-xl font-semibold disabled:opacity-60"
          >
            {submitting ? "Submitting..." : done ? "Taking you to login..." : "Create Account"}
          </button>

          <p className="text-center text-sm text-zinc-500">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-green-400 hover:text-green-300">
              Log in
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}



