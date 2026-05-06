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
      <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Cari Event</h1>

      <form action="/search" method="GET" className="mt-6">
        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Cari event, artis, atau lokasi..."
            className="w-full rounded-full border border-zinc-300 bg-white py-3 pl-10 pr-4 text-zinc-900 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:placeholder-zinc-400"
          />
        </div>
      </form>

      {query && (
        <p className="mt-6 text-sm text-zinc-500 dark:text-zinc-400">
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
          <p className="text-zinc-500 dark:text-zinc-400">
            Tidak ada event yang cocok dengan pencarian Anda.
          </p>
          <Link
            href="/events"
            className="mt-4 inline-block text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            Jelajahi semua event
          </Link>
        </div>
      )}

      {!query && (
        <div className="mt-12 text-center">
          <p className="text-zinc-500 dark:text-zinc-400">Masukkan kata kunci untuk mencari event.</p>
        </div>
      )}
    </div>
  );
}
