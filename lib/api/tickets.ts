import type { Ticket, TicketValidationResult } from "@/lib/types/ticket";
import { api } from "./client";

export const ticketsApi = {
  list(params?: { page?: number; limit?: number }) {
    return api.get<Ticket[]>("/tickets", params as Record<string, number>);
  },

  getByCode(code: string) {
    return api.get<Ticket>(`/tickets/${code}`);
  },

  getQr(code: string) {
    return api.get<{ qr_url: string }>(`/tickets/${code}/qr`);
  },

  resend(data: { email: string; order_number: string }) {
    return api.post("/tickets/resend", data);
  },

  validate(code: string, eventId: string) {
    return api.post<TicketValidationResult>(`/tickets/${code}/validate`, { event_id: eventId });
  },
};
