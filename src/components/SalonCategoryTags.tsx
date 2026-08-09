export default function SalonCategoryTags({ categories }: { categories: string[] }) {
  if (categories.length === 0) return null;

  const shown = categories.slice(0, 3);
  const remaining = categories.length - shown.length;

  return (
    <div className="flex flex-wrap gap-1">
      {shown.map((category) => (
        <span
          key={category}
          className="rounded-full border border-sage/30 bg-sage/10 px-2 py-0.5 text-xs text-link-sage"
        >
          {category}
        </span>
      ))}
      {remaining > 0 && (
        <span className="rounded-full border border-sage/30 bg-sage/10 px-2 py-0.5 text-xs text-link-sage">
          +{remaining}
        </span>
      )}
    </div>
  );
}
