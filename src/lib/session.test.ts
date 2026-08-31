import { describe, it, expect } from "vitest";
import { createSession, resolveSession } from "./session";
import { createTestDb } from "@/db/testDb";
import { family, parent } from "@/db/schema";
import { hashPin } from "./pin";

async function seedParent(db: Awaited<ReturnType<typeof createTestDb>>) {
  const [f] = await db.insert(family).values({ name: "The Smiths" }).returning();
  const [p] = await db
    .insert(parent)
    .values({ familyId: f.id, name: "Mom", pinHash: await hashPin("1234") })
    .returning();
  return p;
}

describe("session", () => {
  it("resolves a freshly created session back to the same person", async () => {
    const db = await createTestDb();
    const p = await seedParent(db);

    const { token } = await createSession(db, "parent", p.id);
    const resolved = await resolveSession(db, token);

    expect(resolved).toEqual({ personType: "parent", personId: p.id });
  });

  it("does not resolve a token that was never issued", async () => {
    const db = await createTestDb();
    const resolved = await resolveSession(db, "not-a-real-token");
    expect(resolved).toBeNull();
  });

  it("does not resolve an expired session", async () => {
    const db = await createTestDb();
    const p = await seedParent(db);

    const { token } = await createSession(db, "parent", p.id, { expiresInMs: -1 });
    const resolved = await resolveSession(db, token);

    expect(resolved).toBeNull();
  });

  it("never stores the raw session token in the database", async () => {
    const db = await createTestDb();
    const p = await seedParent(db);

    const { token } = await createSession(db, "parent", p.id);
    const rows = await db.query.session.findMany();

    expect(rows).toHaveLength(1);
    expect(rows[0].tokenHash).not.toBe(token);
  });
});
