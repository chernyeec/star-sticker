import { redirect } from "next/navigation";
import { getCurrentPerson } from "@/lib/currentPerson";
import { db } from "@/db/client";
import { listFamilyMembers } from "@/actions/family";
import { listActiveRewards } from "@/actions/rewards";
import ManageFamilyPanel from "../manage/ManageFamilyPanel";
import RewardsManager from "../RewardsManager";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const person = await getCurrentPerson();
  if (!person || person.personType !== "parent") {
    redirect("/api/auto-login-parent");
  }

  const [members, rewards] = await Promise.all([listFamilyMembers(db), listActiveRewards(db)]);

  return (
    <div className="container">
      <h1>Settings</h1>
      <ManageFamilyPanel members={members} />
      <RewardsManager rewards={rewards} />
    </div>
  );
}
