"use server";

import { db } from "@/db/client";
import { requireParent } from "@/lib/currentPerson";
import { awardStars, type StarLedgerEntry } from "./stars";

export type AwardStarsResult =
  | { success: true; entry: StarLedgerEntry }
  | { success: false; reason: "not_authorized" };

export async function awardStarsAction(
  kidId: string,
  amount: number,
  reason?: string
): Promise<AwardStarsResult> {
  const parent = await requireParent();
  if (!parent) {
    return { success: false, reason: "not_authorized" };
  }

  const entry = await awardStars(db, {
    kidId,
    amount,
    reason,
    createdByParentId: parent.personId,
  });

  return { success: true, entry };
}
