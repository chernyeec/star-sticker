import { redirect } from "next/navigation";
import { getCurrentPerson } from "@/lib/currentPerson";
import LogoutButton from "../LogoutButton";

export const dynamic = "force-dynamic";

export default async function KidView() {
  const person = await getCurrentPerson();
  if (!person || person.personType !== "kid") {
    redirect("/login");
  }

  return (
    <div className="container">
      <h1>Your stars</h1>
      <p>Your star balance and history will show up here soon.</p>
      <LogoutButton />
    </div>
  );
}
