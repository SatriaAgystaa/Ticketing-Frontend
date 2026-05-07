"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DollarSign, ArrowDownToLine, Clock, CheckCircle } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { payoutsApi } from "@/lib/api/payouts";
import type { Payout, PayoutBalance } from "@/lib/types/payout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils/format-currency";
import { formatDate } from "@/lib/utils/format-date";
import type { PayoutStatus } from "@/lib/utils/constants";

const payoutStatusConfig: Record<
  PayoutStatus,
  { label: string; variant: "default" | "success" | "warning" | "danger" | "info" }
> = {
  pending: { label: "Menunggu", variant: "warning" },
  processing: { label: "Diproses", variant: "info" },
  completed: { label: "Selesai", variant: "success" },
  failed: { label: "Gagal", variant: "danger" },
};

export default function FinancePage() {
  const [balance, setBalance] = useState<PayoutBalance | null>(null);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [amount, setAmount] = useState("");
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [balanceRes, payoutsRes] = await Promise.all([
          payoutsApi.getBalance(),
          payoutsApi.list(),
        ]);
        setBalance(balanceRes.data);
        setPayouts(payoutsRes.data);
      } catch {
        toast.error("Gagal memuat data keuangan");
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const handleRequestPayout = async () => {
    const value = Number(amount);
    if (!value || value <= 0) {
      toast.error("Masukkan jumlah yang valid");
      return;
    }
    if (balance && value > balance.available_balance) {
      toast.error("Jumlah melebihi saldo tersedia");
      return;
    }

    setIsRequesting(true);
    try {
      await payoutsApi.request(value);
      toast.success("Permintaan payout berhasil dikirim!");
      setAmount("");
      // Reload data
      const [balanceRes, payoutsRes] = await Promise.all([
        payoutsApi.getBalance(),
        payoutsApi.list(),
      ]);
      setBalance(balanceRes.data);
      setPayouts(payoutsRes.data);
    } catch {
      toast.error("Gagal membuat permintaan payout");
    } finally {
      setIsRequesting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  const chartData = payouts
    .filter((p) => p.status === "completed")
    .slice(0, 12)
    .reverse()
    .map((p) => ({
      date: formatDate(p.created_at),
      amount: p.amount,
    }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Keuangan
        </h1>
        <p className="text-sm text-gray-500">
          Kelola pendapatan dan penarikan dana
        </p>
      </div>

      {/* Balance Cards */}
      {balance && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Total Penjualan</p>
                  <p className="text-lg font-bold text-gray-900">
                    {formatCurrency(balance.gross_sales)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <ArrowDownToLine className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-xs text-gray-500">Saldo Tersedia</p>
                  <p className="text-lg font-bold text-green-600">
                    {formatCurrency(balance.available_balance)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-xs text-gray-500">Pending</p>
                  <p className="text-lg font-bold text-gray-900">
                    {formatCurrency(balance.pending_withdrawal)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-xs text-gray-500">Total Ditarik</p>
                  <p className="text-lg font-bold text-gray-900">
                    {formatCurrency(balance.total_withdrawn)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Payout Request */}
      <Card>
        <CardHeader>
          <CardTitle>Tarik Dana</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <Input
                id="payout-amount"
                label="Jumlah Penarikan (Rp)"
                type="number"
                placeholder="500000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <Button onClick={handleRequestPayout} isLoading={isRequesting}>
              Ajukan Penarikan
            </Button>
          </div>
          {balance && (
            <p className="mt-2 text-xs text-gray-400">
              Saldo tersedia: {formatCurrency(balance.available_balance)}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Chart */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Riwayat Payout</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value))}
                  />
                  <Bar dataKey="amount" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payout History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Riwayat Penarikan</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={[
              {
                key: "created_at",
                header: "Tanggal",
                render: (p: Payout) => formatDate(p.created_at),
              },
              {
                key: "amount",
                header: "Jumlah",
                render: (p: Payout) => formatCurrency(p.amount),
              },
              {
                key: "bank",
                header: "Bank",
                render: (p: Payout) =>
                  `${p.bank_name} - ${p.bank_account_number}`,
              },
              {
                key: "status",
                header: "Status",
                render: (p: Payout) => {
                  const config = payoutStatusConfig[p.status];
                  return <Badge variant={config.variant}>{config.label}</Badge>;
                },
              },
            ]}
            data={payouts}
            keyExtractor={(p) => p.id}
            emptyMessage="Belum ada riwayat penarikan"
          />
        </CardContent>
      </Card>
    </div>
  );
}
