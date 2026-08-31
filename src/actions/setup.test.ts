import { describe, it, expect } from "vitest";
import { createTestDb } from "@/db/testDb";
import { setupFamily } from "./setup";
import { family, parent, kid } from "@/db/schema";
import { verifyPin } from "@/lib/pin";

describe("setupFamily", () => {
  it("creates a Family, first Parent, and Kids with hashed PINs", async () => {
    const db = await createTestDb();

    const result = await setupFamily(db, {
      familyName: "The Smiths",
      parent: { name: "Mom", avatar: "🦊", pin: "1234" },
      kids: [{ name: "Sam", avatar: "🐸", pin: "0001" }],
    });

    expect(result.success).toBe(true);

    const families = await db.select().from(family);
    expect(families).toHaveLength(1);
    expect(families[0].name).toBe("The Smiths");

    const parents = await db.select().from(parent);
    expect(parents).toHaveLength(1);
    expect(parents[0].pinHash).not.toContain("1234");
    expect(await verifyPin("1234", parents[0].pinHash)).toBe(true);

    const kids = await db.select().from(kid);
    expect(kids).toHaveLength(1);
    expect(await verifyPin("0001", kids[0].pinHash)).toBe(true);
  });

  it("refuses to create a second Family once one exists", async () => {
    const db = await createTestDb();

    await setupFamily(db, {
      familyName: "The Smiths",
      parent: { name: "Mom", avatar: "🦊", pin: "1234" },
      kids: [],
    });

    const result = await setupFamily(db, {
      familyName: "The Joneses",
      parent: { name: "Dad", avatar: "🐻", pin: "5678" },
      kids: [],
    });

    expect(result.success).toBe(false);

    const families = await db.select().from(family);
    expect(families).toHaveLength(1);
    expect(families[0].name).toBe("The Smiths");
  });
});
