"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useCurrentUser } from "@/lib/hooks/use-current-user";
import { authApi } from "@/lib/api/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/lib/api/client";

export default function ProfilePage() {
  const { user, isLoading, mutate } = useCurrentUser();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name);
      setPhone(user.phone ?? "");
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.put("/auth/me", { full_name: fullName, phone: phone || null });
      toast.success("Profil berhasil diperbarui");
      mutate();
    } catch {
      toast.error("Gagal memperbarui profil");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Edit Profil</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email"
          type="email"
          value={user?.email ?? ""}
          disabled
        />

        <Input
          label="Nama Lengkap"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />

        <Input
          label="Nomor Telepon"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="08xxxxxxxxxx"
        />

        <Button type="submit" disabled={isSaving} className="w-full">
          {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
        </Button>
      </form>
    </div>
  );
}
