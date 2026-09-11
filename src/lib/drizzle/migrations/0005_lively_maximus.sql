CREATE TABLE IF NOT EXISTS `word_clues` (
	`word` text PRIMARY KEY NOT NULL,
	`clue` text NOT NULL,
	`source` text NOT NULL,
	`updated_at` text NOT NULL
);
