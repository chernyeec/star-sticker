import type { db as realDb } from "@/db/client";
import { getPerson, setFailedAttempts, resetFailedAttempts, type PersonType } from "@/lib/person";
import { verifyPin } from "@/lib/pin";
import { createSession } from "@/lib/session";

type Db = typeof realDb;

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MS = 30_000;

export type LoginResult =
  | { success: true; token: string; expiresAt: Date; personType: PersonType }
  | { success: false; reason: "not_found" | "locked" | "invalid_pin" };

export async function login(
  db: Db,
  personType: PersonType,
  personId: string,
  pin: string
): Promise<LoginResult> {
  const person = await getPerson(db, personType, personId);
  if (!person) return { success: false, reason: "not_found" };

  if (person.lockedUntil && person.lockedUntil.getTime() > Date.now()) {
    return { success: false, reason: "locked" };
  }

  const validPin = await verifyPin(pin, person.pinHash);
  if (!validPin) {
    const attempts = person.failedPinAttempts + 1;
    const lockedUntil = attempts >= MAX_FAILED_ATTEMPTS ? new Date(Date.now() + LOCKOUT_MS) : null;
    await setFailedAttempts(db, personType, personId, attempts, lockedUntil);
    return { success: false, reason: "invalid_pin" };
  }

  await resetFailedAttempts(db, personType, personId);
  const { token, expiresAt } = await createSession(db, personType, personId);
  return { success: true, token, expiresAt, personType };
}
