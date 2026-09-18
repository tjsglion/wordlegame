CREATE TABLE `common_dictionary` (
	`word` text PRIMARY KEY NOT NULL,
	`length` integer NOT NULL,
	`is_common_word` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE INDEX `common_dictionary_length_common_idx` ON `common_dictionary` (`length`,`is_common_word`);--> statement-breakpoint
CREATE TABLE `daily_strands` (
	`date` text PRIMARY KEY NOT NULL,
	`puzzle_id` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`puzzle_id`) REFERENCES `strands_puzzles`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `daily_strands_puzzle_id_idx` ON `daily_strands` (`puzzle_id`);--> statement-breakpoint
CREATE TABLE `strands_puzzles` (
	`id` text PRIMARY KEY NOT NULL,
	`theme` text NOT NULL,
	`topic` text,
	`theme_embedding` text,
	`spangram` text NOT NULL,
	`words` text NOT NULL,
	`valid_words` text DEFAULT '[]' NOT NULL,
	`grid` text NOT NULL,
	`article` text,
	`difficulty` integer DEFAULT 1 NOT NULL,
	`used_at` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `strands_scores` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`date` text NOT NULL,
	`puzzle_id` text NOT NULL,
	`anonymous_id` text NOT NULL,
	`hints_used` integer DEFAULT 0 NOT NULL,
	`completed` integer DEFAULT true NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`puzzle_id`) REFERENCES `strands_puzzles`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `strands_scores_date_puzzle_idx` ON `strands_scores` (`date`,`puzzle_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `strands_scores_unique_anonymous_completion` ON `strands_scores` (`date`,`puzzle_id`,`anonymous_id`);
