"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { approveRedemptionAction, rejectRedemptionAction } from "@/actions/redemptions.action";
import type { Redemption } from "@/actions/redemptions";
import type { FamilyMember } from "@/actions/family";

export default function PendingRedemptions({
  redemptions,
  kids,
}: {
  redemptions: Redemption[];
  kids: FamilyMember[];
}) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  function kidName(kidId: string) {
    const kid = kids.find((k) => k.id === kidId);
    return kid ? `${kid.avatar ? `${kid.avatar} ` : ""}${kid.name}` : "Unknown";
  }

  async function handleApprove(redemptionId: string) {
    setBusyId(redemptionId);
    await approveRedemptionAction(redemptionId);
    setBusyId(null);
    router.refresh();
  }

  async function handleReject(redemptionId: string) {
    setBusyId(redemptionId);
    await rejectRedemptionAction(redemptionId);
    setBusyId(null);
    router.refresh();
  }

  return (
    <div>
      <h2>Pending redemptions</h2>
      {redemptions.length === 0 ? (
        <p>Nothing pending.</p>
      ) : (
        <ul>
          {redemptions.map((r) => (
            <li key={r.id}>
              {kidName(r.kidId)} wants {r.rewardNameSnapshot} ({r.rewardCostSnapshot} ⭐)
              <button type="button" disabled={busyId === r.id} onClick={() => handleApprove(r.id)}>
                Approve
              </button>
              <button type="button" disabled={busyId === r.id} onClick={() => handleReject(r.id)}>
                Reject
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
