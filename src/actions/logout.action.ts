"use server";

import { db } from "@/db/client";
import { revokeSession } from "@/lib/session";
import { getSessionToken, clearSessionCookie } from "@/lib/authCookie";

export async function logoutAction(): Promise<void> {
  const token = await getSessionToken();
  if (token) {
    await revokeSession(db, token);
  }
  await clearSessionCookie();
}
