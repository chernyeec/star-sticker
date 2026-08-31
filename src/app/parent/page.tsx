import { redirect } from "next/navigation";
import { getCurrentPerson } from "@/lib/requireSession";

export const dynamic = "force-dynamic";

export default async function ParentDashboard() {
  const person = await getCurrentPerson();
  if (!person || person.personType !== "parent") {
    redirect("/login");
  }

  return (
    <div className="container">
      <h1>Parent dashboard</h1>
      <p>Award and deduct stars, manage rewards, and approve redemptions here soon.</p>
    </div>
  );
}
