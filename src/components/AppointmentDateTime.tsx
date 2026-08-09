import { CalendarDays, Clock3 } from "lucide-react";

export default function AppointmentDateTime({ scheduledAt }: { scheduledAt: string }) {
  const date = new Date(scheduledAt);
  const dateLabel = date.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const timeLabel = date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-anthracite/75">
      <span className="inline-flex items-center gap-2">
        <CalendarDays size={16} className="text-link-sage" aria-hidden="true" />
        <span className="first-letter:uppercase">{dateLabel}</span>
      </span>
      <span className="inline-flex items-center gap-2">
        <Clock3 size={16} className="text-link-sage" aria-hidden="true" />
        {timeLabel}
      </span>
    </div>
  );
}
