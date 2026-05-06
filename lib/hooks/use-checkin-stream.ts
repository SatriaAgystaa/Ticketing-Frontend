"use client";

import { useEventSource } from "./use-event-source";

interface CheckinData {
  total_checkins: number;
  total_tickets: number;
  last_checkin?: {
    ticket_code: string;
    holder_name: string;
    ticket_type: string;
    checked_in_at: string;
  };
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/v1";

/** SSE stream for real-time check-in dashboard */
export function useCheckinStream(eventId: string, enabled = true) {
  const { data, isConnected, error } = useEventSource<CheckinData>({
    url: `${API_BASE_URL}/events/${eventId}/checkin/stream`,
    enabled,
  });

  return {
    checkinData: data,
    isConnected,
    isError: !!error,
  };
}
