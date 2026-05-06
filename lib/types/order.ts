import type { OrderStatus, PaymentStatus } from "@/lib/utils/constants";

export interface Order {
  id: string;
  event_id: string;
  user_id: string | null;
  guest_email: string | null;
  order_number: string;
  status: OrderStatus;
  subtotal: number;
  platform_fee: number;
  payment_fee: number;
  total_amount: number;
  promo_code_id: string | null;
  discount_amount: number;
  expires_at: string | null;
  paid_at: string | null;
  cancelled_at: string | null;
  cancel_reason: string | null;
  created_at: string;
  items: OrderItem[];
  event: {
    id: string;
    title: string;
    slug: string;
    banner_url: string | null;
    starts_at: string;
    venue_name: string | null;
  };
}

export interface OrderItem {
  id: string;
  order_id: string;
  ticket_type_id: string;
  ticket_type_name_snapshot: string;
  price_snapshot: number;
  quantity: number;
  subtotal: number;
}

export interface Payment {
  id: string;
  order_id: string;
  midtrans_transaction_id: string;
  payment_method: string;
  amount: number;
  status: PaymentStatus;
  settled_at: string | null;
  created_at: string;
}

export interface CreateOrderRequest {
  event_id: string;
  checkout_token?: string;
  items: {
    ticket_type_id: string;
    quantity: number;
    form_answers?: {
      field_id: string;
      answer: string;
    }[];
  }[];
  promo_code?: string;
  guest_email?: string;
}

export interface CreateOrderResponse {
  order_id: string;
  order_number: string;
  status: OrderStatus;
  expires_at: string;
  total_amount: number;
  breakdown: {
    subtotal: number;
    platform_fee: number;
    payment_fee: number;
    discount: number;
    total: number;
  };
  payment_url: string | null;
}

export interface PromoValidation {
  valid: boolean;
  discount_type: "flat" | "percent";
  discount_value: number;
  max_discount_amount: number | null;
  message: string;
}
