import { redirect } from "next/navigation";
import { getCurrentPerson } from "@/lib/currentPerson";
import { db } from "@/db/client";
import { getKidHistory } from "@/actions/stars";
import LogoutButton from "../LogoutButton";

export const dynamic = "force-dynamic";

export default async function KidView() {
  const person = await getCurrentPerson();
  if (!person || person.personType !== "kid") {
    redirect("/login");
  }

  const history = await getKidHistory(db, person.personId);
  const balance = history.reduce((sum, entry) => sum + entry.amount, 0);

  return (
    <div className="container">
      <h1>Your stars</h1>
      <p style={{ fontSize: "2rem" }}>⭐ {balance}</p>

      <h2>History</h2>
      {history.length === 0 ? (
        <p>No stars yet.</p>
      ) : (
        <ul>
          {history.map((entry) => (
            <li key={entry.id}>
              {entry.amount > 0 ? `+${entry.amount}` : entry.amount}
              {entry.reason ? ` — ${entry.reason}` : ""}
              {" · "}
              {entry.createdAt.toLocaleDateString()}
            </li>
          ))}
        </ul>
      )}

      <LogoutButton />
    </div>
  );
}
