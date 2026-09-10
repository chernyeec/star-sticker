import { eq, and, lt, desc, sql } from "drizzle-orm";
import type { db as realDb } from "@/db/client";
import { starLedgerEntry } from "@/db/schema";

type Db = typeof realDb;

export type StarLedgerEntry = typeof starLedgerEntry.$inferSelect;

export const HISTORY_PAGE_SIZE = 10;

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

// Keyset pagination on `sequence` -- unlike OFFSET, this stays flat-cost
// as the ledger grows, and the column already exists for stable ordering.
export async function getKidHistoryPage(
  db: Db,
  kidId: string,
  before?: number
): Promise<{ entries: StarLedgerEntry[]; hasMore: boolean }> {
  const conditions = [eq(starLedgerEntry.kidId, kidId)];
  if (before !== undefined) conditions.push(lt(starLedgerEntry.sequence, before));

  const rows = await db
    .select()
    .from(starLedgerEntry)
    .where(and(...conditions))
    .orderBy(desc(starLedgerEntry.sequence))
    .limit(HISTORY_PAGE_SIZE + 1);

  return { entries: rows.slice(0, HISTORY_PAGE_SIZE), hasMore: rows.length > HISTORY_PAGE_SIZE };
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
