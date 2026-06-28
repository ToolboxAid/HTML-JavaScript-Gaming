# PR_26180_OWNER_009 Validation Report

## Validation Commands

| Command | Result |
| --- | --- |
| `git diff --check` | PASS |
| `npm run validate:canonical-structure` | PASS |
| `node --check` for changed JS/MJS files | PASS, 86 changed JS/MJS files |
| `node ./dev/scripts/run-node-test-files.mjs dev/tests/dev-runtime/StaticWebRootCompatibility.test.mjs dev/tests/dev-runtime/LocalApiStartupLogging.test.mjs dev/tests/dev-runtime/PublicEnvironmentConfig.test.mjs dev/tests/dev-runtime/DevRuntimeBoundary.test.mjs dev/tests/dev-runtime/AdminNotesBoundary.test.mjs dev/tests/dev-runtime/ArchitectureCleanupApiNavInvitations.test.mjs dev/tests/api/admin-system-health/contract.test.mjs` | PASS, 7/7 files and 30/30 subtests |
| Inline `/api/*` route smoke using `startLocalApiServer()` | PASS |
| `npx playwright test dev/tests/playwright/tools/BrowserApiUrlConfig.spec.mjs --reporter=line` | PASS, 1/1 |

## Route Smoke Endpoints

- `/api/runtime/health` - PASS
- `/api/public/config` - PASS
- `/api/session/current` - PASS
- `/api/session/modes` - PASS
- `/api/guest/seed` - PASS
- `/api/providers/contract` - PASS

## Notes

- `/api/session/users` was not used in the final smoke because it depends on configured provider/session-user data and returned 503 in this local environment.
- Playwright is targeted because API route behavior and browser API URL handling are adjacent to this move.
