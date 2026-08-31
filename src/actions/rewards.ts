import { eq, isNull } from "drizzle-orm";
import type { db as realDb } from "@/db/client";
import { reward } from "@/db/schema";

type Db = typeof realDb;

export type Reward = typeof reward.$inferSelect;

function assertPositiveIntegerCost(cost: number) {
  if (!Number.isInteger(cost) || cost <= 0) {
    throw new Error("Reward cost must be a positive integer");
  }
}

export async function createReward(
  db: Db,
  input: { familyId: string; name: string; cost: number }
): Promise<Reward> {
  assertPositiveIntegerCost(input.cost);
  const [created] = await db.insert(reward).values(input).returning();
  return created;
}

export async function updateReward(
  db: Db,
  rewardId: string,
  input: { name: string; cost: number }
): Promise<Reward> {
  assertPositiveIntegerCost(input.cost);
  const [updated] = await db
    .update(reward)
    .set(input)
    .where(eq(reward.id, rewardId))
    .returning();
  return updated;
}

export async function archiveReward(db: Db, rewardId: string): Promise<Reward> {
  const [archived] = await db
    .update(reward)
    .set({ archivedAt: new Date() })
    .where(eq(reward.id, rewardId))
    .returning();
  return archived;
}

export async function listActiveRewards(db: Db): Promise<Reward[]> {
  return db.select().from(reward).where(isNull(reward.archivedAt));
}
