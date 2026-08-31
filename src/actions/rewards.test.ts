import { describe, it, expect } from "vitest";
import { createTestDb } from "@/db/testDb";
import { family } from "@/db/schema";
import { createReward, updateReward, archiveReward, listActiveRewards } from "./rewards";

async function seedFamilyId(db: Awaited<ReturnType<typeof createTestDb>>) {
  const [f] = await db.insert(family).values({ name: "The Smiths" }).returning();
  return f.id;
}

describe("rewards", () => {
  it("creates a Reward with a name and cost", async () => {
    const db = await createTestDb();
    const familyId = await seedFamilyId(db);

    const created = await createReward(db, { familyId, name: "Ice cream", cost: 10 });

    expect(created.name).toBe("Ice cream");
    expect(created.cost).toBe(10);
    expect(created.archivedAt).toBeNull();
  });

  it("edits a Reward's name and cost", async () => {
    const db = await createTestDb();
    const familyId = await seedFamilyId(db);
    const created = await createReward(db, { familyId, name: "Ice cream", cost: 10 });

    const updated = await updateReward(db, created.id, { name: "Big ice cream", cost: 15 });

    expect(updated.name).toBe("Big ice cream");
    expect(updated.cost).toBe(15);
  });

  it("archives a Reward instead of deleting it", async () => {
    const db = await createTestDb();
    const familyId = await seedFamilyId(db);
    const created = await createReward(db, { familyId, name: "Ice cream", cost: 10 });

    const archived = await archiveReward(db, created.id);

    expect(archived.archivedAt).not.toBeNull();
  });

  it("excludes archived Rewards from the active listing", async () => {
    const db = await createTestDb();
    const familyId = await seedFamilyId(db);
    const keep = await createReward(db, { familyId, name: "Ice cream", cost: 10 });
    const drop = await createReward(db, { familyId, name: "Old prize", cost: 5 });
    await archiveReward(db, drop.id);

    const active = await listActiveRewards(db);

    expect(active.map((r) => r.id)).toEqual([keep.id]);
  });
});
