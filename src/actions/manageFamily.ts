import type { db as realDb } from "@/db/client";
import { parent, kid } from "@/db/schema";

type Db = typeof realDb;

type NewPerson = { familyId: string; name: string; avatar?: string };

export async function addKid(db: Db, input: NewPerson) {
  const [created] = await db
    .insert(kid)
    .values({
      familyId: input.familyId,
      name: input.name,
      avatar: input.avatar,
    })
    .returning();
  return created;
}

export async function addParent(db: Db, input: NewPerson) {
  const [created] = await db
    .insert(parent)
    .values({
      familyId: input.familyId,
      name: input.name,
      avatar: input.avatar,
    })
    .returning();
  return created;
}
