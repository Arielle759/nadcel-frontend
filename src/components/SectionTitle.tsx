import type { LucideIcon } from "lucide-react";

// Titre de section sobre : pas de pastille d'icône décorative.
// La prop `icon` est conservée pour ne pas casser les appels existants, mais n'est plus affichée.
export default function SectionTitle({
  children,
}: {
  icon?: LucideIcon;
  children: React.ReactNode;
}) {
  return <h2 className="text-lg font-semibold text-forest">{children}</h2>;
}
