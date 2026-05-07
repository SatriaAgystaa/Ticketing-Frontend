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
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20" />)}
        </div>
        <Skeleton className="h-48" />
      </div>
    );
  }

  if (!event) return null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Title + status */}
      <div className="flex items-center gap-3 flex-wrap">
        <h1 className="text-xl font-bold text-gray-900">{event.title}</h1>
        <EventStatusBadge status={event.status} />
      </div>

      {/* Stats — hanya kalau VIEW_REVENUE */}
      {stats && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Revenue", value: formatCurrency(stats.total_revenue), color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Pesanan", value: stats.total_orders, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Tiket Terjual", value: stats.total_tickets_sold, color: "text-indigo-600", bg: "bg-indigo-50" },
            { label: "Check-in", value: stats.total_checkins, color: "text-violet-600", bg: "bg-violet-50" },
          ].map((s) => (
            <div key={s.label} className={`rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm`}>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-1">{s.label}</p>
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Banner */}
      {event.banner_url && (
        <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
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
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Informasi Event</h2>

        <div className="flex items-start gap-3 text-sm">
          <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
          <div>
            <p className="font-medium text-gray-900">{formatDate(event.starts_at)}</p>
            <p className="text-gray-500">s/d {formatDate(event.ends_at)}</p>
          </div>
        </div>

        {(event.venue_name || event.venue_city) && (
          <div className="flex items-start gap-3 text-sm">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
            <div>
              {event.venue_name && <p className="font-medium text-gray-900">{event.venue_name}</p>}
              {event.venue_address && <p className="text-gray-500">{event.venue_address}</p>}
              <p className="text-gray-500">
                {[event.venue_city, event.venue_province].filter(Boolean).join(", ")}
              </p>
              {event.venue_maps_url && (
                <a
                  href={event.venue_maps_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block text-xs text-indigo-600 hover:text-indigo-700 hover:underline"
                >
                  Lihat di Google Maps
                </a>
              )}
            </div>
          </div>
        )}

        {event.online_url && (
          <div className="flex items-start gap-3 text-sm">
            <Globe className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
            <a
              href={event.online_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-700 hover:underline"
            >
              {event.online_url}
            </a>
          </div>
        )}

        {event.description && (
          <p className="text-sm text-gray-600 whitespace-pre-wrap border-t border-gray-100 pt-4 mt-2 leading-relaxed">
            {event.description}
          </p>
        )}
      </div>
    </div>
  );
}
