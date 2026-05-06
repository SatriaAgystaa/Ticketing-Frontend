"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { loginSchema, type LoginFormData } from "@/lib/schemas/auth.schema";
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

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    try {
      const { role, isGateScanner, isStaff } = await login(data.email, data.password);
      toast.success("Login berhasil");
      if (role === "super_admin") router.push("/admin");
      else if (role === "organizer") router.push("/dashboard");
      else if (isGateScanner) router.push("/scan");
      else if (isStaff) router.push("/staff");
      else router.push("/");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Login gagal, silakan coba lagi";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Masuk</CardTitle>
        <CardDescription>Masuk ke akun Tiket Event kamu</CardDescription>
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
          <Input
            id="password"
            label="Password"
            type="password"
            placeholder="Masukkan password"
            error={errors.password?.message}
            {...register("password")}
          />
          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
            >
              Lupa password?
            </Link>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            Masuk
          </Button>
          <p className="text-center text-sm text-zinc-500">
            Belum punya akun?{" "}
            <Link href="/register" className="font-medium text-zinc-900 hover:underline dark:text-white">
              Daftar
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
