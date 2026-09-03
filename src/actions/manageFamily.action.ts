"use server";

import { db } from "@/db/client";
import { requireParent } from "@/lib/currentPerson";
import { getFamilyId } from "./family";
import { addKid, addParent } from "./manageFamily";

export type ManageFamilyResult = { success: true } | { success: false; reason: "not_authorized" };

export async function addKidAction(
  name: string,
  avatar: string | undefined
): Promise<ManageFamilyResult> {
  if (!(await requireParent())) {
    return { success: false, reason: "not_authorized" };
  }

  const familyId = await getFamilyId(db);
  await addKid(db, { familyId, name, avatar });
  return { success: true };
}

export async function addParentAction(
  name: string,
  avatar: string | undefined
): Promise<ManageFamilyResult> {
  if (!(await requireParent())) {
    return { success: false, reason: "not_authorized" };
  }

  const familyId = await getFamilyId(db);
  await addParent(db, { familyId, name, avatar });
  return { success: true };
}
