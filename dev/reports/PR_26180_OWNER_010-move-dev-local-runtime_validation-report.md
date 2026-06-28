# PR_26180_OWNER_010 Validation Report

## Commands

| Command | Result |
| --- | --- |
| `git diff --check` | PASS |
| `npm run validate:canonical-structure` | PASS |
| `node --check dev/local-runtime/start-dev.mjs` | PASS |
| `node --check dev/local-runtime/start-local-api-server.mjs` | PASS |
| `node --check dev/local-runtime/team-port-config.mjs` | PASS |
| `node --check dev/scripts/validate-browser-env-agnostic.mjs` | PASS |
| `node --check dev/tests/dev-runtime/TeamAwareBootstrap.test.mjs` | PASS |
| `node --check dev/tests/dev-runtime/LocalApiStartupLogging.test.mjs` | PASS |
| `node --check dev/tests/dev-runtime/StaticWebRootCompatibility.test.mjs` | PASS |
| `node ./dev/scripts/run-node-test-files.mjs dev/tests/dev-runtime/TeamAwareBootstrap.test.mjs dev/tests/dev-runtime/LocalApiStartupLogging.test.mjs dev/tests/dev-runtime/StaticWebRootCompatibility.test.mjs` | PASS, 3/3 files and 18/18 subtests |

## Bootstrap Command Smoke

Each command was started through npm, observed until expected diagnostics printed, and then stopped.

| Command | Result |
| --- | --- |
| `npm run dev:bootstrap -- --team owner` | PASS |
| `npm run dev:api -- --team owner` | PASS |
| `npm run dev:web -- --team owner` | PASS |

Expected diagnostics observed:

- `Mode: bootstrap`, `Team: owner`, `Web URL: http://127.0.0.1:5500`, `API URL: http://127.0.0.1:5501/api`
- `Mode: api`, `Team: owner`, `API URL: http://127.0.0.1:5501/api`
- `Mode: web`, `Team: owner`, `Web URL: http://127.0.0.1:5500`

## Playwright

Not run. This PR moves local developer entrypoint file locations and preserves route behavior. Targeted startup diagnostics and command smoke checks cover the changed surface.
