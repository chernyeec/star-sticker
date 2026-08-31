import { describe, it, expect } from "vitest";
import { createTestDb } from "@/db/testDb";
import { setupFamily } from "./setup";
import { login } from "./login";
import { resolveSession } from "@/lib/session";

async function seedFamily(db: Awaited<ReturnType<typeof createTestDb>>) {
  const result = await setupFamily(db, {
    familyName: "The Smiths",
    parent: { name: "Mom", avatar: "🦊", pin: "1234" },
    kids: [{ name: "Sam", avatar: "🐸", pin: "0001" }],
  });
  if (!result.success) throw new Error("setup failed");

  const parents = await db.query.parent.findMany();
  return { familyId: result.familyId, parentId: parents[0].id };
}

describe("login", () => {
  it("succeeds with the correct PIN and issues a resolvable session", async () => {
    const db = await createTestDb();
    const { parentId } = await seedFamily(db);

    const result = await login(db, "parent", parentId, "1234");

    expect(result.success).toBe(true);
    if (!result.success) throw new Error("expected success");
    expect(await resolveSession(db, result.token)).toEqual({
      personType: "parent",
      personId: parentId,
    });
  });

  it("fails with an incorrect PIN", async () => {
    const db = await createTestDb();
    const { parentId } = await seedFamily(db);

    const result = await login(db, "parent", parentId, "0000");

    expect(result).toEqual({ success: false, reason: "invalid_pin" });
  });

  it("locks out after 5 failed attempts, rejecting even a correct PIN during cooldown", async () => {
    const db = await createTestDb();
    const { parentId } = await seedFamily(db);

    for (let i = 0; i < 5; i++) {
      await login(db, "parent", parentId, "0000");
    }

    const result = await login(db, "parent", parentId, "1234");

    expect(result).toEqual({ success: false, reason: "locked" });
  });
});
