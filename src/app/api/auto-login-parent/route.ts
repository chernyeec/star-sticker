import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { listFamilyMembers } from "@/actions/family";
import { login } from "@/actions/login";
import { setSessionCookie } from "@/lib/authCookie";

// The app has no PIN/identity gate anymore, so visiting /parent should just
// work -- this silently logs in as the family's (first) parent instead of
// making anyone pick who they are.
export async function GET(request: Request) {
  const members = await listFamilyMembers(db);
  const parent = members.find((m) => m.type === "parent");

  if (!parent) {
    return NextResponse.redirect(new URL("/setup", request.url));
  }

  const result = await login(db, "parent", parent.id);
  if (result.success) {
    await setSessionCookie(result.token, result.expiresAt);
  }

  return NextResponse.redirect(new URL("/parent", request.url));
}
