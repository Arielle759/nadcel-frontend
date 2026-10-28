export default function CardSkeletons({ count = 3 }: { count?: number }) {
  return (
    <div
      className="grid w-full grid-cols-1 gap-x-7 gap-y-10 sm:grid-cols-2 lg:grid-cols-3"
      aria-label="Chargement du contenu"
      aria-busy="true"
    >
      {Array.from({ length: count }, (_, index) => (
        <div key={index}>
          <div className="aspect-[4/3] animate-pulse rounded-2xl bg-sage/20" />
          <div className="mt-4 space-y-2 px-1">
            <div className="h-5 w-2/3 animate-pulse rounded-full bg-sage/25" />
            <div className="h-4 w-1/2 animate-pulse rounded-full bg-sage/15" />
          </div>
        </div>
      ))}
    </div>
  );
}
