"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [idCardFile, setIdCardFile] =
  useState<File | null>(null);
  const router = useRouter();

  const [name, setName] = useState("");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [role, setRole] = useState("student");

  const [idCard, setIdCard] = useState("");

  const handleSignup = async () => {

    if (
      !name ||
      !email ||
      !password
    ) {

      alert("Fill all fields");

      return;

    }

    try {

    const formData = new FormData();

    formData.append("name", name);

    formData.append("email", email);

    formData.append("password", password);

    formData.append("role", role);

    if (idCardFile) {

      formData.append(
        "idCard",
        idCardFile
      );

    }

    const response = await fetch(
      "http://localhost:5000/auth/signup",
      {

        method: "POST",

        body: formData,

      }
    );

    const data = await response.json();

    console.log("DATA =", data);

    if (response.ok) {

      alert("Signup Successful");

      router.push("/login");

    } else {

      alert(
        data.message ||
        "Signup Failed"
      );

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
          Signup
        </h1>

        <div className="space-y-5">

          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
            className="w-full p-4 bg-black border border-zinc-700 rounded-xl outline-none"
          />

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
          <select
            value={role}
            onChange={(e) =>
              setRole(e.target.value)
            }
            className="w-full p-4 bg-black border border-zinc-700 rounded-xl outline-none"
          >
            <option value="">
    Select Role
  </option>
            <option value="student">
              Student
            </option>

            <option value="staff">
              Staff
            </option>

            <option value="admin">
              Admin
            </option>

          </select>

          <input
      
  type="file"
  accept=".png,.jpg,.jpeg,.pdf"
  onChange={(e) => {

    if (e.target.files?.[0]) {

      setIdCardFile(
        e.target.files[0]
      );

    }

  }}
  className="w-full bg-zinc-900 border border-zinc-700 rounded-2xl px-5 py-4"
/>

          <button
            onClick={handleSignup}
            className="w-full bg-green-600 hover:bg-green-500 transition py-4 rounded-xl font-semibold"
          >
            Create Account
          </button>

        </div>

      </div>

    </main>

  );

}



