import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentPerson } from "@/lib/currentPerson";
import { db } from "@/db/client";
import { listFamilyMembers } from "@/actions/family";
import { listActiveRewards } from "@/actions/rewards";
import { listPendingRedemptions } from "@/actions/redemptions";
import { listAllKidBalances } from "@/actions/stars";
import LogoutButton from "../LogoutButton";
import AwardStarsForm from "./AwardStarsForm";
import RedeemForKidForm from "./RedeemForKidForm";
import PendingRedemptions from "./PendingRedemptions";
import PersonLabel from "../PersonLabel";
import { getKidPhoto } from "@/lib/kidPhotos";

export const dynamic = "force-dynamic";

export default async function ParentDashboard() {
  const [person, members, rewards, pendingRedemptions, kidBalances] = await Promise.all([
    getCurrentPerson(),
    listFamilyMembers(db),
    listActiveRewards(db),
    listPendingRedemptions(db),
    listAllKidBalances(db),
  ]);
  if (!person || person.personType !== "parent") {
    redirect("/api/auto-login-parent");
  }

  const kids = members.filter((m) => m.type === "kid");
  const balances = kids.map((kid) => kidBalances.get(kid.id) ?? 0);
  const photo = getKidPhoto("Pei Jin");
  const cardTint = "color-mix(in srgb, var(--card) 80%, transparent)";

  return (
    <div
      className="container"
      style={
        photo
          ? {
              backgroundImage: `linear-gradient(${cardTint}, ${cardTint}), url(${photo})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : undefined
      }
    >
      <ul className="kid-grid">
        {kids.map((kid, i) => (
          <li key={kid.id}>
            <Link href={`/parent/kid/${kid.id}`}>
              <PersonLabel name={kid.name} avatar={kid.avatar} size={96} /> {balances[i]} ⭐
            </Link>
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
