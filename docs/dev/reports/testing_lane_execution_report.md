# Testing Lane Execution Report

Generated: 2026-05-26
PR: PR_26146_024-targeted-test-lanes-and-isolation-execution

## Summary

PASS: 3
WARN: 1
FAIL: 0
SKIP: 1

## Full Samples Smoke

Status: SKIP
Reason: Changed files only add targeted lane execution and Playwright/test isolation infrastructure. No sample JSON, shared sample loader, or sample framework files were changed.

## Lane Results

| Lane | Status | Executed/Skipped Reason | Affected Surface | Evidence |
| --- | --- | --- | --- | --- |
| workspace-contract | WARN | Executed because Workspace V2 test wiring was impacted by Playwright storage isolation. | Workspace Manager V2 contract/lifecycle behavior | `PLAYWRIGHT_BROWSERS_PATH=0 npm run test:lane:workspace-contract` invoked existing `npm run test:workspace-v2`; 64 passed, 8 out-of-scope Workspace/Input Mapping/manifest/Preview Generator expectations failed. |
| tool-runtime | PASS | Executed because tool-runtime lane wiring and storage isolation were added for focused tool suites. | Asset Manager V2, Preview Generator V2, Collision Inspector V2 runtime behavior | `PLAYWRIGHT_BROWSERS_PATH=0 npm run test:lane:tool-runtime`; Asset Manager V2 focused launch/runtime subset 5 passed, Preview Generator V2 7 passed, Collision Inspector V2 4 passed. |
| integration | PASS | Executed because integration lane wiring was added for explicit cross-surface handoff validation. | Game index preview manifest handoff | `PLAYWRIGHT_BROWSERS_PATH=0 npm run test:lane:integration`; focused Pong handoff subset 3 passed. |
| engine-src | PASS | Executed because engine/src lane wiring and node storage isolation were added. | src/ engine and shared runtime capability behavior | `npm run test:lane:engine-src`; 11/11 targeted node test files passed. |
| samples | SKIP | Skipped because samples are on-request or affected-sample only and this PR did not impact samples. | On-request samples lane | Not run. Full samples smoke also skipped. |

## Workspace V2 WARN Details

`npm run test:workspace-v2` was run once through the workspace-contract lane and exited non-zero. The exact failing tests were:

- `Workspace Manager V2 bootstrap > sizes Input Mapping V2 columns and live-highlights mapped non-keyboard inputs`
- `Workspace Manager V2 bootstrap > resolves game manifest schema refs from the game schema during repo discovery`
- `Workspace Manager V2 bootstrap > enables object vector and collision tools only from manifest geometry without fallback defaults`
- `Workspace Manager V2 bootstrap > uses header lifecycle controls and launches tools from fixed Workspace Manager V2 tiles`
- `Workspace Manager V2 bootstrap > keeps Preview Generator V2 repo writer after Asset Manager V2 deletes the preview asset entry`
- `Workspace Manager V2 bootstrap > fails Preview Generator V2 without OK WRITE when live handle read-back verification fails`
- `Workspace Manager V2 bootstrap > loads Gravity Well and Pong manifests as current Workspace Manager V2 manifests`
- `Workspace Manager V2 bootstrap > owns temporary UAT manifest seeding and launches Asset Manager V2 through session context`

These were reported as lane WARN because they are broad Workspace/Input Mapping/manifest/Preview Generator assertions outside this testing-lane infrastructure PR. The full suite was not rerun.

## Static Validation

- PASS `node --check scripts/run-targeted-test-lanes.mjs`
- PASS `node --check scripts/run-node-test-files.mjs`
- PASS `node --check tests/helpers/playwrightStorageIsolation.mjs`
- PASS `node --check tests/playwright/tools/WorkspaceManagerV2.spec.mjs`
- PASS `node --check tests/playwright/tools/AssetManagerV2.spec.mjs`
- PASS `node --check tests/playwright/tools/PreviewGeneratorV2Baseline.spec.mjs`
- PASS `node --check tests/playwright/tools/CollisionInspectorV2.spec.mjs`
- PASS `node --check tests/playwright/games/GameIndexPreviewManifestResolution.spec.mjs`

## Lane Routing Notes

- Targeted execution is now available through `npm run test:lanes` and per-lane scripts.
- `npm run test:workspace-v2` remains unchanged and callable directly.
- The integration lane intentionally validates an explicit Pong handoff subset; broad all-game thumbnail coverage is not part of the default targeted lane.
- The samples lane is available on request through `npm run test:lane:samples`, but the full samples smoke remains manual/on-request unless sample scope is active.
