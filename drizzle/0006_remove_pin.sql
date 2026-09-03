ALTER TABLE "kid" DROP COLUMN "pin_hash";--> statement-breakpoint
ALTER TABLE "kid" DROP COLUMN "failed_pin_attempts";--> statement-breakpoint
ALTER TABLE "kid" DROP COLUMN "locked_until";--> statement-breakpoint
ALTER TABLE "parent" DROP COLUMN "pin_hash";--> statement-breakpoint
ALTER TABLE "parent" DROP COLUMN "failed_pin_attempts";--> statement-breakpoint
ALTER TABLE "parent" DROP COLUMN "locked_until";