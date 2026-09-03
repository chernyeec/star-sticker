"use server";

import { db } from "@/db/client";
import { login, type LoginResult } from "./login";
import type { PersonType } from "@/lib/person";
import { setSessionCookie } from "@/lib/authCookie";

export async function loginAction(personType: PersonType, personId: string): Promise<LoginResult> {
  const result = await login(db, personType, personId);
  if (result.success) {
    await setSessionCookie(result.token, result.expiresAt);
  }
  return result;
}
