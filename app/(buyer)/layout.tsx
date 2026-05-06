"use client";

import type { ReactNode } from "react";
import { Navbar } from "@/components/layout/navbar";
import { ProtectedRoute } from "@/lib/auth/guard";

export default function BuyerLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <Navbar />
      <main className="min-h-[calc(100vh-4rem)]">{children}</main>
    </ProtectedRoute>
  );
}
