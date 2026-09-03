"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setupFamilyAction } from "@/actions/setup.action";

type KidDraft = { name: string; avatar: string };

export default function SetupPage() {
  const router = useRouter();
  const [familyName, setFamilyName] = useState("");
  const [parentName, setParentName] = useState("");
  const [parentAvatar, setParentAvatar] = useState("");
  const [kids, setKids] = useState<KidDraft[]>([{ name: "", avatar: "" }]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function updateKid(index: number, patch: Partial<KidDraft>) {
    setKids((prev) => prev.map((k, i) => (i === index ? { ...k, ...patch } : k)));
  }

  function addKid() {
    setKids((prev) => [...prev, { name: "", avatar: "" }]);
  }

  function removeKid(index: number) {
    setKids((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const result = await setupFamilyAction({
      familyName,
      parent: { name: parentName, avatar: parentAvatar || undefined },
      kids: kids
        .filter((k) => k.name.trim() !== "")
        .map((k) => ({ name: k.name, avatar: k.avatar || undefined })),
    });

    if (!result.success) {
      setError("A family has already been set up on this app.");
      setSubmitting(false);
      return;
    }

    router.push("/parent");
  }

  return (
    <div className="container">
      <h1>Set up your family</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Family name
          <input
            type="text"
            required
            value={familyName}
            onChange={(e) => setFamilyName(e.target.value)}
          />
        </label>

        <h2>You (the first parent)</h2>
        <label>
          Your name
          <input
            type="text"
            required
            value={parentName}
            onChange={(e) => setParentName(e.target.value)}
          />
        </label>
        <label>
          Avatar (an emoji works great)
          <input
            type="text"
            value={parentAvatar}
            onChange={(e) => setParentAvatar(e.target.value)}
          />
        </label>

        <h2>Kids</h2>
        {kids.map((k, i) => (
          <div key={i}>
            <label>
              Name
              <input
                type="text"
                value={k.name}
                onChange={(e) => updateKid(i, { name: e.target.value })}
              />
            </label>
            <label>
              Avatar
              <input
                type="text"
                value={k.avatar}
                onChange={(e) => updateKid(i, { avatar: e.target.value })}
              />
            </label>
            {kids.length > 1 && (
              <button type="button" onClick={() => removeKid(i)}>
                Remove
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={addKid}>
          Add another kid
        </button>

        {error && <p role="alert">{error}</p>}

        <button type="submit" disabled={submitting}>
          {submitting ? "Setting up…" : "Create family"}
        </button>
      </form>
    </div>
  );
}
