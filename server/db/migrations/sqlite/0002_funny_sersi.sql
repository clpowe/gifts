PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_birthday` (
	`id` text PRIMARY KEY NOT NULL,
	`org_id` text NOT NULL,
	`created_by` text NOT NULL,
	`name` text NOT NULL,
	`relation` text NOT NULL,
	`birth_date` text NOT NULL,
	`include_year` integer DEFAULT true NOT NULL,
	`interests` text DEFAULT '[]' NOT NULL,
	`notes` text,
	`saved_gifts` text DEFAULT '[]' NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`org_id`) REFERENCES `organization`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`created_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_birthday`("id", "org_id", "created_by", "name", "relation", "birth_date", "include_year", "interests", "notes", "saved_gifts", "created_at", "updated_at") SELECT "id", "org_id", "created_by", "name", "relation", "birth_date", "include_year", "interests", "notes", "saved_gifts", "created_at", "updated_at" FROM `birthday`;--> statement-breakpoint
DROP TABLE `birthday`;--> statement-breakpoint
ALTER TABLE `__new_birthday` RENAME TO `birthday`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_calendar_sync` (
	`id` text PRIMARY KEY NOT NULL,
	`birthday_id` text NOT NULL,
	`user_id` text NOT NULL,
	`calendar_event_id` text NOT NULL,
	`synced_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`birthday_id`) REFERENCES `birthday`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_calendar_sync`("id", "birthday_id", "user_id", "calendar_event_id", "synced_at") SELECT "id", "birthday_id", "user_id", "calendar_event_id", "synced_at" FROM `calendar_sync`;--> statement-breakpoint
DROP TABLE `calendar_sync`;--> statement-breakpoint
ALTER TABLE `__new_calendar_sync` RENAME TO `calendar_sync`;