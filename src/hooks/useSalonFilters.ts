import { useMemo, useState } from "react";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import type { SalonSearchParams } from "@/hooks/useSalons";

export interface UseSalonFiltersResult {
  query: string;
  setQuery: (value: string) => void;
  searchParams: SalonSearchParams;
}

export function useSalonFilters(initialQuery = ""): UseSalonFiltersResult {
  const [query, setQuery] = useState(initialQuery);

  const debouncedQuery = useDebouncedValue(query, 300);

  const searchParams = useMemo<SalonSearchParams>(
    () => ({ q: debouncedQuery.trim() || undefined }),
    [debouncedQuery]
  );

  return { query, setQuery, searchParams };
}
