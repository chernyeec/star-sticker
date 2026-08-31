import { redirect } from "next/navigation";
import { getCurrentPerson } from "@/lib/currentPerson";
import { db } from "@/db/client";
import { listFamilyMembers } from "@/actions/family";
import ManageFamilyPanel from "./ManageFamilyPanel";

export const dynamic = "force-dynamic";

export default async function ManageFamilyPage() {
  const person = await getCurrentPerson();
  if (!person || person.personType !== "parent") {
    redirect("/login");
  }

  const members = await listFamilyMembers(db);

  return (
    <div className="container">
      <h1>Manage family</h1>
      <ManageFamilyPanel members={members} />
    </div>
  );
}
