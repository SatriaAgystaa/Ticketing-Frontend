import Link from "next/link";
import { Search, ArrowRight } from "lucide-react";
import { eventsApi } from "@/lib/api/events";
import { EventCard } from "@/components/shared/event-card";

export default async function HomePage() {
  const [eventsRes, categoriesRes] = await Promise.allSettled([
    eventsApi.list({ sort: "popular", limit: 6 }),
    eventsApi.getCategories(),
  ]);

  const featuredEvents =
    eventsRes.status === "fulfilled" ? eventsRes.value.data : [];
  const categories =
    categoriesRes.status === "fulfilled" ? categoriesRes.value.data : [];

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-4 inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
              Platform ticketing event #1 di Indonesia
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              Temukan event{" "}
              <span className="text-indigo-600">terbaik</span>{" "}
              di Indonesia
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg text-gray-500">
              Jelajahi ribuan event konser, festival, seminar, workshop, dan
              pameran di seluruh Indonesia.
            </p>

            {/* Search bar */}
            <div className="mx-auto mt-8 flex max-w-lg items-center gap-3">
              <Link
                href="/search"
                className="flex flex-1 items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-left text-sm text-gray-400 shadow-sm transition-colors hover:border-gray-300"
              >
                <Search className="h-4 w-4 shrink-0" />
                <span>Cari event, artis, atau lokasi...</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Featured Events */}
        {featuredEvents.length > 0 && (
          <section className="py-14">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Event Pilihan
                </h2>
                <p className="mt-0.5 text-sm text-gray-500">
                  Dikurasi khusus untuk Anda
                </p>
              </div>
              <Link
                href="/events"
                className="flex items-center gap-1 text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-700"
              >
                Lihat semua
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featuredEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </section>
        )}

        {/* Categories Grid */}
        {categories.length > 0 && (
          <section className="border-t border-gray-100 py-14">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Jelajahi Kategori
              </h2>
              <p className="mt-0.5 text-sm text-gray-500">
                Temukan event sesuai minat Anda
              </p>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/categories/${cat.slug}`}
                  className="group flex flex-col items-center gap-3 rounded-xl border border-gray-200 bg-white p-5 text-center shadow-sm transition-all duration-150 hover:border-indigo-300 hover:shadow-md"
                >
                  {cat.icon_url ? (
                    <img
                      src={cat.icon_url}
                      alt={cat.name}
                      className="h-8 w-8 object-contain"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-400 transition-colors group-hover:bg-indigo-50 group-hover:text-indigo-600">
                      <span className="text-lg">🎫</span>
                    </div>
                  )}
                  <span className="text-xs font-medium text-gray-700 group-hover:text-indigo-700">
                    {cat.name}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* CTA Banner */}
        <section className="mb-14 overflow-hidden rounded-2xl bg-indigo-600 px-8 py-12 text-center">
          <h2 className="text-2xl font-bold text-white">
            Punya event yang ingin kamu promosikan?
          </h2>
          <p className="mt-2 text-indigo-200">
            Buat dan jual tiket event Anda sekarang. Mudah, cepat, dan
            terpercaya.
          </p>
          <Link
            href="/dashboard"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-indigo-700 shadow-sm transition-colors hover:bg-indigo-50"
          >
            Mulai sebagai Organizer
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </div>
    </div>
  );
}
