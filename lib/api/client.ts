import { getAccessToken, getRefreshToken, setTokens, clearTokens } from "@/lib/auth/tokens";
import type { ApiError, ApiResponse } from "@/lib/types/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/v1";

class ApiClient {
  private baseUrl: string;
  private isRefreshing = false;
  private refreshPromise: Promise<boolean> | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async getHeaders(withAuth = true): Promise<HeadersInit> {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (withAuth) {
      const token = getAccessToken();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private async refreshToken(): Promise<boolean> {
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = (async () => {
      try {
        const refreshToken = getRefreshToken();
        if (!refreshToken) return false;

        const res = await fetch(`${this.baseUrl}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });

        if (!res.ok) {
          clearTokens();
          return false;
        }

        const data = await res.json();
        if (data.success) {
          setTokens({
            access_token: data.data.access_token,
            refresh_token: data.data.refresh_token,
            expires_in: data.data.expires_in,
          });
          return true;
        }

        clearTokens();
        return false;
      } catch {
        clearTokens();
        return false;
      } finally {
        this.isRefreshing = false;
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  private async request<T>(
    method: string,
    path: string,
    options?: {
      body?: unknown;
      params?: Record<string, string | number | boolean | undefined>;
      withAuth?: boolean;
    },
  ): Promise<ApiResponse<T>> {
    const { body, params, withAuth = true } = options ?? {};

    let url = `${this.baseUrl}${path}`;
    if (params) {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== "") {
          searchParams.set(key, String(value));
        }
      }
      const qs = searchParams.toString();
      if (qs) url += `?${qs}`;
    }

    const headers = await this.getHeaders(withAuth);
    const fetchOptions: RequestInit = { method, headers, cache: "no-store" };

    if (body) {
      fetchOptions.body = JSON.stringify(body);
    }

    let res = await fetch(url, fetchOptions);

    // Auto-refresh on 401
    if (res.status === 401 && withAuth) {
      const refreshed = await this.refreshToken();
      if (refreshed) {
        const newHeaders = await this.getHeaders(true);
        res = await fetch(url, { ...fetchOptions, headers: newHeaders });
      }
    }

    const json = await res.json();

    if (!res.ok || !json.success) {
      const error = json as ApiError;
      throw new ApiRequestError(error.code, error.message, res.status, error.errors);
    }

    return json as ApiResponse<T>;
  }

  async get<T>(
    path: string,
    params?: Record<string, string | number | boolean | undefined>,
    withAuth = true,
  ) {
    return this.request<T>("GET", path, { params, withAuth });
  }

  async post<T>(path: string, body?: unknown, withAuth = true) {
    return this.request<T>("POST", path, { body, withAuth });
  }

  async put<T>(path: string, body?: unknown, withAuth = true) {
    return this.request<T>("PUT", path, { body, withAuth });
  }

  async delete<T>(path: string, withAuth = true) {
    return this.request<T>("DELETE", path, { withAuth });
  }
}

/** Typed API error that can be caught in UI */
export class ApiRequestError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number,
    public errors?: { field: string; message: string }[],
  ) {
    super(message);
    this.name = "ApiRequestError";
  }
}

export const api = new ApiClient(API_BASE_URL);
