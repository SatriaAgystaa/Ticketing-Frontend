import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalendarDays, Users } from "lucide-react";
import { organizersApi } from "@/lib/api/organizers";
import { EventCard } from "@/components/shared/event-card";
import { OrganizerBadge } from "@/components/shared/organizer-badge";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const organizer = await organizersApi.getPublicProfile(id).then((r) => r.data).catch(() => null);
  if (!organizer) return { title: "Organizer Tidak Ditemukan" };

  return {
    title: organizer.brand_name,
    description: organizer.description ?? undefined,
  };
}

export default async function OrganizerProfilePage({ params }: Props) {
  const { id } = await params;
  const organizer = await organizersApi.getPublicProfile(id).then((r) => r.data).catch(() => null);

  if (!organizer) notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Profile Header */}
      <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
        {organizer.logo_url ? (
          <img
            src={organizer.logo_url}
            alt={organizer.brand_name}
            className="h-20 w-20 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="h-20 w-20 shrink-0 rounded-full bg-gray-200" />
        )}
        <div>
          <div className="flex items-center justify-center gap-2 sm:justify-start">
            <h1 className="text-2xl font-bold text-gray-900">{organizer.brand_name}</h1>
            {organizer.is_verified && (
              <OrganizerBadge brandName="" isVerified={organizer.is_verified} />
            )}
          </div>
          {organizer.description && (
            <p className="mt-1 max-w-xl text-gray-600">{organizer.description}</p>
          )}
          <div className="mt-3 flex flex-wrap justify-center gap-4 text-sm text-gray-500 sm:justify-start">
            <span className="flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4" />
              {organizer.event_count} event
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              {organizer.follower_count.toLocaleString("id-ID")} pengikut
            </span>
          </div>
        </div>
      </div>

      {/* Events */}
      <section className="mt-10">
        <h2 className="text-xl font-bold text-gray-900">
          Event oleh {organizer.brand_name}
        </h2>
        {organizer.events && organizer.events.length > 0 ? (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {organizer.events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <p className="mt-8 text-center text-gray-500">
            Belum ada event dari penyelenggara ini.
          </p>
        )}
      </section>
    </div>
  );
}
