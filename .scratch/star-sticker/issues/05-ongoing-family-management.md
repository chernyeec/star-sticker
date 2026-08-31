# 05 — Ongoing family management

**What to build:** After initial setup, any Parent can keep growing and
maintaining the Family from within the app — adding more Kids or
Parents, and resetting anyone's PIN — without needing a repeat of the
one-time setup flow.

**Blocked by:** 01 — Family setup, and PIN login for Parents and Kids

**Status:** ready-for-agent

- [ ] A "manage family" screen is reachable by any logged-in Parent at
      any time, not just during initial setup
- [ ] A Parent can add a new Kid (name, avatar, PIN) to the Family
- [ ] A Parent can add a new Parent (name, avatar, PIN) to the Family
- [ ] A Parent can change the PIN of any existing Kid or Parent
- [ ] New and changed PINs are hashed before storage
- [ ] Server Action-level tests cover: adding a Kid, adding a Parent,
      and a changed PIN taking effect on the next login attempt (old
      PIN rejected, new PIN accepted)
