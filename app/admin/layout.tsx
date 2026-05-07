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
    <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div className="flex items-center gap-2.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-900">
          <Ticket className="h-4 w-4 text-white" />
        </div>
        <span className="font-semibold text-gray-900">Tiket Event</span>
        <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700 border border-red-200">
          Admin
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500">{user?.email}</span>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
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
          <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
