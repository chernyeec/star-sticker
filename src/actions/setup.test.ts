import { describe, it, expect } from "vitest";
import { createTestDb } from "@/db/testDb";
import { setupFamily } from "./setup";
import { family, parent, kid } from "@/db/schema";

describe("setupFamily", () => {
  it("creates a Family, first Parent, and Kids", async () => {
    const db = await createTestDb();

    const result = await setupFamily(db, {
      familyName: "The Smiths",
      parent: { name: "Mom", avatar: "🦊" },
      kids: [{ name: "Sam", avatar: "🐸" }],
    });

    expect(result.success).toBe(true);

    const families = await db.select().from(family);
    expect(families).toHaveLength(1);
    expect(families[0].name).toBe("The Smiths");

    const parents = await db.select().from(parent);
    expect(parents).toHaveLength(1);
    expect(parents[0].name).toBe("Mom");

    const kids = await db.select().from(kid);
    expect(kids).toHaveLength(1);
    expect(kids[0].name).toBe("Sam");
  });

  it("refuses to create a second Family once one exists", async () => {
    const db = await createTestDb();

    await setupFamily(db, {
      familyName: "The Smiths",
      parent: { name: "Mom", avatar: "🦊" },
      kids: [],
    });

    const result = await setupFamily(db, {
      familyName: "The Joneses",
      parent: { name: "Dad", avatar: "🐻" },
      kids: [],
    });

    expect(result.success).toBe(false);

    const families = await db.select().from(family);
    expect(families).toHaveLength(1);
    expect(families[0].name).toBe("The Smiths");
  });
});
