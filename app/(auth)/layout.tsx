import type { ReactNode } from "react";
import Link from "next/link";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-900">
      <div className="mb-8">
        <Link href="/" className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Tiket Event
        </Link>
      </div>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
