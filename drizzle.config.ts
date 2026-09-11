import { config } from "dotenv";
import type { Config } from "drizzle-kit";

// Load env from .env.local first (Next.js convention), then fall back to .env.
config({ path: [".env.local", ".env"] });

const url = process.env.DATABASE_URL ?? "file:local.db";
const authToken = process.env.DATABASE_AUTH_TOKEN || undefined;
// Only local `file:` URLs use the sqlite dialect; everything else
// (libsql://, http(s)://, ws://) is served over the Turso/libsql protocol
// and needs the turso dialect — e.g. `turso dev` at http://127.0.0.1:8080.
const isLocalFile = url.startsWith("file:");

export default {
  schema: "./src/lib/drizzle/schema.ts",
  out: "./src/lib/drizzle/migrations",
  ...(isLocalFile
    ? { dialect: "sqlite", dbCredentials: { url } }
    : { dialect: "turso", dbCredentials: { url, authToken } }),
} satisfies Config;
