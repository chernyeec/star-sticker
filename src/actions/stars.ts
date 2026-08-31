import { eq, desc } from "drizzle-orm";
import type { db as realDb } from "@/db/client";
import { starLedgerEntry } from "@/db/schema";

type Db = typeof realDb;

export type StarLedgerEntry = typeof starLedgerEntry.$inferSelect;

export async function awardStars(
  db: Db,
  input: { kidId: string; amount: number; reason?: string; createdByParentId: string }
): Promise<StarLedgerEntry> {
  const [entry] = await db
    .insert(starLedgerEntry)
    .values({
      kidId: input.kidId,
      amount: input.amount,
      reason: input.reason,
      createdByParentId: input.createdByParentId,
    })
    .returning();

  return entry;
}

export async function getKidHistory(db: Db, kidId: string): Promise<StarLedgerEntry[]> {
  return db
    .select()
    .from(starLedgerEntry)
    .where(eq(starLedgerEntry.kidId, kidId))
    .orderBy(desc(starLedgerEntry.createdAt));
}

export async function getKidBalance(db: Db, kidId: string): Promise<number> {
  const history = await getKidHistory(db, kidId);
  return history.reduce((sum, entry) => sum + entry.amount, 0);
}
