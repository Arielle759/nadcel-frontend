"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b border-black/[.08] dark:border-white/[.145]">
      <Link href="/" className="font-semibold text-lg">
        Nadcel
      </Link>
      <div className="flex items-center gap-6 text-sm font-medium">
        <Link href="/login">Login</Link>
      </div>
    </nav>
  );
}
