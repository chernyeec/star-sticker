"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { redeemForKidAction } from "@/actions/redemptions.action";
import type { FamilyMember } from "@/actions/family";
import type { Reward } from "@/actions/rewards";

export default function RedeemForKidForm({
  kids,
  rewards,
}: {
  kids: FamilyMember[];
  rewards: Reward[];
}) {
  const router = useRouter();
  const [kidId, setKidId] = useState(kids[0]?.id ?? "");
  const [rewardId, setRewardId] = useState(rewards[0]?.id ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (kids.length === 0 || rewards.length === 0) {
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const result = await redeemForKidAction(kidId, rewardId);
      if (!result.success) {
        setError("Couldn't redeem — try logging in again.");
        return;
      }
      router.refresh();
    } catch {
      setError("Kid can't afford that reward.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Redeem for a kid</h2>
      <label>
        Kid
        <select value={kidId} onChange={(e) => setKidId(e.target.value)}>
          {kids.map((k) => (
            <option key={k.id} value={k.id}>
              {k.avatar ? `${k.avatar} ` : ""}
              {k.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Reward
        <select value={rewardId} onChange={(e) => setRewardId(e.target.value)}>
          {rewards.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name} — {r.cost} ⭐
            </option>
          ))}
        </select>
      </label>
      {error && <p role="alert">{error}</p>}
      <button type="submit" disabled={submitting}>
        {submitting ? "Redeeming…" : "Redeem"}
      </button>
    </form>
  );
}
