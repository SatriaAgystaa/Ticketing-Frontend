"use client";

import useSWR from "swr";
import { waitingRoomApi } from "@/lib/api/waiting-room";
import type { WaitingRoomPosition } from "@/lib/types/ticket";
import { POLLING } from "@/lib/utils/constants";

/** Polls waiting room position every 5s */
export function useWaitingRoom(eventId: string, enabled = true) {
  const { data, error, isLoading, mutate } = useSWR<WaitingRoomPosition>(
    enabled ? `/events/${eventId}/waiting-room/position` : null,
    async () => {
      const res = await waitingRoomApi.getPosition(eventId);
      return res.data;
    },
    {
      refreshInterval: POLLING.WAITING_ROOM,
      revalidateOnFocus: true,
    },
  );

  const join = async () => {
    const res = await waitingRoomApi.join(eventId);
    mutate(res.data, false);
    return res.data;
  };

  const leave = async () => {
    await waitingRoomApi.leave(eventId);
    mutate(undefined, false);
  };

  return {
    position: data ?? null,
    isCalled: data?.status === "called",
    checkoutToken: data?.checkout_token,
    isLoading,
    isError: !!error,
    join,
    leave,
  };
}
