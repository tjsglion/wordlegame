PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_friend_links` (
        `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        `name` text NOT NULL,
        `url` text NOT NULL,
        `description` text,
        `logo_url` text,
        `sort_order` integer DEFAULT 0 NOT NULL,
        `is_visible` integer DEFAULT true NOT NULL,
        `created_at` text NOT NULL,
        `updated_at` text NOT NULL
);--> statement-breakpoint
INSERT INTO `__new_friend_links` (`id`, `name`, `url`, `description`, `logo_url`, `sort_order`, `is_visible`, `created_at`, `updated_at`)
SELECT
        `id`,
        `name`,
        `url`,
        `description`,
        `logo_url`,
        `sort_order`,
        `is_visible`,
        CASE
                WHEN typeof(`created_at`) = 'integer' THEN datetime(CASE WHEN `created_at` > 9999999999 THEN `created_at` / 1000 ELSE `created_at` END, 'unixepoch')
                ELSE `created_at`
        END,
        CASE
                WHEN typeof(`updated_at`) = 'integer' THEN datetime(CASE WHEN `updated_at` > 9999999999 THEN `updated_at` / 1000 ELSE `updated_at` END, 'unixepoch')
                ELSE `updated_at`
        END
FROM `friend_links`;--> statement-breakpoint
DROP TABLE `friend_links`;--> statement-breakpoint
ALTER TABLE `__new_friend_links` RENAME TO `friend_links`;--> statement-breakpoint
CREATE TABLE `__new_game_daily_progress` (
        `user_id` text NOT NULL,
        `game_slug` text NOT NULL,
        `date_key` text NOT NULL,
        `guesses_json` text NOT NULL,
        `results_json` text NOT NULL,
        `status` text NOT NULL,
        `answer` text,
        `updated_at` text NOT NULL,
        PRIMARY KEY(`user_id`, `game_slug`, `date_key`),
        FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);--> statement-breakpoint
INSERT INTO `__new_game_daily_progress` (`user_id`, `game_slug`, `date_key`, `guesses_json`, `results_json`, `status`, `answer`, `updated_at`)
SELECT
        `user_id`,
        `game_slug`,
        `date_key`,
        `guesses_json`,
        `results_json`,
        `status`,
        `answer`,
        CASE
                WHEN typeof(`updated_at`) = 'integer' THEN datetime(CASE WHEN `updated_at` > 9999999999 THEN `updated_at` / 1000 ELSE `updated_at` END, 'unixepoch')
                ELSE `updated_at`
        END
FROM `game_daily_progress`;--> statement-breakpoint
DROP TABLE `game_daily_progress`;--> statement-breakpoint
ALTER TABLE `__new_game_daily_progress` RENAME TO `game_daily_progress`;--> statement-breakpoint
CREATE TABLE `__new_game_user_stats` (
        `user_id` text NOT NULL,
        `game_slug` text NOT NULL,
        `mode` text NOT NULL,
        `played` integer DEFAULT 0 NOT NULL,
        `wins` integer DEFAULT 0 NOT NULL,
        `current_streak` integer DEFAULT 0 NOT NULL,
        `max_streak` integer DEFAULT 0 NOT NULL,
        `distribution_json` text NOT NULL,
        `updated_at` text NOT NULL,
        PRIMARY KEY(`user_id`, `game_slug`, `mode`),
        FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);--> statement-breakpoint
INSERT INTO `__new_game_user_stats` (`user_id`, `game_slug`, `mode`, `played`, `wins`, `current_streak`, `max_streak`, `distribution_json`, `updated_at`)
SELECT
        `user_id`,
        `game_slug`,
        `mode`,
        `played`,
        `wins`,
        `current_streak`,
        `max_streak`,
        `distribution_json`,
        CASE
                WHEN typeof(`updated_at`) = 'integer' THEN datetime(CASE WHEN `updated_at` > 9999999999 THEN `updated_at` / 1000 ELSE `updated_at` END, 'unixepoch')
                ELSE `updated_at`
        END
FROM `game_user_stats`;--> statement-breakpoint
DROP TABLE `game_user_stats`;--> statement-breakpoint
ALTER TABLE `__new_game_user_stats` RENAME TO `game_user_stats`;--> statement-breakpoint
CREATE TABLE `__new_wordle_answer_pool` (
        `word` text PRIMARY KEY NOT NULL,
        `enabled` integer DEFAULT true NOT NULL,
        `created_at` text NOT NULL
);--> statement-breakpoint
INSERT INTO `__new_wordle_answer_pool` (`word`, `enabled`, `created_at`)
SELECT
        `word`,
        `enabled`,
        CASE
                WHEN typeof(`created_at`) = 'integer' THEN datetime(CASE WHEN `created_at` > 9999999999 THEN `created_at` / 1000 ELSE `created_at` END, 'unixepoch')
                ELSE `created_at`
        END
FROM `wordle_answer_pool`;--> statement-breakpoint
DROP TABLE `wordle_answer_pool`;--> statement-breakpoint
ALTER TABLE `__new_wordle_answer_pool` RENAME TO `wordle_answer_pool`;--> statement-breakpoint
CREATE TABLE `__new_wordle_daily_puzzles` (
        `date_key` text PRIMARY KEY NOT NULL,
        `answer_word` text NOT NULL,
        `created_at` text NOT NULL
);--> statement-breakpoint
INSERT INTO `__new_wordle_daily_puzzles` (`date_key`, `answer_word`, `created_at`)
SELECT
        `date_key`,
        `answer_word`,
        CASE
                WHEN typeof(`created_at`) = 'integer' THEN datetime(CASE WHEN `created_at` > 9999999999 THEN `created_at` / 1000 ELSE `created_at` END, 'unixepoch')
                ELSE `created_at`
        END
FROM `wordle_daily_puzzles`;--> statement-breakpoint
DROP TABLE `wordle_daily_puzzles`;--> statement-breakpoint
ALTER TABLE `__new_wordle_daily_puzzles` RENAME TO `wordle_daily_puzzles`;--> statement-breakpoint
CREATE TABLE `__new_wordle_guess_words` (
        `word` text PRIMARY KEY NOT NULL,
        `created_at` text NOT NULL
);--> statement-breakpoint
INSERT INTO `__new_wordle_guess_words` (`word`, `created_at`)
SELECT
        `word`,
        CASE
                WHEN typeof(`created_at`) = 'integer' THEN datetime(CASE WHEN `created_at` > 9999999999 THEN `created_at` / 1000 ELSE `created_at` END, 'unixepoch')
                ELSE `created_at`
        END
FROM `wordle_guess_words`;--> statement-breakpoint
DROP TABLE `wordle_guess_words`;--> statement-breakpoint
ALTER TABLE `__new_wordle_guess_words` RENAME TO `wordle_guess_words`;--> statement-breakpoint
PRAGMA foreign_keys=ON;
