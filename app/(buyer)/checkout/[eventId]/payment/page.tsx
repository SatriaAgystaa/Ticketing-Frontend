"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import useSWR from "swr";
import { paymentsApi } from "@/lib/api/payments";
import { ordersApi } from "@/lib/api/orders";
import { CountdownTimer } from "@/components/shared/countdown-timer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { POLLING } from "@/lib/utils/constants";
import { toast } from "sonner";

function PaymentStatusContent() {
  const { eventId } = useParams<{ eventId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("order") ?? "";
  const [simulating, setSimulating] = useState(false);

  const { data: payment, isLoading, mutate } = useSWR(
    orderId ? `/orders/${orderId}/payment-status` : null,
    async () => {
      const res = await paymentsApi.getStatus(orderId);
      return res.data;
    },
    { refreshInterval: POLLING.PAYMENT_STATUS },
  );

  const isPaid = payment?.status === "paid";
  const isFailed =
    payment?.status === "cancelled" ||
    payment?.status === "expired";

  useEffect(() => {
    if (isPaid) {
      router.push(`/orders/${orderId}`);
    }
  }, [isPaid, orderId, router]);

  const handleSimulatePayment = async () => {
    setSimulating(true);
    try {
      await ordersApi.simulatePayment(orderId);
      toast.success("Pembayaran berhasil disimulasikan!");
      mutate();
    } catch {
      toast.error("Gagal simulasi pembayaran");
    } finally {
      setSimulating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12 text-center">
      <h1 className="mb-2 text-2xl font-bold text-zinc-900 dark:text-white">
        Status Pembayaran
      </h1>

      {!isFailed && !isPaid && (
        <>
          <div className="my-8 flex flex-col items-center gap-4">
            <Spinner />
            <p className="text-zinc-600 dark:text-zinc-400">
              Menunggu konfirmasi pembayaran...
            </p>
          </div>

          <CountdownTimer
            targetDate={new Date(Date.now() + 15 * 60 * 1000).toISOString()}
            label="Batas waktu pembayaran"
            variant="danger"
            className="justify-center"
          />

          <div className="mt-6">
            <Badge variant="warning">Menunggu Pembayaran</Badge>
          </div>

          {payment?.payment_method && (
            <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
              Metode: {payment.payment_method}
            </p>
          )}

          <div className="mt-8 rounded-lg border border-dashed border-zinc-300 p-4 dark:border-zinc-700">
            <p className="mb-3 text-xs text-zinc-500 dark:text-zinc-400">
              Mode pengembangan — simulasi pembayaran
            </p>
            <Button
              onClick={handleSimulatePayment}
              disabled={simulating}
              variant="secondary"
              size="sm"
            >
              {simulating ? <Spinner className="mr-2 h-4 w-4" /> : null}
              Simulasi Pembayaran Berhasil
            </Button>
          </div>
        </>
      )}

      {isFailed && (
        <div className="my-8 space-y-4">
          <Badge variant="danger">Pembayaran Gagal</Badge>
          <p className="text-zinc-600 dark:text-zinc-400">
            Pembayaran tidak berhasil. Silakan coba lagi.
          </p>
          <Button onClick={() => router.push(`/checkout/${eventId}`)}>
            Kembali ke Checkout
          </Button>
        </div>
      )}

      {isPaid && (
        <div className="my-8 space-y-4">
          <Badge variant="success">Pembayaran Berhasil</Badge>
          <p className="text-zinc-600 dark:text-zinc-400">
            Mengalihkan ke detail pesanan...
          </p>
        </div>
      )}
    </div>
  );
}

export default function PaymentStatusPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <Spinner />
        </div>
      }
    >
      <PaymentStatusContent />
    </Suspense>
  );
}
