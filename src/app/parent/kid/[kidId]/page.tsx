import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentPerson } from "@/lib/currentPerson";
import { db } from "@/db/client";
import { listFamilyMembers } from "@/actions/family";
import { getKidBalance, getKidHistory } from "@/actions/stars";
import { listActiveRewards } from "@/actions/rewards";
import { listKidRedemptions, STATUS_LABEL } from "@/actions/redemptions";
import RedeemRewardButton from "./RedeemRewardButton";

export const dynamic = "force-dynamic";

export default async function KidRewardsView({
  params,
}: {
  params: Promise<{ kidId: string }>;
}) {
  const { kidId } = await params;
  const [person, members, balance, history, rewards, redemptions] = await Promise.all([
    getCurrentPerson(),
    listFamilyMembers(db),
    getKidBalance(db, kidId),
    getKidHistory(db, kidId),
    listActiveRewards(db),
    listKidRedemptions(db, kidId),
  ]);
  if (!person || person.personType !== "parent") {
    redirect("/api/auto-login-parent");
  }

  const kid = members.find((m) => m.id === kidId && m.type === "kid");
  if (!kid) {
    notFound();
  }

  return (
    <div className="container">
      <h1>
        {kid.avatar ? `${kid.avatar} ` : ""}
        {kid.name}
      </h1>
      <p className="star-balance">{balance} ⭐</p>

      <h2>History</h2>
      {history.length === 0 ? (
        <p>No stars yet.</p>
      ) : (
        <ul>
          {history.map((entry) => (
            <li key={entry.id}>
              {entry.amount > 0 ? `+${entry.amount}` : entry.amount}
              {entry.reason ? ` — ${entry.reason}` : ""}
              {" · "}
              {entry.createdAt.toLocaleDateString()}
            </li>
          ))}
        </ul>
      )}

      <h2>Rewards</h2>
      {rewards.length === 0 ? (
        <p>No rewards yet.</p>
      ) : (
        <ul>
          {rewards.map((r) => (
            <li key={r.id}>
              {r.name} — {r.cost} ⭐{balance < r.cost ? " (not enough stars)" : ""}
              {balance >= r.cost && <RedeemRewardButton kidId={kidId} rewardId={r.id} />}
            </li>
          ))}
        </ul>
      )}

      <h2>Redemption history</h2>
      {redemptions.length === 0 ? (
        <p>No redemptions yet.</p>
      ) : (
        <ul>
          {redemptions.map((r) => (
            <li key={r.id}>
              {r.rewardNameSnapshot} ({r.rewardCostSnapshot} ⭐) — {STATUS_LABEL[r.status]}
              {r.status === "rejected" && r.rejectReason ? ` — ${r.rejectReason}` : ""}
            </li>
          ))}
        </ul>
      )}

      <p>
        <Link href="/parent">Back to dashboard</Link>
      </p>
    </div>
  );
}
