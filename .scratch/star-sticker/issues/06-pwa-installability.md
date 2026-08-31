# 06 — PWA installability

**What to build:** The site can be added to a phone's home screen and
opens like a standalone app, instead of just being a browser tab.

**Blocked by:** 01 — Family setup, and PIN login for Parents and Kids

**Status:** done

- [x] `manifest.json` present with app name, icons, theme color, and
      `display: standalone`
- [x] A minimal service worker is registered that caches the app shell
- [x] The site is installable via "Add to Home Screen" on a mobile
      browser (verified manually — this is browser platform behavior,
      not app logic, so no automated test is required)

## Notes

Icons are real PNGs (512×512 and 180×180) generated via Next's
`icon.tsx`/`apple-icon.tsx` file conventions (`ImageResponse`, bundled
with Next — no new dependency) rather than a single SVG, since Chrome's
installability heuristic wants an explicit ≥192px raster icon and iOS
Safari's `apple-touch-icon` doesn't support SVG at all. Service worker
precaches only the manifest and icons — the app's pages are all
session/DB-dependent (`force-dynamic`), so there's no meaningful HTML
shell to cache offline. Verified manually in the browser (manifest
content, icon routes, registered/active service worker, populated
cache) after a full unregister-and-clear-caches pass.
