"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { redeemForKidAction } from "@/actions/redemptions.action";

export default function RedeemRewardButton({
  kidId,
  rewardId,
}: {
  kidId: string;
  rewardId: string;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
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
    <>
      <button type="button" disabled={submitting} onClick={handleClick}>
        {submitting ? "Redeeming…" : "Redeem"}
      </button>
      {error && <span role="alert">{error}</span>}
    </>
  );
}
