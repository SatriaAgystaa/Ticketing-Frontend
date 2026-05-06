"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Ticket } from "lucide-react";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { ProtectedRoute } from "@/lib/auth/guard";
import { useAuth } from "@/lib/auth/context";

function AdminTopbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <header className="flex h-14 items-center justify-between border-b border-zinc-200 bg-white px-6 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center gap-2 font-bold text-zinc-900 dark:text-white">
        <Ticket className="h-5 w-5" />
        <span>Tiket Event</span>
        <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-900/30 dark:text-red-400">
          Admin
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-zinc-500 dark:text-zinc-400">{user?.email}</span>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          Keluar
        </button>
      </div>
    </header>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={["super_admin"]}>
      <div className="flex h-screen flex-col">
        <AdminTopbar />
        <div className="flex flex-1 overflow-hidden">
          <AdminSidebar />
          <main className="flex-1 overflow-y-auto bg-zinc-50 p-6 dark:bg-zinc-900">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
