CREATE TABLE `alert_history` (
	`id` integer PRIMARY KEY NOT NULL,
	`rule_id` text NOT NULL,
	`server_id` text NOT NULL,
	`triggered_at` integer NOT NULL,
	`resolved_at` integer,
	`metric_value` real NOT NULL,
	`threshold` real NOT NULL,
	FOREIGN KEY (`rule_id`) REFERENCES `alert_rules`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`server_id`) REFERENCES `servers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_alert_history_rule` ON `alert_history` (`rule_id`,`triggered_at`);--> statement-breakpoint
CREATE INDEX `idx_alert_history_server` ON `alert_history` (`server_id`,`triggered_at`);--> statement-breakpoint
CREATE TABLE `alert_rules` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`metric_type` text NOT NULL,
	`condition` text NOT NULL,
	`threshold` real NOT NULL,
	`server_id` text,
	`enabled` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`server_id`) REFERENCES `servers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_alert_rules_metric` ON `alert_rules` (`metric_type`,`enabled`);--> statement-breakpoint
CREATE TABLE `cpu_metrics` (
	`id` integer PRIMARY KEY NOT NULL,
	`server_id` text NOT NULL,
	`timestamp` integer NOT NULL,
	`usage_percent` real NOT NULL,
	`load_1m` real,
	`load_5m` real,
	`load_15m` real,
	FOREIGN KEY (`server_id`) REFERENCES `servers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_cpu_timestamp` ON `cpu_metrics` (`server_id`,`timestamp`);--> statement-breakpoint
CREATE TABLE `disk_io_metrics` (
	`id` integer PRIMARY KEY NOT NULL,
	`server_id` text NOT NULL,
	`timestamp` integer NOT NULL,
	`device` text NOT NULL,
	`read_bytes` integer NOT NULL,
	`write_bytes` integer NOT NULL,
	`read_count` integer,
	`write_count` integer,
	FOREIGN KEY (`server_id`) REFERENCES `servers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_disk_io_timestamp` ON `disk_io_metrics` (`server_id`,`timestamp`);--> statement-breakpoint
CREATE TABLE `disk_usage_metrics` (
	`id` integer PRIMARY KEY NOT NULL,
	`server_id` text NOT NULL,
	`timestamp` integer NOT NULL,
	`mount_point` text NOT NULL,
	`total_bytes` integer NOT NULL,
	`used_bytes` integer NOT NULL,
	`free_bytes` integer NOT NULL,
	FOREIGN KEY (`server_id`) REFERENCES `servers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_disk_usage_timestamp` ON `disk_usage_metrics` (`server_id`,`timestamp`);--> statement-breakpoint
CREATE TABLE `memory_metrics` (
	`id` integer PRIMARY KEY NOT NULL,
	`server_id` text NOT NULL,
	`timestamp` integer NOT NULL,
	`total_bytes` integer NOT NULL,
	`used_bytes` integer NOT NULL,
	`available_bytes` integer NOT NULL,
	`cached_bytes` integer,
	FOREIGN KEY (`server_id`) REFERENCES `servers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_memory_timestamp` ON `memory_metrics` (`server_id`,`timestamp`);--> statement-breakpoint
CREATE TABLE `network_metrics` (
	`id` integer PRIMARY KEY NOT NULL,
	`server_id` text NOT NULL,
	`timestamp` integer NOT NULL,
	`interface` text NOT NULL,
	`bytes_sent` integer NOT NULL,
	`bytes_recv` integer NOT NULL,
	`packets_sent` integer,
	`packets_recv` integer,
	FOREIGN KEY (`server_id`) REFERENCES `servers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_network_timestamp` ON `network_metrics` (`server_id`,`timestamp`);--> statement-breakpoint
CREATE TABLE `process_metrics` (
	`id` integer PRIMARY KEY NOT NULL,
	`server_id` text NOT NULL,
	`timestamp` integer NOT NULL,
	`pid` integer NOT NULL,
	`name` text NOT NULL,
	`cpu_percent` real NOT NULL,
	`memory_percent` real NOT NULL,
	FOREIGN KEY (`server_id`) REFERENCES `servers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_process_timestamp` ON `process_metrics` (`server_id`,`timestamp`);--> statement-breakpoint
CREATE TABLE `servers` (
	`id` text PRIMARY KEY NOT NULL,
	`hostname` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `swap_metrics` (
	`id` integer PRIMARY KEY NOT NULL,
	`server_id` text NOT NULL,
	`timestamp` integer NOT NULL,
	`total_bytes` integer NOT NULL,
	`used_bytes` integer NOT NULL,
	`free_bytes` integer NOT NULL,
	FOREIGN KEY (`server_id`) REFERENCES `servers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_swap_timestamp` ON `swap_metrics` (`server_id`,`timestamp`);