"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { awardStarsAction } from "@/actions/stars.action";
import type { FamilyMember } from "@/actions/family";
import PersonLabel from "../PersonLabel";

export default function AwardStarsForm({ kids }: { kids: FamilyMember[] }) {
  const router = useRouter();
  const [kidId, setKidId] = useState(kids[0]?.id ?? "");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [burstKey, setBurstKey] = useState(0);
  const [fallKey, setFallKey] = useState(0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const result = await awardStarsAction(kidId, Number(amount), reason || undefined);

    setSubmitting(false);
    if (!result.success) {
      setError("Couldn't save that — try logging in again.");
      return;
    }

    setAmount("");
    setReason("");
    router.refresh();
  }

  if (kids.length === 0) {
    return <p>Add a kid first (Manage family) before awarding stars.</p>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Award or deduct stars</h2>
      <div style={{ display: "flex", gap: "0.35rem", marginBottom: "0.75rem" }}>
        {kids.map((k) => (
          <button
            key={k.id}
            type="button"
            className="kid-pick"
            aria-pressed={kidId === k.id}
            onClick={() => setKidId(k.id)}
          >
            <PersonLabel name={k.name} avatar={k.avatar} />
          </button>
        ))}
      </div>
      <label>
        Stars (negative to deduct)
        <input
          type="number"
          step="1"
          required
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <span style={{ position: "relative", display: "inline-block" }}>
          <button
            type="button"
            style={{ fontSize: "1.5rem", lineHeight: 1, padding: "0.25rem 0.75rem" }}
            onClick={() => {
              setAmount(String(Number(amount || 0) + 1));
              setBurstKey((k) => k + 1);
            }}
          >
            +
          </button>
          {burstKey > 0 && (
            <span key={burstKey} className="star-burst" aria-hidden="true">
              ⭐
            </span>
          )}
        </span>
        <span style={{ position: "relative", display: "inline-block" }}>
          <button
            type="button"
            style={{ fontSize: "1.5rem", lineHeight: 1, padding: "0.25rem 0.75rem" }}
            onClick={() => {
              setAmount(String(Number(amount || 0) - 1));
              setFallKey((k) => k + 1);
            }}
          >
            −
          </button>
          {fallKey > 0 && (
            <span key={fallKey} className="star-fall" aria-hidden="true">
              ⭐
            </span>
          )}
        </span>
      </label>
      <label>
        Reason (optional)
        <input type="text" value={reason} onChange={(e) => setReason(e.target.value)} />
      </label>
      {error && <p role="alert">{error}</p>}
      <button type="submit" disabled={submitting || amount === ""}>
        {submitting ? "Saving…" : "Save"}
      </button>
    </form>
  );
}
