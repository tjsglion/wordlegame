import type { MetadataRoute } from "next";
import { getSiteHost, getSiteOrigin } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const origin = getSiteOrigin();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard", "/api/"],
      },
    ],
    sitemap: `${origin}/sitemap.xml`,
    host: getSiteHost(),
  };
}
