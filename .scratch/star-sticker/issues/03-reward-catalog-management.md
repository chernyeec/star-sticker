# 03 — Reward catalog management

**What to build:** Any Parent can maintain the Family's shared Reward
catalog — create Rewards with a star cost, edit them, and archive ones
no longer offered, without breaking anything that referenced them.

**Blocked by:** 01 — Family setup, and PIN login for Parents and Kids

**Status:** done

- [x] `reward` schema (family_id, name, cost as a positive integer,
      nullable archived_at)
- [x] Any logged-in Parent can create a Reward (name + cost)
- [x] Any logged-in Parent can edit a Reward's name or cost
- [x] Any logged-in Parent can archive a Reward (sets archived_at; not
      a hard delete)
- [x] Archived Rewards are excluded from the active catalog listing
- [x] The catalog is shared across the whole Family, not per-Kid
- [x] Server Action-level tests cover: create/edit/archive a Reward,
      and the active-listing query excludes archived Rewards

## Notes

Positive-integer cost is enforced in `rewards.ts`, not just the UI's
`min="1"` — calling the action directly with a zero/negative cost is
rejected. Both `stars.action.ts` and `rewards.action.ts` now share one
`requireParent()` helper (`src/lib/currentPerson.ts`) rather than each
having its own auth-check idiom.
