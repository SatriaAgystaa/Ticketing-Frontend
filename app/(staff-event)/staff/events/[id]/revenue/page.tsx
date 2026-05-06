"use client";

import { use } from "react";
import CheckinDashboardPage from "@/app/dashboard/events/[id]/checkin/page";

export default function StaffRevenuePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <div className="mx-auto max-w-3xl">
      <CheckinDashboardPage params={Promise.resolve({ id })} />
    </div>
  );
}
