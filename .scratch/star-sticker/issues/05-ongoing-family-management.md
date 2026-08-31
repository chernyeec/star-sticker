# 05 — Ongoing family management

**What to build:** After initial setup, any Parent can keep growing and
maintaining the Family from within the app — adding more Kids or
Parents, and resetting anyone's PIN — without needing a repeat of the
one-time setup flow.

**Blocked by:** 01 — Family setup, and PIN login for Parents and Kids

**Status:** done

- [x] A "manage family" screen is reachable by any logged-in Parent at
      any time, not just during initial setup
- [x] A Parent can add a new Kid (name, avatar, PIN) to the Family
- [x] A Parent can add a new Parent (name, avatar, PIN) to the Family
- [x] A Parent can change the PIN of any existing Kid or Parent
- [x] New and changed PINs are hashed before storage
- [x] Server Action-level tests cover: adding a Kid, adding a Parent,
      and a changed PIN taking effect on the next login attempt (old
      PIN rejected, new PIN accepted)

## Notes

`/parent/manage`, linked from the dashboard, is a standalone route
(not a one-shot wizard) with its own Parent-only guard. Verified live
in the browser: added a second Kid, changed an existing Kid's PIN, and
confirmed the old PIN is rejected while the new one logs in.
