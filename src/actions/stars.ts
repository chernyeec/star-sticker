import { eq, desc, sql } from "drizzle-orm";
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
    .orderBy(desc(starLedgerEntry.sequence));
}

export async function getKidBalance(db: Db, kidId: string): Promise<number> {
  const [row] = await db
    .select({ balance: sql<number>`coalesce(sum(${starLedgerEntry.amount}), 0)::int` })
    .from(starLedgerEntry)
    .where(eq(starLedgerEntry.kidId, kidId));
  return row.balance;
}

// One aggregate query for every kid's balance, so a dashboard listing several
// kids doesn't issue one round trip per kid — see the /parent page.
export async function listAllKidBalances(db: Db): Promise<Map<string, number>> {
  const rows = await db
    .select({
      kidId: starLedgerEntry.kidId,
      balance: sql<number>`coalesce(sum(${starLedgerEntry.amount}), 0)::int`,
    })
    .from(starLedgerEntry)
    .groupBy(starLedgerEntry.kidId);
  return new Map(rows.map((r) => [r.kidId, r.balance]));
}
