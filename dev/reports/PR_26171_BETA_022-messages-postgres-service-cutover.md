# PR_26171_BETA_022-messages-postgres-service-cutover

## Summary

TEAM ownership: Bravo.

Branch: `team/BETA/messages`.

Scope completed:
- Replaced the active Messages Local API persistence service with a Postgres-backed implementation.
- Routed `/api/messages/*` through `createMessagesPostgresService`.
- Preserved the existing Local API response envelopes for Messages, categories, emotion profiles, TTS profiles, and segments.
- Removed the active Messages `node:sqlite`, `DatabaseSync`, `messages.sqlite`, and `GAMEFOUNDRY_MESSAGES_SQLITE_PATH` runtime path.
- Updated targeted Messages Playwright coverage to use an injected Postgres client stub.
- Updated active Messages DML/seed documentation from SQLite service wording to Postgres service wording.

Compatibility wrapper:
- No wrapper was kept. Active imports were migrated to `messages-postgres-service.mjs`, and targeted text checks found no remaining active reference to `messages-sqlite-service`.

Postgres authority:
- The runtime service uses the existing `createPostgresConnectionClient` path, which reads `GAMEFOUNDRY_DATABASE_URL` for the server-side database connection.
- Tests inject `createMessagesPostgresClientStub()` to preserve deterministic Local API and Playwright behavior without creating a local SQLite file.

## Validation

Passed:
- `node --test --test-name-pattern "Messages Local API" tests/dev-runtime/DbSeedIntegrity.test.mjs`
- `npx playwright test tests/playwright/tools/MessagesTool.spec.mjs --config=codex_playwright_system_chrome.config.cjs --project=playwright`
- `git diff --check`
- Targeted stale SQLite dependency check across Messages service, Local API router, affected tests, helper stubs, and active Messages docs.
- Targeted Postgres wiring check for `GAMEFOUNDRY_DATABASE_URL`, `createPostgresConnectionClient`, and Postgres service references.

Skipped:
- Full samples smoke: out of scope for this Messages Local API cutover.
- Broad runtime test suite: out of scope; validation was limited to the affected Messages and Local API surfaces.

## Notes

Playwright V8 coverage reports were refreshed by the targeted Messages Playwright run. Server-side runtime files are listed as advisory warnings because browser V8 coverage does not collect Node-side Local API modules.
