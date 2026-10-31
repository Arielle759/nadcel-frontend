import { DAYS, DEFAULT_DAY_HOURS, DayKey, OpeningHours } from "@/lib/openingHours";
import { ui } from "@/lib/ui";

interface OpeningHoursEditorProps {
  value: OpeningHours | null;
  onChange: (value: OpeningHours | null) => void;
}

const timeInput =
  "h-10 rounded-lg bg-white px-2 text-sm text-anthracite outline-none shadow-[0_0_0_1px_rgba(45,59,40,0.12)] focus:shadow-[0_0_0_2px_var(--color-forest)]";

export default function OpeningHoursEditor({ value, onChange }: OpeningHoursEditorProps) {
  const isCustom = value !== null;

  function setDay(day: DayKey, hours: OpeningHours[DayKey]) {
    onChange({ ...(value ?? {}), [day]: hours });
  }

  function toggleCustom() {
    onChange(isCustom ? null : Object.fromEntries(DAYS.map((d) => [d.key, DEFAULT_DAY_HOURS])));
  }

  return (
    <div className="flex flex-col gap-5">
      {!isCustom ? (
        <p className="text-sm leading-6 text-anthracite/80">
          Horaires standard : ouvert tous les jours de 9 h à 19 h. Les créneaux proposés aux clientes suivent ces horaires.
        </p>
      ) : (
        <ul className="flex flex-col gap-1">
          {DAYS.map(({ key, label }) => {
            const dayHours = value?.[key] ?? null;
            const isOpen = dayHours !== null;

            return (
              <li key={key} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-2.5">
                <label className="flex w-36 items-center gap-3 text-sm font-medium text-anthracite">
                  <input
                    type="checkbox"
                    checked={isOpen}
                    onChange={(e) => setDay(key, e.target.checked ? DEFAULT_DAY_HOURS : null)}
                    className="h-4 w-4 accent-[var(--color-forest)]"
                  />
                  {label}
                </label>
                {isOpen ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      aria-label={`${label}, ouverture`}
                      value={dayHours.open}
                      onChange={(e) => setDay(key, { ...dayHours, open: e.target.value })}
                      className={timeInput}
                    />
                    <span className="text-sm text-anthracite/70">à</span>
                    <input
                      type="time"
                      aria-label={`${label}, fermeture`}
                      value={dayHours.close}
                      onChange={(e) => setDay(key, { ...dayHours, close: e.target.value })}
                      className={timeInput}
                    />
                  </div>
                ) : (
                  <span className="text-sm text-anthracite/60">Fermé</span>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <div>
        <button type="button" onClick={toggleCustom} className={ui.buttonSecondary}>
          {isCustom ? "Revenir aux horaires standard" : "Personnaliser les jours et les heures"}
        </button>
      </div>
    </div>
  );
}
