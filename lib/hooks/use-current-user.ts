"use client";

import useSWR from "swr";
import { authApi } from "@/lib/api/auth";
import { isAuthenticated } from "@/lib/auth/tokens";
import type { User } from "@/lib/types/user";

export function useCurrentUser() {
  const { data, error, isLoading, mutate } = useSWR<User>(
    isAuthenticated() ? "/auth/me" : null,
    async () => {
      const res = await authApi.getMe();
      return res.data;
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 60_000,
    },
  );

  return {
    user: data ?? null,
    isLoading,
    isError: !!error,
    mutate,
  };
}
