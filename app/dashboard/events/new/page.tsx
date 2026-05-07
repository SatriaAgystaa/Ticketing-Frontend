"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  createEventSchema,
  type CreateEventFormData,
} from "@/lib/schemas/event.schema";
import { eventsApi } from "@/lib/api/events";
import type { EventCategory } from "@/lib/types/event";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "@/components/shared/file-upload";
import { WilayahSelect } from "@/components/shared/wilayah-select";
import { DateTimePicker } from "@/components/ui/date-time-picker";

export default function CreateEventPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<EventCategory[]>([]);

  useEffect(() => {
    eventsApi.getCategories().then((res) => setCategories(res.data)).catch(() => {});
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateEventFormData>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      event_type: "offline",
      visibility: "public",
      is_high_demand: false,
      allow_attendance_list: true,
    },
  });

  const bannerUrl = watch("banner_url");

  const onSubmit = async (data: CreateEventFormData) => {
    setIsSubmitting(true);
    try {
      const res = await eventsApi.create(data);
      toast.success("Event berhasil dibuat!");
      router.push(`/dashboard/events/${res.data.id}`);
    } catch {
      toast.error("Gagal membuat event. Coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Buat Event Baru
        </h1>
        <p className="text-sm text-gray-500">
          Isi detail event Anda
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Banner */}
        <Card>
          <CardHeader>
            <CardTitle>Banner Event</CardTitle>
          </CardHeader>
          <CardContent>
            <FileUpload
              label="Upload banner (16:9, maks 5MB)"
              folder="events"
              value={bannerUrl}
              onChange={(url) => setValue("banner_url", url)}
            />
          </CardContent>
        </Card>

        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi Dasar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              id="title"
              label="Judul Event"
              placeholder="Contoh: Jakarta Music Festival 2026"
              error={errors.title?.message}
              {...register("title")}
            />

            <Textarea
              id="description"
              label="Deskripsi"
              placeholder="Jelaskan detail event Anda..."
              rows={5}
              error={errors.description?.message}
              {...register("description")}
            />

            <Select
              id="category_id"
              label="Kategori"
              options={categories.map((c) => ({ value: c.id, label: c.name }))}
              error={errors.category_id?.message}
              {...register("category_id")}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                id="event_type"
                label="Tipe Event"
                options={[
                  { value: "offline", label: "Offline" },
                  { value: "online", label: "Online" },
                  { value: "hybrid", label: "Hybrid" },
                ]}
                error={errors.event_type?.message}
                {...register("event_type")}
              />

              <Select
                id="visibility"
                label="Visibilitas"
                options={[
                  { value: "public", label: "Publik" },
                  { value: "private", label: "Private" },
                  { value: "unlisted", label: "Unlisted" },
                ]}
                error={errors.visibility?.message}
                {...register("visibility")}
              />
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle>Lokasi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              id="venue_name"
              label="Nama Venue"
              placeholder="Contoh: Jakarta Convention Center"
              error={errors.venue_name?.message}
              {...register("venue_name")}
            />
            <Input
              id="venue_address"
              label="Alamat"
              placeholder="Jl. Gatot Subroto No.1"
              error={errors.venue_address?.message}
              {...register("venue_address")}
            />
            <WilayahSelect
              value={{
                province: watch("venue_province"),
                city: watch("venue_city"),
                district: watch("venue_district"),
                subdistrict: watch("venue_subdistrict"),
              }}
              onChange={(val) => {
                setValue("venue_province", val.province);
                setValue("venue_city", val.city);
                setValue("venue_district", val.district);
                setValue("venue_subdistrict", val.subdistrict);
              }}
              errors={{
                province: errors.venue_province?.message,
                city: errors.venue_city?.message,
                district: errors.venue_district?.message,
                subdistrict: errors.venue_subdistrict?.message,
              }}
            />
            <Input
              id="venue_maps_url"
              label="Google Maps URL (opsional)"
              placeholder="https://maps.google.com/..."
              error={errors.venue_maps_url?.message}
              {...register("venue_maps_url")}
            />
            <Input
              id="online_url"
              label="Online URL (opsional)"
              placeholder="https://zoom.us/..."
              error={errors.online_url?.message}
              {...register("online_url")}
            />
          </CardContent>
        </Card>

        {/* Date & Time */}
        <Card>
          <CardHeader>
            <CardTitle>Tanggal & Waktu</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <DateTimePicker
                id="starts_at"
                label="Mulai"
                value={watch("starts_at")}
                onChange={(v) => setValue("starts_at", v, { shouldValidate: true })}
                error={errors.starts_at?.message}
              />
              <DateTimePicker
                id="ends_at"
                label="Selesai"
                value={watch("ends_at")}
                onChange={(v) => setValue("ends_at", v, { shouldValidate: true })}
                error={errors.ends_at?.message}
                minDate={watch("starts_at") ? new Date(watch("starts_at")!) : undefined}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <DateTimePicker
                id="sale_starts_at"
                label="Penjualan Dimulai (opsional)"
                value={watch("sale_starts_at")}
                onChange={(v) => setValue("sale_starts_at", v, { shouldValidate: true })}
                error={errors.sale_starts_at?.message}
              />
              <DateTimePicker
                id="sale_ends_at"
                label="Penjualan Berakhir (opsional)"
                value={watch("sale_ends_at")}
                onChange={(v) => setValue("sale_ends_at", v, { shouldValidate: true })}
                error={errors.sale_ends_at?.message}
              />
            </div>
          </CardContent>
        </Card>

        {/* Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Pengaturan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300"
                {...register("is_high_demand")}
              />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  High Demand Mode
                </p>
                <p className="text-xs text-gray-500">
                  Aktifkan waiting room untuk event dengan permintaan tinggi
                </p>
              </div>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300"
                {...register("allow_attendance_list")}
              />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Daftar Kehadiran
                </p>
                <p className="text-xs text-gray-500">
                  Tampilkan daftar peserta yang hadir secara publik
                </p>
              </div>
            </label>

            <Textarea
              id="refund_policy"
              label="Kebijakan Refund (opsional)"
              rows={3}
              placeholder="Jelaskan kebijakan refund event Anda..."
              error={errors.refund_policy?.message}
              {...register("refund_policy")}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.back()}
          >
            Batal
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Buat Event
          </Button>
        </div>
      </form>
    </div>
  );
}
