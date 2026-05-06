import { z } from "zod";

export const createEventSchema = z.object({
  title: z.string().min(5, "Judul minimal 5 karakter").max(200),
  description: z.string().min(20, "Deskripsi minimal 20 karakter"),
  category_id: z.string().uuid("Pilih kategori"),
  event_type: z.enum(["offline", "online", "hybrid"]),
  venue_name: z.string().optional(),
  venue_address: z.string().optional(),
  venue_province: z.string().min(1, "Provinsi wajib dipilih"),
  venue_city: z.string().min(1, "Kabupaten/Kota wajib dipilih"),
  venue_district: z.string().optional(),
  venue_subdistrict: z.string().optional(),
  venue_maps_url: z.string().url("URL Google Maps tidak valid").optional().or(z.literal("")),
  online_url: z.string().url("URL tidak valid").optional().or(z.literal("")),
  starts_at: z.string().min(1, "Tanggal mulai wajib diisi"),
  ends_at: z.string().min(1, "Tanggal selesai wajib diisi"),
  sale_starts_at: z.string().optional(),
  sale_ends_at: z.string().optional(),
  visibility: z.enum(["public", "private", "unlisted"]),
  is_high_demand: z.boolean(),
  allow_attendance_list: z.boolean(),
  refund_policy: z.string().optional(),
  banner_url: z.string().optional(),
});

export type CreateEventFormData = z.infer<typeof createEventSchema>;

export const updateEventSchema = createEventSchema.partial();

export type UpdateEventFormData = z.infer<typeof updateEventSchema>;
