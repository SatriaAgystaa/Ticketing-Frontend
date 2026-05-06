"use client";

import type { ReactNode } from "react";
import { ScanLine } from "lucide-react";
import Link from "next/link";
import { ProtectedRoute } from "@/lib/auth/guard";

export default function ScanLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={["organizer"]}>
      <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-900">
        <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950">
          <Link
            href="/scan"
            className="flex items-center gap-2 font-bold text-zinc-900 dark:text-white"
          >
            <ScanLine className="h-5 w-5" />
            Gate Scanner
          </Link>
        </header>
        <main className="flex flex-1 flex-col p-4">{children}</main>
      </div>
    </ProtectedRoute>
  );
}
