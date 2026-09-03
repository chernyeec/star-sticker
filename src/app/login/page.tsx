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
  const [error, setError] = useState<string | null>(null);
  const [loggingInId, setLoggingInId] = useState<string | null>(null);

  useEffect(() => {
    listFamilyMembersAction().then(setMembers);
  }, []);

  async function handleSelect(member: FamilyMember) {
    setError(null);
    setLoggingInId(member.id);

    const result = await loginAction(member.type, member.id);

    if (!result.success) {
      setError("Couldn't log in — try again.");
      setLoggingInId(null);
      return;
    }

    router.push(member.type === "parent" ? "/parent" : "/kid");
  }

  if (!members) return <div className="container">Loading…</div>;

  return (
    <div className="container">
      <h1>Who&rsquo;s this?</h1>
      {error && <p role="alert">{error}</p>}
      <div>
        {members.map((m) => (
          <button
            key={m.id}
            disabled={loggingInId !== null}
            onClick={() => handleSelect(m)}
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
