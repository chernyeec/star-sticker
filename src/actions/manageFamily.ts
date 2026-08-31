import type { db as realDb } from "@/db/client";
import { parent, kid } from "@/db/schema";
import { hashPin } from "@/lib/pin";
import { setPinHash, type PersonType } from "@/lib/person";

type Db = typeof realDb;

type NewPerson = { familyId: string; name: string; avatar?: string; pin: string };

export async function addKid(db: Db, input: NewPerson) {
  const [created] = await db
    .insert(kid)
    .values({
      familyId: input.familyId,
      name: input.name,
      avatar: input.avatar,
      pinHash: await hashPin(input.pin),
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
      pinHash: await hashPin(input.pin),
    })
    .returning();
  return created;
}

export async function changePin(
  db: Db,
  personType: PersonType,
  personId: string,
  newPin: string
): Promise<void> {
  await setPinHash(db, personType, personId, await hashPin(newPin));
}
