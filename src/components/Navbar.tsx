"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b border-sage/30 bg-beige">
      <Link href="/" className="font-semibold text-lg text-dark-sage">
        Nadcel
      </Link>
      <div className="flex items-center gap-6 text-sm font-medium text-anthracite">
        <Link href="/client/appointments" className="hover:text-dark-sage">
          Mes réservations
        </Link>
        <Link href="/login" className="hover:text-dark-sage">
          Login
        </Link>
      </div>
    </nav>
  );
}
