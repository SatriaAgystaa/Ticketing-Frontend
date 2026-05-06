import Cookies from "js-cookie";
import type { AuthTokens } from "@/lib/types/user";

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

export function getAccessToken(): string | undefined {
  return Cookies.get(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | undefined {
  return Cookies.get(REFRESH_TOKEN_KEY);
}

export function setTokens(tokens: AuthTokens) {
  // Access token: short-lived, expires based on server response
  Cookies.set(ACCESS_TOKEN_KEY, tokens.access_token, {
    expires: tokens.expires_in / 86400, // convert seconds to days
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  // Refresh token: longer-lived (30 days)
  Cookies.set(REFRESH_TOKEN_KEY, tokens.refresh_token, {
    expires: 30,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export function clearTokens() {
  Cookies.remove(ACCESS_TOKEN_KEY);
  Cookies.remove(REFRESH_TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  return !!getAccessToken() || !!getRefreshToken();
}
