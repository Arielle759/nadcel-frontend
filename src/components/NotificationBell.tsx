import Link from "next/link";
import { Bell } from "lucide-react";

// Cloche des espaces privés : le compteur est celui des éléments qui attendent
// vraiment une action (demandes de salons, rendez-vous à confirmer), et le
// clic mène à la liste correspondante. Pas de fausse notification.
// dot : simple point (mise en page « hub ») au lieu du nombre.
export default function NotificationBell({
  count,
  label,
  href,
  dot = false,
}: {
  count: number | null;
  label: string;
  href: string;
  dot?: boolean;
}) {
  const shown = count !== null && count > 0;
  const text = shown ? `${count} ${label}` : `Aucun élément en attente : ${label}`;
  return (
    <Link
      href={href}
      title={text}
      className="relative flex size-11 items-center justify-center rounded-full text-anthracite/75 transition-colors hover:bg-white/70 hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      <Bell size={21} aria-hidden="true" />
      <span className="sr-only">{text}</span>
      {shown && dot && <span aria-hidden="true" className="absolute right-2.5 top-2.5 size-2 rounded-full bg-[var(--color-chart-2)]" />}
      {shown && !dot && (
        <span
          aria-hidden="true"
          className="absolute right-1 top-1 flex min-w-5 items-center justify-center rounded-full bg-alert px-1 text-[11px] font-semibold leading-5 text-white"
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
