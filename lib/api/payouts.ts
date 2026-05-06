import type { Payout, PayoutBalance } from "@/lib/types/payout";
import { api } from "./client";

export const payoutsApi = {
  getBalance() {
    return api.get<PayoutBalance>("/payouts/balance");
  },

  request(amount: number) {
    return api.post<Payout>("/payouts/request", { amount });
  },

  list(params?: { page?: number; limit?: number }) {
    return api.get<Payout[]>("/payouts", params as Record<string, number>);
  },
};
