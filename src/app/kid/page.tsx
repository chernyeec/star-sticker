import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentPerson } from "@/lib/currentPerson";
import { db } from "@/db/client";
import { getKidHistoryPage, getKidBalance } from "@/actions/stars";
import { listActiveRewards } from "@/actions/rewards";
import { listKidRedemptions } from "@/actions/redemptions";
import LogoutButton from "../LogoutButton";
import RedeemPanel from "./RedeemPanel";

export const dynamic = "force-dynamic";

function parseCursor(value: string | string[] | undefined): number | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  const n = raw ? Number(raw) : NaN;
  return Number.isFinite(n) ? n : undefined;
}

export default async function KidView({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const person = await getCurrentPerson();
  if (!person || person.personType !== "kid") {
    redirect("/login");
  }

  const historyBefore = parseCursor((await searchParams).historyBefore);

  const [historyPage, balance, rewards, redemptions] = await Promise.all([
    getKidHistoryPage(db, person.personId, historyBefore),
    getKidBalance(db, person.personId),
    listActiveRewards(db),
    listKidRedemptions(db, person.personId),
  ]);
  const { entries: history, hasMore } = historyPage;
  const oldestSequence = history.at(-1)?.sequence;

  return (
    <div className="container">
      <h1>⭐ Your stars ⭐</h1>
      <p className="star-balance">{balance}</p>

      <h2>History</h2>
      {history.length === 0 ? (
        <p>No stars yet.</p>
      ) : (
        <>
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
          <p>
            {historyBefore !== undefined && <Link href="/kid">Newest</Link>}
            {historyBefore !== undefined && hasMore && " · "}
            {hasMore && <Link href={`/kid?historyBefore=${oldestSequence}`}>Older →</Link>}
          </p>
        </>
      )}

      <RedeemPanel rewards={rewards} balance={balance} redemptions={redemptions} />

      <LogoutButton />
    </div>
  );
}
