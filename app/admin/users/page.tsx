"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Ban, Unlock, Search } from "lucide-react";
import { adminApi } from "@/lib/api/admin";
import type { User } from "@/lib/types/user";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils/format-date";
import type { UserRole } from "@/lib/utils/constants";

const roleVariant: Record<UserRole, "default" | "info" | "purple"> = {
  buyer: "default",
  organizer: "info",
  super_admin: "purple",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [suspendModal, setSuspendModal] = useState<{
    open: boolean;
    userId: string;
    name: string;
  }>({ open: false, userId: "", name: "" });
  const [reason, setReason] = useState("");

  const load = async (search?: string) => {
    try {
      const res = await adminApi.listUsers({
        search: search || undefined,
      });
      setUsers(res.data);
    } catch {
      toast.error("Gagal memuat users");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSearch = () => {
    setIsLoading(true);
    load(searchQuery);
  };

  const handleSuspend = async () => {
    if (!reason.trim()) {
      toast.error("Alasan wajib diisi");
      return;
    }
    try {
      await adminApi.suspendUser(suspendModal.userId, reason);
      toast.success("User disuspend");
      setSuspendModal({ open: false, userId: "", name: "" });
      setReason("");
      load(searchQuery);
    } catch {
      toast.error("Gagal suspend user");
    }
  };

  const handleUnsuspend = async (userId: string) => {
    try {
      await adminApi.unsuspendUser(userId);
      toast.success("User di-unsuspend");
      load(searchQuery);
    } catch {
      toast.error("Gagal unsuspend user");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-full max-w-sm" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Users
        </h1>
        <p className="text-sm text-gray-500">
          Kelola user platform
        </p>
      </div>

      <div className="flex items-end gap-3">
        <div className="flex-1 max-w-sm">
          <Input
            id="search-users"
            placeholder="Cari nama atau email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>
        <Button variant="secondary" onClick={handleSearch}>
          <Search className="mr-2 h-4 w-4" />
          Cari
        </Button>
      </div>

      <DataTable
        columns={[
          {
            key: "name",
            header: "Nama",
            render: (u: User) => (
              <div>
                <p className="font-medium text-gray-900">
                  {u.full_name}
                </p>
                <p className="text-xs text-gray-500">{u.email}</p>
              </div>
            ),
          },
          {
            key: "role",
            header: "Role",
            render: (u: User) => (
              <Badge variant={roleVariant[u.role]}>{u.role}</Badge>
            ),
          },
          {
            key: "status",
            header: "Status",
            render: (u: User) => (
              <Badge variant={u.is_active ? "success" : "danger"}>
                {u.is_active ? "Aktif" : "Suspended"}
              </Badge>
            ),
          },
          {
            key: "created_at",
            header: "Terdaftar",
            render: (u: User) => formatDate(u.created_at),
          },
          {
            key: "actions",
            header: "Aksi",
            render: (u: User) =>
              u.is_active ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setSuspendModal({
                      open: true,
                      userId: u.id,
                      name: u.full_name,
                    })
                  }
                  title="Suspend"
                >
                  <Ban className="h-4 w-4 text-red-500" />
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleUnsuspend(u.id)}
                  title="Unsuspend"
                >
                  <Unlock className="h-4 w-4 text-green-500" />
                </Button>
              ),
          },
        ]}
        data={users}
        keyExtractor={(u) => u.id}
        emptyMessage="Tidak ada user ditemukan"
      />

      <Modal
        open={suspendModal.open}
        onClose={() => setSuspendModal({ open: false, userId: "", name: "" })}
        title={`Suspend ${suspendModal.name}`}
      >
        <div className="space-y-4">
          <Input
            id="suspend-reason"
            label="Alasan Suspend"
            placeholder="Masukkan alasan..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() =>
                setSuspendModal({ open: false, userId: "", name: "" })
              }
            >
              Batal
            </Button>
            <Button variant="danger" onClick={handleSuspend}>
              Suspend
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
