"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  DollarSign,
  CalendarDays,
  Ticket,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EventStatusBadge } from "@/components/shared/event-status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils/format-currency";
import { formatDate } from "@/lib/utils/format-date";
import { eventsApi } from "@/lib/api/events";
import { payoutsApi } from "@/lib/api/payouts";
import type { EventListItem } from "@/lib/types/event";
import type { PayoutBalance } from "@/lib/types/payout";

export default function DashboardOverviewPage() {
  const [events, setEvents] = useState<EventListItem[]>([]);
  const [balance, setBalance] = useState<PayoutBalance | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [eventsRes, balanceRes] = await Promise.all([
          eventsApi.list({ limit: 5, sort: "newest" }),
          payoutsApi.getBalance(),
        ]);
        setEvents(eventsRes.data);
        setBalance(balanceRes.data);
      } catch {
        // handled by API client
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-72 rounded-xl" />
      </div>
    );
  }

  const stats = [
    {
      label: "Total Revenue",
      value: formatCurrency(balance?.gross_sales ?? 0),
      icon: TrendingUp,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Saldo Tersedia",
      value: formatCurrency(balance?.available_balance ?? 0),
      icon: DollarSign,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      label: "Total Event",
      value: events.length.toString(),
      icon: CalendarDays,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Tiket Terjual",
      value: "-",
      icon: Ticket,
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          Ringkasan performa event Anda
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    {stat.label}
                  </p>
                  <p className="mt-2 text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.bg}`}
                >
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Events */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Event Terbaru</CardTitle>
              <p className="mt-0.5 text-xs text-gray-500">5 event terakhir</p>
            </div>
            <Link href="/dashboard/events">
              <Button variant="ghost" size="sm">
                Lihat Semua
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100">
                <CalendarDays className="h-5 w-5 text-gray-400" />
              </div>
              <p className="mt-3 text-sm font-medium text-gray-900">
                Belum ada event
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Buat event pertama Anda sekarang!
              </p>
              <Link href="/dashboard/events/new" className="mt-4">
                <Button variant="brand" size="sm">
                  Buat Event
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {events.map((event) => (
                <Link
                  key={event.id}
                  href={`/dashboard/events/${event.id}`}
                  className="flex items-center justify-between py-3.5 transition-colors hover:bg-gray-50 -mx-6 px-6 first:-mt-0 last:-mb-0"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                      <CalendarDays className="h-4 w-4 text-gray-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate max-w-[200px] sm:max-w-none">
                        {event.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(event.starts_at)}
                      </p>
                    </div>
                  </div>
                  <EventStatusBadge status={event.status} />
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
