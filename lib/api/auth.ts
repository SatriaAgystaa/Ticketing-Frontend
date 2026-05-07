import type { LoginResponse, StaffEvent, User } from "@/lib/types/user";
import { getRefreshToken } from "@/lib/auth/tokens";
import { api } from "./client";

export const authApi = {
  register(data: { email: string; password: string; full_name: string; phone?: string }) {
    return api.post<{ user: User }>("/auth/register", data, false);
  },

  login(data: { email: string; password: string }) {
    return api.post<LoginResponse>("/auth/login", data, false);
  },

  refresh(refreshToken: string) {
    return api.post<LoginResponse>("/auth/refresh", { refresh_token: refreshToken }, false);
  },

  logout() {
    return api.post("/auth/logout", { refresh_token: getRefreshToken() }, false);
  },

  verifyEmail(email: string, otp: string) {
    return api.post("/auth/verify-email", { email, otp }, false);
  },

  resendVerification(email: string) {
    return api.post("/auth/resend-verification", { email }, false);
  },

  forgotPassword(email: string) {
    return api.post("/auth/forgot-password", { email }, false);
  },

  resetPassword(data: { token: string; password: string }) {
    return api.post("/auth/reset-password", data, false);
  },

  registerOrganizer(data: {
    email: string;
    password: string;
    full_name: string;
    phone?: string;
    brand_name: string;
    description?: string;
    website_url?: string;
    instagram_url?: string;
  }) {
    return api.post<{ user: User }>("/auth/register/organizer", data, false);
  },

  getMe() {
    return api.get<User>("/auth/me");
  },

  getStaffEvents() {
    return api.get<StaffEvent[]>("/auth/me/staff-events");
  },
};
