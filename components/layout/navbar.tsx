"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, Search, Ticket, User, LogOut, LayoutDashboard } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth/context";
import { Button } from "@/components/ui/button";
import { Dropdown } from "@/components/ui/dropdown";
import { USER_ROLES } from "@/lib/utils/constants";

export function Navbar() {
  const { user, isLoggedIn, logout } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-zinc-900 dark:text-white">
          <Ticket className="h-6 w-6" />
          <span className="hidden sm:inline">Tiket Event</span>
        </Link>

        {/* Desktop Search */}
        <div className="hidden flex-1 items-center justify-center px-8 md:flex">
          <Link
            href="/events"
            className="flex h-10 w-full max-w-md items-center gap-2 rounded-lg border border-zinc-200 px-3 text-sm text-zinc-400 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700"
          >
            <Search className="h-4 w-4" />
            Cari event, konser, workshop...
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-4 md:flex">
          <Link href="/events" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">
            Jelajahi
          </Link>

          {!isLoggedIn ? (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => router.push("/login")}>
                Masuk
              </Button>
              <Button size="sm" onClick={() => router.push("/register")}>
                Daftar
              </Button>
            </div>
          ) : (
            <Dropdown
              trigger={
                <div className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <User className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                </div>
              }
              items={[
                ...(user?.role === USER_ROLES.ORGANIZER
                  ? [{ label: "Dashboard", onClick: () => router.push("/dashboard"), icon: <LayoutDashboard className="h-4 w-4" /> }]
                  : []),
                ...(user?.role === USER_ROLES.SUPER_ADMIN
                  ? [{ label: "Admin Panel", onClick: () => router.push("/admin"), icon: <LayoutDashboard className="h-4 w-4" /> }]
                  : []),
                { label: "Tiket Saya", onClick: () => router.push("/tickets"), icon: <Ticket className="h-4 w-4" /> },
                { label: "Profil", onClick: () => router.push("/profile"), icon: <User className="h-4 w-4" /> },
                { label: "Keluar", onClick: handleLogout, icon: <LogOut className="h-4 w-4" />, danger: true },
              ]}
            />
          )}
        </nav>

        {/* Mobile menu button */}
        <button
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <Menu className="h-6 w-6 text-zinc-600 dark:text-zinc-400" />
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="border-t border-zinc-200 px-4 py-4 md:hidden dark:border-zinc-800">
          <div className="flex flex-col gap-3">
            <Link href="/events" className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Jelajahi Event
            </Link>
            {isLoggedIn ? (
              <>
                <Link href="/tickets" className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  Tiket Saya
                </Link>
                <Link href="/orders" className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  Pesanan Saya
                </Link>
                <Link href="/profile" className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  Profil
                </Link>
                <button onClick={handleLogout} className="text-left text-sm font-medium text-red-600">
                  Keluar
                </button>
              </>
            ) : (
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" className="flex-1" onClick={() => router.push("/login")}>
                  Masuk
                </Button>
                <Button size="sm" className="flex-1" onClick={() => router.push("/register")}>
                  Daftar
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
