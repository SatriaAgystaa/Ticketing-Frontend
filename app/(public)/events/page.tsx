import Link from "next/link";
import { eventsApi } from "@/lib/api/events";
import { EventCard } from "@/components/shared/event-card";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function EventsPage({ searchParams }: { searchParams: SearchParams }) {
  const { category, city, sort, page } = await searchParams;

  const [eventsRes, categoriesRes] = await Promise.allSettled([
    eventsApi.list({
      category: typeof category === "string" ? category : undefined,
      city: typeof city === "string" ? city : undefined,
      sort: (typeof sort === "string" ? sort : "newest") as "newest" | "popular" | "date",
      page: page ? Number(page) : 1,
      limit: 12,
    }),
    eventsApi.getCategories(),
  ]);

  const events = eventsRes.status === "fulfilled" ? eventsRes.value.data : [];
  const categories = categoriesRes.status === "fulfilled" ? categoriesRes.value.data : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900">Jelajahi Event</h1>
      <p className="mt-2 text-gray-600">
        Temukan event yang sesuai dengan minat Anda.
      </p>

      {/* Category Filter */}
      {categories.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            href="/events"
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              !category
                ? "border-indigo-600 bg-indigo-600 text-white"
                : "border-gray-300 text-gray-700 hover:border-gray-400"
            }`}
          >
            Semua
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/events?category=${cat.slug}${city ? `&city=${city}` : ""}`}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                category === cat.slug
                  ? "border-indigo-600 bg-indigo-600 text-white"
                  : "border-gray-300 text-gray-700 hover:border-gray-400"
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </div>
      )}

      {/* Event List */}
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>

      {events.length === 0 && (
        <div className="mt-12 text-center">
          <p className="text-gray-500">Tidak ada event yang ditemukan.</p>
          <Link
            href="/events"
            className="mt-4 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            Hapus semua filter
          </Link>
        </div>
      )}
    </div>
  );
}
