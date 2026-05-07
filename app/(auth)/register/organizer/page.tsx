"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import {
  registerOrganizerSchema,
  type RegisterOrganizerFormData,
} from "@/lib/schemas/auth.schema";
import { authApi } from "@/lib/api/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

export default function RegisterOrganizerPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterOrganizerFormData>({
    resolver: zodResolver(registerOrganizerSchema),
  });

  const onSubmit = async (data: RegisterOrganizerFormData) => {
    setIsSubmitting(true);
    try {
      await authApi.registerOrganizer({
        full_name: data.full_name,
        email: data.email,
        password: data.password,
        phone: data.phone || undefined,
        brand_name: data.brand_name,
        description: data.description || undefined,
        website_url: data.website_url || undefined,
        instagram_url: data.instagram_url || undefined,
      });
      toast.success(
        "Pendaftaran berhasil! Cek email kamu untuk verifikasi, lalu tunggu konfirmasi dari tim kami (1–3 hari kerja).",
        { duration: 8000 },
      );
      router.push("/login");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Registrasi gagal, silakan coba lagi";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Daftar sebagai Organizer</CardTitle>
        <CardDescription>
          Buat akun organizer untuk mulai menjual tiket event kamu
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {/* Divider: Akun */}
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Informasi Akun
          </p>
          <Input
            id="full_name"
            label="Nama Lengkap"
            placeholder="Nama lengkap kamu"
            error={errors.full_name?.message}
            {...register("full_name")}
          />
          <Input
            id="email"
            label="Email"
            type="email"
            placeholder="nama@email.com"
            error={errors.email?.message}
            {...register("email")}
          />
          <Input
            id="phone"
            label="Nomor Telepon (opsional)"
            type="tel"
            placeholder="08xxxxxxxxxx"
            error={errors.phone?.message}
            {...register("phone")}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              id="password"
              label="Password"
              type="password"
              placeholder="Minimal 8 karakter"
              error={errors.password?.message}
              {...register("password")}
            />
            <Input
              id="confirm_password"
              label="Konfirmasi Password"
              type="password"
              placeholder="Ulangi password"
              error={errors.confirm_password?.message}
              {...register("confirm_password")}
            />
          </div>

          {/* Divider: Profil Organizer */}
          <p className="pt-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Profil Organizer
          </p>
          <Input
            id="brand_name"
            label="Nama Brand / EO"
            placeholder="Contoh: LiveNation Indonesia"
            error={errors.brand_name?.message}
            {...register("brand_name")}
          />
          <div>
            <label
              htmlFor="description"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Deskripsi (opsional)
            </label>
            <textarea
              id="description"
              placeholder="Ceritakan tentang organisasi atau brand kamu..."
              rows={3}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              {...register("description")}
            />
            {errors.description && (
              <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              id="website_url"
              label="Website (opsional)"
              type="url"
              placeholder="https://example.com"
              error={errors.website_url?.message}
              {...register("website_url")}
            />
            <Input
              id="instagram_url"
              label="Instagram (opsional)"
              type="url"
              placeholder="https://instagram.com/brand"
              error={errors.instagram_url?.message}
              {...register("instagram_url")}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            Daftar sebagai Organizer
          </Button>
          <p className="text-center text-sm text-gray-500">
            Sudah punya akun?{" "}
            <Link href="/login" className="font-medium text-indigo-600 hover:underline">
              Masuk
            </Link>
          </p>
          <p className="text-center text-sm text-gray-500">
            Mau daftar sebagai pembeli?{" "}
            <Link
              href="/register"
              className="font-medium text-indigo-600 hover:underline"
            >
              Daftar di sini
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
