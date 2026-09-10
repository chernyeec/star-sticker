import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentPerson } from "@/lib/currentPerson";
import { db } from "@/db/client";
import { listFamilyMembers } from "@/actions/family";
import { getKidBalance, getKidHistoryPage } from "@/actions/stars";
import { listActiveRewards } from "@/actions/rewards";
import { listKidRedemptionsPage, STATUS_LABEL } from "@/actions/redemptions";
import RedeemRewardButton from "./RedeemRewardButton";

export const dynamic = "force-dynamic";

function parseCursor(value: string | string[] | undefined): number | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  const n = raw ? Number(raw) : NaN;
  return Number.isFinite(n) ? n : undefined;
}

function pageHref(kidId: string, historyBefore?: number, redeemBefore?: number): string {
  const params = new URLSearchParams();
  if (historyBefore !== undefined) params.set("historyBefore", String(historyBefore));
  if (redeemBefore !== undefined) params.set("redeemBefore", String(redeemBefore));
  const qs = params.toString();
  return `/parent/kid/${kidId}${qs ? `?${qs}` : ""}`;
}

export default async function KidRewardsView({
  params,
  searchParams,
}: {
  params: Promise<{ kidId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { kidId } = await params;
  const sp = await searchParams;
  const historyBefore = parseCursor(sp.historyBefore);
  const redeemBefore = parseCursor(sp.redeemBefore);

  const [person, members, balance, rewards, redemptionsPage, historyPage] = await Promise.all([
    getCurrentPerson(),
    listFamilyMembers(db),
    getKidBalance(db, kidId),
    listActiveRewards(db),
    listKidRedemptionsPage(db, kidId, redeemBefore),
    getKidHistoryPage(db, kidId, historyBefore),
  ]);
  if (!person || person.personType !== "parent") {
    redirect("/api/auto-login-parent");
  }

  const kid = members.find((m) => m.id === kidId && m.type === "kid");
  if (!kid) {
    notFound();
  }

  const { redemptions, hasMore: moreRedemptions } = redemptionsPage;
  const { entries: history, hasMore: moreHistory } = historyPage;
  const oldestRedemptionSequence = redemptions.at(-1)?.sequence;
  const oldestHistorySequence = history.at(-1)?.sequence;

  return (
    <div className="container">
      <h1>
        {kid.avatar ? `${kid.avatar} ` : ""}
        {kid.name}
      </h1>
      <p className="star-balance">{balance} ⭐</p>

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
        <>
          <ul>
            {redemptions.map((r) => (
              <li key={r.id}>
                {r.rewardNameSnapshot} ({r.rewardCostSnapshot} ⭐) — {STATUS_LABEL[r.status]}
                {r.status === "rejected" && r.rejectReason ? ` — ${r.rejectReason}` : ""}
              </li>
            ))}
          </ul>
          <p>
            {redeemBefore !== undefined && (
              <Link href={pageHref(kidId, historyBefore, undefined)}>Newest</Link>
            )}
            {redeemBefore !== undefined && moreRedemptions && " · "}
            {moreRedemptions && (
              <Link href={pageHref(kidId, historyBefore, oldestRedemptionSequence)}>Older →</Link>
            )}
          </p>
        </>
      )}

      <h2>History</h2>
      {history.length === 0 ? (
        <p>No stars yet.</p>
      ) : (
        <>
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
          <p>
            {historyBefore !== undefined && (
              <Link href={pageHref(kidId, undefined, redeemBefore)}>Newest</Link>
            )}
            {historyBefore !== undefined && moreHistory && " · "}
            {moreHistory && (
              <Link href={pageHref(kidId, oldestHistorySequence, redeemBefore)}>Older →</Link>
            )}
          </p>
        </>
      )}

      <p>
        <Link href="/parent">Back to dashboard</Link>
      </p>
    </div>
  );
}
