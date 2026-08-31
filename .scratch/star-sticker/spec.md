# Star Sticker

Status: ready-for-agent

## Problem Statement

Parents want a lightweight, mobile-friendly way to give kids star stickers
as rewards, or take them away as a consequence — without resorting to a
physical sticker chart. Today that either means a paper chart (easy to
lose, no history, can't be checked remotely) or nothing formal at all. It
also needs to work across each family member's own phone, and cost
nothing to run.

## Solution

A single-family, mobile-first website. Any Parent logs in with their own
PIN and can award or deduct stars on any Kid, optionally with a reason.
Each Kid logs in with their own PIN, on their own device, to see their
running Star Balance and full history, and to request Redemptions from a
shared family Reward catalog — which a Parent then approves or rejects.
The site installs to the home screen like an app (PWA) and runs on a
permanently-free hosting tier.

See [CONTEXT.md](../../CONTEXT.md) for the domain glossary (Family,
Parent, Kid, Star Ledger Entry, Star Balance, Reward, Redemption) and
[docs/superpowers/specs/2026-08-31-star-sticker-design.md](../../docs/superpowers/specs/2026-08-31-star-sticker-design.md)
for the design this spec formalizes.

## User Stories

1. As the first Parent, I want to set up my Family (name it, set my own
   PIN) the first time I open the app, so that I can start using it
   immediately with no manual/technical setup step.
2. As the first Parent, I want to add each Kid and set their PIN during
   setup, so that they can log in on their own device right away.
3. As a Parent, I want to log in by tapping my name/avatar and entering
   my PIN, so that logging in is fast on a phone.
4. As a Kid, I want to log in by tapping my name/avatar and entering my
   PIN, so that I can check my own stars without needing a password.
5. As a Parent, I want my login to persist on my device after I log in
   once, so that I don't have to re-enter my PIN every time I open the
   app.
6. As a Parent, I want to award stars to any Kid in the Family, so that I
   can reward good behavior in the moment.
7. As a Parent, I want to deduct stars from any Kid, so that I can apply
   a consequence for bad behavior.
8. As a Parent, I want to optionally attach a reason when I award or
   deduct stars, so that the Kid understands why their balance changed.
9. As a Parent, I want to award or deduct stars without being forced to
   type a reason, so that a quick "+1 star" doesn't have unnecessary
   friction.
10. As a Kid, I want to see my current Star Balance, so that I know where
    I stand.
11. As a Kid, I want my Star Balance to be able to go negative, so that
    consequences are reflected honestly even if I have no stars to lose.
12. As a Kid, I want to see the full history of every star I've earned or
    lost, with the reason if one was given, so that I can understand the
    pattern behind my balance.
13. As a Parent, I want the star history to be permanent (append-only),
    so that neither I nor the Kid can lose track of what actually
    happened by editing the past.
14. As a Parent, I want to fix a mistaken entry by adding a new
    correcting entry rather than editing the old one, so that the
    history stays trustworthy.
15. As a Parent, I want to create Rewards in a shared catalog (name and
    star cost), so that Kids have something concrete to work toward.
16. As a Parent, I want to edit or archive a Reward, so that I can keep
    the catalog current without breaking historical Redemption records
    that reference it.
17. As any Parent in the Family, I want to manage the Reward catalog
    (not just the first/admin Parent), so that either parent can keep it
    up to date.
18. As a Kid, I want to see the shared family Reward catalog, so that I
    know what I can redeem my stars for.
19. As a Kid, I want to request a Redemption for a Reward I can currently
    afford, so that I can claim it.
20. As a Kid, I want to be blocked from requesting a Redemption I can't
    currently afford, so that I don't create requests that don't make
    sense.
21. As a Kid, I want to cancel my own pending Redemption request, so
    that I can change my mind before a Parent responds.
22. As a Parent, I want to see pending Redemption requests from any Kid,
    so that I can act on them.
23. As a Parent, I want to approve a pending Redemption, deducting the
    Reward's cost from the Kid's balance, so that the exchange is
    recorded like any other star change.
24. As a Parent, I want to approve a Redemption even if the Kid's
    balance has since dropped below the Reward's cost, so that I retain
    final say rather than being blocked by a strict rule.
25. As a Parent, I want to reject a pending Redemption, optionally with a
    reason, so that the Kid understands why it wasn't granted.
26. As a Kid, I want a rejected Redemption to remain visible in my
    history with its reason, so that it doesn't just vanish
    unexplained.
27. As a Parent, I want a Redemption to preserve the Reward's name and
    cost as they were at request time, so that later edits to the
    catalog don't rewrite past records.
28. As a Parent, I want to add another Parent to the Family after
    initial setup, so that both parents can use the app independently.
29. As a Parent, I want to add more Kids after initial setup, so that
    the Family isn't limited to whoever was added on day one.
30. As a Parent, I want to change any Family member's PIN from within
    the app, so that a forgotten or compromised PIN can be reset without
    external help.
31. As a Parent or Kid, I want repeated wrong PIN attempts to be
    rate-limited, so that someone can't just guess a short PIN quickly.
32. As a Parent, I want re-opening the setup flow after the Family
    already exists to just take me to login, so that a second Family
    can't accidentally be created.
33. As a Parent or Kid, I want to install the site to my phone's home
    screen, so that it feels and opens like a regular app.
34. As the person paying for hosting, I want the app to run entirely on
    free-tier infrastructure, so that this personal tool costs nothing
    to keep running.

## Implementation Decisions

- **Architecture**: a single Next.js (App Router) application deployed
  to Vercel. UI is React, mobile-first responsive layout. Data access
  goes through Server Actions calling Drizzle ORM directly against a
  Neon Postgres database — no separate REST/GraphQL API layer, since
  the only client is this app's own frontend.
- **Auth**: custom-built, not a third-party auth library — PINs don't
  map onto standard email/password or OAuth flows. A submitted PIN is
  checked server-side against a bcrypt hash; on success, a signed
  httpOnly session cookie is issued, backed by a `session` table
  (`person_type`: `parent`|`kid`, `person_id`, `token_hash`,
  `expires_at`). Middleware resolves the cookie to a Parent or Kid
  identity on protected routes and persists the login across visits.
- **PWA**: a `manifest.json` plus a minimal cache-the-shell service
  worker, enabling "Add to Home Screen." No offline data sync — the app
  still needs network access to function.
- **Hosting**: Vercel (Hobby plan) for the app, Neon (Postgres free
  tier) for the database. Both are free indefinitely at single-family
  traffic with no credit card required.
- **Data model**:
  - `family`: id, name
  - `parent`: id, family_id, name, avatar, pin_hash
  - `kid`: id, family_id, name, avatar, pin_hash
  - `star_ledger_entry`: id, kid_id, amount (signed integer), reason
    (nullable), created_by_parent_id, created_at. Append-only; a Kid's
    Star Balance is `SUM(amount) WHERE kid_id = ?` and can be negative.
  - `reward`: id, family_id, name, cost (positive integer),
    archived_at (nullable) — archiving replaces hard deletion so past
    Redemptions stay meaningful.
  - `redemption`: id, kid_id, reward_name_snapshot, reward_cost_snapshot,
    status (`pending`|`approved`|`rejected`|`cancelled`), requested_at,
    resolved_at (nullable), resolved_by_parent_id (nullable),
    reject_reason (nullable).
  - `session`: id, person_type, person_id, token_hash, expires_at.
- **Login flow**: tap a Parent/Kid avatar (identifies who) → enter that
  person's PIN (authenticates) → session cookie issued → redirect to
  that person's view. PINs are unique per-person, not family-wide.
- **Star award/deduct flow**: a Parent picks a Kid, enters a signed
  amount and optional reason → inserts one `star_ledger_entry` row. No
  separate "reward" vs "punishment" field — sign of the amount is the
  only distinction.
- **Redemption lifecycle**: Kid requests (blocked if balance < cost) →
  `redemption` row created `pending` → Parent approves (inserts an
  offsetting `star_ledger_entry` for the snapshotted cost, sets
  `approved`) or rejects (`rejected`, optional reason) → or the Kid
  cancels their own request while still `pending` (`cancelled`).
  Approval succeeds even if the balance has since dropped below cost.
- **Manage family flow**: first-ever Parent runs setup (create Family,
  set own PIN, add Kids + PINs). If a Family already exists, this flow
  redirects to login. The same screen stays available afterward for
  adding Kids/Parents or changing any PIN — it is not a one-shot wizard.
- **Rate limiting**: 5 failed PIN attempts for a given person triggers a
  30-second cooldown before the next attempt is accepted.

## Testing Decisions

- **Seam**: tests call Server Actions directly (`awardStars`,
  `requestRedemption`, `approveRedemption`, `rejectRedemption`,
  `cancelRedemption`, `verifyPin`, etc.) against a real Postgres test
  database — not mocked, and not driven through HTTP or the browser.
  This is the single seam for the whole app (greenfield repo, no prior
  art to match).
- **What makes a good test here**: assert on the Server Action's return
  value and/or the resulting database state (e.g. the Kid's computed
  Star Balance, the Redemption's `status`) — never on internal
  implementation details like specific SQL calls.
- **Modules to test**:
  - Star Balance calculation, including sums that go negative.
  - Redemption state transitions — valid ones (pending → approved,
    pending → rejected, pending → cancelled) and invalid ones that must
    be rejected (e.g. approving an already-resolved Redemption,
    cancelling one that isn't pending).
  - Redemption request eligibility (balance ≥ cost check).
  - PIN hashing and verification.
  - Session issuance and validation (including expiry).
- **Out of scope for automated tests**: no end-to-end/browser test
  framework in v1. A manual pass in a real mobile browser covers the
  full user-facing flow before shipping (login as Parent and Kid,
  award/deduct stars, full Redemption cycle).

## Out of Scope

- Multi-family / self-serve signup — this deployment serves exactly one
  Family.
- Push notifications — state refreshes only when the app is opened or
  reloaded.
- Editing or deleting past Star Ledger Entries — corrections are new
  offsetting entries.
- Removing Parents or Kids once added — only adding and PIN changes are
  supported.
- Per-kid Reward catalogs — one shared catalog for the whole Family.
- A native mobile app — this is a responsive website, installable as a
  PWA.

## Further Notes

This spec formalizes the design already agreed in
[docs/superpowers/specs/2026-08-31-star-sticker-design.md](../../docs/superpowers/specs/2026-08-31-star-sticker-design.md),
produced via a `/grilling` session (recorded in
[CONTEXT.md](../../CONTEXT.md)) and `superpowers:brainstorming`. This is
a greenfield repo — there is no existing codebase to reconcile against,
so all "implementation decisions" above are being established for the
first time, not modified from prior art.
