# Star Sticker — Design

Status: approved by user in brainstorming session, pending written-spec review.

## Purpose

A mobile-friendly website for a single family where Parents award or deduct
star stickers as rewards or consequences, and Kids track their own star
balance and redeem stars for rewards. See [CONTEXT.md](../../../CONTEXT.md)
for the domain glossary (Family, Parent, Kid, Star Ledger Entry, Star
Balance, Reward, Redemption) — this document does not redefine those terms.

## Scope

**In scope (v1):**

- Single Family, multiple Parents, multiple Kids
- PIN-based login for both Parents and Kids (avatar/name tap, then PIN)
- Parents award/deduct stars on any Kid, with an optional reason
- Append-only star history, visible in full to the Kid it belongs to
- Shared Reward catalog (managed by any Parent)
- Kid-initiated Redemption requests, Parent approval/rejection, Kid can
  cancel their own pending request
- In-app "manage family" flow: initial setup, and ongoing (add
  Kids/Parents, change PINs) — available permanently, not one-shot
- Installable as a PWA (Add to Home Screen)

**Out of scope (v1):**

- Multi-family / self-serve signup (single Family per deployment)
- Push notifications (state refreshes on app open/reload only)
- Editing or deleting past Star Ledger Entries (corrections are new
  offsetting entries)
- Removing Parents or Kids once added (adding + PIN change only)
- Per-kid Reward catalogs (one shared catalog for the whole Family)

## Architecture

Single Next.js (App Router) app deployed to Vercel:

- **UI**: React, mobile-first responsive layout.
- **Data access**: Server Actions call Drizzle ORM against Neon Postgres
  directly — no separate REST/GraphQL API layer, since the only client is
  this app's own frontend.
- **Auth**: PIN verified server-side against a bcrypt hash; on success a
  signed, httpOnly session cookie is issued, backed by a `session` table.
  Middleware checks the cookie on protected routes and resolves it to a
  Parent or Kid identity.
- **PWA**: `manifest.json` + a minimal cache-the-shell service worker for
  installability. No offline data sync.
- **Hosting**: Vercel (Hobby plan) + Neon (Postgres free tier) — both free
  indefinitely at single-family traffic, no credit card required.

## Data model

- **`family`**: id, name
- **`parent`**: id, family_id, name, avatar, pin_hash
- **`kid`**: id, family_id, name, avatar, pin_hash
- **`star_ledger_entry`**: id, kid_id, amount (signed integer), reason
  (nullable text), created_by_parent_id, created_at.
  Append-only. A Kid's Star Balance = `SUM(amount) WHERE kid_id = ?`
  (can be negative).
- **`reward`**: id, family_id, name, cost (positive integer),
  archived_at (nullable) — archiving replaces deletion so past
  Redemptions remain meaningful.
- **`redemption`**: id, kid_id, reward_name_snapshot, reward_cost_snapshot,
  status (`pending`|`approved`|`rejected`|`cancelled`), requested_at,
  resolved_at (nullable), resolved_by_parent_id (nullable),
  reject_reason (nullable text).
  Snapshots the Reward's name/cost at request time so later edits to the
  Reward catalog don't alter historical Redemption records.
- **`session`**: id, person_type (`parent`|`kid`), person_id, token_hash,
  expires_at.

## Core flows

**Login**: tap a Parent/Kid avatar → enter that person's PIN → server
verifies against `pin_hash` → session cookie issued → redirect to that
person's view (Parent dashboard or Kid view).

**Award/deduct stars**: Parent selects a Kid, enters a signed amount and
optional reason → new `star_ledger_entry` row → Kid's balance updates
immediately (visible on next load, no push).

**Redemption**: Kid picks a Reward they can afford (balance ≥ cost) →
`redemption` row created as `pending` → Parent sees pending requests →
Parent approves (creates an offsetting `star_ledger_entry` for the
snapshotted cost, sets status `approved`) or rejects (status `rejected`,
optional reason) → Kid can instead cancel while still `pending` (status
`cancelled`). Approval is allowed even if the Kid's balance has since
dropped below the cost — the Parent decides, balances can go negative.

**Manage family**: first Parent ever created runs initial setup (create
Family, set own PIN, add Kids with their PINs). If a Family already
exists, this flow redirects to login instead of creating a second Family.
The same screen remains available afterward for adding more Kids/Parents
or changing anyone's PIN.

## Error handling & edge cases

- **Wrong PIN**: 5 failed attempts for a given person → 30s cooldown
  before retrying. No lockout notification system.
- **Redemption request with insufficient balance**: blocked client- and
  server-side; a Kid can only request a Reward they can currently afford.
- **Approving with an insufficient current balance**: allowed anyway —
  approval always succeeds for a `pending` request; the resulting balance
  can go negative, consistent with punishments being allowed to do the
  same.
- **Re-running setup when a Family exists**: redirected to login, no
  second Family created.
- **PINs**: hashed (bcrypt) before storage; never logged or stored in
  plaintext.

## Testing

- Unit tests: Star Balance calculation (including negative sums),
  Redemption state transitions (valid/invalid, e.g. rejecting an
  already-approved request must fail), PIN hashing/verification.
- No e2e framework for v1. Manual pass in a real mobile browser before
  shipping: login as Parent and Kid, award/deduct stars, full Redemption
  cycle (request → approve, request → reject, request → cancel).
