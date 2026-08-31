import { describe, it, expect } from "vitest";
import { createTestDb } from "@/db/testDb";
import { family } from "@/db/schema";
import { verifyPin } from "@/lib/pin";
import { getPerson } from "@/lib/person";
import { addKid, addParent, changePin } from "./manageFamily";
import { login } from "./login";

async function seedFamilyId(db: Awaited<ReturnType<typeof createTestDb>>) {
  const [f] = await db.insert(family).values({ name: "The Smiths" }).returning();
  return f.id;
}

describe("manageFamily", () => {
  it("adds a new Kid with a hashed PIN", async () => {
    const db = await createTestDb();
    const familyId = await seedFamilyId(db);

    const created = await addKid(db, { familyId, name: "Alex", avatar: "🐨", pin: "0002" });

    expect(created.name).toBe("Alex");
    expect(created.pinHash).not.toContain("0002");
    expect(await verifyPin("0002", created.pinHash)).toBe(true);
  });

  it("adds a new Parent with a hashed PIN", async () => {
    const db = await createTestDb();
    const familyId = await seedFamilyId(db);

    const created = await addParent(db, { familyId, name: "Dad", avatar: "🐻", pin: "5678" });

    expect(created.name).toBe("Dad");
    expect(await verifyPin("5678", created.pinHash)).toBe(true);
  });

  it("changes a Kid's PIN, taking effect on the next login", async () => {
    const db = await createTestDb();
    const familyId = await seedFamilyId(db);
    const kid = await addKid(db, { familyId, name: "Alex", pin: "0002" });

    await changePin(db, "kid", kid.id, "9999");

    const oldPinResult = await login(db, "kid", kid.id, "0002");
    expect(oldPinResult).toEqual({ success: false, reason: "invalid_pin" });

    const newPinResult = await login(db, "kid", kid.id, "9999");
    expect(newPinResult.success).toBe(true);
  });

  it("stores the changed PIN hashed, never in plaintext", async () => {
    const db = await createTestDb();
    const familyId = await seedFamilyId(db);
    const kid = await addKid(db, { familyId, name: "Alex", pin: "0002" });

    await changePin(db, "kid", kid.id, "9999");

    const person = await getPerson(db, "kid", kid.id);
    expect(person?.pinHash).not.toContain("9999");
  });
});
