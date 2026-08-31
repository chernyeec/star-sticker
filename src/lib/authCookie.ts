import { cookies } from "next/headers";

// The cookie holds a high-entropy opaque token (see session.ts), verified
// server-side against a hash stored in the `session` table — not an
// HMAC/JWT-signed value. This gives the same tamper-resistance as
// signing, plus instant revocation (delete the row) with no signing-key
// management.
const SESSION_COOKIE = "star_sticker_session";

export async function setSessionCookie(token: string, expiresAt: Date) {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });
}

export async function getSessionToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value ?? null;
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
