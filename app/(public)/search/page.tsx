import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { eventsApi } from "@/lib/api/events";
import { EventCard } from "@/components/shared/event-card";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export const metadata: Metadata = {
  title: "Cari Event",
  description: "Cari event berdasarkan nama, lokasi, atau kategori.",
};

export default async function SearchPage({ searchParams }: { searchParams: SearchParams }) {
  const { q } = await searchParams;
  const query = typeof q === "string" ? q : "";

  const results =
    query.length > 0
      ? await eventsApi.list({ search: query, limit: 20 }).then((r) => r.data).catch(() => [])
      : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900">Cari Event</h1>

      <form action="/search" method="GET" className="mt-6">
        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Cari event, artis, atau lokasi..."
            className="w-full rounded-full border border-gray-300 bg-white py-3 pl-10 pr-4 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </form>

      {query && (
        <p className="mt-6 text-sm text-gray-500">
          {results.length} hasil ditemukan untuk &ldquo;{query}&rdquo;
        </p>
      )}

      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>

      {query && results.length === 0 && (
        <div className="mt-12 text-center">
          <p className="text-gray-500">
            Tidak ada event yang cocok dengan pencarian Anda.
          </p>
          <Link
            href="/events"
            className="mt-4 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            Jelajahi semua event
          </Link>
        </div>
      )}

      {!query && (
        <div className="mt-12 text-center">
          <p className="text-gray-500">Masukkan kata kunci untuk mencari event.</p>
        </div>
      )}
    </div>
  );
}
