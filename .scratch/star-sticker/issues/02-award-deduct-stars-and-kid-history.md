# 02 — Award/deduct stars, and Kid balance & history

**What to build:** A Parent can give any Kid stars as a reward or take
them away as a consequence, with an optional reason. The Kid, on their
own device, sees their running Star Balance and the full history behind
it.

**Blocked by:** 01 — Family setup, and PIN login for Parents and Kids

**Status:** done

- [x] `star_ledger_entry` schema (kid_id, signed amount, nullable
      reason, created_by_parent_id, created_at)
- [x] A logged-in Parent can select any Kid in the Family and submit a
      signed star amount with an optional reason, creating a new entry
- [x] A Kid's Star Balance is the sum of their entries and can be
      negative
- [x] A logged-in Kid sees their current Star Balance
- [x] A logged-in Kid sees the full history of their entries (amount,
      reason if present, date), in a sensible order
- [x] Entries are append-only — no edit or delete path exists anywhere
      in the UI or Server Actions
- [x] Server Action-level tests cover: awarding stars creates an entry,
      deducting stars creates a negative entry, balance sums correctly
      including negative totals, history returns entries in order

## Notes

History ordering uses a `sequence` (bigserial) column rather than
`created_at`, since wall-clock timestamps can tie between two rapid
sequential inserts — confirmed non-flaky across repeated test runs and
verified in the browser with three awards saved back-to-back.
Non-integer amounts are rejected by the `integer` column itself; no
separate application-level validation was needed.
