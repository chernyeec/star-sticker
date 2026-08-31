import type { db as realDb } from "@/db/client";
import { family, parent, kid, type PersonType } from "@/db/schema";

type Db = typeof realDb;

export type FamilyMember = {
  id: string;
  type: PersonType;
  name: string;
  avatar: string | null;
};

export async function listFamilyMembers(db: Db): Promise<FamilyMember[]> {
  const parents = await db
    .select({ id: parent.id, name: parent.name, avatar: parent.avatar })
    .from(parent);
  const kids = await db.select({ id: kid.id, name: kid.name, avatar: kid.avatar }).from(kid);

  return [
    ...parents.map((p) => ({ ...p, type: "parent" as const })),
    ...kids.map((k) => ({ ...k, type: "kid" as const })),
  ];
}

export async function getFamilyId(db: Db): Promise<string> {
  const [f] = await db.select({ id: family.id }).from(family).limit(1);
  if (!f) throw new Error("no family exists yet");
  return f.id;
}
