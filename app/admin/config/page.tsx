"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { adminApi } from "@/lib/api/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminConfigPage() {
  const [feeFlat, setFeeFlat] = useState("");
  const [feePercent, setFeePercent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await adminApi.getConfig();
        setFeeFlat(res.data.platform_fee_flat.toString());
        setFeePercent(res.data.platform_fee_percent.toString());
      } catch {
        toast.error("Gagal memuat konfigurasi");
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async () => {
    const flat = Number(feeFlat);
    const percent = Number(feePercent);

    if (isNaN(flat) || flat < 0) {
      toast.error("Fee flat tidak valid");
      return;
    }
    if (isNaN(percent) || percent < 0 || percent > 100) {
      toast.error("Fee persen harus antara 0-100");
      return;
    }

    setIsSaving(true);
    try {
      await adminApi.updateConfig({
        platform_fee_flat: flat,
        platform_fee_percent: percent,
      });
      toast.success("Konfigurasi berhasil diperbarui");
    } catch {
      toast.error("Gagal menyimpan konfigurasi");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-lg space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          Konfigurasi Platform
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Atur fee platform untuk setiap transaksi
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Platform Fee</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Fee dihitung sebagai: Fee Flat + (Harga Tiket x Fee Persen / 100).
            Fee dibebankan ke organizer dari setiap penjualan tiket.
          </p>

          <Input
            id="fee_flat"
            label="Fee Flat per Tiket (Rp)"
            type="number"
            placeholder="2500"
            value={feeFlat}
            onChange={(e) => setFeeFlat(e.target.value)}
          />

          <Input
            id="fee_percent"
            label="Fee Persen per Tiket (%)"
            type="number"
            step="0.1"
            placeholder="3.5"
            value={feePercent}
            onChange={(e) => setFeePercent(e.target.value)}
          />

          <div className="rounded-lg bg-zinc-100 p-3 text-sm dark:bg-zinc-800">
            <p className="font-medium text-zinc-700 dark:text-zinc-300">
              Simulasi
            </p>
            <p className="text-zinc-500 dark:text-zinc-400">
              Tiket Rp 100.000 = Fee Rp{" "}
              {(
                Number(feeFlat || 0) +
                (100000 * Number(feePercent || 0)) / 100
              ).toLocaleString("id-ID")}
            </p>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} isLoading={isSaving}>
              Simpan Konfigurasi
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
