"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { awardStarsAction } from "@/actions/stars.action";
import type { FamilyMember } from "@/actions/family";
import PersonLabel from "../PersonLabel";

const stepStyle = { fontSize: "1.5rem", lineHeight: 1, padding: "0.25rem 0.75rem" };

export default function KidStarCard({ kid, balance }: { kid: FamilyMember; balance: number }) {
  const router = useRouter();
  const [delta, setDelta] = useState(0);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [burstKey, setBurstKey] = useState(0);
  const [fallKey, setFallKey] = useState(0);

  async function save() {
    setError(null);
    setSubmitting(true);
    const result = await awardStarsAction(kid.id, delta, reason || undefined);
    setSubmitting(false);
    if (!result.success) {
      setError("Couldn't save that — try logging in again.");
      return;
    }
    setDelta(0);
    setReason("");
    router.refresh();
  }

  return (
    <div style={{ width: "100%", padding: "0.75rem 0.5rem", textAlign: "center" }}>
      <Link
        href={`/parent/kid/${kid.id}`}
        className="kid-link"
        style={{ display: "block", textDecoration: "none", color: "inherit", fontSize: "1.1rem" }}
      >
        <PersonLabel name={kid.name} avatar={kid.avatar} size={96} />{" "}
        <strong className="kid-balance">{balance} ⭐</strong>
      </Link>
      <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginTop: "0.4rem" }}>
        <span style={{ position: "relative", display: "inline-block" }}>
          <button
            type="button"
            aria-label={`Add a star to ${kid.name}`}
            style={stepStyle}
            onClick={() => {
              setDelta((d) => d + 1);
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
            aria-label={`Deduct a star from ${kid.name}`}
            style={stepStyle}
            onClick={() => {
              setDelta((d) => d - 1);
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
      </div>
      {delta !== 0 && (
        <div style={{ marginTop: "0.4rem" }}>
          <strong>{delta > 0 ? `+${delta}` : `−${-delta}`} ⭐</strong>
          <input
            type="text"
            placeholder="Reason (optional)"
            aria-label={`Reason for ${kid.name}`}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <button type="button" onClick={save} disabled={submitting}>
            {submitting ? "Saving…" : "Save"}
          </button>
          {error && <p role="alert">{error}</p>}
        </div>
      )}
    </div>
  );
}
