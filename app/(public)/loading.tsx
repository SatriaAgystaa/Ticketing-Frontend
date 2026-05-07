export default function PublicLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Title skeleton */}
      <div className="h-8 w-64 animate-pulse rounded-lg bg-gray-200" />
      <div className="mt-3 h-5 w-96 animate-pulse rounded-lg bg-gray-200" />

      {/* Card grid skeleton */}
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-xl border border-gray-200 bg-white"
          >
            <div className="aspect-[16/9] animate-pulse bg-gray-100" />
            <div className="space-y-3 p-4">
              <div className="h-4 w-32 animate-pulse rounded bg-gray-100" />
              <div className="h-5 w-48 animate-pulse rounded bg-gray-100" />
              <div className="h-4 w-24 animate-pulse rounded bg-gray-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
