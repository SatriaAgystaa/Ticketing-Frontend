"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import {
  Ticket,
  Tag,
  Users,
  ScanLine,
  UserPlus,
  MessageSquare,
  Pencil,
  MapPin,
  Calendar,
  Globe,
  AlertTriangle,
} from "lucide-react";
import { eventsApi } from "@/lib/api/events";
import type { Event, EventStats } from "@/lib/types/event";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EventStatusBadge } from "@/components/shared/event-status-badge";
import { formatCurrency } from "@/lib/utils/format-currency";
import { formatDate } from "@/lib/utils/format-date";
import Image from "next/image";

const quickLinks = [
  { label: "Tipe Tiket", href: "tickets", icon: Ticket },
  { label: "Promo", href: "promos", icon: Tag },
  { label: "Peserta", href: "attendees", icon: Users },
  { label: "Check-in", href: "checkin", icon: ScanLine },
  { label: "Staff", href: "staff", icon: UserPlus },
  { label: "Blast", href: "blast", icon: MessageSquare },
];

export default function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [stats, setStats] = useState<EventStats | null>(null);
  const [hasTickets, setHasTickets] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [eventRes, ticketRes] = await Promise.all([
          eventsApi.getBySlug(id),
          eventsApi.getTicketTypes(id),
        ]);
        setEvent(eventRes.data as Event);
        setHasTickets(ticketRes.data.length > 0);
        // Stats may be forbidden for co_organizer without VIEW_REVENUE
        const statsRes = await eventsApi.getStats(id).catch(() => null);
        if (statsRes) setStats(statsRes.data);
      } catch {
        toast.error("Gagal memuat data event");
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [id, router]);

  const handlePublish = async () => {
    try {
      await eventsApi.publish(id);
      toast.success("Event berhasil dipublish!");
      setEvent((prev) => (prev ? { ...prev, status: "published" } : prev));
    } catch {
      toast.error("Gagal publish event");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-48" />
      </div>
    );
  }

  if (!event) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
                {event.title}
              </h1>
              <EventStatusBadge status={event.status} />
            </div>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              ID: {event.id}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/events/${id}/edit`}>
            <Button variant="secondary">
              <Pencil className="mr-1.5 h-4 w-4" />
              Edit Event
            </Button>
          </Link>
          {event.status === "draft" && (
            <Button onClick={handlePublish}>Publish Event</Button>
          )}
        </div>
      </div>

      {/* Warning: belum ada tiket */}
      {!hasTickets && (
        <div className="flex items-center justify-between rounded-lg border border-yellow-300 bg-yellow-50 px-4 py-3 dark:border-yellow-700 dark:bg-yellow-950">
          <div className="flex items-center gap-2 text-sm text-yellow-800 dark:text-yellow-300">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>Event belum punya tipe tiket. Pembeli tidak bisa checkout sampai tiket ditambahkan.</span>
          </div>
          <Link href={`/dashboard/events/${id}/tickets`}>
            <Button size="sm">
              <Ticket className="mr-1.5 h-4 w-4" />
              Tambah Tiket
            </Button>
          </Link>
        </div>
      )}

      {/* Stats */}
      {stats && (
        <div className="grid gap-4 sm:grid-cols-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-zinc-500">Revenue</p>
              <p className="text-lg font-bold text-zinc-900 dark:text-white">
                {formatCurrency(stats.total_revenue)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-zinc-500">Pesanan</p>
              <p className="text-lg font-bold text-zinc-900 dark:text-white">
                {stats.total_orders}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-zinc-500">Tiket Terjual</p>
              <p className="text-lg font-bold text-zinc-900 dark:text-white">
                {stats.total_tickets_sold}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-zinc-500">Check-in</p>
              <p className="text-lg font-bold text-zinc-900 dark:text-white">
                {stats.total_checkins}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Links */}
      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {quickLinks.map((link) => (
          <Link key={link.href} href={`/dashboard/events/${id}/${link.href}`}>
            <Card className="transition-shadow hover:shadow-md">
              <CardContent className="flex flex-col items-center gap-2 p-4">
                <link.icon className="h-5 w-5 text-zinc-500" />
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  {link.label}
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Event Info */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Banner */}
        {event.banner_url && (
          <Card className="lg:col-span-2">
            <CardContent className="p-0">
              <Image
                src={event.banner_url}
                alt={event.title}
                width={1200}
                height={256}
                className="h-64 w-full rounded-xl object-cover"
              />
            </CardContent>
          </Card>
        )}

        {/* Detail Info */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi Event</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-2 text-sm">
              <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
              <div>
                <p className="font-medium text-zinc-900 dark:text-white">
                  {formatDate(event.starts_at)}
                </p>
                <p className="text-zinc-500">s/d {formatDate(event.ends_at)}</p>
              </div>
            </div>

            {(event.venue_name || event.venue_city) && (
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
                <div>
                  {event.venue_name && (
                    <p className="font-medium text-zinc-900 dark:text-white">
                      {event.venue_name}
                    </p>
                  )}
                  {event.venue_address && (
                    <p className="text-zinc-500">{event.venue_address}</p>
                  )}
                  <p className="text-zinc-500">
                    {[
                      event.venue_subdistrict,
                      event.venue_district,
                      event.venue_city,
                      event.venue_province,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                  {event.venue_maps_url && (
                    <a
                      href={event.venue_maps_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-block text-xs text-blue-500 hover:underline"
                    >
                      Lihat di Google Maps
                    </a>
                  )}
                </div>
              </div>
            )}

            {event.online_url && (
              <div className="flex items-start gap-2 text-sm">
                <Globe className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
                <a
                  href={event.online_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  {event.online_url}
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Deskripsi */}
        <Card>
          <CardHeader>
            <CardTitle>Deskripsi</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm text-zinc-600 dark:text-zinc-400">
              {event.description}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
