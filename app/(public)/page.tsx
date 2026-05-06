import Link from "next/link";
import { Search } from "lucide-react";
import { eventsApi } from "@/lib/api/events";
import { EventCard } from "@/components/shared/event-card";

export default async function HomePage() {
  const [eventsRes, categoriesRes] = await Promise.allSettled([
    eventsApi.list({ sort: "popular", limit: 6 }),
    eventsApi.getCategories(),
  ]);

  const featuredEvents = eventsRes.status === "fulfilled" ? eventsRes.value.data : [];
  const categories = categoriesRes.status === "fulfilled" ? categoriesRes.value.data : [];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      {/* Hero */}
      <section className="py-16 text-center sm:py-24">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-5xl">
          Temukan Event Terbaik di Indonesia
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
          Jelajahi ribuan event konser, festival, seminar, workshop, dan pameran di seluruh Indonesia.
        </p>
        <div className="mx-auto mt-8 flex max-w-xl items-center gap-2">
          <Link
            href="/search"
            className="flex w-full items-center gap-3 rounded-full border border-zinc-300 bg-white px-5 py-3 text-left text-zinc-500 transition-colors hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400"
          >
            <Search className="h-5 w-5 shrink-0" />
            <span>Cari event, artis, atau lokasi...</span>
          </Link>
        </div>
      </section>

      {/* Featured Events */}
      {featuredEvents.length > 0 && (
        <section className="pb-16">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Event Pilihan</h2>
            <Link
              href="/events"
              className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
            >
              Lihat semua
            </Link>
          </div>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}

      {/* Categories Grid */}
      {categories.length > 0 && (
        <section className="pb-16">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Jelajahi Kategori</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/categories/${cat.slug}`}
                className="flex flex-col items-center gap-2 rounded-xl border border-zinc-200 bg-white p-6 text-center transition-colors hover:border-blue-300 hover:bg-blue-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-blue-700 dark:hover:bg-blue-950"
              >
                {cat.icon_url ? (
                  <img src={cat.icon_url} alt={cat.name} className="h-8 w-8 object-contain" />
                ) : (
                  <span className="text-3xl">🎫</span>
                )}
                <span className="text-sm font-medium text-zinc-900 dark:text-white">{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
