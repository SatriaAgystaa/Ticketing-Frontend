import type { TicketStatus } from "@/lib/utils/constants";

export interface Ticket {
  id: string;
  order_item_id: string;
  order_id: string;
  event_id: string;
  ticket_code: string;
  qr_data: string;
  qr_url: string | null;
  status: TicketStatus;
  used_at: string | null;
  scanned_by: string | null;
  created_at: string;
  event: {
    id: string;
    title: string;
    slug: string;
    banner_url: string | null;
    starts_at: string;
    ends_at: string;
    venue_name: string | null;
    venue_address: string | null;
  };
  ticket_type_name: string;
  holder_name: string;
}

export interface TicketValidationResult {
  status: "valid" | "already_used" | "cancelled" | "wrong_event" | "not_found";
  ticket_code: string;
  holder_name?: string;
  ticket_type?: string;
  event_name?: string;
  event_date?: string;
  used_at?: string;
  message: string;
}

export interface WaitingRoomPosition {
  status: "waiting" | "called" | "checkout" | "expired";
  position?: number;
  estimated_wait_minutes?: number;
  total_in_queue?: number;
  checkout_token?: string;
  checkout_expires_at?: string;
}
