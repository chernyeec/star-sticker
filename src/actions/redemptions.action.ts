"use server";

import { db } from "@/db/client";
import { getCurrentPerson, requireParent } from "@/lib/currentPerson";
import {
  requestRedemption,
  approveRedemption,
  rejectRedemption,
  cancelRedemption,
  type Redemption,
} from "./redemptions";

export type RedemptionActionResult =
  | { success: true; redemption: Redemption }
  | { success: false; reason: "not_authorized" };

export async function requestRedemptionAction(rewardId: string): Promise<RedemptionActionResult> {
  const person = await getCurrentPerson();
  if (!person || person.personType !== "kid") {
    return { success: false, reason: "not_authorized" };
  }

  const redemption = await requestRedemption(db, { kidId: person.personId, rewardId });
  return { success: true, redemption };
}

export async function cancelRedemptionAction(redemptionId: string): Promise<RedemptionActionResult> {
  const person = await getCurrentPerson();
  if (!person || person.personType !== "kid") {
    return { success: false, reason: "not_authorized" };
  }

  const redemption = await cancelRedemption(db, { redemptionId, kidId: person.personId });
  return { success: true, redemption };
}

export async function approveRedemptionAction(redemptionId: string): Promise<RedemptionActionResult> {
  const parent = await requireParent();
  if (!parent) {
    return { success: false, reason: "not_authorized" };
  }

  const redemption = await approveRedemption(db, { redemptionId, parentId: parent.personId });
  return { success: true, redemption };
}

export async function rejectRedemptionAction(
  redemptionId: string,
  reason?: string
): Promise<RedemptionActionResult> {
  const parent = await requireParent();
  if (!parent) {
    return { success: false, reason: "not_authorized" };
  }

  const redemption = await rejectRedemption(db, { redemptionId, parentId: parent.personId, reason });
  return { success: true, redemption };
}
