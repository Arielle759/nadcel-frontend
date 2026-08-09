import type { LucideIcon } from "lucide-react";

export default function EmptyState({
  message,
  icon: Icon,
}: {
  message: string;
  icon?: LucideIcon;
}) {
  return (
    <div className="flex flex-col items-center gap-2 py-8 text-center text-anthracite/75">
      {Icon && <Icon className="h-8 w-8 text-anthracite/30" />}
      <p>{message}</p>
    </div>
  );
}
