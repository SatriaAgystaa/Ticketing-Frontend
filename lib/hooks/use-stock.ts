"use client";

import useSWR from "swr";
import { eventsApi } from "@/lib/api/events";
import type { TicketType } from "@/lib/types/event";
import { POLLING } from "@/lib/utils/constants";

/** Polls ticket stock every 30s for real-time availability */
export function useStock(eventId: string) {
  const { data, error, isLoading } = useSWR<TicketType[]>(
    `/events/${eventId}/ticket-types`,
    async () => {
      const res = await eventsApi.getTicketTypes(eventId);
      return res.data;
    },
    {
      refreshInterval: POLLING.STOCK_COUNTER,
      revalidateOnFocus: true,
    },
  );

  return {
    ticketTypes: data ?? [],
    isLoading,
    isError: !!error,
  };
}
