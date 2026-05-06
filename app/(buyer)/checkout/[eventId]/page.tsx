"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import { eventsApi } from "@/lib/api/events";
import { ordersApi } from "@/lib/api/orders";
import { TicketSelector } from "@/components/shared/ticket-selector";
import { DynamicForm } from "@/components/shared/dynamic-form";
import { PriceBreakdown } from "@/components/shared/price-breakdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import type { EventDetail } from "@/lib/types/event";
import type { PromoValidation } from "@/lib/types/order";

export default function CheckoutPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const router = useRouter();

  const { data: event, isLoading } = useSWR<EventDetail>(
    `/events/${eventId}/detail`,
    async () => {
      const res = await eventsApi.getBySlug(eventId);
      return res.data;
    },
  );

  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [promoCode, setPromoCode] = useState("");
  const [promo, setPromo] = useState<PromoValidation | null>(null);
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedItems = Object.entries(quantities)
    .filter(([, qty]) => qty > 0)
    .map(([ticketTypeId, quantity]) => ({ ticket_type_id: ticketTypeId, quantity }));

  const subtotal = selectedItems.reduce((sum, item) => {
    const tt = event?.ticket_types.find((t) => t.id === item.ticket_type_id);
    return sum + (tt?.price ?? 0) * item.quantity;
  }, 0);

  const discount = promo?.valid
    ? promo.discount_type === "percent"
      ? Math.min(subtotal * (promo.discount_value / 100), promo.max_discount_amount ?? Infinity)
      : promo.discount_value
    : 0;

  const platformFee = Math.round(subtotal * 0.04);
  const total = subtotal + platformFee - discount;

  const handleValidatePromo = async () => {
    if (!promoCode.trim() || selectedItems.length === 0) return;
    setIsValidatingPromo(true);
    try {
      const res = await ordersApi.validatePromo({
        event_id: eventId,
        code: promoCode,
        items: selectedItems,
      });
      setPromo(res.data);
      if (!res.data.valid) {
        toast.error(res.data.message);
      } else {
        toast.success("Kode promo berhasil diterapkan");
      }
    } catch {
      toast.error("Gagal memvalidasi kode promo");
      setPromo(null);
    } finally {
      setIsValidatingPromo(false);
    }
  };

  const handleSubmit = async () => {
    if (selectedItems.length === 0) {
      toast.error("Pilih minimal 1 tiket");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await ordersApi.create({
        event_id: eventId,
        items: selectedItems.map((item) => ({
          ...item,
          form_answers: event?.custom_form_fields.map((f) => ({
            field_id: f.id,
            answer: formValues[f.id] || "",
          })),
        })),
        promo_code: promo?.valid ? promoCode : undefined,
      });

      if (res.data.payment_url) {
        window.location.href = res.data.payment_url;
      } else {
        router.push(`/checkout/${eventId}/payment?order=${res.data.order_id}`);
      }
    } catch {
      toast.error("Gagal membuat pesanan. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <Skeleton className="mb-4 h-8 w-48" />
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-zinc-500">Event tidak ditemukan</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-1 text-2xl font-bold text-zinc-900 dark:text-white">Checkout</h1>
      <p className="mb-6 text-zinc-500 dark:text-zinc-400">{event.title}</p>

      {/* Ticket Selection */}
      <section className="mb-6">
        <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-white">Pilih Tiket</h2>
        <div className="space-y-3">
          {event.ticket_types
            .filter((tt) => tt.is_visible)
            .map((tt) => (
              <TicketSelector
                key={tt.id}
                ticketType={tt}
                quantity={quantities[tt.id] || 0}
                onQuantityChange={(qty) =>
                  setQuantities((prev) => ({ ...prev, [tt.id]: qty }))
                }
              />
            ))}
        </div>
      </section>

      {/* Custom Form Fields */}
      {event.custom_form_fields.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-white">
            Informasi Tambahan
          </h2>
          <DynamicForm
            fields={event.custom_form_fields}
            values={formValues}
            onChange={(fieldId, value) =>
              setFormValues((prev) => ({ ...prev, [fieldId]: value }))
            }
          />
        </section>
      )}

      {/* Promo Code */}
      <section className="mb-6">
        <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-white">Kode Promo</h2>
        <div className="flex gap-2">
          <Input
            placeholder="Masukkan kode promo"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
          />
          <Button
            variant="secondary"
            onClick={handleValidatePromo}
            disabled={isValidatingPromo || !promoCode.trim()}
          >
            {isValidatingPromo ? "Cek..." : "Terapkan"}
          </Button>
        </div>
        {promo?.valid && (
          <p className="mt-2 text-sm text-green-600">{promo.message}</p>
        )}
      </section>

      {/* Price Breakdown */}
      <section className="mb-6">
        <PriceBreakdown
          subtotal={subtotal}
          platformFee={platformFee}
          paymentFee={0}
          discount={discount}
          total={total}
        />
      </section>

      {/* Submit */}
      <Button
        className="w-full"
        size="lg"
        onClick={handleSubmit}
        disabled={isSubmitting || selectedItems.length === 0}
      >
        {isSubmitting ? "Memproses..." : "Buat Pesanan"}
      </Button>
    </div>
  );
}
