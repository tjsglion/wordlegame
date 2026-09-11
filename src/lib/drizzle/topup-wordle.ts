import { config } from "dotenv";

config({ path: [".env.local", ".env"] });

import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";
import { ensureWordleDailySchedule } from "@/games/wordle/daily-schedule";
import { todayKey } from "@/lib/game/daily";
import { loadWordListsFromSource } from "./wordle-word-source";

async function main() {
  const url = process.env.DATABASE_URL || "file:local.db";
  const authToken = process.env.DATABASE_AUTH_TOKEN || undefined;
  const { answers } = loadWordListsFromSource();

  const client = createClient({ url, authToken });
  const db = drizzle(client, { schema });

  const inserted = await ensureWordleDailySchedule(db, answers, todayKey());
  console.log(
    inserted > 0
      ? `✓ Topped up ${inserted} daily puzzles`
      : "✓ Daily schedule already has sufficient coverage",
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
