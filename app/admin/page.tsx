"use client";

import { useEffect, useState } from "react";
import {
  DollarSign,
  CalendarDays,
  Users,
  Ticket,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { adminApi } from "@/lib/api/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils/format-currency";

interface DashboardStats {
  total_gmv: number;
  total_platform_fee: number;
  total_events: number;
  total_users: number;
  total_tickets_sold: number;
  monthly_revenue: { month: string; amount: number }[];
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await adminApi.getDashboardStats();
        setStats(res.data);
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
        <Skeleton className="h-80" />
      </div>
    );
  }

  if (!stats) return null;

  const summaryCards = [
    {
      label: "Total GMV",
      value: formatCurrency(stats.total_gmv),
      icon: DollarSign,
    },
    {
      label: "Platform Fee",
      value: formatCurrency(stats.total_platform_fee),
      icon: DollarSign,
    },
    {
      label: "Total Event",
      value: stats.total_events.toLocaleString("id-ID"),
      icon: CalendarDays,
    },
    {
      label: "Total Users",
      value: stats.total_users.toLocaleString("id-ID"),
      icon: Users,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          Admin Dashboard
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Platform overview & statistics
        </p>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => (
          <Card key={card.label}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                <card.icon className="h-6 w-6 text-zinc-600 dark:text-zinc-400" />
              </div>
              <div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {card.label}
                </p>
                <p className="text-xl font-bold text-zinc-900 dark:text-white">
                  {card.value}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tiket Terjual */}
      <Card>
        <CardContent className="flex items-center gap-4 p-6">
          <Ticket className="h-6 w-6 text-zinc-500" />
          <div>
            <p className="text-sm text-zinc-500">Total Tiket Terjual</p>
            <p className="text-2xl font-bold text-zinc-900 dark:text-white">
              {stats.total_tickets_sold.toLocaleString("id-ID")}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Revenue Chart */}
      {stats.monthly_revenue.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pendapatan Bulanan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.monthly_revenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value))}
                  />
                  <Bar
                    dataKey="amount"
                    fill="#18181b"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
