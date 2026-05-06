import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://tiketevent.id";

// In production, fetch live events and categories from the API.
// For now, static entries + placeholders for dynamic routes.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${BASE_URL}/events`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/search`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    },
  ];

  // TODO: fetch published events from API and add dynamic routes
  // const events = await eventsApi.list({ limit: 1000 })
  // const eventRoutes = events.data.map((e) => ({
  //   url: `${BASE_URL}/events/${e.slug}`,
  //   lastModified: new Date(e.updated_at),
  //   changeFrequency: 'weekly' as const,
  //   priority: 0.8,
  // }))

  // TODO: fetch categories and add routes
  // const categories = await eventsApi.getCategories()
  // const categoryRoutes = categories.data.map((c) => ({
  //   url: `${BASE_URL}/categories/${c.slug}`,
  //   lastModified: new Date(),
  //   changeFrequency: 'daily' as const,
  //   priority: 0.6,
  // }))

  return [...staticRoutes];
}
