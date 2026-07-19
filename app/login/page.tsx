"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {

  try {

    const response = await fetch(
      "http://localhost:5000/auth/login",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          email,
          password,
        }),
      }
    );

    const data = await response.json();

    console.log("DATA =", data);

    if (!response.ok) {

      alert(
        data.message || "Login Failed"
      );

      return;
    }

    localStorage.setItem(
      "user",
      JSON.stringify(data)
    );

    if (data.role === "admin") {

      router.push("/admin");

    } else if (
      data.role === "staff"
    ) {

      router.push("/staff");

    } else {

      router.push("/sports");

    }

  } catch (error) {

    console.log(error);

    alert("Server Error");

  }

};
  return (

    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">

      <div className="w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-3xl p-10">

        <h1 className="text-5xl font-bold mb-10">
          Login
        </h1>
        <div className="space-y-5">

          <input
            type="email"
            placeholder="College Email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            className="w-full p-4 bg-black border border-zinc-700 rounded-xl outline-none"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            className="w-full p-4 bg-black border border-zinc-700 rounded-xl outline-none"
          />

          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 hover:bg-blue-500 transition py-4 rounded-xl font-semibold"
          >
            Login
          </button>
        </div>
      </div>
    </main>
  );
}