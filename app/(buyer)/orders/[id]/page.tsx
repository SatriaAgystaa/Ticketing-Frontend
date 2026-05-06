"use client";

import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import { toast } from "sonner";
import { ordersApi } from "@/lib/api/orders";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: order, isLoading, mutate } = useSWR<Order>(
    `/orders/${id}`,
    async () => {
      const res = await ordersApi.getById(id);
      return res.data;
    },
  );

  const handleCancel = async () => {
    try {
      await ordersApi.cancel(id);
      toast.success("Pesanan berhasil dibatalkan");
      mutate();
    } catch {
      toast.error("Gagal membatalkan pesanan");
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <Skeleton className="mb-4 h-8 w-64" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-zinc-500">Pesanan tidak ditemukan</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <button
        onClick={() => router.push("/orders")}
        className="mb-4 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
      >
        &larr; Kembali ke Pesanan
      </button>

      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
            {order.order_number}
          </h1>
          <p className="mt-1 text-zinc-500 dark:text-zinc-400">{order.event.title}</p>
        </div>
        <Badge variant={STATUS_VARIANT[order.status] ?? "default"}>
          {order.status}
        </Badge>
      </div>

      {/* Event Info */}
      <div className="mb-6 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {formatDate(order.event.starts_at)}
        </p>
        {order.event.venue_name && (
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {order.event.venue_name}
          </p>
        )}
      </div>

      {/* Order Items */}
      <div className="mb-6 rounded-xl border border-zinc-200 dark:border-zinc-800">
        <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <h2 className="font-semibold text-zinc-900 dark:text-white">Item Pesanan</h2>
        </div>
        <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="font-medium text-zinc-900 dark:text-white">
                  {item.ticket_type_name_snapshot}
                </p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {item.quantity}x {formatCurrency(item.price_snapshot)}
                </p>
              </div>
              <p className="font-medium text-zinc-900 dark:text-white">
                {formatCurrency(item.subtotal)}
              </p>
            </div>
          ))}
        </div>

        <div className="border-t border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <div className="flex justify-between text-sm text-zinc-500 dark:text-zinc-400">
            <span>Subtotal</span>
            <span>{formatCurrency(order.subtotal)}</span>
          </div>
          <div className="mt-1 flex justify-between text-sm text-zinc-500 dark:text-zinc-400">
            <span>Biaya layanan</span>
            <span>{formatCurrency(order.platform_fee)}</span>
          </div>
          {order.payment_fee > 0 && (
            <div className="mt-1 flex justify-between text-sm text-zinc-500 dark:text-zinc-400">
              <span>Biaya pembayaran</span>
              <span>{formatCurrency(order.payment_fee)}</span>
            </div>
          )}
          {order.discount_amount > 0 && (
            <div className="mt-1 flex justify-between text-sm text-green-600">
              <span>Diskon</span>
              <span>-{formatCurrency(order.discount_amount)}</span>
            </div>
          )}
          <div className="mt-2 flex justify-between border-t border-zinc-200 pt-2 font-semibold text-zinc-900 dark:border-zinc-800 dark:text-white">
            <span>Total</span>
            <span>{formatCurrency(order.total_amount)}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        {order.status === ORDER_STATUS.PAID && (
          <Button onClick={() => router.push("/tickets")}>Lihat Tiket</Button>
        )}
        {order.status === ORDER_STATUS.PENDING && (
          <Button variant="danger" onClick={handleCancel}>
            Batalkan Pesanan
          </Button>
        )}
      </div>

      <p className="mt-6 text-xs text-zinc-400 dark:text-zinc-500">
        Dibuat pada {formatDate(order.created_at)}
      </p>
    </div>
  );
}
