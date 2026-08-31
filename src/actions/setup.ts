import type { db as realDb } from "@/db/client";
import { family, parent, kid } from "@/db/schema";
import { hashPin } from "@/lib/pin";

type Db = typeof realDb;

export type SetupInput = {
  familyName: string;
  parent: { name: string; avatar?: string; pin: string };
  kids: { name: string; avatar?: string; pin: string }[];
};

export type SetupResult =
  | { success: true; familyId: string; parentId: string }
  | { success: false; reason: "family_exists" };

export async function setupFamily(db: Db, input: SetupInput): Promise<SetupResult> {
  if (await familyExists(db)) {
    return { success: false, reason: "family_exists" };
  }

  const [createdFamily] = await db.insert(family).values({ name: input.familyName }).returning();

  const [createdParent] = await db
    .insert(parent)
    .values({
      familyId: createdFamily.id,
      name: input.parent.name,
      avatar: input.parent.avatar,
      pinHash: await hashPin(input.parent.pin),
    })
    .returning();

  for (const k of input.kids) {
    await db.insert(kid).values({
      familyId: createdFamily.id,
      name: k.name,
      avatar: k.avatar,
      pinHash: await hashPin(k.pin),
    });
  }

  return { success: true, familyId: createdFamily.id, parentId: createdParent.id };
}

export async function familyExists(db: Db): Promise<boolean> {
  const existing = await db.select().from(family).limit(1);
  return existing.length > 0;
}
