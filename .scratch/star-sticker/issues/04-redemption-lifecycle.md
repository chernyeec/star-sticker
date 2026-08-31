# 04 — Redemption lifecycle

**What to build:** A Kid can request a Reward they can currently afford;
a Parent then approves it (spending the stars) or rejects it; the Kid
can also cancel their own request before a Parent responds.

**Blocked by:** 02 — Award/deduct stars, and Kid balance & history;
03 — Reward catalog management

**Status:** done

- [x] `redemption` schema (kid_id, reward_name_snapshot,
      reward_cost_snapshot, status, requested_at, resolved_at,
      resolved_by_parent_id, reject_reason)
- [x] A logged-in Kid sees the active Reward catalog and can request a
      Redemption only for a Reward they can currently afford (balance
      ≥ cost), enforced client- and server-side
- [x] Requesting a Redemption snapshots the Reward's current name and
      cost onto the redemption row and sets status `pending`
- [x] A logged-in Parent sees all pending Redemption requests across
      every Kid in the Family
- [x] A Parent can approve a pending Redemption: creates an offsetting
      `star_ledger_entry` for the snapshotted cost and sets status
      `approved` — this succeeds even if the Kid's current balance has
      since dropped below the cost
- [x] A Parent can reject a pending Redemption with an optional reason;
      it stays visible (status `rejected`) in the Kid's history
- [x] A Kid can cancel their own pending Redemption; it stays visible
      (status `cancelled`) in their history
- [x] Approving, rejecting, or cancelling a Redemption that is not
      currently `pending` fails
- [x] Server Action-level tests cover: request blocked when balance is
      insufficient, request allowed and snapshots values when
      sufficient, approve deducts stars and updates status (including
      when current balance is now insufficient), reject sets status
      and reason, cancel sets status, and each invalid transition on a
      non-pending redemption is rejected

## Notes

Also enforces kid ownership on cancel (a Kid can't cancel a sibling's
redemption) — not explicitly named in the ticket text but implied by
"their own pending Redemption," and covered by a test. Verified the
full lifecycle manually in the browser (approve, reject-with-reason,
cancel), including the client-side Redeem-button balance gating.
