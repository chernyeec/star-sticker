import { describe, it, expect } from "vitest";
import { createTestDb } from "@/db/testDb";
import { family } from "@/db/schema";
import { addKid, addParent } from "./manageFamily";

async function seedFamilyId(db: Awaited<ReturnType<typeof createTestDb>>) {
  const [f] = await db.insert(family).values({ name: "The Smiths" }).returning();
  return f.id;
}

describe("manageFamily", () => {
  it("adds a new Kid", async () => {
    const db = await createTestDb();
    const familyId = await seedFamilyId(db);

    const created = await addKid(db, { familyId, name: "Alex", avatar: "🐨" });

    expect(created.name).toBe("Alex");
    expect(created.avatar).toBe("🐨");
  });

  it("adds a new Parent", async () => {
    const db = await createTestDb();
    const familyId = await seedFamilyId(db);

    const created = await addParent(db, { familyId, name: "Dad", avatar: "🐻" });

    expect(created.name).toBe("Dad");
    expect(created.avatar).toBe("🐻");
  });
});
