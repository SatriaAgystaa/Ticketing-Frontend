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
import type { User } from "@/lib/types/user";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; full_name: string; phone?: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      if (!isAuthenticated()) {
        setUser(null);
        return;
      }
      const { data } = await authApi.getMe();
      setUser(data);
    } catch {
      setUser(null);
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
      isLoading,
      isLoggedIn: !!user,
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
