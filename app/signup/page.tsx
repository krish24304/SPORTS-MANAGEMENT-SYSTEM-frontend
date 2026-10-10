"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export default function SignupPage() {
  const [idCardFile, setIdCardFile] = useState<File | null>(null);
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [collegeId, setCollegeId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleSignup = async () => {
    if (!name || !email || !collegeId || !password) {
      setNotice({ type: "error", message: "Please fill all fields" });
      return;
    }

    setSubmitting(true);
    setNotice(null);

    try {
      const formData = new FormData();

      formData.append("name", name);
      formData.append("email", email);
      formData.append("collegeId", collegeId);
      formData.append("password", password);

      if (idCardFile) {
        formData.append("profilePicture", idCardFile);
      }

      const response = await fetch("http://localhost:5000/auth/signup", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setNotice({
          type: "success",
          message: data.message || "Signup request submitted. A staff or admin member will review it before you can log in.",
        });
        setTimeout(() => router.push("/login"), 2200);
      } else {
        setNotice({ type: "error", message: data.message || "Signup Failed" });
      }
    } catch (error) {
      console.log(error);
      setNotice({ type: "error", message: "Could not reach the server. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-3xl p-10">
        <h1 className="text-5xl font-bold mb-10">Signup</h1>

        <div className="space-y-5">
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-4 bg-black border border-zinc-700 rounded-xl outline-none"
          />

          <input
            type="email"
            placeholder="College Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-4 bg-black border border-zinc-700 rounded-xl outline-none"
          />

          <input
            type="text"
            placeholder="College ID (e.g. 2024cs123@xyzuniversity.ac.in)"
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

          <input
            type="file"
            accept=".png,.jpg,.jpeg,.pdf"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                setIdCardFile(e.target.files[0]);
              }
            }}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-2xl px-5 py-4"
          />

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
            onClick={handleSignup}
            disabled={submitting}
            className="w-full bg-green-600 hover:bg-green-500 transition py-4 rounded-xl font-semibold disabled:opacity-60"
          >
            {submitting ? "Submitting..." : "Create Account"}
          </button>
        </div>
      </div>
    </main>
  );
}



