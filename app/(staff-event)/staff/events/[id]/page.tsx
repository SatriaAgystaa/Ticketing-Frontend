"use client";

import { use, useEffect, useState } from "react";
import { toast } from "sonner";
import { CalendarDays, MapPin, Globe } from "lucide-react";
import { eventsApi } from "@/lib/api/events";
import type { Event, EventStats } from "@/lib/types/event";
import { Skeleton } from "@/components/ui/skeleton";
import { EventStatusBadge } from "@/components/shared/event-status-badge";
import { formatCurrency } from "@/lib/utils/format-currency";
import { formatDate } from "@/lib/utils/format-date";
import { useAuth } from "@/lib/auth/context";
import Image from "next/image";

export default function StaffEventOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: eventId } = use(params);
  const { staffEvents } = useAuth();
  const staffEvent = staffEvents.find((s) => s.event_id === eventId);
  const permissions = (staffEvent?.permissions ?? []).map((p) => p.toLowerCase());

  const [event, setEvent] = useState<Event | null>(null);
  const [stats, setStats] = useState<EventStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const eventRes = await eventsApi.getById(eventId);
        setEvent(eventRes.data as Event);
        if (permissions.includes("view_revenue")) {
          const statsRes = await eventsApi.getStats(eventId).catch(() => null);
          if (statsRes) setStats(statsRes.data);
        }
      } catch {
        toast.error("Gagal memuat data event");
      } finally {
        setIsLoading(false);
      }
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <Skeleton className="h-8 w-64 bg-zinc-800" />
        <div className="grid grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 bg-zinc-800" />)}
        </div>
        <Skeleton className="h-48 bg-zinc-800" />
      </div>
    );
  }

  if (!event) return null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Title + status */}
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-white">{event.title}</h1>
        <EventStatusBadge status={event.status} />
      </div>

      {/* Stats — hanya kalau VIEW_REVENUE */}
      {stats && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Revenue", value: formatCurrency(stats.total_revenue) },
            { label: "Pesanan", value: stats.total_orders },
            { label: "Tiket Terjual", value: stats.total_tickets_sold },
            { label: "Check-in", value: stats.total_checkins },
          ].map((s) => (
            <div key={s.label} className="rounded-xl bg-zinc-900 border border-zinc-800 p-4 text-center">
              <p className="text-xs text-zinc-500 mb-1">{s.label}</p>
              <p className="text-lg font-bold text-white">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Banner */}
      {event.banner_url && (
        <div className="overflow-hidden rounded-xl border border-zinc-800">
          <Image
            src={event.banner_url}
            alt={event.title}
            width={800}
            height={200}
            className="h-48 w-full object-cover"
          />
        </div>
      )}

      {/* Info */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 space-y-4">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide">Informasi Event</h2>

        <div className="flex items-start gap-3 text-sm">
          <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />
          <div>
            <p className="font-medium text-white">{formatDate(event.starts_at)}</p>
            <p className="text-zinc-500">s/d {formatDate(event.ends_at)}</p>
          </div>
        </div>

        {(event.venue_name || event.venue_city) && (
          <div className="flex items-start gap-3 text-sm">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />
            <div>
              {event.venue_name && <p className="font-medium text-white">{event.venue_name}</p>}
              {event.venue_address && <p className="text-zinc-500">{event.venue_address}</p>}
              <p className="text-zinc-500">
                {[event.venue_city, event.venue_province].filter(Boolean).join(", ")}
              </p>
              {event.venue_maps_url && (
                <a
                  href={event.venue_maps_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block text-xs text-blue-400 hover:underline"
                >
                  Lihat di Google Maps
                </a>
              )}
            </div>
          </div>
        )}

        {event.online_url && (
          <div className="flex items-start gap-3 text-sm">
            <Globe className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />
            <a href={event.online_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
              {event.online_url}
            </a>
          </div>
        )}

        {event.description && (
          <p className="text-sm text-zinc-400 whitespace-pre-wrap border-t border-zinc-800 pt-4 mt-2">
            {event.description}
          </p>
        )}
      </div>
    </div>
  );
}
