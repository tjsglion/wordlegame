DROP INDEX "common_dictionary_length_common_idx";--> statement-breakpoint
DROP INDEX "daily_strands_puzzle_id_idx";--> statement-breakpoint
DROP INDEX "game_daily_progress_slug_date_status_idx";--> statement-breakpoint
DROP INDEX "strands_scores_date_puzzle_idx";--> statement-breakpoint
DROP INDEX "strands_scores_unique_anonymous_completion";--> statement-breakpoint
DROP INDEX "strands_scores_unique_user_completion";--> statement-breakpoint
DROP INDEX "user_email_unique";--> statement-breakpoint
ALTER TABLE `strands_scores` ALTER COLUMN "anonymous_id" TO "anonymous_id" text;--> statement-breakpoint
CREATE INDEX `common_dictionary_length_common_idx` ON `common_dictionary` (`length`,`is_common_word`);--> statement-breakpoint
CREATE INDEX `daily_strands_puzzle_id_idx` ON `daily_strands` (`puzzle_id`);--> statement-breakpoint
CREATE INDEX `game_daily_progress_slug_date_status_idx` ON `game_daily_progress` (`game_slug`,`date_key`,`status`);--> statement-breakpoint
CREATE INDEX `strands_scores_date_puzzle_idx` ON `strands_scores` (`date`,`puzzle_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `strands_scores_unique_anonymous_completion` ON `strands_scores` (`date`,`puzzle_id`,`anonymous_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `strands_scores_unique_user_completion` ON `strands_scores` (`date`,`puzzle_id`,`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
ALTER TABLE `strands_scores` ADD `user_id` text;