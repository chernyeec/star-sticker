# 06 — PWA installability

**What to build:** The site can be added to a phone's home screen and
opens like a standalone app, instead of just being a browser tab.

**Blocked by:** 01 — Family setup, and PIN login for Parents and Kids

**Status:** ready-for-agent

- [ ] `manifest.json` present with app name, icons, theme color, and
      `display: standalone`
- [ ] A minimal service worker is registered that caches the app shell
- [ ] The site is installable via "Add to Home Screen" on a mobile
      browser (verified manually — this is browser platform behavior,
      not app logic, so no automated test is required)
