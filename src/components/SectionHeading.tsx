import { ui } from "@/lib/ui";

// Titre de section, avec une phrase d'introduction facultative.
export default function SectionHeading({
  id,
  title,
  description,
  align = "left",
  onDark = false,
}: {
  id?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  onDark?: boolean;
}) {
  const centered = align === "center";
  return (
    <div className={centered ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <h2 id={id} className={`${ui.sectionTitleBase} ${onDark ? "text-beige" : "text-forest"}`}>
        {title}
      </h2>
      {description && (
        <p className={`mt-5 text-lg leading-8 ${onDark ? "text-beige/80" : "text-anthracite/75"}`}>{description}</p>
      )}
    </div>
  );
}
