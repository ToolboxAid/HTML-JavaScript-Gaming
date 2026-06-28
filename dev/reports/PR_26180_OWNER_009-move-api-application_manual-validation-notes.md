# PR_26180_OWNER_009 Manual Validation Notes

## Manual Review

- Confirmed `src/dev-runtime/` now contains only the Admin Notes browser-viewer compatibility files.
- Confirmed top-level `api/` contains server/API runtime ownership folders.
- Confirmed browser-facing imports use `src/api` client modules rather than top-level `api/` implementation modules.
- Confirmed developer bootstrap files remain under `dev/scripts/` for the later local-runtime migration PR.
- Confirmed active Project Instructions and backlog now describe this API migration step.

## Manual Route Notes

- Representative `/api/*` endpoints were exercised through the moved local API server.
- Public URL preservation was checked through the targeted Browser API URL Playwright smoke.
