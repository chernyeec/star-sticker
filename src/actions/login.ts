import type { db as realDb } from "@/db/client";
import { getPerson, type PersonType } from "@/lib/person";
import { createSession } from "@/lib/session";

type Db = typeof realDb;

export type LoginResult =
  | { success: true; token: string; expiresAt: Date; personType: PersonType }
  | { success: false; reason: "not_found" };

export async function login(db: Db, personType: PersonType, personId: string): Promise<LoginResult> {
  const person = await getPerson(db, personType, personId);
  if (!person) return { success: false, reason: "not_found" };

  const { token, expiresAt } = await createSession(db, personType, personId);
  return { success: true, token, expiresAt, personType };
}
