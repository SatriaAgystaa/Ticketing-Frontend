"use client";

import Link from "next/link";
import useSWR from "swr";
import { toast } from "sonner";
import { api } from "@/lib/api/client";
import { organizersApi } from "@/lib/api/organizers";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { OrganizerBadge } from "@/components/shared/organizer-badge";
import type { OrganizerPublic } from "@/lib/types/user";

export default function FollowingPage() {
  const { data: organizers, isLoading, mutate } = useSWR<OrganizerPublic[]>(
    "/me/following",
    async () => {
      const res = await api.get<OrganizerPublic[]>("/me/following");
      return res.data;
    },
  );

  const handleUnfollow = async (organizerId: string) => {
    try {
      await organizersApi.unfollow(organizerId);
      toast.success("Berhenti mengikuti organizer");
      mutate();
    } catch {
      toast.error("Gagal berhenti mengikuti");
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Organizer yang Diikuti</h1>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">
        Organizer yang Diikuti
      </h1>

      {!organizers || organizers.length === 0 ? (
        <EmptyState
          title="Belum mengikuti organizer"
          description="Ikuti organizer untuk mendapat notifikasi event terbaru."
        />
      ) : (
        <div className="space-y-4">
          {organizers.map((org) => (
            <div
              key={org.id}
              className="flex items-center justify-between rounded-xl border border-gray-200 p-4"
            >
              <Link href={`/organizers/${org.id}`} className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                  {org.logo_url ? (
                    <img src={org.logo_url} alt={org.brand_name} className="h-12 w-12 rounded-full object-cover" />
                  ) : (
                    <span className="text-lg font-bold text-gray-400">
                      {org.brand_name.charAt(0)}
                    </span>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900">{org.brand_name}</p>
                    {org.is_verified && <OrganizerBadge brandName={org.brand_name} isVerified={org.is_verified} />}
                  </div>
                  <p className="text-sm text-gray-500">
                    {org.follower_count} pengikut &middot; {org.event_count} event
                  </p>
                </div>
              </Link>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleUnfollow(org.id)}
              >
                Berhenti Ikuti
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
