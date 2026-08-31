"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { requestRedemptionAction, cancelRedemptionAction } from "@/actions/redemptions.action";
import type { Reward } from "@/actions/rewards";
import type { Redemption } from "@/actions/redemptions";

const STATUS_LABEL: Record<Redemption["status"], string> = {
  pending: "Waiting for a parent",
  approved: "Approved",
  rejected: "Not this time",
  cancelled: "Cancelled",
};

export default function RedeemPanel({
  rewards,
  balance,
  redemptions,
}: {
  rewards: Reward[];
  balance: number;
  redemptions: Redemption[];
}) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function handleRequest(rewardId: string) {
    setPendingId(rewardId);
    await requestRedemptionAction(rewardId);
    setPendingId(null);
    router.refresh();
  }

  async function handleCancel(redemptionId: string) {
    setPendingId(redemptionId);
    await cancelRedemptionAction(redemptionId);
    setPendingId(null);
    router.refresh();
  }

  return (
    <div>
      <h2>Rewards</h2>
      {rewards.length === 0 ? (
        <p>No rewards to redeem yet.</p>
      ) : (
        <ul>
          {rewards.map((r) => (
            <li key={r.id}>
              {r.name} — {r.cost} ⭐{" "}
              <button
                type="button"
                disabled={balance < r.cost || pendingId === r.id}
                onClick={() => handleRequest(r.id)}
              >
                Redeem
              </button>
            </li>
          ))}
        </ul>
      )}

      {redemptions.length > 0 && (
        <>
          <h2>Your requests</h2>
          <ul>
            {redemptions.map((r) => (
              <li key={r.id}>
                {r.rewardNameSnapshot} ({r.rewardCostSnapshot} ⭐) — {STATUS_LABEL[r.status]}
                {r.status === "rejected" && r.rejectReason ? ` — ${r.rejectReason}` : ""}
                {r.status === "pending" && (
                  <button type="button" disabled={pendingId === r.id} onClick={() => handleCancel(r.id)}>
                    Cancel
                  </button>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
