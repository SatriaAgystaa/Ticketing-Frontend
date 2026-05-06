"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarDays, ChevronRight } from "lucide-react";
import { eventsApi } from "@/lib/api/events";
import type { EventListItem } from "@/lib/types/event";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils/format-date";

export default function ScanSelectEventPage() {
  const [events, setEvents] = useState<EventListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await eventsApi.list({ sort: "date" });
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
    <div className="mx-auto w-full max-w-md space-y-4">
      <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
        Pilih Event
      </h1>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Pilih event untuk mulai scan tiket
      </p>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-zinc-400">
            Tidak ada event yang tersedia untuk scan
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <Link key={event.id} href={`/scan/${event.id}`}>
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                      <CalendarDays className="h-5 w-5 text-zinc-500" />
                    </div>
                    <div>
                      <p className="font-medium text-zinc-900 dark:text-white">
                        {event.title}
                      </p>
                      <p className="text-sm text-zinc-500">
                        {formatDate(event.starts_at)}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-zinc-400" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
