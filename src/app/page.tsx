import { redirect } from "next/navigation";
import { db } from "@/db/client";
import { familyExists } from "@/actions/setup";

// Depends on live DB state (has a Family been set up yet?), which can
// change after this app is built — must be evaluated per-request.
export const dynamic = "force-dynamic";

export default async function Home() {
  const exists = await familyExists(db);
  redirect(exists ? "/login" : "/setup");
}
