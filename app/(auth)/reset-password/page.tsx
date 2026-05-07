"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import {
  resetPasswordSchema,
  type ResetPasswordFormData,
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

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      toast.error("Token reset password tidak ditemukan");
      return;
    }

    setIsSubmitting(true);
    try {
      await authApi.resetPassword({ token, password: data.password });
      toast.success("Password berhasil direset! Silakan login dengan password baru.");
      router.push("/login");
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Gagal mereset password. Token mungkin sudah kadaluarsa.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Token Tidak Valid</CardTitle>
          <CardDescription>
            Link reset password tidak valid atau sudah kadaluarsa.
          </CardDescription>
        </CardHeader>
        <CardFooter className="justify-center">
          <Link href="/forgot-password">
            <Button variant="secondary">Minta link baru</Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reset Password</CardTitle>
        <CardDescription>Masukkan password baru kamu</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <Input
            id="password"
            label="Password Baru"
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
          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            Reset Password
          </Button>
          <Link
            href="/login"
            className="text-center text-sm text-gray-500 hover:text-gray-900"
          >
            Kembali ke login
          </Link>
        </CardFooter>
      </form>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <Card>
          <CardContent className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-indigo-600" />
          </CardContent>
        </Card>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
