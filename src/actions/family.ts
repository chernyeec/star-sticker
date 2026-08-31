import type { db as realDb } from "@/db/client";
import { parent, kid } from "@/db/schema";

type Db = typeof realDb;

export type FamilyMember = {
  id: string;
  type: "parent" | "kid";
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
