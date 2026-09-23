"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { listFamilyMembersAction } from "@/actions/family.action";
import { loginAction } from "@/actions/login.action";
import type { FamilyMember } from "@/actions/family";
import PersonLabel from "../PersonLabel";

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
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "0.5rem",
        }}
      >
        <div style={{ borderRadius: "50%", overflow: "hidden", width: "96px", height: "96px" }}>
          <video
            src="/animated-star.mp4"
            autoPlay
            loop
            muted
            playsInline
            width={96}
            height={96}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      </div>
      <h1>Who&rsquo;s this?</h1>
      {error && <p role="alert">{error}</p>}
      <div>
        {members.map((m) => (
          <button
            key={m.id}
            disabled={loggingInId !== null}
            onClick={() => handleSelect(m)}
            style={{
              display: "flex",
              alignItems: "center",
              width: "100%",
              marginBottom: "0.5rem",
            }}
          >
            <PersonLabel name={m.name} avatar={m.avatar} size={36} />
          </button>
        ))}
      </div>
    </div>
  );
}
