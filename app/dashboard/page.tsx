"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  DollarSign,
  CalendarDays,
  Ticket,
  Users,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EventStatusBadge } from "@/components/shared/event-status-badge";
import { formatCurrency } from "@/lib/utils/format-currency";
import { formatDate } from "@/lib/utils/format-date";
import { eventsApi } from "@/lib/api/events";
import { payoutsApi } from "@/lib/api/payouts";
import type { EventListItem } from "@/lib/types/event";
import type { PayoutBalance } from "@/lib/types/payout";
import { Skeleton } from "@/components/ui/skeleton";

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
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  const stats = [
    {
      label: "Total Revenue",
      value: formatCurrency(balance?.gross_sales ?? 0),
      icon: DollarSign,
    },
    {
      label: "Saldo Tersedia",
      value: formatCurrency(balance?.available_balance ?? 0),
      icon: DollarSign,
    },
    {
      label: "Total Event",
      value: events.length.toString(),
      icon: CalendarDays,
    },
    {
      label: "Tiket Terjual",
      value: "-",
      icon: Ticket,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Ringkasan performa event Anda
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                <stat.icon className="h-6 w-6 text-zinc-600 dark:text-zinc-400" />
              </div>
              <div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {stat.label}
                </p>
                <p className="text-xl font-bold text-zinc-900 dark:text-white">
                  {stat.value}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Events */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Event Terbaru</CardTitle>
            <Link href="/dashboard/events">
              <Button variant="ghost" size="sm">
                Lihat Semua <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="py-8 text-center text-sm text-zinc-400">
              Belum ada event. Buat event pertama Anda!
            </div>
          ) : (
            <div className="space-y-3">
              {events.map((event) => (
                <Link
                  key={event.id}
                  href={`/dashboard/events/${event.id}`}
                  className="flex items-center justify-between rounded-lg border border-zinc-200 p-4 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                      <CalendarDays className="h-5 w-5 text-zinc-500" />
                    </div>
                    <div>
                      <p className="font-medium text-zinc-900 dark:text-white">
                        {event.title}
                      </p>
                      <p className="text-sm text-zinc-500">
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
