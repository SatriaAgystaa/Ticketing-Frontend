import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    full_name: z.string().min(2, "Nama minimal 2 karakter"),
    email: z.string().email("Email tidak valid"),
    phone: z.string().optional(),
    password: z.string().min(8, "Password minimal 8 karakter"),
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Password tidak cocok",
    path: ["confirm_password"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email("Email tidak valid"),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password minimal 8 karakter"),
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Password tidak cocok",
    path: ["confirm_password"],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export const registerOrganizerSchema = z
  .object({
    full_name: z.string().min(2, "Nama minimal 2 karakter"),
    email: z.string().email("Email tidak valid"),
    phone: z.string().optional(),
    password: z.string().min(8, "Password minimal 8 karakter"),
    confirm_password: z.string(),
    brand_name: z.string().min(2, "Nama brand minimal 2 karakter"),
    description: z.string().optional(),
    website_url: z.string().url("URL tidak valid").optional().or(z.literal("")),
    instagram_url: z.string().url("URL tidak valid").optional().or(z.literal("")),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Password tidak cocok",
    path: ["confirm_password"],
  });

export type RegisterOrganizerFormData = z.infer<typeof registerOrganizerSchema>;
