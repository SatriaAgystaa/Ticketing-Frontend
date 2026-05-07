"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { CalendarDays, ShieldCheck } from "lucide-react";
import { api } from "@/lib/api/client";
import { setTokens } from "@/lib/auth/tokens";
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
import { Badge } from "@/components/ui/badge";

interface InvitationInfo {
  token: string;
  email: string;
  role: string;
  permissions: string[];
  event: {
    id: string;
    title: string;
    banner_url: string | null;
    starts_at: string;
  };
  inviter_name: string;
  expires_at: string;
}

const schema = z.object({
  full_name: z.string().min(1, "Nama wajib diisi").optional(),
  password: z.string().min(8, "Password minimal 8 karakter"),
});

type FormData = z.infer<typeof schema>;

export default function AcceptInvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const router = useRouter();

  const [invitation, setInvitation] = useState<InvitationInfo | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    const fetchInvitation = async () => {
      try {
        const res = await api.get<InvitationInfo>(`/auth/invite/${token}`, undefined, false);
        setInvitation(res.data);

        // Cek apakah email sudah punya akun
        const checkRes = await api.post<{ exists: boolean }>(
          "/auth/check-email",
          { email: res.data.email },
          false,
        ).catch(() => null);

        setIsNewUser(!checkRes?.data?.exists);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Undangan tidak valid atau sudah kedaluwarsa";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvitation();
  }, [token]);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const res = await api.post<{
        access_token: string;
        refresh_token: string;
        expires_in: number;
        role: string;
      }>(
        `/auth/invite/${token}/accept`,
        { password: data.password, full_name: data.full_name },
        false,
      );
      setTokens({
        access_token: res.data.access_token,
        refresh_token: res.data.refresh_token,
        expires_in: res.data.expires_in,
      });
      toast.success("Berhasil bergabung sebagai staff!");
      const dest = res.data.role === "gate_scanner" ? "/scan" : "/staff";
      router.push(dest);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gagal menerima undangan";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const roleLabel = invitation?.role === "gate_scanner" ? "Gate Scanner" : "Co-Organizer";
  const roleVariant = invitation?.role === "gate_scanner" ? "info" : "purple";

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-indigo-600" />
          <p className="text-sm text-gray-500">Memuat undangan...</p>
        </CardContent>
      </Card>
    );
  }

  if (error || !invitation) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
          <ShieldCheck className="h-12 w-12 text-red-400" />
          <div>
            <p className="font-semibold text-gray-900">Undangan Tidak Valid</p>
            <p className="mt-1 text-sm text-gray-500">{error ?? "Undangan tidak ditemukan"}</p>
          </div>
          <Button variant="secondary" onClick={() => router.push("/")}>
            Kembali ke Beranda
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Terima Undangan Staff</CardTitle>
        <CardDescription>
          <strong>{invitation.inviter_name}</strong> mengundang kamu untuk bergabung
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Info Event */}
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="font-semibold text-gray-900">{invitation.event.title}</p>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <CalendarDays className="h-3 w-3" />
                {new Date(invitation.event.starts_at).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </div>
            </div>
            <Badge variant={roleVariant}>{roleLabel}</Badge>
          </div>

          {invitation.permissions.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {invitation.permissions.map((p) => (
                <span
                  key={p}
                  className="rounded bg-gray-200 px-2 py-0.5 text-xs text-gray-600"
                >
                  {p.replace(/_/g, " ")}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Info email */}
        <div className="rounded-md bg-indigo-50 px-4 py-3 text-sm text-indigo-700">
          Undangan dikirim ke <strong>{invitation.email}</strong>.{" "}
          {isNewUser
            ? "Karena kamu belum punya akun, isi nama dan password untuk mendaftar sekalian."
            : "Masukkan password akun kamu untuk konfirmasi."}
        </div>

        {/* Form */}
        <form id="accept-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {isNewUser && (
            <Input
              id="full_name"
              label="Nama Lengkap"
              placeholder="Nama kamu"
              error={errors.full_name?.message}
              {...register("full_name")}
            />
          )}
          <Input
            id="password"
            label="Password"
            type="password"
            placeholder={isNewUser ? "Buat password baru (min. 8 karakter)" : "Masukkan password akun kamu"}
            error={errors.password?.message}
            {...register("password")}
          />
        </form>
      </CardContent>

      <CardFooter className="flex flex-col gap-3">
        <Button
          type="submit"
          form="accept-form"
          className="w-full"
          isLoading={isSubmitting}
        >
          {isNewUser ? "Daftar & Terima Undangan" : "Konfirmasi & Terima Undangan"}
        </Button>
        <p className="text-center text-xs text-gray-400">
          Undangan kedaluwarsa:{" "}
          {new Date(invitation.expires_at).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </CardFooter>
    </Card>
  );
}
