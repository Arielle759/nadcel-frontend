import { DAYS, DEFAULT_DAY_HOURS, DayKey, OpeningHours } from "@/lib/openingHours";

interface OpeningHoursEditorProps {
  value: OpeningHours | null;
  onChange: (value: OpeningHours | null) => void;
}

export default function OpeningHoursEditor({ value, onChange }: OpeningHoursEditorProps) {
  const isCustom = value !== null;

  function setDay(day: DayKey, hours: OpeningHours[DayKey]) {
    onChange({ ...(value ?? {}), [day]: hours });
  }

  function toggleCustom() {
    onChange(isCustom ? null : Object.fromEntries(DAYS.map((d) => [d.key, DEFAULT_DAY_HOURS])));
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Horaires d&apos;ouverture</span>
        <button
          type="button"
          onClick={toggleCustom}
          className="text-xs font-medium text-link-sage hover:underline"
        >
          {isCustom ? "Revenir aux horaires par défaut (9h-19h)" : "Personnaliser les horaires"}
        </button>
      </div>

      {!isCustom && (
        <p className="text-sm text-anthracite/75">
          Par défaut, votre salon est ouvert de 9h à 19h tous les jours.
        </p>
      )}

      {isCustom && (
        <div className="flex flex-col gap-2">
          {DAYS.map(({ key, label }) => {
            const dayHours = value?.[key] ?? null;
            const isOpen = dayHours !== null;

            return (
              <div key={key} className="flex flex-wrap items-center gap-3">
                <label className="flex w-32 items-center gap-2 text-sm text-anthracite">
                  <input
                    type="checkbox"
                    checked={isOpen}
                    onChange={(e) => setDay(key, e.target.checked ? DEFAULT_DAY_HOURS : null)}
                    className="h-4 w-4 rounded border-sage/40"
                  />
                  {label}
                </label>
                {isOpen ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={dayHours.open}
                      onChange={(e) => setDay(key, { ...dayHours, open: e.target.value })}
                      className="rounded-md border border-sage/40 px-2 py-1 text-sm"
                    />
                    <span className="text-sm text-anthracite/60">à</span>
                    <input
                      type="time"
                      value={dayHours.close}
                      onChange={(e) => setDay(key, { ...dayHours, close: e.target.value })}
                      className="rounded-md border border-sage/40 px-2 py-1 text-sm"
                    />
                  </div>
                ) : (
                  <span className="text-sm text-anthracite/50">Fermé</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
