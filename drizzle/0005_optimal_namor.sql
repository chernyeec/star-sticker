CREATE TYPE "public"."redemption_status" AS ENUM('pending', 'approved', 'rejected', 'cancelled');--> statement-breakpoint
CREATE TABLE "redemption" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sequence" bigserial NOT NULL,
	"kid_id" uuid NOT NULL,
	"reward_name_snapshot" text NOT NULL,
	"reward_cost_snapshot" integer NOT NULL,
	"status" "redemption_status" DEFAULT 'pending' NOT NULL,
	"requested_at" timestamp with time zone DEFAULT now() NOT NULL,
	"resolved_at" timestamp with time zone,
	"resolved_by_parent_id" uuid,
	"reject_reason" text
);
--> statement-breakpoint
ALTER TABLE "redemption" ADD CONSTRAINT "redemption_kid_id_kid_id_fk" FOREIGN KEY ("kid_id") REFERENCES "public"."kid"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "redemption" ADD CONSTRAINT "redemption_resolved_by_parent_id_parent_id_fk" FOREIGN KEY ("resolved_by_parent_id") REFERENCES "public"."parent"("id") ON DELETE no action ON UPDATE no action;