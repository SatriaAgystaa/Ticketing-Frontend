import type { EventDetail } from "@/lib/types/event";

interface EventJsonLdProps {
  event: EventDetail;
  url: string;
}

export function EventJsonLd({ event, url }: EventJsonLdProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.description,
    image: event.banner_url,
    startDate: event.starts_at,
    endDate: event.ends_at,
    eventStatus: event.status === "cancelled"
      ? "https://schema.org/EventCancelled"
      : "https://schema.org/EventScheduled",
    eventAttendanceMode:
      event.event_type === "online"
        ? "https://schema.org/OnlineEventAttendanceMode"
        : event.event_type === "hybrid"
          ? "https://schema.org/MixedEventAttendanceMode"
          : "https://schema.org/OfflineEventAttendanceMode",
    location:
      event.event_type === "online"
        ? {
            "@type": "VirtualLocation",
            url: event.online_url,
          }
        : {
            "@type": "Place",
            name: event.venue_name,
            address: {
              "@type": "PostalAddress",
              addressLocality: event.venue_city,
              streetAddress: event.venue_address,
            },
          },
    organizer: {
      "@type": "Organization",
      name: event.organizer.brand_name,
      url: `${url}/organizers/${event.organizer.id}`,
    },
    offers: event.ticket_types.map((tt) => ({
      "@type": "Offer",
      name: tt.name,
      price: tt.price,
      priceCurrency: "IDR",
      availability:
        tt.quota - tt.sold_count <= 0
          ? "https://schema.org/SoldOut"
          : "https://schema.org/InStock",
      validFrom: tt.sale_starts_at || event.sale_starts_at,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
