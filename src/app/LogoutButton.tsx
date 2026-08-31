"use client";

import { useRouter } from "next/navigation";
import { logoutAction } from "@/actions/logout.action";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await logoutAction();
    router.push("/login");
  }

  return <button onClick={handleLogout}>Log out</button>;
}
