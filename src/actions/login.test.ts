import { describe, it, expect } from "vitest";
import { createTestDb } from "@/db/testDb";
import { setupFamily } from "./setup";
import { login } from "./login";
import { resolveSession } from "@/lib/session";

async function seedFamily(db: Awaited<ReturnType<typeof createTestDb>>) {
  const result = await setupFamily(db, {
    familyName: "The Smiths",
    parent: { name: "Mom", avatar: "🦊" },
    kids: [{ name: "Sam", avatar: "🐸" }],
  });
  if (!result.success) throw new Error("setup failed");

  const parents = await db.query.parent.findMany();
  return { familyId: result.familyId, parentId: parents[0].id };
}

describe("login", () => {
  it("succeeds for an existing person and issues a resolvable session", async () => {
    const db = await createTestDb();
    const { parentId } = await seedFamily(db);

    const result = await login(db, "parent", parentId);

    expect(result.success).toBe(true);
    if (!result.success) throw new Error("expected success");
    expect(await resolveSession(db, result.token)).toEqual({
      personType: "parent",
      personId: parentId,
    });
  });

  it("fails for a person that does not exist", async () => {
    const db = await createTestDb();
    await seedFamily(db);

    const result = await login(db, "parent", "00000000-0000-0000-0000-000000000000");

    expect(result).toEqual({ success: false, reason: "not_found" });
  });
});
