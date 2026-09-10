CREATE INDEX "redemption_kid_id_idx" ON "redemption" USING btree ("kid_id");--> statement-breakpoint
CREATE INDEX "star_ledger_entry_kid_id_idx" ON "star_ledger_entry" USING btree ("kid_id");