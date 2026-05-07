"use client";

import { use, useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import {
  ticketTypeSchema,
  type TicketTypeFormData,
} from "@/lib/schemas/ticket-type.schema";
import { eventsApi } from "@/lib/api/events";
import type { TicketType } from "@/lib/types/event";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils/format-currency";

export default function TicketTypesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: eventId } = use(params);
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TicketTypeFormData>({
    resolver: zodResolver(ticketTypeSchema),
    defaultValues: {
      price: 0,
      quota: 100,
      max_per_user: 5,
      is_early_bird: false,
      is_visible: true,
    },
  });

  const loadTicketTypes = useCallback(async () => {
    try {
      const res = await eventsApi.getTicketTypes(eventId);
      setTicketTypes(res.data);
    } catch {
      toast.error("Gagal memuat tipe tiket");
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    loadTicketTypes();
  }, [loadTicketTypes]);

  const openCreate = () => {
    setEditingId(null);
    reset({
      name: "",
      description: "",
      price: 0,
      quota: 100,
      max_per_user: 5,
      is_early_bird: false,
      is_visible: true,
    });
    setIsModalOpen(true);
  };

  const openEdit = (tt: TicketType) => {
    setEditingId(tt.id);
    reset({
      name: tt.name,
      description: tt.description ?? "",
      price: tt.price,
      quota: tt.quota,
      max_per_user: tt.max_per_user,
      is_early_bird: tt.is_early_bird,
      is_visible: tt.is_visible,
      sale_starts_at: tt.sale_starts_at ?? "",
      sale_ends_at: tt.sale_ends_at ?? "",
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (data: TicketTypeFormData) => {
    setIsSubmitting(true);
    try {
      if (editingId) {
        await eventsApi.updateTicketType(eventId, editingId, data);
        toast.success("Tipe tiket berhasil diperbarui");
      } else {
        await eventsApi.createTicketType(eventId, data);
        toast.success("Tipe tiket berhasil dibuat");
      }
      setIsModalOpen(false);
      loadTicketTypes();
    } catch {
      toast.error("Gagal menyimpan tipe tiket");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (typeId: string) => {
    if (!confirm("Hapus tipe tiket ini?")) return;
    try {
      await eventsApi.deleteTicketType(eventId, typeId);
      toast.success("Tipe tiket dihapus");
      loadTicketTypes();
    } catch {
      toast.error("Gagal menghapus tipe tiket");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Tipe Tiket
          </h1>
          <p className="text-sm text-gray-500">
            Kelola tipe tiket untuk event ini
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Tipe Tiket
        </Button>
      </div>

      {ticketTypes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-gray-400">
            Belum ada tipe tiket. Tambahkan tipe tiket pertama.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {ticketTypes.map((tt) => (
            <Card key={tt.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">
                      {tt.name}
                    </h3>
                    {!tt.is_visible && (
                      <Badge variant="default">Tersembunyi</Badge>
                    )}
                    {tt.is_early_bird && (
                      <Badge variant="warning">Early Bird</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    {formatCurrency(tt.price)} &middot; {tt.sold_count}/
                    {tt.quota} terjual &middot; Maks {tt.max_per_user}/user
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEdit(tt)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(tt.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? "Edit Tipe Tiket" : "Tambah Tipe Tiket"}
        className="max-w-lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            id="name"
            label="Nama Tiket"
            placeholder="Contoh: VIP, Regular, Early Bird"
            error={errors.name?.message}
            {...register("name")}
          />
          <Textarea
            id="description"
            label="Deskripsi (opsional)"
            rows={2}
            error={errors.description?.message}
            {...register("description")}
          />
          <div className="grid gap-4 sm:grid-cols-3">
            <Input
              id="price"
              label="Harga"
              type="number"
              error={errors.price?.message}
              {...register("price", { valueAsNumber: true })}
            />
            <Input
              id="quota"
              label="Kuota"
              type="number"
              error={errors.quota?.message}
              {...register("quota", { valueAsNumber: true })}
            />
            <Input
              id="max_per_user"
              label="Maks/User"
              type="number"
              error={errors.max_per_user?.message}
              {...register("max_per_user", { valueAsNumber: true })}
            />
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300"
              {...register("is_visible")}
            />
            <span className="text-sm text-gray-700">
              Tampilkan ke pembeli
            </span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300"
              {...register("is_early_bird")}
            />
            <span className="text-sm text-gray-700">
              Early Bird
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
              {editingId ? "Simpan" : "Buat"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
