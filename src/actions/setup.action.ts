"use server";

import { db } from "@/db/client";
import { setupFamily, type SetupInput, type SetupResult } from "./setup";
import { login } from "./login";
import { setSessionCookie } from "@/lib/authCookie";

export async function setupFamilyAction(input: SetupInput): Promise<SetupResult> {
  const result = await setupFamily(db, input);

  if (result.success) {
    const loginResult = await login(db, "parent", result.parentId);
    if (loginResult.success) {
      await setSessionCookie(loginResult.token, loginResult.expiresAt);
    }
  }

  return result;
}
