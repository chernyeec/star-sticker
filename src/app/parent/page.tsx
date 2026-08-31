import { redirect } from "next/navigation";
import { getCurrentPerson } from "@/lib/currentPerson";
import { db } from "@/db/client";
import { listFamilyMembers } from "@/actions/family";
import { listActiveRewards } from "@/actions/rewards";
import { listPendingRedemptions } from "@/actions/redemptions";
import LogoutButton from "../LogoutButton";
import AwardStarsForm from "./AwardStarsForm";
import RewardsManager from "./RewardsManager";
import PendingRedemptions from "./PendingRedemptions";

export const dynamic = "force-dynamic";

export default async function ParentDashboard() {
  const person = await getCurrentPerson();
  if (!person || person.personType !== "parent") {
    redirect("/login");
  }

  const [members, rewards, pendingRedemptions] = await Promise.all([
    listFamilyMembers(db),
    listActiveRewards(db),
    listPendingRedemptions(db),
  ]);
  const kids = members.filter((m) => m.type === "kid");

  return (
    <div className="container">
      <h1>Parent dashboard</h1>
      <AwardStarsForm kids={kids} />
      <RewardsManager rewards={rewards} />
      <PendingRedemptions redemptions={pendingRedemptions} kids={kids} />
      <LogoutButton />
    </div>
  );
}
