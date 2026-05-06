import { z } from "zod";

export const ticketTypeSchema = z.object({
  name: z.string().min(2, "Nama tiket minimal 2 karakter"),
  description: z.string().optional(),
  price: z.number().min(0, "Harga tidak boleh negatif"),
  quota: z.number().min(1, "Kuota minimal 1"),
  max_per_user: z.number().min(1, "Minimal 1 per user").max(10),
  is_early_bird: z.boolean(),
  early_bird_ends_at: z.string().optional(),
  early_bird_quota: z.number().optional(),
  is_visible: z.boolean(),
  sale_starts_at: z.string().optional(),
  sale_ends_at: z.string().optional(),
});

export type TicketTypeFormData = z.infer<typeof ticketTypeSchema>;
