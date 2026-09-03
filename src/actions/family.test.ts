import { describe, it, expect } from "vitest";
import { createTestDb } from "@/db/testDb";
import { setupFamily } from "./setup";
import { listFamilyMembers } from "./family";

describe("listFamilyMembers", () => {
  it("lists Parents and Kids with their type", async () => {
    const db = await createTestDb();
    await setupFamily(db, {
      familyName: "The Smiths",
      parent: { name: "Mom", avatar: "🦊" },
      kids: [{ name: "Sam", avatar: "🐸" }],
    });

    const members = await listFamilyMembers(db);

    expect(members).toHaveLength(2);
    const mom = members.find((m) => m.name === "Mom");
    const sam = members.find((m) => m.name === "Sam");
    expect(mom).toMatchObject({ name: "Mom", type: "parent", avatar: "🦊" });
    expect(sam).toMatchObject({ name: "Sam", type: "kid", avatar: "🐸" });
  });
});
