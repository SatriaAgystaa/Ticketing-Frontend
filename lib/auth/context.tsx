"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { authApi } from "@/lib/api/auth";
import { clearTokens, isAuthenticated, setTokens } from "@/lib/auth/tokens";
import type { StaffEvent, User } from "@/lib/types/user";

interface AuthContextValue {
  user: User | null;
  staffEvents: StaffEvent[];
  isLoading: boolean;
  isLoggedIn: boolean;
  isStaff: boolean;
  isGateScanner: boolean;
  login: (email: string, password: string) => Promise<{ role: string; isGateScanner: boolean; isStaff: boolean }>;
  register: (data: { email: string; password: string; full_name: string; phone?: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [staffEvents, setStaffEvents] = useState<StaffEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      if (!isAuthenticated()) {
        setUser(null);
        setStaffEvents([]);
        return;
      }
      const { data } = await authApi.getMe();
      setUser(data);

      // Load staff events untuk semua user (gate scanner / co-organizer)
      const staffRes = await authApi.getStaffEvents().catch(() => null);
      setStaffEvents(staffRes?.data ?? []);
    } catch {
      setUser(null);
      setStaffEvents([]);
      clearTokens();
    }
  }, []);

  useEffect(() => {
    refreshUser().finally(() => setIsLoading(false));
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    const { data } = await authApi.login({ email, password });
    setTokens({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in,
    });
    setUser(data.user);
    const staffRes = await authApi.getStaffEvents().catch(() => null);
    const events = staffRes?.data ?? [];
    setStaffEvents(events);
    const isGateScanner = events.some((e) => e.role === 'gate_scanner');
    return { role: data.user.role, isStaff: events.length > 0, isGateScanner };
  };

  const register = async (data: { email: string; password: string; full_name: string; phone?: string }) => {
    await authApi.register(data);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      clearTokens();
      setUser(null);
    }
  };

  return (
    <AuthContext value={{
      user,
      staffEvents,
      isLoading,
      isLoggedIn: !!user,
      isStaff: staffEvents.length > 0,
      isGateScanner: staffEvents.some((e) => e.role === 'gate_scanner'),
      login,
      register,
      logout,
      refreshUser,
    }}>
      {children}
    </AuthContext>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
