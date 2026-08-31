# 01 — Family setup, and PIN login for Parents and Kids

**What to build:** The very first time the app is opened, a Parent walks
through a "set up your family" flow — naming the Family, setting their
own PIN, and adding Kids with their own PINs. After that, any Parent or
Kid can log in by tapping their name/avatar and entering their PIN, and
stays logged in on that device until they log out. This ticket also
establishes the project scaffold (Next.js, Drizzle ORM, Postgres
connection, migrations) that every later ticket builds on.

**Blocked by:** None — can start immediately

**Status:** ready-for-agent

- [ ] Next.js app scaffolded with Drizzle ORM connected to a Postgres
      database, with a migration workflow in place
- [ ] Schema exists for `family`, `parent`, `kid`, `session`
- [ ] First-time setup flow creates a Family (name), the first Parent
      (name, avatar, PIN), and one or more Kids (name, avatar, PIN)
- [ ] PINs are hashed (bcrypt) before storage — never stored or logged
      in plaintext
- [ ] Visiting setup when a Family already exists redirects to login
      instead of creating a second Family
- [ ] Login: tap a Parent or Kid's name/avatar, enter that person's PIN,
      verified server-side against their hash
- [ ] On success, a signed httpOnly session cookie is issued and
      persists across app opens (no re-login until logout/expiry)
- [ ] A logged-in Parent lands on a placeholder Parent dashboard; a
      logged-in Kid lands on a placeholder Kid view
- [ ] 5 failed PIN attempts for a given person trigger a 30-second
      cooldown before the next attempt is accepted
- [ ] Server Action-level tests cover: setup creates the expected rows,
      re-running setup after a Family exists is blocked, correct PIN
      succeeds, wrong PIN fails, PIN hashing/verification round-trips,
      and the rate-limit cooldown engages after 5 failures
