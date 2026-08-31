"use server";

import { db } from "@/db/client";
import { listFamilyMembers, type FamilyMember } from "./family";

export async function listFamilyMembersAction(): Promise<FamilyMember[]> {
  return listFamilyMembers(db);
}
