import { randomBytes, createHash } from "node:crypto";
import { eq, and, gt } from "drizzle-orm";
import { session, type PersonType } from "@/db/schema";
import type { db as DbClient } from "@/db/client";

type Db = typeof DbClient;

const DEFAULT_SESSION_LIFETIME_MS = 90 * 24 * 60 * 60 * 1000; // 90 days

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(
  db: Db,
  personType: PersonType,
  personId: string,
  options?: { expiresInMs?: number }
): Promise<{ token: string; expiresAt: Date }> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + (options?.expiresInMs ?? DEFAULT_SESSION_LIFETIME_MS));

  await db.insert(session).values({
    personType,
    personId,
    tokenHash: hashToken(token),
    expiresAt,
  });

  return { token, expiresAt };
}

export async function resolveSession(
  db: Db,
  token: string
): Promise<{ personType: PersonType; personId: string } | null> {
  const rows = await db
    .select()
    .from(session)
    .where(and(eq(session.tokenHash, hashToken(token)), gt(session.expiresAt, new Date())))
    .limit(1);

  const row = rows[0];
  if (!row) return null;

  return { personType: row.personType, personId: row.personId };
}

export async function revokeSession(db: Db, token: string): Promise<void> {
  await db.delete(session).where(eq(session.tokenHash, hashToken(token)));
}
