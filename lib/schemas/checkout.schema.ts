import { z } from "zod";

export const checkoutItemSchema = z.object({
  ticket_type_id: z.string().uuid(),
  quantity: z.number().min(1, "Minimal 1 tiket"),
  form_answers: z
    .array(
      z.object({
        field_id: z.string().uuid(),
        answer: z.string().min(1, "Wajib diisi"),
      }),
    )
    .optional(),
});

export const checkoutSchema = z.object({
  event_id: z.string().uuid(),
  items: z.array(checkoutItemSchema).min(1, "Pilih minimal 1 tiket"),
  promo_code: z.string().optional(),
  guest_email: z.string().email("Email tidak valid").optional(),
  checkout_token: z.string().optional(),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;
