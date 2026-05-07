"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
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

export default function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsSubmitting(true);
    try {
      await authApi.forgotPassword(data.email);
      setIsSubmitted(true);
      toast.success("Link reset password telah dikirim ke email kamu");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Gagal mengirim email reset password";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cek Email Kamu</CardTitle>
          <CardDescription>
            Kami telah mengirim link untuk reset password ke email kamu. Silakan cek inbox
            atau folder spam.
          </CardDescription>
        </CardHeader>
        <CardFooter className="justify-center">
          <Link href="/login">
            <Button variant="secondary">Kembali ke login</Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lupa Password</CardTitle>
        <CardDescription>
          Masukkan email kamu dan kami akan mengirim link untuk reset password.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <Input
            id="email"
            label="Email"
            type="email"
            placeholder="nama@email.com"
            error={errors.email?.message}
            {...register("email")}
          />
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            Kirim Link Reset
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
