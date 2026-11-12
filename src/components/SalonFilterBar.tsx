"use client";

import { Search, X } from "lucide-react";
import type { UseSalonFiltersResult } from "@/hooks/useSalonFilters";
import SearchSuggest from "@/components/SearchSuggest";

export default function SalonFilterBar({ filters }: { filters: UseSalonFiltersResult }) {
  const { query, setQuery } = filters;

  return (
    <div role="search" className="relative w-full max-w-xl">
      <label htmlFor="salon-search" className="sr-only">
        Rechercher un salon
      </label>
      <Search
        size={18}
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-anthracite/75"
        aria-hidden="true"
      />
      <SearchSuggest
        id="salon-search"
        value={query}
        onChange={setQuery}
        onPickTerm={setQuery}
        placeholder="Coiffure, Plateau, nom du salon..."
        className="h-12 w-full rounded-full border border-sable/40 bg-white/70 pl-11 pr-11 text-base text-anthracite outline-none transition-colors focus-visible:outline-none placeholder:text-anthracite/75 focus:border-brand focus:ring-2 focus:ring-brand-soft/30 [&::-webkit-search-cancel-button]:hidden"
      />
      {query && (
        <button
          type="button"
          onClick={() => setQuery("")}
          aria-label="Effacer la recherche"
          className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-anthracite/75 hover:bg-sable/15 hover:text-brand"
        >
          <X size={16} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
