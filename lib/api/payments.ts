import { api } from "./client";

export const paymentsApi = {
  getStatus(orderId: string) {
    return api.get<{
      status: string;
      payment_method: string;
      settled_at: string | null;
    }>(`/orders/${orderId}/payment-status`);
  },
};
