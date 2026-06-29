# PR_26180_OWNER_022-resolve-remaining-src-dependencies Report

## Executive Summary

Rebuilt PR022 from the migration stack base `PR_26180_OWNER_021-archive-legacy-games-samples-teardown` at `2e38e9e31`, not from `main`.

The rebuilt PR is intentionally narrow:

- Deletes obsolete `src/shared/projectDataStore/inMemoryProjectDataStore.js`.
- Deletes the stale self-test that only validated that obsolete in-memory store.
- Confirms `src/shared/number/numbers.js` is not present on PR021 and the active equivalent remains at `www/src/shared/number/numbers.js`.
- Preserves `-v2` tool contract files because active dev contract tests still import them.
- Preserves manifest-era/sample-era schemas because active validation still references them.
- Updates `www/toolbox/toolRegistry.js` to import the existing `www/src/shared/toolbox/tool-metadata-inventory.js` equivalent rather than traversing to root `src`.

## Branch Model

- Model: Owner stacked PR
- Base branch: `PR_26180_OWNER_021-archive-legacy-games-samples-teardown`
- Base commit: `2e38e9e31`
- Source branch: `PR_26180_OWNER_022-resolve-remaining-src-dependencies`
- Rebuilt from migration stack: YES
- Used `main` as base: NO

## Migration Stack Gates

| Gate | Result |
|---|---:|
| Current branch is not `main` | PASS |
| `www/` exists | PASS |
| `api/` exists | PASS |
| root `assets/` tracked active folder absent | PASS |
| root `games/` tracked active folder absent | PASS |
| root `learn/` tracked active folder absent | PASS |
| root `toolbox/` tracked active folder absent | PASS |

## Root Src Count

- Before: 65 tracked files under `src/`
- After: 64 tracked files under `src/`

## Cleanup Decisions

| Item | Decision | Reason |
|---|---|---|
| `src/shared/projectDataStore/inMemoryProjectDataStore.js` | Deleted | Obsolete in-memory project data store; no active references remain after deleting stale self-test. |
| `dev/tests/shared/InMemoryProjectDataStore.test.mjs` | Deleted | Test only validated the deleted obsolete helper. |
| `src/shared/number/numbers.js` | No action | Root file is absent; active equivalent exists under `www/src/shared/number/numbers.js`. |
| `-v2` tool contract files under `src/shared/contracts/tools/` | Preserved | Active dev contract tests import these modules directly. |
| `src/shared/schemas/game.manifest.schema.json` | Preserved | Active `validate-json-contracts` and fixtures still reference it. |
| `src/shared/schemas/samples/sample.tool-payload.schema.json` | Preserved | Active sample validation reports and `ToolManifestBoundary` still reference it. |
| `www/toolbox/toolRegistry.js` import path | Updated | Existing equivalent is under `www/src/shared/toolbox/`; avoids root `src` traversal. |

## Protected Paths

No files under `dev/workspace/generated/tool-images/**` were touched.

## Validation Summary

- `git diff --check`: PASS
- `npm run validate:canonical-structure`: PASS
- `node --check www/toolbox/toolRegistry.js`: PASS
- Browser registry import smoke: PASS, returned 47 tools
- `node ./dev/tests/shared/ProjectDataStoreContract.test.mjs`: PASS
- `node ./dev/tests/dev-runtime/ArchitectureCleanupApiNavInvitations.test.mjs`: PASS
- `node ./dev/tests/tools/ToolManifestBoundary.test.mjs`: PASS
- Targeted root `src` reference scans: PASS with active references documented and preserved

## Outcome

PR022 has been rebuilt from PR021 and is ready as a narrow migration-stack cleanup branch. It does not attempt broad `src/` retirement.
