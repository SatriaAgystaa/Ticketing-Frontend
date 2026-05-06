"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "./context";
import type { UserRole } from "@/lib/utils/constants";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  allowedRoles,
  redirectTo = "/login",
}: ProtectedRouteProps) {
  const { user, isLoading, isLoggedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!isLoggedIn) {
      router.replace(redirectTo);
      return;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      router.replace("/");
    }
  }, [isLoading, isLoggedIn, user, allowedRoles, redirectTo, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-zinc-900" />
      </div>
    );
  }

  if (!isLoggedIn) return null;
  if (allowedRoles && user && !allowedRoles.includes(user.role)) return null;

  return <>{children}</>;
}
