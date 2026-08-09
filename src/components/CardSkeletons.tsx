export default function CardSkeletons({ count = 3 }: { count?: number }) {
  return (
    <div
      className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
      aria-label="Chargement du contenu"
      aria-busy="true"
    >
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-2xl border border-sage/20 bg-beige shadow-sm"
        >
          <div className="aspect-[4/3] animate-pulse bg-sage/20" />
          <div className="space-y-3 p-5">
            <div className="h-5 w-2/3 animate-pulse rounded-full bg-sage/25" />
            <div className="h-4 w-1/2 animate-pulse rounded-full bg-sage/15" />
            <div className="h-4 w-full animate-pulse rounded-full bg-sage/15" />
          </div>
        </div>
      ))}
    </div>
  );
}
