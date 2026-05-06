import type { EventListItem } from "@/lib/types/event";
import type { Payout } from "@/lib/types/payout";
import type { OrganizerProfile, User } from "@/lib/types/user";
import { api } from "./client";

export const adminApi = {
  // Events moderation
  listEvents(params?: { status?: string; page?: number; limit?: number }) {
    return api.get<EventListItem[]>("/admin/events", params as Record<string, string | number>);
  },

  approveEvent(id: string) {
    return api.post(`/admin/events/${id}/approve`);
  },

  rejectEvent(id: string, reason: string) {
    return api.post(`/admin/events/${id}/reject`, { reason });
  },

  suspendEvent(id: string, reason: string) {
    return api.post(`/admin/events/${id}/suspend`, { reason });
  },

  // Organizer verification
  listOrganizers(params?: { kyc_status?: string; page?: number; limit?: number }) {
    return api.get<(OrganizerProfile & { user: User })[]>(
      "/admin/organizers",
      params as Record<string, string | number>,
    );
  },

  approveOrganizer(userId: string) {
    return api.post(`/admin/organizers/${userId}/approve`);
  },

  rejectOrganizer(userId: string, reason: string) {
    return api.post(`/admin/organizers/${userId}/reject`, { reason });
  },

  // Payouts
  listPayouts(params?: { status?: string; page?: number; limit?: number }) {
    return api.get<Payout[]>("/admin/payouts", params as Record<string, string | number>);
  },

  approvePayout(id: string) {
    return api.post(`/admin/payouts/${id}/approve`);
  },

  rejectPayout(id: string, reason: string) {
    return api.post(`/admin/payouts/${id}/reject`, { reason });
  },

  // Users
  listUsers(params?: { role?: string; search?: string; page?: number; limit?: number }) {
    return api.get<User[]>("/admin/users", params as Record<string, string | number>);
  },

  suspendUser(userId: string, reason: string) {
    return api.post(`/admin/users/${userId}/suspend`, { reason });
  },

  unsuspendUser(userId: string) {
    return api.post(`/admin/users/${userId}/unsuspend`);
  },

  // Platform config
  getConfig() {
    return api.get<{ platform_fee_flat: number; platform_fee_percent: number }>("/admin/config");
  },

  updateConfig(data: { platform_fee_flat: number; platform_fee_percent: number }) {
    return api.put("/admin/config", data);
  },

  // Dashboard stats
  getDashboardStats() {
    return api.get<{
      total_gmv: number;
      total_platform_fee: number;
      total_events: number;
      total_users: number;
      total_tickets_sold: number;
      monthly_revenue: { month: string; amount: number }[];
    }>("/admin/stats");
  },
};
