import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="w-full bg-zinc-900 text-white px-6 py-4 flex justify-between items-center border-b border-zinc-800">
      
      <h1 className="text-xl font-bold">
        Sports Management System
      </h1>

      <div className="flex gap-6 text-sm">

        <Link
          href="/"
          className="hover:text-gray-400 transition-colors"
        >
          Home
        </Link>

        <Link
          href="/sports"
          className="hover:text-gray-400 transition-colors"
        >
          Sports
        </Link>

        <Link
          href="/login"
          className="hover:text-gray-400 transition-colors"
        >
          Login
        </Link>

      </div>
    </nav>
  );
}