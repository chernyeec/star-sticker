import { redirect } from "next/navigation";
import { getCurrentPerson } from "@/lib/currentPerson";
import { db } from "@/db/client";
import { listFamilyMembers } from "@/actions/family";
import LogoutButton from "../LogoutButton";
import AwardStarsForm from "./AwardStarsForm";

export const dynamic = "force-dynamic";

export default async function ParentDashboard() {
  const person = await getCurrentPerson();
  if (!person || person.personType !== "parent") {
    redirect("/login");
  }

  const members = await listFamilyMembers(db);
  const kids = members.filter((m) => m.type === "kid");

  return (
    <div className="container">
      <h1>Parent dashboard</h1>
      <p>Manage rewards and approve redemptions here soon.</p>
      <AwardStarsForm kids={kids} />
      <LogoutButton />
    </div>
  );
}
