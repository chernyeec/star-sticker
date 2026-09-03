import { eq } from "drizzle-orm";
import { parent, kid, type PersonType } from "@/db/schema";
import type { db as DbClient } from "@/db/client";

type Db = typeof DbClient;
export type { PersonType };

function tableFor(personType: PersonType) {
  return personType === "parent" ? parent : kid;
}

export async function getPerson(db: Db, personType: PersonType, personId: string) {
  const table = tableFor(personType);
  const rows = await db
    .select()
    .from(table)
    .where(eq(table.id, personId))
    .limit(1);
  return rows[0] ?? null;
}
