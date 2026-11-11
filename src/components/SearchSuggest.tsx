"use client";

import { KeyboardEvent, RefObject, useEffect, useId, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, MapPin, Scissors } from "lucide-react";
import { api } from "@/lib/api";

interface Suggestions {
  salons: { id: number; name: string; area: string }[];
  services: string[];
  places: string[];
}

type Option =
  | { kind: "salon"; id: number; label: string; hint: string }
  | { kind: "service" | "place"; label: string };

const EMPTY: Suggestions = { salons: [], services: [], places: [] };
const DELAY_MS = 200;

const GROUPS: { kind: Option["kind"]; title: string; Icon: typeof MapPin }[] = [
  { kind: "salon", title: "Salons", Icon: Building2 },
  { kind: "service", title: "Services", Icon: Scissors },
  { kind: "place", title: "Quartiers et villes", Icon: MapPin },
];

// Champ de recherche avec suggestions pendant la saisie (motif « combobox »
// WAI-ARIA) : flèches pour parcourir, Entrée pour choisir, Échap pour fermer.
// Un salon ouvre directement sa page ; un service ou un lieu devient le
// terme recherché (onPickTerm).
export default function SearchSuggest({
  id,
  value,
  onChange,
  onPickTerm,
  placeholder,
  className,
  inputRef,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  onPickTerm: (term: string) => void;
  placeholder: string;
  className: string;
  inputRef?: RefObject<HTMLInputElement | null>;
}) {
  const router = useRouter();
  const listId = useId();
  const [data, setData] = useState<Suggestions>(EMPTY);
  const [loadedFor, setLoadedFor] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  const term = value.trim();

  useEffect(() => {
    if (!term || !open) return;
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      try {
        const { data: result } = await api.get<Suggestions>("/search/suggestions", { params: { q: term } });
        if (!cancelled) {
          setData(result);
          setLoadedFor(term);
          setActive(-1);
        }
      } catch {
        if (!cancelled) {
          setData(EMPTY);
          setLoadedFor(term);
        }
      }
    }, DELAY_MS);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [term, open]);

  const options = useMemo<Option[]>(
    () => [
      ...data.salons.map((s) => ({ kind: "salon" as const, id: s.id, label: s.name, hint: s.area })),
      ...data.services.map((label) => ({ kind: "service" as const, label })),
      ...data.places.map((label) => ({ kind: "place" as const, label })),
    ],
    [data]
  );

  const visible = open && term !== "" && loadedFor !== "" && loadedFor === term;
  const optionId = (index: number) => `${listId}-option-${index}`;

  function choose(option: Option) {
    setOpen(false);
    setActive(-1);
    if (option.kind === "salon") {
      router.push(`/salons/${option.id}`);
      return;
    }
    onChange(option.label);
    onPickTerm(option.label);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setOpen(false);
      setActive(-1);
      return;
    }
    if (!visible || options.length === 0) {
      if (event.key === "ArrowDown") setOpen(true);
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((current) => (current + 1) % options.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((current) => (current <= 0 ? options.length - 1 : current - 1));
    } else if (event.key === "Enter" && active >= 0) {
      event.preventDefault();
      choose(options[active]);
    }
  }

  let index = -1;

  return (
    <div className="relative w-full">
      <input
        ref={inputRef}
        id={id}
        type="search"
        role="combobox"
        aria-expanded={visible}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={visible && active >= 0 ? optionId(active) : undefined}
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoComplete="off"
        className={className}
      />

      <p className="sr-only" aria-live="polite">
        {visible ? (options.length === 0 ? "Aucune suggestion" : `${options.length} suggestions disponibles`) : ""}
      </p>

      {visible && (
        <div
          id={listId}
          role="listbox"
          aria-label="Suggestions"
          className="absolute left-0 right-0 top-full z-50 mt-3 max-h-80 overflow-y-auto rounded-2xl bg-white p-2 text-left shadow-[0_18px_50px_rgba(40,25,18,0.22)]"
        >
          {options.length === 0 ? (
            <p className="px-3 py-3 text-sm text-anthracite/65">Aucune suggestion. Lancez la recherche pour voir tous les résultats.</p>
          ) : (
            GROUPS.map(({ kind, title, Icon }) => {
              const items = options.filter((o) => o.kind === kind);
              if (items.length === 0) return null;
              return (
                <div key={kind} role="group" aria-label={title} className="py-1">
                  <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-anthracite/50" aria-hidden="true">
                    {title}
                  </p>
                  {items.map((option) => {
                    index += 1;
                    const current = index;
                    const selected = current === active;
                    return (
                      <div
                        key={`${kind}-${option.label}-${current}`}
                        id={optionId(current)}
                        role="option"
                        aria-selected={selected}
                        onMouseDown={(event) => event.preventDefault()}
                        onMouseEnter={() => setActive(current)}
                        onClick={() => choose(option)}
                        className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm ${
                          selected ? "bg-beige text-brand" : "text-anthracite"
                        }`}
                      >
                        <Icon size={16} className="shrink-0 text-anthracite/45" aria-hidden="true" />
                        <span className="min-w-0 truncate font-medium">{option.label}</span>
                        {option.kind === "salon" && (
                          <span className="ml-auto shrink-0 truncate text-xs text-anthracite/55">{option.hint}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
