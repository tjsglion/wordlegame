import { eq } from "drizzle-orm";
import { config } from "dotenv";
import { GOLDEN_FIXTURE } from "@/games/strands/shared";
import { getDb } from "@/lib/db";
import { dailyStrands, strandsPuzzles } from "./schema";
import { todayKey } from "@/lib/game/daily";

config({ path: [".env.local", ".env"] });

async function seedStrandsFixture() {
  const date = process.argv[2] ?? todayKey();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(`${date}T00:00:00Z`))) {
    throw new Error("Expected a UTC date in YYYY-MM-DD format");
  }

  const db = getDb();
  const puzzle = GOLDEN_FIXTURE.puzzle;
  const puzzleId = "fixture-golden";

  await db
    .insert(strandsPuzzles)
    .values({
      id: puzzleId,
      theme: puzzle.theme,
      spangram: puzzle.spangram,
      words: JSON.stringify(puzzle.words),
      validWords: JSON.stringify(puzzle.validWords),
      grid: JSON.stringify(puzzle.grid),
      article: puzzle.article ? JSON.stringify(puzzle.article) : null,
    })
    .onConflictDoUpdate({
      target: strandsPuzzles.id,
      set: {
        theme: puzzle.theme,
        spangram: puzzle.spangram,
        words: JSON.stringify(puzzle.words),
        validWords: JSON.stringify(puzzle.validWords),
        grid: JSON.stringify(puzzle.grid),
        article: puzzle.article ? JSON.stringify(puzzle.article) : null,
      },
    });

  await db
    .insert(dailyStrands)
    .values({ date, puzzleId })
    .onConflictDoUpdate({
      target: dailyStrands.date,
      set: { puzzleId },
    });

  await db.update(strandsPuzzles).set({ usedAt: new Date().toISOString() }).where(eq(strandsPuzzles.id, puzzleId));
  console.log(`Seeded Strands Golden Fixture for ${date}`);
}

seedStrandsFixture().catch((error) => {
  console.error(error);
  process.exit(1);
});
