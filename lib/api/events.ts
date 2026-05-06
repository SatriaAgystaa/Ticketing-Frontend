import type {
  Attendee,
  Event,
  EventCategory,
  EventDetail,
  EventListItem,
  EventStats,
  EventStaff,
  PromoCode,
  TicketType,
} from "@/lib/types/event";
import { api } from "./client";

export interface EventFilters {
  category?: string;
  city?: string;
  date_from?: string;
  date_to?: string;
  price_min?: number;
  price_max?: number;
  sort?: "newest" | "popular" | "date";
  page?: number;
  limit?: number;
  search?: string;
}

export const eventsApi = {
  // Public
  list(filters?: EventFilters) {
    return api.get<EventListItem[]>("/events", filters as Record<string, string | number>, false);
  },

  getBySlug(slug: string) {
    return api.get<EventDetail>(`/events/${slug}`, undefined, false);
  },

  getCategories() {
    return api.get<EventCategory[]>("/events/categories", undefined, false);
  },

  // Organizer: list own events (semua status)
  listOwn(params?: { sort?: string; page?: number; limit?: number }) {
    return api.get<EventListItem[]>("/organizer/events", params as Record<string, string | number>);
  },

  // Organizer
  create(data: Partial<Event>) {
    return api.post<Event>("/events", data);
  },

  update(id: string, data: Partial<Event>) {
    return api.put<Event>(`/events/${id}`, data);
  },

  remove(id: string) {
    return api.delete(`/events/${id}`);
  },

  publish(id: string) {
    return api.post(`/events/${id}/publish`);
  },

  cancel(id: string) {
    return api.post(`/events/${id}/cancel`);
  },

  getAttendees(id: string, params?: { page?: number; limit?: number }) {
    return api.get<Attendee[]>(`/events/${id}/attendees`, params as Record<string, number>);
  },

  getStats(id: string) {
    return api.get<EventStats>(`/events/${id}/stats`);
  },

  // Ticket Types
  getTicketTypes(id: string) {
    return api.get<TicketType[]>(`/events/${id}/ticket-types`, undefined, false);
  },

  createTicketType(eventId: string, data: Partial<TicketType>) {
    return api.post<TicketType>(`/events/${eventId}/ticket-types`, data);
  },

  updateTicketType(eventId: string, typeId: string, data: Partial<TicketType>) {
    return api.put<TicketType>(`/events/${eventId}/ticket-types/${typeId}`, data);
  },

  deleteTicketType(eventId: string, typeId: string) {
    return api.delete(`/events/${eventId}/ticket-types/${typeId}`);
  },

  // Staff
  inviteStaff(eventId: string, data: { email: string; role: string; permissions: string[] }) {
    return api.post<EventStaff>(`/events/${eventId}/staff`, data);
  },

  removeStaff(eventId: string, userId: string) {
    return api.delete(`/events/${eventId}/staff/${userId}`);
  },

  // Blast
  sendBlast(eventId: string, data: { subject: string; message: string }) {
    return api.post(`/events/${eventId}/blast-message`, data);
  },

  // Promo Codes
  listPromos(eventId: string) {
    return api.get<PromoCode[]>(`/events/${eventId}/promo-codes`);
  },

  createPromo(eventId: string, data: Partial<PromoCode>) {
    return api.post<PromoCode>(`/events/${eventId}/promo-codes`, data);
  },

  getPromo(eventId: string, promoId: string) {
    return api.get<PromoCode>(`/events/${eventId}/promo-codes/${promoId}`);
  },

  updatePromo(eventId: string, promoId: string, data: Partial<PromoCode>) {
    return api.put<PromoCode>(`/events/${eventId}/promo-codes/${promoId}`, data);
  },

  deletePromo(eventId: string, promoId: string) {
    return api.delete(`/events/${eventId}/promo-codes/${promoId}`);
  },
};
