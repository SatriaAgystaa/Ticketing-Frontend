"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LayoutDashboard, LogOut, User } from "lucide-react";
import { useAuth } from "@/lib/auth/context";

export default function StaffLayout({ children }: { children: ReactNode }) {
  const { isLoggedIn, isStaff, isLoading, user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!isLoggedIn) { router.replace("/login"); return; }
    if (!isStaff) router.replace("/");
  }, [isLoading, isLoggedIn, isStaff, router]);

  if (isLoading || !isLoggedIn || !isStaff) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-indigo-600" />
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
        <div className="flex h-14 items-center justify-between px-4">
          <Link
            href="/staff"
            className="flex items-center gap-2 font-bold text-gray-900"
          >
            <LayoutDashboard className="h-5 w-5" />
            Staff Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">{user?.full_name?.split(" ")[0]}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-sm text-red-500 hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>
      <main className="flex flex-1 flex-col p-4">{children}</main>
    </div>
  );
}
