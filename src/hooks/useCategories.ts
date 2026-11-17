"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export interface Category {
  name: string;
  salons_count: number;
}

// Catégories réellement proposées par les salons en ligne (menu « Services »).
// Chargées une fois par visite et partagées entre les composants.
let cache: Promise<Category[]> | null = null;

function fetchCategories(): Promise<Category[]> {
  cache ??= api
    .get<Category[]>("/categories")
    .then(({ data }) => data)
    .catch((err) => {
      cache = null; // nouvel essai au prochain affichage
      throw err;
    });
  return cache;
}

export function useCategories(): { categories: Category[] | null; error: boolean } {
  const [state, setState] = useState<{ categories: Category[] | null; error: boolean }>({ categories: null, error: false });

  useEffect(() => {
    let active = true;
    fetchCategories()
      .then((categories) => active && setState({ categories, error: false }))
      .catch(() => active && setState({ categories: null, error: true }));
    return () => {
      active = false;
    };
  }, []);

  return state;
}
