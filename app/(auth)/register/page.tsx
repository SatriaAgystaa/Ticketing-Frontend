"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { registerSchema, type RegisterFormData } from "@/lib/schemas/auth.schema";
import { useAuth } from "@/lib/auth/context";
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

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    try {
      await registerUser({
        full_name: data.full_name,
        email: data.email,
        password: data.password,
        phone: data.phone || undefined,
      });
      toast.success("Registrasi berhasil! Silakan cek email untuk kode OTP.");
      router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Registrasi gagal, silakan coba lagi";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daftar</CardTitle>
        <CardDescription>Buat akun baru di Tiket Event</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
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
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" variant="brand" className="w-full" isLoading={isSubmitting}>
            Buat Akun
          </Button>
          <p className="text-center text-sm text-gray-500">
            Sudah punya akun?{" "}
            <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-700">
              Masuk
            </Link>
          </p>
          <div className="w-full rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-center text-sm">
            <p className="text-gray-600">Ingin jadi penyelenggara event?</p>
            <Link
              href="/register/organizer"
              className="mt-1 inline-block font-medium text-indigo-600 hover:text-indigo-700"
            >
              Daftar sebagai Organizer →
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
