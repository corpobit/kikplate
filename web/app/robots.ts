import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://kikplate.dev"
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/account/", "/api/", "/auth/"],
      },
    ],
    sitemap: `${appUrl}/sitemap.xml`,
  }
}
