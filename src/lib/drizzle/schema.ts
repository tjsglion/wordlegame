import { index, integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";
import type { AdapterAccountType } from "next-auth/adapters";
import { formatSqliteDateTime } from "./date-time";

/**
 * Application tables
 */

export const friendLinks = sqliteTable("friend_links", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  url: text("url").notNull(),
  description: text("description"),
  logoUrl: text("logo_url"),
  sortOrder: integer("sort_order").notNull().default(0),
  isVisible: integer("is_visible", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => formatSqliteDateTime()),
  updatedAt: text("updated_at")
    .notNull()
    .$defaultFn(() => formatSqliteDateTime()),
});

export const gameUserStats = sqliteTable(
  "game_user_stats",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    gameSlug: text("game_slug").notNull(),
    mode: text("mode").notNull(),
    played: integer("played").notNull().default(0),
    wins: integer("wins").notNull().default(0),
    currentStreak: integer("current_streak").notNull().default(0),
    maxStreak: integer("max_streak").notNull().default(0),
    distributionJson: text("distribution_json").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.userId, table.gameSlug, table.mode],
    }),
  ],
);

export const gameDailyProgress = sqliteTable(
  "game_daily_progress",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    gameSlug: text("game_slug").notNull(),
    dateKey: text("date_key").notNull(),
    guessesJson: text("guesses_json").notNull(),
    resultsJson: text("results_json").notNull(),
    status: text("status").notNull(),
    answer: text("answer"),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.userId, table.gameSlug, table.dateKey],
    }),
    // Leaderboards filter by slug + date + status across all users; the PK
    // leads with user_id so it can't serve that lookup.
    index("game_daily_progress_slug_date_status_idx").on(
      table.gameSlug,
      table.dateKey,
      table.status,
    ),
  ],
);

export const wordleAnswerPool = sqliteTable("wordle_answer_pool", {
  word: text("word").primaryKey(),
  enabled: integer("enabled", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => formatSqliteDateTime()),
});

export const wordleGuessWords = sqliteTable("wordle_guess_words", {
  word: text("word").primaryKey(),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => formatSqliteDateTime()),
});

export const wordleDailyPuzzles = sqliteTable("wordle_daily_puzzles", {
  dateKey: text("date_key").primaryKey(),
  answerWord: text("answer_word").notNull(),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => formatSqliteDateTime()),
});

/**
 * Crossword-style clue per answer word (game-agnostic). Filled offline by
 * scripts/generate-clues.ts into the local DB, verified there, then copied
 * to production with scripts/push-clues.ts — never generated at runtime.
 */
export const wordClues = sqliteTable("word_clues", {
  word: text("word").primaryKey(),
  clue: text("clue").notNull(),
  /** Where the clue came from: llm | dictionary | override. */
  source: text("source").notNull(),
  updatedAt: text("updated_at")
    .notNull()
    .$defaultFn(() => formatSqliteDateTime()),
});

/**
 * Auth.js (next-auth v5) Drizzle Adapter tables
 * Matches the official SQLite schema from `@auth/drizzle-adapter`.
 */

export const users = sqliteTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: integer("emailVerified", { mode: "timestamp_ms" }),
  image: text("image"),
});

export const accounts = sqliteTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({ columns: [account.provider, account.providerAccountId] }),
  ],
);

export const sessions = sqliteTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
});

export const verificationTokens = sqliteTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
  },
  (verificationToken) => [
    primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  ],
);
