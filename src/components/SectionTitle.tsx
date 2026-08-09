import type { LucideIcon } from "lucide-react";

export default function SectionTitle({
  icon: Icon,
  children,
}: {
  icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <h2 className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.14em] text-forest">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sage/15 text-link-sage">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      {children}
    </h2>
  );
}
