import { eq, and, lt, desc } from "drizzle-orm";
import type { db as realDb } from "@/db/client";
import { redemption, reward } from "@/db/schema";
import { awardStars, getKidBalance } from "./stars";

type Db = typeof realDb;

export type Redemption = typeof redemption.$inferSelect;

export const REDEMPTIONS_PAGE_SIZE = 10;

export const STATUS_LABEL: Record<Redemption["status"], string> = {
  pending: "Waiting for a parent",
  approved: "Approved",
  rejected: "Not this time",
  cancelled: "Cancelled",
};

async function getPendingRedemption(
  db: Db,
  redemptionId: string,
  ownedByKidId?: string
): Promise<Redemption> {
  const conditions = [eq(redemption.id, redemptionId), eq(redemption.status, "pending")];
  if (ownedByKidId) conditions.push(eq(redemption.kidId, ownedByKidId));

  const [row] = await db
    .select()
    .from(redemption)
    .where(and(...conditions));

  if (!row) {
    throw new Error("Redemption is not pending, or does not belong to this Kid");
  }

  return row;
}

export async function requestRedemption(
  db: Db,
  input: { kidId: string; rewardId: string }
): Promise<Redemption> {
  const [r] = await db.select().from(reward).where(eq(reward.id, input.rewardId));
  if (!r) throw new Error("Reward not found");

  const balance = await getKidBalance(db, input.kidId);
  if (balance < r.cost) {
    throw new Error("Kid cannot afford this reward");
  }

  const [created] = await db
    .insert(redemption)
    .values({
      kidId: input.kidId,
      rewardNameSnapshot: r.name,
      rewardCostSnapshot: r.cost,
    })
    .returning();

  return created;
}

export async function redeemForKid(
  db: Db,
  input: { kidId: string; rewardId: string; parentId: string }
): Promise<Redemption> {
  const requested = await requestRedemption(db, { kidId: input.kidId, rewardId: input.rewardId });
  return approveRedemption(db, { redemptionId: requested.id, parentId: input.parentId });
}

export async function approveRedemption(
  db: Db,
  input: { redemptionId: string; parentId: string }
): Promise<Redemption> {
  const pending = await getPendingRedemption(db, input.redemptionId);

  await awardStars(db, {
    kidId: pending.kidId,
    amount: -pending.rewardCostSnapshot,
    reason: `Redeemed: ${pending.rewardNameSnapshot}`,
    createdByParentId: input.parentId,
  });

  const [updated] = await db
    .update(redemption)
    .set({ status: "approved", resolvedAt: new Date(), resolvedByParentId: input.parentId })
    .where(eq(redemption.id, input.redemptionId))
    .returning();

  return updated;
}

export async function rejectRedemption(
  db: Db,
  input: { redemptionId: string; parentId: string; reason?: string }
): Promise<Redemption> {
  await getPendingRedemption(db, input.redemptionId);

  const [updated] = await db
    .update(redemption)
    .set({
      status: "rejected",
      resolvedAt: new Date(),
      resolvedByParentId: input.parentId,
      rejectReason: input.reason,
    })
    .where(eq(redemption.id, input.redemptionId))
    .returning();

  return updated;
}

export async function cancelRedemption(
  db: Db,
  input: { redemptionId: string; kidId: string }
): Promise<Redemption> {
  await getPendingRedemption(db, input.redemptionId, input.kidId);

  const [updated] = await db
    .update(redemption)
    .set({ status: "cancelled", resolvedAt: new Date() })
    .where(eq(redemption.id, input.redemptionId))
    .returning();

  return updated;
}

export async function listPendingRedemptions(db: Db): Promise<Redemption[]> {
  return db
    .select()
    .from(redemption)
    .where(eq(redemption.status, "pending"))
    .orderBy(desc(redemption.sequence));
}

export async function listKidRedemptions(db: Db, kidId: string): Promise<Redemption[]> {
  return db
    .select()
    .from(redemption)
    .where(eq(redemption.kidId, kidId))
    .orderBy(desc(redemption.sequence));
}

// Same keyset-pagination approach as getKidHistoryPage -- see that
// comment for why this uses `sequence` instead of OFFSET.
export async function listKidRedemptionsPage(
  db: Db,
  kidId: string,
  before?: number
): Promise<{ redemptions: Redemption[]; hasMore: boolean }> {
  const conditions = [eq(redemption.kidId, kidId)];
  if (before !== undefined) conditions.push(lt(redemption.sequence, before));

  const rows = await db
    .select()
    .from(redemption)
    .where(and(...conditions))
    .orderBy(desc(redemption.sequence))
    .limit(REDEMPTIONS_PAGE_SIZE + 1);

  return { redemptions: rows.slice(0, REDEMPTIONS_PAGE_SIZE), hasMore: rows.length > REDEMPTIONS_PAGE_SIZE };
}
