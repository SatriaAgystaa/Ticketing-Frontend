"use client";

import { use, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import {
  updateEventSchema,
  type UpdateEventFormData,
} from "@/lib/schemas/event.schema";
import { eventsApi } from "@/lib/api/events";
import type { Event, EventCategory } from "@/lib/types/event";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "@/components/shared/file-upload";
import { WilayahSelect } from "@/components/shared/wilayah-select";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const pathname = usePathname();
  const isStaffRoute = pathname.startsWith("/staff");
  const backHref = isStaffRoute ? `/staff/events/${id}` : `/dashboard/events/${id}`;
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<EventCategory[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<UpdateEventFormData>({
    resolver: zodResolver(updateEventSchema),
  });

  const bannerUrl = watch("banner_url");

  useEffect(() => {
    eventsApi.getCategories().then((res) => setCategories(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const res = await eventsApi.getById(id);
        const e = res.data as Event;
        reset({
          title: e.title,
          description: e.description,
          category_id: e.category_id,
          event_type: e.event_type,
          venue_name: e.venue_name ?? "",
          venue_address: e.venue_address ?? "",
          venue_province: e.venue_province ?? "",
          venue_city: e.venue_city ?? "",
          venue_district: e.venue_district ?? "",
          venue_subdistrict: e.venue_subdistrict ?? "",
          venue_maps_url: e.venue_maps_url ?? "",
          online_url: e.online_url ?? "",
          starts_at: e.starts_at,
          ends_at: e.ends_at,
          sale_starts_at: e.sale_starts_at ?? "",
          sale_ends_at: e.sale_ends_at ?? "",
          visibility: e.visibility,
          is_high_demand: e.is_high_demand,
          allow_attendance_list: e.allow_attendance_list,
          refund_policy: e.refund_policy ?? "",
          banner_url: e.banner_url ?? "",
        });
      } catch {
        toast.error("Gagal memuat data event");
        router.push(backHref);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [id, reset, router]);

  const onSubmit = async (data: UpdateEventFormData) => {
    setIsSubmitting(true);
    try {
      await eventsApi.update(id, data);
      toast.success("Event berhasil diperbarui!");
      router.push(backHref);
    } catch {
      toast.error("Gagal memperbarui event");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href={backHref}>
          <Button variant="secondary" size="sm">
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Kembali
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
            Edit Event
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Perbarui detail event Anda
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Banner Event</CardTitle>
          </CardHeader>
          <CardContent>
            <FileUpload
              folder="events"
              value={bannerUrl}
              onChange={(url) => setValue("banner_url", url)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informasi Dasar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              id="title"
              label="Judul Event"
              error={errors.title?.message}
              {...register("title")}
            />
            <Textarea
              id="description"
              label="Deskripsi"
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

        <Card>
          <CardHeader>
            <CardTitle>Lokasi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              id="venue_name"
              label="Nama Venue"
              error={errors.venue_name?.message}
              {...register("venue_name")}
            />
            <Input
              id="venue_address"
              label="Alamat Lengkap"
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
              error={errors.venue_maps_url?.message}
              {...register("venue_maps_url")}
            />
            <Input
              id="online_url"
              label="Online URL (opsional)"
              error={errors.online_url?.message}
              {...register("online_url")}
            />
          </CardContent>
        </Card>

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

        <Card>
          <CardHeader>
            <CardTitle>Pengaturan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-zinc-300"
                {...register("is_high_demand")}
              />
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-white">
                  High Demand Mode
                </p>
                <p className="text-xs text-zinc-500">
                  Aktifkan waiting room untuk event dengan permintaan tinggi
                </p>
              </div>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-zinc-300"
                {...register("allow_attendance_list")}
              />
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-white">
                  Daftar Kehadiran
                </p>
                <p className="text-xs text-zinc-500">
                  Tampilkan daftar peserta yang hadir secara publik
                </p>
              </div>
            </label>
            <Textarea
              id="refund_policy"
              label="Kebijakan Refund (opsional)"
              rows={3}
              error={errors.refund_policy?.message}
              {...register("refund_policy")}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push(backHref)}
          >
            Batal
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Simpan Perubahan
          </Button>
        </div>
      </form>
    </div>
  );
}
