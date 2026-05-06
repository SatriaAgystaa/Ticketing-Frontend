"use client";

import { use, useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Copy } from "lucide-react";
import {
  promoCodeSchema,
  type PromoCodeFormData,
} from "@/lib/schemas/promo.schema";
import { eventsApi } from "@/lib/api/events";
import type { PromoCode } from "@/lib/types/event";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable } from "@/components/ui/data-table";
import { formatCurrency } from "@/lib/utils/format-currency";
import { formatDate } from "@/lib/utils/format-date";

export default function PromosPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: eventId } = use(params);
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<PromoCodeFormData>({
    resolver: zodResolver(promoCodeSchema),
    defaultValues: {
      discount_type: "percent",
      discount_value: 10,
      usage_limit: 100,
      max_per_user: 1,
      is_active: true,
    },
  });

  const discountType = watch("discount_type");

  const loadPromos = useCallback(async () => {
    try {
      const res = await eventsApi.listPromos(eventId);
      setPromos(res.data);
    } catch {
      toast.error("Gagal memuat promo");
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    loadPromos();
  }, [loadPromos]);

  const onSubmit = async (data: PromoCodeFormData) => {
    setIsSubmitting(true);
    try {
      await eventsApi.createPromo(eventId, data);
      toast.success("Promo berhasil dibuat");
      setIsModalOpen(false);
      reset();
      loadPromos();
    } catch {
      toast.error("Gagal membuat promo");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Kode disalin!");
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
            Kode Promo
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Kelola kode promo untuk event ini
          </p>
        </div>
        <Button
          onClick={() => {
            reset();
            setIsModalOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Buat Promo
        </Button>
      </div>

      <DataTable
        columns={[
          {
            key: "code",
            header: "Kode",
            render: (p: PromoCode) => (
              <div className="flex items-center gap-2">
                <code className="rounded bg-zinc-100 px-2 py-0.5 text-sm font-mono dark:bg-zinc-800">
                  {p.code}
                </code>
                <button
                  onClick={() => copyCode(p.code)}
                  className="text-zinc-400 hover:text-zinc-600"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
            ),
          },
          {
            key: "discount",
            header: "Diskon",
            render: (p: PromoCode) =>
              p.discount_type === "percent"
                ? `${p.discount_value}%`
                : formatCurrency(p.discount_value),
          },
          {
            key: "usage",
            header: "Pemakaian",
            render: (p: PromoCode) => `${p.used_count}/${p.usage_limit}`,
          },
          {
            key: "valid_until",
            header: "Berlaku Hingga",
            render: (p: PromoCode) => formatDate(p.valid_until),
          },
          {
            key: "status",
            header: "Status",
            render: (p: PromoCode) => (
              <Badge variant={p.is_active ? "success" : "default"}>
                {p.is_active ? "Aktif" : "Nonaktif"}
              </Badge>
            ),
          },
        ]}
        data={promos}
        keyExtractor={(p) => p.id}
        emptyMessage="Belum ada kode promo"
      />

      {/* Create Modal */}
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Buat Kode Promo"
        className="max-w-lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            id="code"
            label="Kode Promo"
            placeholder="EARLYBIRD2026"
            error={errors.code?.message}
            {...register("code")}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              id="discount_type"
              label="Tipe Diskon"
              options={[
                { value: "percent", label: "Persentase (%)" },
                { value: "flat", label: "Nominal (Rp)" },
              ]}
              error={errors.discount_type?.message}
              {...register("discount_type")}
            />
            <Input
              id="discount_value"
              label={discountType === "percent" ? "Persen (%)" : "Nominal (Rp)"}
              type="number"
              error={errors.discount_value?.message}
              {...register("discount_value", { valueAsNumber: true })}
            />
          </div>
          <Input
            id="max_discount_amount"
            label="Maks Diskon (opsional, Rp)"
            type="number"
            error={errors.max_discount_amount?.message}
            {...register("max_discount_amount", { valueAsNumber: true })}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              id="usage_limit"
              label="Batas Pemakaian"
              type="number"
              error={errors.usage_limit?.message}
              {...register("usage_limit", { valueAsNumber: true })}
            />
            <Input
              id="max_per_user"
              label="Maks/User"
              type="number"
              error={errors.max_per_user?.message}
              {...register("max_per_user", { valueAsNumber: true })}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              id="valid_from"
              label="Berlaku Dari"
              type="datetime-local"
              error={errors.valid_from?.message}
              {...register("valid_from")}
            />
            <Input
              id="valid_until"
              label="Berlaku Hingga"
              type="datetime-local"
              error={errors.valid_until?.message}
              {...register("valid_until")}
            />
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-zinc-300"
              {...register("is_active")}
            />
            <span className="text-sm text-zinc-700 dark:text-zinc-300">
              Aktifkan sekarang
            </span>
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Buat Promo
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
