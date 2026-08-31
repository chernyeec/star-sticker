"use server";

import { db } from "@/db/client";
import { getCurrentPerson } from "@/lib/currentPerson";
import { awardStars, type StarLedgerEntry } from "./stars";

export type AwardStarsResult =
  | { success: true; entry: StarLedgerEntry }
  | { success: false; reason: "not_authorized" };

export async function awardStarsAction(
  kidId: string,
  amount: number,
  reason?: string
): Promise<AwardStarsResult> {
  const person = await getCurrentPerson();
  if (!person || person.personType !== "parent") {
    return { success: false, reason: "not_authorized" };
  }

  const entry = await awardStars(db, {
    kidId,
    amount,
    reason,
    createdByParentId: person.personId,
  });

  return { success: true, entry };
}
