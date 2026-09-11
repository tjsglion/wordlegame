import { config } from "dotenv";

// Load env from .env.local first (Next.js convention), then fall back to .env.
config({ path: [".env.local", ".env"] });

// This script runs in Node only, so it can use the full `@libsql/client`
// (which supports `file:` URLs). The app runtime (`src/lib/db.ts`) uses
// `@libsql/client/web` for the Workers runtime instead.
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { friendLinks } from "./schema";

async function seed() {
  const url = process.env.DATABASE_URL || "file:local.db";
  const authToken = process.env.DATABASE_AUTH_TOKEN || undefined;

  const client = createClient({ url, authToken });
  const db = drizzle(client);

  await db
    .insert(friendLinks)
    .values([
      {
        name: "Next.js",
        url: "https://nextjs.org",
        description: "The React Framework",
        sortOrder: 1,
      },
      {
        name: "Turso",
        url: "https://turso.tech",
        description: "SQLite for production",
        sortOrder: 2,
      },
    ])
    .onConflictDoNothing();

  console.log("✓ Seeded");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
