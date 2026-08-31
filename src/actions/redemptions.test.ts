import { describe, it, expect } from "vitest";
import { createTestDb } from "@/db/testDb";
import { family, parent, kid } from "@/db/schema";
import { hashPin } from "@/lib/pin";
import { createReward } from "./rewards";
import { awardStars, getKidBalance } from "./stars";
import {
  requestRedemption,
  approveRedemption,
  rejectRedemption,
  cancelRedemption,
  listPendingRedemptions,
} from "./redemptions";

async function seedFamily(db: Awaited<ReturnType<typeof createTestDb>>) {
  const [f] = await db.insert(family).values({ name: "The Smiths" }).returning();
  const [p] = await db
    .insert(parent)
    .values({ familyId: f.id, name: "Mom", pinHash: await hashPin("1234") })
    .returning();
  const [k] = await db
    .insert(kid)
    .values({ familyId: f.id, name: "Sam", pinHash: await hashPin("0001") })
    .returning();
  const reward = await createReward(db, { familyId: f.id, name: "Ice cream", cost: 10 });
  return { familyId: f.id, parentId: p.id, kidId: k.id, reward };
}

describe("redemptions", () => {
  it("blocks a request when the Kid's balance is below the Reward's cost", async () => {
    const db = await createTestDb();
    const { kidId, reward, parentId } = await seedFamily(db);
    await awardStars(db, { kidId, amount: 5, createdByParentId: parentId });

    await expect(requestRedemption(db, { kidId, rewardId: reward.id })).rejects.toThrow();
  });

  it("allows a request when the balance is sufficient, snapshotting the reward", async () => {
    const db = await createTestDb();
    const { kidId, reward, parentId } = await seedFamily(db);
    await awardStars(db, { kidId, amount: 10, createdByParentId: parentId });

    const redemption = await requestRedemption(db, { kidId, rewardId: reward.id });

    expect(redemption.status).toBe("pending");
    expect(redemption.rewardNameSnapshot).toBe("Ice cream");
    expect(redemption.rewardCostSnapshot).toBe(10);
  });

  it("approving deducts stars and marks the redemption approved, even if balance later drops", async () => {
    const db = await createTestDb();
    const { kidId, reward, parentId } = await seedFamily(db);
    await awardStars(db, { kidId, amount: 10, createdByParentId: parentId });
    const redemption = await requestRedemption(db, { kidId, rewardId: reward.id });

    // balance drops below the snapshotted cost before approval
    await awardStars(db, { kidId, amount: -8, createdByParentId: parentId });

    const approved = await approveRedemption(db, { redemptionId: redemption.id, parentId });

    expect(approved.status).toBe("approved");
    expect(approved.resolvedByParentId).toBe(parentId);
    expect(await getKidBalance(db, kidId)).toBe(10 - 8 - 10);
  });

  it("rejecting sets status and an optional reason without touching stars", async () => {
    const db = await createTestDb();
    const { kidId, reward, parentId } = await seedFamily(db);
    await awardStars(db, { kidId, amount: 10, createdByParentId: parentId });
    const redemption = await requestRedemption(db, { kidId, rewardId: reward.id });

    const rejected = await rejectRedemption(db, {
      redemptionId: redemption.id,
      parentId,
      reason: "not today",
    });

    expect(rejected.status).toBe("rejected");
    expect(rejected.rejectReason).toBe("not today");
    expect(await getKidBalance(db, kidId)).toBe(10);
  });

  it("the Kid can cancel their own pending redemption", async () => {
    const db = await createTestDb();
    const { kidId, reward, parentId } = await seedFamily(db);
    await awardStars(db, { kidId, amount: 10, createdByParentId: parentId });
    const redemption = await requestRedemption(db, { kidId, rewardId: reward.id });

    const cancelled = await cancelRedemption(db, { redemptionId: redemption.id, kidId });

    expect(cancelled.status).toBe("cancelled");
  });

  it("a Kid cannot cancel a different Kid's redemption", async () => {
    const db = await createTestDb();
    const { kidId, reward, parentId, familyId } = await seedFamily(db);
    await awardStars(db, { kidId, amount: 10, createdByParentId: parentId });
    const redemption = await requestRedemption(db, { kidId, rewardId: reward.id });

    const [otherKid] = await db
      .insert(kid)
      .values({ familyId, name: "Alex", pinHash: await hashPin("0002") })
      .returning();

    await expect(
      cancelRedemption(db, { redemptionId: redemption.id, kidId: otherKid.id })
    ).rejects.toThrow();
  });

  it("rejects approving/rejecting/cancelling a redemption that is not pending", async () => {
    const db = await createTestDb();
    const { kidId, reward, parentId } = await seedFamily(db);
    await awardStars(db, { kidId, amount: 10, createdByParentId: parentId });
    const redemption = await requestRedemption(db, { kidId, rewardId: reward.id });
    await approveRedemption(db, { redemptionId: redemption.id, parentId });

    await expect(approveRedemption(db, { redemptionId: redemption.id, parentId })).rejects.toThrow();
    await expect(rejectRedemption(db, { redemptionId: redemption.id, parentId })).rejects.toThrow();
    await expect(
      cancelRedemption(db, { redemptionId: redemption.id, kidId })
    ).rejects.toThrow();
  });

  it("lists pending redemptions across every Kid in the Family", async () => {
    const db = await createTestDb();
    const { kidId, reward, parentId } = await seedFamily(db);
    await awardStars(db, { kidId, amount: 10, createdByParentId: parentId });
    const redemption = await requestRedemption(db, { kidId, rewardId: reward.id });

    const pending = await listPendingRedemptions(db);

    expect(pending.map((r) => r.id)).toEqual([redemption.id]);
  });
});
