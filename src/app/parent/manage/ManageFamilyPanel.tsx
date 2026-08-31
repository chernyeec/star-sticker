"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addKidAction, addParentAction, changePinAction } from "@/actions/manageFamily.action";
import type { FamilyMember } from "@/actions/family";

function ChangePin({ member }: { member: FamilyMember }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [pin, setPin] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSave() {
    setSubmitting(true);
    await changePinAction(member.type, member.id, pin);
    setSubmitting(false);
    setEditing(false);
    setPin("");
    router.refresh();
  }

  if (!editing) {
    return (
      <li>
        {member.avatar ? `${member.avatar} ` : ""}
        {member.name} ({member.type})
        <button type="button" onClick={() => setEditing(true)}>
          Change PIN
        </button>
      </li>
    );
  }

  return (
    <li>
      {member.avatar ? `${member.avatar} ` : ""}
      {member.name} ({member.type})
      <input
        type="password"
        inputMode="numeric"
        placeholder="New PIN"
        value={pin}
        onChange={(e) => setPin(e.target.value)}
      />
      <button type="button" disabled={submitting || pin === ""} onClick={handleSave}>
        Save
      </button>
    </li>
  );
}

function AddPersonForm({
  title,
  onAdd,
}: {
  title: string;
  onAdd: (name: string, avatar: string | undefined, pin: string) => Promise<unknown>;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [pin, setPin] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    await onAdd(name, avatar || undefined, pin);
    setName("");
    setAvatar("");
    setPin("");
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
      <label>
        PIN
        <input
          type="password"
          inputMode="numeric"
          required
          value={pin}
          onChange={(e) => setPin(e.target.value)}
        />
      </label>
      <button type="submit" disabled={submitting || name === "" || pin === ""}>
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
          <ChangePin key={m.id} member={m} />
        ))}
      </ul>

      <AddPersonForm title="Add a Kid" onAdd={(name, avatar, pin) => addKidAction(name, avatar, pin)} />
      <AddPersonForm
        title="Add a Parent"
        onAdd={(name, avatar, pin) => addParentAction(name, avatar, pin)}
      />
    </div>
  );
}
