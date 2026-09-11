import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

// Enable `getCloudflareContext()` and other Cloudflare bindings during `next dev`.
initOpenNextCloudflareForDev();

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // Only the isomorphic WebSocket helper needs to stay external.
  // Do NOT externalize `@libsql/client` — it must be bundled so the
  // `@libsql/client/web` import works inside the Workers runtime.
  serverExternalPackages: ["@libsql/isomorphic-ws"],
  // Allow building into a separate dir (NEXT_DIST_DIR=.next-build npm run build)
  // so a production build does not clobber a running dev server's .next.
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
};

export default withNextIntl(nextConfig);
