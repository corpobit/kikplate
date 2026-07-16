import type { MetadataRoute } from "next"
import { getServerApiBaseUrl } from "@/src/lib/api"

export const dynamic = "force-dynamic"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://kikplate.dev"
  const base = await getServerApiBaseUrl()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: appUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${appUrl}/explore`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
  ]

  try {
    const slugs: string[] = []
    let page = 1
    const limit = 100

    while (true) {
      const res = await fetch(`${base}/plates?limit=${limit}&page=${page}`, { cache: "no-store" })
      if (!res.ok) break
      const data = await res.json()
      const items: Array<{ slug: string }> = data.data ?? []
      slugs.push(...items.map((p) => p.slug))
      if (items.length < limit) break
      page++
    }

    const plateRoutes: MetadataRoute.Sitemap = slugs.map((slug) => ({
      url: `${appUrl}/plates/${slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }))

    return [...staticRoutes, ...plateRoutes]
  } catch {
    return staticRoutes
  }
}
