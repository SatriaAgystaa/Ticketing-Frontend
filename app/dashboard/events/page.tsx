"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, CalendarDays } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EventStatusBadge } from "@/components/shared/event-status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils/format-date";
import { formatCurrency } from "@/lib/utils/format-currency";
import { eventsApi } from "@/lib/api/events";
import type { EventListItem } from "@/lib/types/event";

export default function DashboardEventsPage() {
  const [events, setEvents] = useState<EventListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await eventsApi.listOwn({ sort: "newest" });
        setEvents(res.data);
      } catch {
        // handled by API client
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Event Saya
          </h1>
          <p className="text-sm text-gray-500">
            Kelola semua event Anda
          </p>
        </div>
        <Link href="/dashboard/events/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Buat Event
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-16">
            <CalendarDays className="h-12 w-12 text-gray-300" />
            <p className="text-gray-500">Belum ada event</p>
            <Link href="/dashboard/events/new">
              <Button>Buat Event Pertama</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <Link key={event.id} href={`/dashboard/events/${event.id}`}>
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="flex items-center gap-4 p-4">
                  {event.banner_url ? (
                    <img
                      src={event.banner_url}
                      alt={event.title}
                      className="h-16 w-24 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-24 items-center justify-center rounded-lg bg-gray-100">
                      <CalendarDays className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">
                        {event.title}
                      </h3>
                      <EventStatusBadge status={event.status} />
                    </div>
                    <p className="text-sm text-gray-500">
                      {formatDate(event.starts_at)}
                      {event.venue_city ? ` - ${event.venue_city}` : ""}
                    </p>
                    <p className="text-sm font-medium text-gray-700">
                      {event.min_price === 0
                        ? "Gratis"
                        : `Mulai ${formatCurrency(event.min_price)}`}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
