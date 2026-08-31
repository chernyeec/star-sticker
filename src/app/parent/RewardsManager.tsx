"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createRewardAction,
  updateRewardAction,
  archiveRewardAction,
} from "@/actions/rewards.action";
import type { Reward } from "@/actions/rewards";

function EditableReward({ reward }: { reward: Reward }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(reward.name);
  const [cost, setCost] = useState(String(reward.cost));

  async function handleSave() {
    await updateRewardAction(reward.id, name, Number(cost));
    setEditing(false);
    router.refresh();
  }

  async function handleArchive() {
    await archiveRewardAction(reward.id);
    router.refresh();
  }

  if (editing) {
    return (
      <li>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
        <input
          type="number"
          step="1"
          min="1"
          value={cost}
          onChange={(e) => setCost(e.target.value)}
        />
        <button type="button" onClick={handleSave}>
          Save
        </button>
      </li>
    );
  }

  return (
    <li>
      {reward.name} — {reward.cost} ⭐
      <button type="button" onClick={() => setEditing(true)}>
        Edit
      </button>
      <button type="button" onClick={handleArchive}>
        Archive
      </button>
    </li>
  );
}

export default function RewardsManager({ rewards }: { rewards: Reward[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [cost, setCost] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    await createRewardAction(name, Number(cost));
    setName("");
    setCost("");
    setSubmitting(false);
    router.refresh();
  }

  return (
    <div>
      <h2>Rewards</h2>
      {rewards.length === 0 ? (
        <p>No rewards yet.</p>
      ) : (
        <ul>
          {rewards.map((r) => (
            <EditableReward key={r.id} reward={r} />
          ))}
        </ul>
      )}

      <form onSubmit={handleCreate}>
        <label>
          Name
          <input type="text" required value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label>
          Cost (stars)
          <input
            type="number"
            step="1"
            min="1"
            required
            value={cost}
            onChange={(e) => setCost(e.target.value)}
          />
        </label>
        <button type="submit" disabled={submitting || name === "" || cost === ""}>
          {submitting ? "Adding…" : "Add reward"}
        </button>
      </form>
    </div>
  );
}
