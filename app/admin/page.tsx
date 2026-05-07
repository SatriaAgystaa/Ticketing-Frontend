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
        <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          Platform overview &amp; statistics
        </p>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => (
          <Card key={card.label}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    {card.label}
                  </p>
                  <p className="mt-2 text-2xl font-bold text-gray-900">
                    {card.value}
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
                  <card.icon className="h-5 w-5 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tiket Terjual */}
      <Card>
        <CardContent className="flex items-center gap-4 p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50">
            <Ticket className="h-5 w-5 text-violet-600" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Total Tiket Terjual
            </p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
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
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="month" fontSize={12} tick={{ fill: "#6b7280" }} axisLine={false} tickLine={false} />
                  <YAxis fontSize={12} tick={{ fill: "#6b7280" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value))}
                    contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.07)" }}
                  />
                  <Bar
                    dataKey="amount"
                    fill="#6366f1"
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
