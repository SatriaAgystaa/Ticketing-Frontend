"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { organizersApi } from "@/lib/api/organizers";
import type { OrganizerProfile } from "@/lib/types/user";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileUpload } from "@/components/shared/file-upload";
import { Skeleton } from "@/components/ui/skeleton";
import type { KycStatus } from "@/lib/utils/constants";

const kycStatusConfig: Record<
  KycStatus,
  { label: string; variant: "default" | "success" | "warning" | "danger" | "info" }
> = {
  unverified: { label: "Belum Verifikasi", variant: "default" },
  pending: { label: "Menunggu Review", variant: "warning" },
  verified: { label: "Terverifikasi", variant: "success" },
  rejected: { label: "Ditolak", variant: "danger" },
};

export default function OrganizerProfilePage() {
  const [profile, setProfile] = useState<OrganizerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmittingKyc, setIsSubmittingKyc] = useState(false);

  // Profile form
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<{
    brand_name: string;
    description: string;
    logo_url: string;
    website_url: string;
    instagram_url: string;
  }>();

  // KYC form
  const [ktpUrl, setKtpUrl] = useState("");
  const [npwpUrl, setNpwpUrl] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankAccountName, setBankAccountName] = useState("");

  const logoUrl = watch("logo_url");

  useEffect(() => {
    async function load() {
      try {
        const res = await organizersApi.getMyProfile();
        setProfile(res.data);
        reset({
          brand_name: res.data.brand_name,
          description: res.data.description ?? "",
          logo_url: res.data.logo_url ?? "",
          website_url: res.data.website_url ?? "",
          instagram_url: res.data.instagram_url ?? "",
        });
      } catch {
        toast.error("Gagal memuat profil");
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [reset]);

  const onSaveProfile = async (data: {
    brand_name: string;
    description: string;
    logo_url: string;
    website_url: string;
    instagram_url: string;
  }) => {
    setIsSaving(true);
    try {
      const res = await organizersApi.updateProfile(data);
      setProfile(res.data);
      toast.success("Profil berhasil diperbarui");
    } catch {
      toast.error("Gagal menyimpan profil");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitKyc = async () => {
    if (!ktpUrl || !bankName || !bankAccountNumber || !bankAccountName) {
      toast.error("Lengkapi semua field KYC");
      return;
    }
    setIsSubmittingKyc(true);
    try {
      await organizersApi.submitKyc({
        ktp_url: ktpUrl,
        npwp_url: npwpUrl,
        bank_name: bankName,
        bank_account_number: bankAccountNumber,
        bank_account_name: bankAccountName,
      });
      toast.success("KYC berhasil dikirim! Tunggu proses verifikasi.");
      setProfile((prev) =>
        prev ? { ...prev, kyc_status: "pending" } : prev,
      );
    } catch {
      toast.error("Gagal mengirim KYC");
    } finally {
      setIsSubmittingKyc(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          Profil Organizer
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Kelola profil dan verifikasi KYC
        </p>
      </div>

      {/* KYC Status */}
      {profile && (
        <div className="flex items-center gap-3">
          <span className="text-sm text-zinc-600 dark:text-zinc-400">
            Status KYC:
          </span>
          <Badge variant={kycStatusConfig[profile.kyc_status].variant}>
            {kycStatusConfig[profile.kyc_status].label}
          </Badge>
        </div>
      )}

      {/* Profile Form */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Organizer</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit(onSaveProfile)}
            className="space-y-4"
          >
            <FileUpload
              label="Logo"
              folder="organizer-logos"
              value={logoUrl}
              onChange={(url) => setValue("logo_url", url)}
            />
            <Input
              id="brand_name"
              label="Nama Brand"
              placeholder="Nama organizer Anda"
              {...register("brand_name", {
                required: "Nama brand wajib diisi",
              })}
              error={errors.brand_name?.message}
            />
            <Textarea
              id="description"
              label="Deskripsi"
              rows={3}
              placeholder="Ceritakan tentang organizer Anda..."
              {...register("description")}
            />
            <Input
              id="website_url"
              label="Website (opsional)"
              placeholder="https://..."
              {...register("website_url")}
            />
            <Input
              id="instagram_url"
              label="Instagram (opsional)"
              placeholder="https://instagram.com/..."
              {...register("instagram_url")}
            />
            <div className="flex justify-end">
              <Button type="submit" isLoading={isSaving}>
                Simpan Profil
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* KYC Form */}
      {profile && profile.kyc_status !== "verified" && profile.kyc_status !== "pending" && (
        <Card>
          <CardHeader>
            <CardTitle>Verifikasi KYC</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-zinc-500">
              Upload dokumen untuk verifikasi identitas. Diperlukan untuk
              menerima pembayaran.
            </p>
            <FileUpload
              label="KTP / Identitas"
              folder="kyc"
              value={ktpUrl}
              onChange={setKtpUrl}
            />
            <FileUpload
              label="NPWP (opsional)"
              folder="kyc"
              value={npwpUrl}
              onChange={setNpwpUrl}
            />
            <Input
              id="bank_name"
              label="Nama Bank"
              placeholder="BCA, Mandiri, BNI, dll."
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
            />
            <Input
              id="bank_account_number"
              label="Nomor Rekening"
              placeholder="1234567890"
              value={bankAccountNumber}
              onChange={(e) => setBankAccountNumber(e.target.value)}
            />
            <Input
              id="bank_account_name"
              label="Nama Pemilik Rekening"
              placeholder="Nama sesuai buku tabungan"
              value={bankAccountName}
              onChange={(e) => setBankAccountName(e.target.value)}
            />
            <div className="flex justify-end">
              <Button onClick={handleSubmitKyc} isLoading={isSubmittingKyc}>
                Kirim KYC
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
