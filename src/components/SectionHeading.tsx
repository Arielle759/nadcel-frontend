import { ui } from "@/lib/ui";

// Titre de section en deux temps : l'idée principale, puis une seconde ligne
// plus claire qui la précise.
export default function SectionHeading({
  id,
  title,
  muted,
  description,
  align = "left",
  onDark = false,
}: {
  id?: string;
  title: string;
  muted?: string;
  description?: string;
  align?: "left" | "center";
  onDark?: boolean;
}) {
  const centered = align === "center";
  return (
    <div className={centered ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <h2 id={id} className={`${ui.sectionTitleBase} ${onDark ? "text-beige" : "text-forest"}`}>
        {title}
        {muted && <span className={onDark ? "block text-beige/60" : ui.sectionTitleMuted}>{muted}</span>}
      </h2>
      {description && (
        <p className={`mt-5 text-lg leading-8 ${onDark ? "text-beige/80" : "text-anthracite/75"}`}>{description}</p>
      )}
    </div>
  );
}
