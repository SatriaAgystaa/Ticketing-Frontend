import type { Metadata, ResolvingMetadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, MapPin, Clock, Users, Globe, ExternalLink } from "lucide-react";
import { eventsApi } from "@/lib/api/events";
import { EventCard } from "@/components/shared/event-card";
import { ShareButtons } from "@/components/shared/share-buttons";
import { OrganizerBadge } from "@/components/shared/organizer-badge";
import { StockBadge } from "@/components/shared/stock-badge";
import { formatCurrency } from "@/lib/utils/format-currency";
import { formatDate } from "@/lib/utils/format-date";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props, parent: ResolvingMetadata): Promise<Metadata> {
  const { slug } = await params;
  const event = await eventsApi.getBySlug(slug).then((r) => r.data).catch(() => null);
  if (!event) return { title: "Event Tidak Ditemukan" };

  return {
    title: event.title,
    description: event.description?.slice(0, 160),
    openGraph: {
      title: event.title,
      description: event.description?.slice(0, 160),
      images: event.banner_url ? [event.banner_url] : [],
    },
  };
}

export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params;
  const event = await eventsApi.getBySlug(slug).then((r) => r.data).catch(() => null);

  if (!event) notFound();

  const hasTickets = event.ticket_types && event.ticket_types.length > 0;
  const minPrice = hasTickets ? Math.min(...event.ticket_types!.map((t) => t.price)) : 0;
  const maxPrice = hasTickets ? Math.max(...event.ticket_types!.map((t) => t.price)) : 0;
  const isFree = maxPrice === 0;
  const totalQuota = event.ticket_types?.reduce((s, t) => s + t.quota, 0) ?? 0;
  const totalSold = event.ticket_types?.reduce((s, t) => s + t.sold_count, 0) ?? 0;
  const remaining = totalQuota - totalSold;
  const isSoldOut = hasTickets && remaining <= 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-gray-500">
        <Link href="/events" className="hover:text-gray-700">Event</Link>
        <span className="mx-2">/</span>
        <Link href={`/categories/${event.category.slug}`} className="hover:text-gray-700">
          {event.category.name}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{event.title}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {event.banner_url ? (
            <img
              src={event.banner_url}
              alt={event.title}
              className="aspect-[16/9] w-full rounded-xl object-cover"
            />
          ) : (
            <div className="aspect-[16/9] rounded-xl bg-gray-100" />
          )}

          <div className="mt-6">
            <span className="inline-block rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700">
              {event.category.name}
            </span>
            <h1 className="mt-3 text-3xl font-bold text-gray-900">{event.title}</h1>

            <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4" />
                {formatDate(event.starts_at)}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {new Date(event.starts_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB
              </span>
              {event.venue_name && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  {event.venue_name}{event.venue_city ? `, ${event.venue_city}` : ""}
                </span>
              )}
              {event.event_type === "online" && event.online_url && (
                <span className="flex items-center gap-1.5">
                  <Globe className="h-4 w-4" />
                  Online
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                <StockBadge remaining={remaining} total={totalQuota} />
              </span>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <ShareButtons url={`/events/${event.slug}`} title={event.title} />
            </div>

            {event.description && (
              <div className="mt-6">
                <h2 className="text-lg font-semibold text-gray-900">Tentang Event</h2>
                <p className="mt-2 whitespace-pre-line leading-relaxed text-gray-600">
                  {event.description}
                </p>
              </div>
            )}

            {event.venue_address && (
              <div className="mt-6">
                <h2 className="text-lg font-semibold text-gray-900">Lokasi</h2>
                <p className="mt-2 text-gray-600">{event.venue_address}</p>
                {event.venue_maps_url && (
                  <a
                    href={event.venue_maps_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    Lihat di Maps <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            )}

            {event.refund_policy && (
              <div className="mt-6">
                <h2 className="text-lg font-semibold text-gray-900">Kebijakan Refund</h2>
                <p className="mt-2 text-gray-600">{event.refund_policy}</p>
              </div>
            )}

            {/* Organizer */}
            <div className="mt-6 rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Diselenggarakan oleh</p>
              <Link href={`/organizers/${event.organizer.id}`} className="mt-2 inline-flex items-center gap-2">
                <OrganizerBadge
                  brandName={event.organizer.brand_name}
                  isVerified={event.organizer.is_verified}
                />
              </Link>
            </div>
          </div>
        </div>

        {/* Sidebar - Ticket CTA */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            {!hasTickets ? (
              <>
                <p className="text-sm text-gray-500">Informasi tiket</p>
                <p className="mt-2 text-sm text-gray-400">
                  Tiket belum tersedia. Pantau terus!
                </p>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-500">
                  {isFree ? "Event Gratis" : "Harga mulai dari"}
                </p>
                {!isFree && (
                  <p className="mt-1 text-2xl font-bold text-gray-900">
                    {formatCurrency(minPrice)}
                    {maxPrice > minPrice && (
                      <span className="text-base font-normal text-gray-500">
                        {" "}— {formatCurrency(maxPrice)}
                      </span>
                    )}
                  </p>
                )}

                {/* Ticket Types Preview */}
                <div className="mt-4 space-y-2">
                  {event.ticket_types!.filter((t) => t.is_visible).map((t) => (
                    <div key={t.id} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                      <span className="text-sm font-medium text-gray-900">{t.name}</span>
                      <span className="text-sm text-gray-600">
                        {t.price === 0 ? "Gratis" : formatCurrency(t.price)}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {!hasTickets ? null : isSoldOut ? (
              <div className="mt-6 w-full rounded-lg bg-gray-200 px-4 py-3 text-center font-medium text-gray-500">
                Tiket Habis
              </div>
            ) : (
              <Link
                href={`/checkout/${event.id}`}
                className="mt-6 block w-full rounded-lg bg-indigo-600 px-4 py-3 text-center font-medium text-white transition-colors hover:bg-indigo-700"
              >
                {isFree ? "Daftar Sekarang" : "Beli Tiket"}
              </Link>
            )}

            {hasTickets && !isSoldOut && totalQuota > 0 && (
              <p className="mt-3 text-center text-xs text-gray-500">
                {remaining.toLocaleString("id-ID")} dari {totalQuota.toLocaleString("id-ID")} tiket tersisa
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
