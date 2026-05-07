"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Ticket,
  User,
  LogOut,
  LayoutDashboard,
  ScanLine,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth/context";
import { Button } from "@/components/ui/button";
import { Dropdown } from "@/components/ui/dropdown";
import { USER_ROLES } from "@/lib/utils/constants";

export function Navbar() {
  const { user, isLoggedIn, isStaff, isGateScanner, logout } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-gray-900"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600">
            <Ticket className="h-4 w-4 text-white" />
          </div>
          <span className="hidden sm:inline">Tiket Event</span>
        </Link>

        {/* Desktop Search */}
        <div className="hidden flex-1 items-center justify-center px-8 md:flex">
          <Link
            href="/events"
            className="flex h-9 w-full max-w-sm items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-400 transition-colors hover:border-gray-300 hover:bg-gray-100"
          >
            <Search className="h-3.5 w-3.5 shrink-0" />
            Cari event, konser, workshop...
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 md:flex">
          <Link
            href="/events"
            className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            Jelajahi
          </Link>

          {!isLoggedIn ? (
            <div className="ml-2 flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/login")}
              >
                Masuk
              </Button>
              <Button
                variant="brand"
                size="sm"
                onClick={() => router.push("/register")}
              >
                Daftar
              </Button>
            </div>
          ) : (
            <div className="ml-2">
              <Dropdown
                trigger={
                  <div className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200">
                    <User className="h-4 w-4" />
                  </div>
                }
                items={[
                  ...(user?.role === USER_ROLES.ORGANIZER
                    ? [
                        {
                          label: "Dashboard",
                          onClick: () => router.push("/dashboard"),
                          icon: <LayoutDashboard className="h-4 w-4" />,
                        },
                      ]
                    : []),
                  ...(user?.role === USER_ROLES.SUPER_ADMIN
                    ? [
                        {
                          label: "Admin Panel",
                          onClick: () => router.push("/admin"),
                          icon: <LayoutDashboard className="h-4 w-4" />,
                        },
                      ]
                    : []),
                  ...(isGateScanner
                    ? [
                        {
                          label: "Scan Tiket",
                          onClick: () => router.push("/scan"),
                          icon: <ScanLine className="h-4 w-4" />,
                        },
                      ]
                    : isStaff
                      ? [
                          {
                            label: "Staff Dashboard",
                            onClick: () => router.push("/staff"),
                            icon: <LayoutDashboard className="h-4 w-4" />,
                          },
                        ]
                      : []),
                  {
                    label: "Tiket Saya",
                    onClick: () => router.push("/tickets"),
                    icon: <Ticket className="h-4 w-4" />,
                  },
                  {
                    label: "Profil",
                    onClick: () => router.push("/profile"),
                    icon: <User className="h-4 w-4" />,
                  },
                  {
                    label: "Keluar",
                    onClick: handleLogout,
                    icon: <LogOut className="h-4 w-4" />,
                    danger: true,
                  },
                ]}
              />
            </div>
          )}
        </nav>

        {/* Mobile menu button */}
        <button
          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-100 md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="h-4 w-4" />
          ) : (
            <Menu className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="border-t border-gray-100 bg-white px-4 py-3 md:hidden">
          {/* Mobile search */}
          <Link
            href="/events"
            className="mb-3 flex h-9 w-full items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-400"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Search className="h-3.5 w-3.5 shrink-0" />
            Cari event...
          </Link>

          <div className="flex flex-col gap-1">
            <Link
              href="/events"
              className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(false)}
            >
              Jelajahi Event
            </Link>
            {isLoggedIn ? (
              <>
                <Link
                  href="/tickets"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Tiket Saya
                </Link>
                <Link
                  href="/orders"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Pesanan Saya
                </Link>
                <Link
                  href="/profile"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Profil
                </Link>
                <button
                  onClick={handleLogout}
                  className="rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  Keluar
                </button>
              </>
            ) : (
              <div className="mt-1 flex gap-2 pt-1">
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    router.push("/login");
                    setMobileMenuOpen(false);
                  }}
                >
                  Masuk
                </Button>
                <Button
                  variant="brand"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    router.push("/register");
                    setMobileMenuOpen(false);
                  }}
                >
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
