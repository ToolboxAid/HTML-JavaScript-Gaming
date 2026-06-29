# PR_26180_OWNER_018-move-src-browser-to-www Manual Validation Notes

- No manual browser launch was required beyond targeted Playwright route smoke.
- Public browser route compatibility was manually smoke-checked through `resolveStaticRouteTarget` for representative browser, toolbox, admin, and `/src/...` routes.
- Product behavior is expected to remain unchanged because public URLs are preserved and moved files keep their relative browser module relationships under `www/src/`.
- The guard self-test intentionally retains a legacy `src/shared` import string as a violation fixture; it was allowlisted in the path scan and not treated as an active dependency.
