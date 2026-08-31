"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { listFamilyMembersAction } from "@/actions/family.action";
import { loginAction } from "@/actions/login.action";
import type { FamilyMember } from "@/actions/family";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  const router = useRouter();
  const [members, setMembers] = useState<FamilyMember[] | null>(null);
  const [selected, setSelected] = useState<FamilyMember | null>(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    listFamilyMembersAction().then(setMembers);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setError(null);
    setSubmitting(true);

    const result = await loginAction(selected.type, selected.id, pin);

    if (!result.success) {
      setError(
        result.reason === "locked"
          ? "Too many wrong PINs — try again in 30 seconds."
          : "Wrong PIN, try again."
      );
      setPin("");
      setSubmitting(false);
      return;
    }

    router.push(selected.type === "parent" ? "/parent" : "/kid");
  }

  if (!members) return <div className="container">Loading…</div>;

  if (!selected) {
    return (
      <div className="container">
        <h1>Who&rsquo;s this?</h1>
        <div>
          {members.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelected(m)}
              style={{ display: "block", width: "100%", marginBottom: "0.5rem" }}
            >
              {m.avatar ? `${m.avatar} ` : ""}
              {m.name}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>
        {selected.avatar ? `${selected.avatar} ` : ""}
        {selected.name}
      </h1>
      <form onSubmit={handleSubmit}>
        <label>
          Enter your PIN
          <input
            type="password"
            inputMode="numeric"
            autoFocus
            value={pin}
            onChange={(e) => setPin(e.target.value)}
          />
        </label>
        {error && <p role="alert">{error}</p>}
        <button type="submit" disabled={submitting}>
          {submitting ? "Checking…" : "Log in"}
        </button>
      </form>
      <button type="button" onClick={() => setSelected(null)}>
        Not {selected.name}?
      </button>
    </div>
  );
}
