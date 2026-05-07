"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "./context";
import type { UserRole } from "@/lib/utils/constants";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
  allowStaff?: boolean;
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  allowedRoles,
  allowStaff = false,
  redirectTo = "/login",
}: ProtectedRouteProps) {
  const { user, isLoading, isLoggedIn, isStaff } = useAuth();
  const router = useRouter();

  const hasAccess = !allowedRoles || (user && (allowedRoles.includes(user.role) || (allowStaff && isStaff)));

  useEffect(() => {
    if (isLoading) return;
    if (!isLoggedIn) { router.replace(redirectTo); return; }
    if (!hasAccess) router.replace("/");
  }, [isLoading, isLoggedIn, hasAccess, redirectTo, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-indigo-600" />
      </div>
    );
  }

  if (!isLoggedIn || !hasAccess) return null;

  return <>{children}</>;
}
