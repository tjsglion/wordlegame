CREATE TABLE `game_daily_progress` (
	`user_id` text NOT NULL,
	`game_slug` text NOT NULL,
	`date_key` text NOT NULL,
	`guesses_json` text NOT NULL,
	`results_json` text NOT NULL,
	`status` text NOT NULL,
	`answer` text,
	`updated_at` integer NOT NULL,
	PRIMARY KEY(`user_id`, `game_slug`, `date_key`),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `game_user_stats` (
	`user_id` text NOT NULL,
	`game_slug` text NOT NULL,
	`mode` text NOT NULL,
	`played` integer DEFAULT 0 NOT NULL,
	`wins` integer DEFAULT 0 NOT NULL,
	`current_streak` integer DEFAULT 0 NOT NULL,
	`max_streak` integer DEFAULT 0 NOT NULL,
	`distribution_json` text NOT NULL,
	`updated_at` integer NOT NULL,
	PRIMARY KEY(`user_id`, `game_slug`, `mode`),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
