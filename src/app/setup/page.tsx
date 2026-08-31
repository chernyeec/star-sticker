import { redirect } from "next/navigation";
import { db } from "@/db/client";
import { familyExists } from "@/actions/setup";
import SetupForm from "./SetupForm";

export const dynamic = "force-dynamic";

export default async function SetupPage() {
  if (await familyExists(db)) {
    redirect("/login");
  }

  return <SetupForm />;
}
