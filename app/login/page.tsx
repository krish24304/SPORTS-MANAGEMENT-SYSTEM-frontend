"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, Eye, EyeOff, XCircle } from "lucide-react";
import { saveUser } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [collegeId, setCollegeId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [approvalStatus, setApprovalStatus] = useState<"pending" | "rejected" | null>(null);

  const handleLogin = async () => {
    setSubmitting(true);
    setError("");
    setApprovalStatus(null);

    try {
      const response = await fetch("http://localhost:5000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          collegeId,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setApprovalStatus(data.approvalStatus === "pending" || data.approvalStatus === "rejected" ? data.approvalStatus : null);
        setError(data.message || "Login Failed");
        return;
      }

      saveUser(data);

      if (data.role === "admin") {
        router.push("/admin");
      } else if (data.role === "staff") {
        router.push("/staff");
      } else {
        router.push("/sports");
      }
    } catch (error) {
      console.log(error);
      setError("Could not reach the server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-3xl p-10">
        <h1 className="text-5xl font-bold mb-10">Login</h1>
        <div className="space-y-5">
          <input
            type="text"
            placeholder="College ID or email"
            value={collegeId}
            onChange={(e) => setCollegeId(e.target.value)}
            className="w-full p-4 bg-black border border-zinc-700 rounded-xl outline-none"
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 pr-12 bg-black border border-zinc-700 rounded-xl outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {error && (
            <motion.div
              role="alert"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-start gap-3 rounded-xl border px-5 py-4 text-sm font-medium ${
                approvalStatus === "pending"
                  ? "border-amber-500/30 bg-amber-500/10 text-amber-200"
                  : "border-red-500/30 bg-red-500/10 text-red-300"
              }`}
            >
              {approvalStatus === "pending" ? (
                <Clock size={18} className="mt-0.5 shrink-0" />
              ) : (
                <XCircle size={18} className="mt-0.5 shrink-0" />
              )}
              <div>
                <p>{error}</p>
                {approvalStatus === "rejected" && (
                  <Link href="/signup" className="mt-2 inline-block font-bold text-white underline underline-offset-4">
                    Sign up again →
                  </Link>
                )}
              </div>
            </motion.div>
          )}

          <button
            onClick={handleLogin}
            disabled={submitting}
            className="w-full bg-blue-600 hover:bg-blue-500 transition py-4 rounded-xl font-semibold disabled:opacity-60"
          >
            {submitting ? "Signing in..." : "Login"}
          </button>
        </div>
      </div>
    </main>
  );
}
