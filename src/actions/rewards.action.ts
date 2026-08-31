"use server";

import { db } from "@/db/client";
import { getCurrentPerson } from "@/lib/currentPerson";
import { getFamilyId } from "./family";
import { createReward, updateReward, archiveReward, type Reward } from "./rewards";

export type RewardActionResult =
  | { success: true; reward: Reward }
  | { success: false; reason: "not_authorized" };

async function requireParent() {
  const person = await getCurrentPerson();
  return person && person.personType === "parent";
}

export async function createRewardAction(name: string, cost: number): Promise<RewardActionResult> {
  if (!(await requireParent())) {
    return { success: false, reason: "not_authorized" };
  }

  const familyId = await getFamilyId(db);
  const reward = await createReward(db, { familyId, name, cost });
  return { success: true, reward };
}

export async function updateRewardAction(
  rewardId: string,
  name: string,
  cost: number
): Promise<RewardActionResult> {
  if (!(await requireParent())) {
    return { success: false, reason: "not_authorized" };
  }

  const reward = await updateReward(db, rewardId, { name, cost });
  return { success: true, reward };
}

export async function archiveRewardAction(rewardId: string): Promise<RewardActionResult> {
  if (!(await requireParent())) {
    return { success: false, reason: "not_authorized" };
  }

  const reward = await archiveReward(db, rewardId);
  return { success: true, reward };
}
