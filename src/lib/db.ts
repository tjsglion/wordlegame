import { drizzle } from "drizzle-orm/libsql/web";
import { createClient } from "@libsql/client/web";
import * as schema from "./drizzle/schema";

/**
 * Create a database client per invocation.
 *
 * Cloudflare Workers isolates are shared across requests, so we must NOT keep
 * a module-level global client. `@libsql/client/web` is used because it works
 * in both the Workers runtime and local dev.
 *
 * NOTE: the web client does NOT support `file:` URLs. For local development,
 * run `npm run db:dev` (turso dev) and set DATABASE_URL=http://127.0.0.1:8080.
 *
 * Env vars:
 * - DATABASE_URL: local dev server or remote Turso URL.
 * - DATABASE_AUTH_TOKEN: required for remote Turso databases, empty locally.
 */
export function getDb() {
  const url = process.env.DATABASE_URL || "http://127.0.0.1:8080";
  const authToken = process.env.DATABASE_AUTH_TOKEN || undefined;

  const client = createClient({ url, authToken });
  return drizzle(client, { schema });
}

export type Db = ReturnType<typeof getDb>;
