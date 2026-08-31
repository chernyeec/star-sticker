import { eq } from "drizzle-orm";
import { parent, kid } from "@/db/schema";
import type { db as DbClient } from "@/db/client";

type Db = typeof DbClient;
export type PersonType = "parent" | "kid";

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

export async function setFailedAttempts(
  db: Db,
  personType: PersonType,
  personId: string,
  attempts: number,
  lockedUntil: Date | null
) {
  const table = tableFor(personType);
  await db
    .update(table)
    .set({ failedPinAttempts: attempts, lockedUntil })
    .where(eq(table.id, personId));
}

export async function resetFailedAttempts(db: Db, personType: PersonType, personId: string) {
  await setFailedAttempts(db, personType, personId, 0, null);
}
