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
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950">
        {/* Banner */}
        <div className="relative aspect-[16/9] overflow-hidden bg-zinc-100 dark:bg-zinc-900">
          {event.banner_url ? (
            <Image
              src={event.banner_url}
              alt={event.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <CalendarDays className="h-10 w-10 text-zinc-300 dark:text-zinc-700" />
            </div>
          )}
          {event.is_sold_out && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <Badge variant="danger" className="text-base">SOLD OUT</Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <CalendarDays className="h-3.5 w-3.5" />
            {formatDate(event.starts_at)}
          </div>

          <h3 className="mt-1.5 line-clamp-2 text-sm font-semibold text-zinc-900 dark:text-white">
            {event.title}
          </h3>

          {event.venue_city && (
            <div className="mt-1.5 flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
              <MapPin className="h-3.5 w-3.5" />
              {event.venue_city}
            </div>
          )}

          <div className="mt-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-zinc-900 dark:text-white">
              {event.min_price === 0 ? "Gratis" : `Mulai ${formatCurrency(event.min_price)}`}
            </p>
            {event.organizer.is_verified && (
              <Badge variant="info" className="text-[10px]">Verified</Badge>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
