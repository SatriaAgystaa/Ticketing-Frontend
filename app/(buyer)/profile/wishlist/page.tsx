"use client";

import useSWR from "swr";
import { api } from "@/lib/api/client";
import { EventCard } from "@/components/shared/event-card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import type { EventListItem } from "@/lib/types/event";

export default function WishlistPage() {
  const { data: events, isLoading } = useSWR<EventListItem[]>(
    "/me/wishlist",
    async () => {
      const res = await api.get<EventListItem[]>("/me/wishlist");
      return res.data;
    },
  );

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-white">Wishlist</h1>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-white">Wishlist</h1>

      {!events || events.length === 0 ? (
        <EmptyState
          title="Wishlist kosong"
          description="Event yang Anda simpan akan muncul di sini."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
