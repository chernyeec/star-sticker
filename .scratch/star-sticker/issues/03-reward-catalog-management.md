# 03 — Reward catalog management

**What to build:** Any Parent can maintain the Family's shared Reward
catalog — create Rewards with a star cost, edit them, and archive ones
no longer offered, without breaking anything that referenced them.

**Blocked by:** 01 — Family setup, and PIN login for Parents and Kids

**Status:** ready-for-agent

- [ ] `reward` schema (family_id, name, cost as a positive integer,
      nullable archived_at)
- [ ] Any logged-in Parent can create a Reward (name + cost)
- [ ] Any logged-in Parent can edit a Reward's name or cost
- [ ] Any logged-in Parent can archive a Reward (sets archived_at; not
      a hard delete)
- [ ] Archived Rewards are excluded from the active catalog listing
- [ ] The catalog is shared across the whole Family, not per-Kid
- [ ] Server Action-level tests cover: create/edit/archive a Reward,
      and the active-listing query excludes archived Rewards
