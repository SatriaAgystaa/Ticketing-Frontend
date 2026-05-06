import type { WaitingRoomPosition } from "@/lib/types/ticket";
import { api } from "./client";

export const waitingRoomApi = {
  join(eventId: string) {
    return api.post<WaitingRoomPosition>(`/events/${eventId}/waiting-room/join`);
  },

  getPosition(eventId: string) {
    return api.get<WaitingRoomPosition>(`/events/${eventId}/waiting-room/position`);
  },

  leave(eventId: string) {
    return api.delete(`/events/${eventId}/waiting-room/leave`);
  },
};
