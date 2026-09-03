"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addKidAction, addParentAction } from "@/actions/manageFamily.action";
import type { FamilyMember } from "@/actions/family";

function AddPersonForm({
  title,
  onAdd,
}: {
  title: string;
  onAdd: (name: string, avatar: string | undefined) => Promise<unknown>;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    await onAdd(name, avatar || undefined);
    setName("");
    setAvatar("");
    setSubmitting(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit}>
      <h3>{title}</h3>
      <label>
        Name
        <input type="text" required value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <label>
        Avatar
        <input type="text" value={avatar} onChange={(e) => setAvatar(e.target.value)} />
      </label>
      <button type="submit" disabled={submitting || name === ""}>
        {submitting ? "Adding…" : "Add"}
      </button>
    </form>
  );
}

export default function ManageFamilyPanel({ members }: { members: FamilyMember[] }) {
  return (
    <div>
      <h2>Family members</h2>
      <ul>
        {members.map((m) => (
          <li key={m.id}>
            {m.avatar ? `${m.avatar} ` : ""}
            {m.name} ({m.type})
          </li>
        ))}
      </ul>

      <AddPersonForm title="Add a Kid" onAdd={(name, avatar) => addKidAction(name, avatar)} />
      <AddPersonForm title="Add a Parent" onAdd={(name, avatar) => addParentAction(name, avatar)} />
    </div>
  );
}
