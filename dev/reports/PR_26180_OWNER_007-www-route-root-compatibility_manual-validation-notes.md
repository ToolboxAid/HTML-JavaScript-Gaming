# PR_26180_OWNER_007 Manual Validation Notes

## Manual Review

- Confirmed no browser-served files were moved.
- Confirmed public URLs remain unchanged.
- Confirmed the future web-root activation toggle is documented as `GAMEFOUNDRY_LOCAL_WEB_ROOT=www`.
- Confirmed the default remains repository-root static serving until the actual `www/` move PR.
- Confirmed route-root compatibility work is limited to local static serving and test helper support.

## Manual Test Guidance

After applying this PR, Owner can test:

1. Start the current local development flow with no web-root override.
2. Open `/index.html`, `/toolbox/index.html`, and an `/assets/...` URL.
3. Confirm the routes continue to load from the current repository-root layout.
4. In a future migration branch, set `GAMEFOUNDRY_LOCAL_WEB_ROOT=www` after browser files are moved and confirm the same public URLs load from `www/`.

## Runtime Scope

No UI, API, database, or product behavior changes are expected from this PR.
