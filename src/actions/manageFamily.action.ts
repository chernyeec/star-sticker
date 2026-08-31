"use server";

import { db } from "@/db/client";
import { requireParent } from "@/lib/currentPerson";
import { getFamilyId } from "./family";
import { addKid, addParent, changePin } from "./manageFamily";
import type { PersonType } from "@/lib/person";

export type ManageFamilyResult = { success: true } | { success: false; reason: "not_authorized" };

export async function addKidAction(
  name: string,
  avatar: string | undefined,
  pin: string
): Promise<ManageFamilyResult> {
  if (!(await requireParent())) {
    return { success: false, reason: "not_authorized" };
  }

  const familyId = await getFamilyId(db);
  await addKid(db, { familyId, name, avatar, pin });
  return { success: true };
}

export async function addParentAction(
  name: string,
  avatar: string | undefined,
  pin: string
): Promise<ManageFamilyResult> {
  if (!(await requireParent())) {
    return { success: false, reason: "not_authorized" };
  }

  const familyId = await getFamilyId(db);
  await addParent(db, { familyId, name, avatar, pin });
  return { success: true };
}

export async function changePinAction(
  personType: PersonType,
  personId: string,
  newPin: string
): Promise<ManageFamilyResult> {
  if (!(await requireParent())) {
    return { success: false, reason: "not_authorized" };
  }

  await changePin(db, personType, personId, newPin);
  return { success: true };
}
