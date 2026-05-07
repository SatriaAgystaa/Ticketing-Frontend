import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eventsApi } from "@/lib/api/events";
import { EventCard } from "@/components/shared/event-card";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const categories = await eventsApi.getCategories().then((r) => r.data).catch(() => []);
  const category = categories.find((c) => c.slug === slug);

  return {
    title: category ? `Event ${category.name}` : "Kategori",
    description: category ? `Temukan berbagai event ${category.name} menarik di seluruh Indonesia.` : undefined,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;

  const [categoriesRes, eventsRes] = await Promise.allSettled([
    eventsApi.getCategories(),
    eventsApi.list({ category: slug, limit: 12 }),
  ]);

  const categories = categoriesRes.status === "fulfilled" ? categoriesRes.value.data : [];
  const events = eventsRes.status === "fulfilled" ? eventsRes.value.data : [];
  const category = categories.find((c) => c.slug === slug);

  if (!category && categories.length > 0) notFound();

  const categoryName = category?.name ?? slug.charAt(0).toUpperCase() + slug.slice(1);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <nav className="mb-6 text-sm text-gray-500">
        <Link href="/events" className="hover:text-gray-700">Event</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{categoryName}</span>
      </nav>

      <h1 className="text-3xl font-bold text-gray-900">Event {categoryName}</h1>
      <p className="mt-2 text-gray-600">
        Temukan berbagai event {categoryName} menarik di seluruh Indonesia.
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>

      {events.length === 0 && (
        <div className="mt-12 text-center">
          <p className="text-gray-500">Belum ada event untuk kategori ini.</p>
          <Link
            href="/events"
            className="mt-4 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            Jelajahi semua event
          </Link>
        </div>
      )}
    </div>
  );
}
