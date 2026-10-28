"use client";

import { Search } from "lucide-react";
import type { UseSalonFiltersResult } from "@/hooks/useSalonFilters";

export default function SalonFilterBar({ filters }: { filters: UseSalonFiltersResult }) {
  const { query, setQuery } = filters;

  return (
    <div className="relative w-full max-w-lg">
      <Search
        size={18}
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-terracotta"
        aria-hidden="true"
      />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Rechercher..."
        className="w-full rounded-full border border-sage/40 bg-beige py-2.5 pl-11 pr-4 text-sm text-anthracite outline-none focus:border-dark-sage"
      />
    </div>
  );
}
