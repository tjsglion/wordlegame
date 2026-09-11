CREATE TABLE `wordle_answer_pool` (
	`word` text PRIMARY KEY NOT NULL,
	`enabled` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `wordle_daily_puzzles` (
	`date_key` text PRIMARY KEY NOT NULL,
	`answer_word` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `wordle_guess_words` (
	`word` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL
);
