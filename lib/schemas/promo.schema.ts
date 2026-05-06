import { z } from "zod";

export const promoCodeSchema = z.object({
  code: z
    .string()
    .min(3, "Kode minimal 3 karakter")
    .max(20)
    .regex(/^[A-Z0-9]+$/, "Kode hanya boleh huruf kapital dan angka"),
  discount_type: z.enum(["flat", "percent"]),
  discount_value: z.number().min(1, "Nilai diskon minimal 1"),
  max_discount_amount: z.number().optional(),
  usage_limit: z.number().min(1, "Batas pemakaian minimal 1"),
  max_per_user: z.number().min(1, "Minimal 1 per user"),
  valid_from: z.string().min(1, "Tanggal mulai wajib diisi"),
  valid_until: z.string().min(1, "Tanggal berakhir wajib diisi"),
  is_active: z.boolean(),
});

export type PromoCodeFormData = z.infer<typeof promoCodeSchema>;
