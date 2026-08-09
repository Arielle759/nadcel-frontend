import type { LucideIcon } from "lucide-react";

export default function SectionTitle({
  icon: Icon,
  children,
}: {
  icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-anthracite/75">
      <Icon className="h-4 w-4" />
      {children}
    </h2>
  );
}
