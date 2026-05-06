"use client";

import Link from "next/link";
import useSWR from "swr";
import { ordersApi } from "@/lib/api/orders";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import type { Order } from "@/lib/types/order";
import { formatCurrency } from "@/lib/utils/format-currency";
import { formatDate } from "@/lib/utils/format-date";
import { ORDER_STATUS } from "@/lib/utils/constants";

const STATUS_VARIANT: Record<string, "success" | "warning" | "danger" | "default"> = {
  [ORDER_STATUS.PAID]: "success",
  [ORDER_STATUS.PENDING]: "warning",
  [ORDER_STATUS.CANCELLED]: "danger",
  [ORDER_STATUS.REFUNDED]: "default",
  [ORDER_STATUS.EXPIRED]: "danger",
};

export default function OrdersPage() {
  const { data: orders, isLoading } = useSWR<Order[]>("/orders", async () => {
    const res = await ordersApi.list();
    return res.data;
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-white">Pesanan Saya</h1>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-white">Pesanan Saya</h1>

      {!orders || orders.length === 0 ? (
        <EmptyState
          title="Belum ada pesanan"
          description="Pesanan tiket Anda akan muncul di sini."
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="block rounded-xl border border-zinc-200 p-4 transition-shadow hover:shadow-md dark:border-zinc-800"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-zinc-900 dark:text-white">
                    {order.event.title}
                  </p>
                  <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
                    {order.order_number}
                  </p>
                  <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
                    {formatDate(order.created_at)}
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant={STATUS_VARIANT[order.status] ?? "default"}>
                    {order.status}
                  </Badge>
                  <p className="mt-2 font-semibold text-zinc-900 dark:text-white">
                    {formatCurrency(order.total_amount)}
                  </p>
                </div>
              </div>
              <div className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
                {order.items.length} item &middot;{" "}
                {order.items.map((i) => `${i.quantity}x ${i.ticket_type_name_snapshot}`).join(", ")}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
