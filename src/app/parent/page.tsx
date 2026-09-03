import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentPerson } from "@/lib/currentPerson";
import { db } from "@/db/client";
import { listFamilyMembers } from "@/actions/family";
import { listActiveRewards } from "@/actions/rewards";
import { listPendingRedemptions } from "@/actions/redemptions";
import { getKidBalance } from "@/actions/stars";
import LogoutButton from "../LogoutButton";
import AwardStarsForm from "./AwardStarsForm";
import RedeemForKidForm from "./RedeemForKidForm";
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
  const balances = await Promise.all(kids.map((kid) => getKidBalance(db, kid.id)));

  return (
    <div className="container">
      <h1>Parent dashboard</h1>
      <ul className="kid-grid">
        {kids.map((kid, i) => (
          <li key={kid.id}>
            <span>
              <Link href={`/parent/kid/${kid.id}`}>
                {kid.avatar ? `${kid.avatar} ` : ""}
                {kid.name}
              </Link>{" "}
              {balances[i]} ⭐
            </span>
          </li>
        ))}
      </ul>
      <AwardStarsForm kids={kids} />
      <RedeemForKidForm kids={kids} rewards={rewards} />
      <PendingRedemptions redemptions={pendingRedemptions} kids={kids} />
      <p>
        <Link href="/parent/settings">Settings</Link>
      </p>
      <LogoutButton />
    </div>
  );
}
