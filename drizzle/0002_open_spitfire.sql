CREATE TABLE "star_ledger_entry" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kid_id" uuid NOT NULL,
	"amount" integer NOT NULL,
	"reason" text,
	"created_by_parent_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "star_ledger_entry" ADD CONSTRAINT "star_ledger_entry_kid_id_kid_id_fk" FOREIGN KEY ("kid_id") REFERENCES "public"."kid"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "star_ledger_entry" ADD CONSTRAINT "star_ledger_entry_created_by_parent_id_parent_id_fk" FOREIGN KEY ("created_by_parent_id") REFERENCES "public"."parent"("id") ON DELETE no action ON UPDATE no action;