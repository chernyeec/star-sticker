ALTER TABLE "kid" ADD COLUMN "failed_pin_attempts" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "kid" ADD COLUMN "locked_until" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "parent" ADD COLUMN "failed_pin_attempts" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "parent" ADD COLUMN "locked_until" timestamp with time zone;