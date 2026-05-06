import type {
  CreateOrderRequest,
  CreateOrderResponse,
  Order,
  PromoValidation,
} from "@/lib/types/order";
import { api } from "./client";

export const ordersApi = {
  create(data: CreateOrderRequest) {
    return api.post<CreateOrderResponse>("/orders", data);
  },

  getById(id: string) {
    return api.get<Order>(`/orders/${id}`);
  },

  list(params?: { page?: number; limit?: number }) {
    return api.get<Order[]>("/orders", params as Record<string, number>);
  },

  cancel(id: string) {
    return api.post(`/orders/${id}/cancel`);
  },

  getPaymentStatus(id: string) {
    return api.get<{ status: string; payment_method: string }>(`/orders/${id}/payment-status`);
  },

  validatePromo(data: { event_id: string; code: string; items: { ticket_type_id: string; quantity: number }[] }) {
    return api.post<PromoValidation>("/checkout/validate-promo", data);
  },

  simulatePayment(id: string) {
    return api.post(`/orders/${id}/simulate-payment`);
  },
};
