import Image from "next/image";
import Link from "next/link";
import { CalendarDays, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { EventListItem } from "@/lib/types/event";
import { formatCurrency } from "@/lib/utils/format-currency";
import { formatDate } from "@/lib/utils/format-date";

interface EventCardProps {
  event: EventListItem;
}

export function EventCard({ event }: EventCardProps) {
  return (
    <Link href={`/events/${event.slug}`} className="group block">
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
        {/* Banner */}
        <div className="relative aspect-[16/9] overflow-hidden bg-gray-100">
          {event.banner_url ? (
            <Image
              src={event.banner_url}
              alt={event.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <CalendarDays className="h-10 w-10 text-gray-300" />
            </div>
          )}
          {event.is_sold_out && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-[1px]">
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-900 shadow-sm">
                SOLD OUT
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <CalendarDays className="h-3 w-3 shrink-0" />
            {formatDate(event.starts_at)}
          </div>

          <h3 className="mt-2 line-clamp-2 text-sm font-semibold leading-snug text-gray-900 group-hover:text-indigo-600 transition-colors">
            {event.title}
          </h3>

          {event.venue_city && (
            <div className="mt-1.5 flex items-center gap-1 text-xs text-gray-400">
              <MapPin className="h-3 w-3 shrink-0" />
              {event.venue_city}
            </div>
          )}

          <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
            <p className="text-sm font-semibold text-gray-900">
              {event.min_price === 0
                ? "Gratis"
                : `Mulai ${formatCurrency(event.min_price)}`}
            </p>
            {event.organizer.is_verified && (
              <Badge variant="brand" className="text-[10px]">
                Verified
              </Badge>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
