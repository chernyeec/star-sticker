import { describe, it, expect } from "vitest";
import { createTestDb } from "@/db/testDb";
import { family, parent, kid } from "@/db/schema";
import { awardStars, getKidHistoryPage, getKidBalance, listAllKidBalances } from "./stars";

async function seedFamily(db: Awaited<ReturnType<typeof createTestDb>>) {
  const [f] = await db.insert(family).values({ name: "The Smiths" }).returning();
  const [p] = await db.insert(parent).values({ familyId: f.id, name: "Mom" }).returning();
  const [k] = await db.insert(kid).values({ familyId: f.id, name: "Sam" }).returning();
  return { parentId: p.id, kidId: k.id };
}

describe("stars", () => {
  it("awarding stars creates a positive ledger entry", async () => {
    const db = await createTestDb();
    const { parentId, kidId } = await seedFamily(db);

    const entry = await awardStars(db, {
      kidId,
      amount: 3,
      reason: "cleaned room",
      createdByParentId: parentId,
    });

    expect(entry.amount).toBe(3);
    expect(entry.reason).toBe("cleaned room");
    expect(entry.kidId).toBe(kidId);
    expect(entry.createdByParentId).toBe(parentId);
  });

  it("deducting stars creates a negative ledger entry", async () => {
    const db = await createTestDb();
    const { parentId, kidId } = await seedFamily(db);

    const entry = await awardStars(db, { kidId, amount: -2, createdByParentId: parentId });

    expect(entry.amount).toBe(-2);
    expect(entry.reason).toBeNull();
  });

  it("rejects a non-integer amount", async () => {
    const db = await createTestDb();
    const { parentId, kidId } = await seedFamily(db);

    await expect(
      awardStars(db, { kidId, amount: 1.5, createdByParentId: parentId })
    ).rejects.toThrow();
  });

  it("sums a Kid's balance across entries, including going negative", async () => {
    const db = await createTestDb();
    const { parentId, kidId } = await seedFamily(db);

    await awardStars(db, { kidId, amount: 3, createdByParentId: parentId });
    await awardStars(db, { kidId, amount: -5, createdByParentId: parentId });

    expect(await getKidBalance(db, kidId)).toBe(-2);
  });

  it("returns a balance of 0 for a Kid with no entries", async () => {
    const db = await createTestDb();
    const { kidId } = await seedFamily(db);

    expect(await getKidBalance(db, kidId)).toBe(0);
  });

  it("lists every kid's balance in one query, omitting kids with no entries", async () => {
    const db = await createTestDb();
    const { parentId, kidId } = await seedFamily(db);
    const [f] = await db.select().from(family);
    const [otherKid] = await db.insert(kid).values({ familyId: f.id, name: "Other" }).returning();

    await awardStars(db, { kidId, amount: 3, createdByParentId: parentId });
    await awardStars(db, { kidId, amount: -1, createdByParentId: parentId });
    await awardStars(db, { kidId: otherKid.id, amount: 5, createdByParentId: parentId });

    const balances = await listAllKidBalances(db);

    expect(balances.get(kidId)).toBe(2);
    expect(balances.get(otherKid.id)).toBe(5);
    expect(balances.size).toBe(2);
  });

  it("returns history newest-first", async () => {
    const db = await createTestDb();
    const { parentId, kidId } = await seedFamily(db);

    const first = await awardStars(db, { kidId, amount: 1, createdByParentId: parentId });
    const second = await awardStars(db, { kidId, amount: 2, createdByParentId: parentId });

    const { entries } = await getKidHistoryPage(db, kidId);

    expect(entries.map((e) => e.id)).toEqual([second.id, first.id]);
  });

  it("paginates history with a cursor, oldest page first is false until you page past it", async () => {
    const db = await createTestDb();
    const { parentId, kidId } = await seedFamily(db);

    for (let i = 1; i <= 12; i++) {
      await awardStars(db, { kidId, amount: i, createdByParentId: parentId });
    }

    const firstPage = await getKidHistoryPage(db, kidId);
    expect(firstPage.entries).toHaveLength(10);
    expect(firstPage.entries[0].amount).toBe(12);
    expect(firstPage.hasMore).toBe(true);

    const oldestOnFirstPage = firstPage.entries.at(-1)!.sequence;
    const secondPage = await getKidHistoryPage(db, kidId, oldestOnFirstPage);
    expect(secondPage.entries).toHaveLength(2);
    expect(secondPage.entries[0].amount).toBe(2);
    expect(secondPage.hasMore).toBe(false);
  });
});
