CREATE TABLE `wordplay_progress` (
	`user_id` text PRIMARY KEY NOT NULL,
	`current_level` integer DEFAULT 1 NOT NULL,
	`coins` integer DEFAULT 30 NOT NULL,
	`completed_json` text DEFAULT '{}' NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
