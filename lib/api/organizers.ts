import type { EventListItem } from "@/lib/types/event";
import type { OrganizerProfile, OrganizerPublic } from "@/lib/types/user";
import { api } from "./client";

export const organizersApi = {
  getPublicProfile(id: string) {
    return api.get<OrganizerPublic & { events: EventListItem[] }>(
      `/organizers/${id}`,
      undefined,
      false,
    );
  },

  follow(id: string) {
    return api.post(`/organizers/${id}/follow`);
  },

  unfollow(id: string) {
    return api.delete(`/organizers/${id}/follow`);
  },

  getMyProfile() {
    return api.get<OrganizerProfile>("/organizers/me");
  },

  updateProfile(data: Partial<OrganizerProfile>) {
    return api.put<OrganizerProfile>("/organizers/me", data);
  },

  submitKyc(data: { ktp_url: string; npwp_url: string; bank_name: string; bank_account_number: string; bank_account_name: string }) {
    return api.post("/organizers/me/kyc", data);
  },
};
