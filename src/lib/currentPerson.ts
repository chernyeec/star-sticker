import { db } from "@/db/client";
import { resolveSession } from "./session";
import { getSessionToken } from "./authCookie";
import type { PersonType } from "./person";

export async function getCurrentPerson(): Promise<{ personType: PersonType; personId: string } | null> {
  const token = await getSessionToken();
  if (!token) return null;
  return resolveSession(db, token);
}

export async function requireParent(): Promise<{ personId: string } | null> {
  const person = await getCurrentPerson();
  if (!person || person.personType !== "parent") return null;
  return { personId: person.personId };
}
