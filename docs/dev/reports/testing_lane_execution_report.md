# PR_26146_042 Testing Lane Execution Report

## Summary

Targeted workflow remained active. Zero-browser validation ran first, then only affected tool-runtime and integration lanes ran. Workspace, game-runtime, engine/src, and samples lanes were skipped because this PR changed test ownership/routing only.

## Executed Lanes

| Lane | Reason executed | Result | Browser-backed invocations | Evidence |
| --- | --- | --- | --- | --- |
| zero-browser preflight | Required before any Playwright/browser startup after lane routing and spec ownership changes. | PASS | 0 | `PLAYWRIGHT_BROWSERS_PATH=0 node ./scripts/run-targeted-test-lanes.mjs --zero-browser-only` |
| tool-runtime | Tool-owned specs were split and tool-runtime lane targets changed. | PASS | 2 Playwright command groups | 5 Asset Manager targeted tests passed; 11 Preview/Collision/Palette/Template tests passed. |
| integration | Integration spec ownership and routing changed. | PASS | 1 Playwright command group | 3 Pong manifest handoff tests and 1 tools index registration test passed. |

## Skipped Lanes

| Lane | Reason skipped | Status |
| --- | --- | --- |
| workspace-contract | `WorkspaceManagerV2.spec.mjs` and workspace contract routing were not modified. | SKIP |
| game-runtime | No game-owned tests or runtime files changed. | SKIP |
| engine-src | No `src/`, engine, or shared runtime code changed. | SKIP |
| samples | Full samples smoke was out of scope and no sample loader or sample JSON changed. | SKIP |
| recovery/UAT | No recovery/UAT lane scope was changed. | SKIP |

## Static And Syntax Validation

| File set | Result |
| --- | --- |
| Playwright structure/ownership audit | PASS via `npm run test:playwright:structure` |
| `scripts/run-targeted-test-lanes.mjs` | PASS via `node --check` |
| Changed tool specs | PASS via `node --check` |
| Changed integration specs | PASS via `node --check` |

## Routing Observations

- Targeted integration no longer depends on `--grep "Pong"` to avoid broad execution.
- The all-game thumbnail scan is isolated in `GameIndexPreviewManifestBroadScan.spec.mjs` and is not part of the default targeted integration lane.
- Tool-runtime keeps focused tool specs under `tests/playwright/tools`.
- Tools index registration coverage moved to `tests/playwright/integration`.
- No broad samples smoke ran.
- No Workspace lane ran.

## Interim Failure Handling

The first integration execution after the split exposed stale tools-index assertions in the moved registration test. The assertions were updated to match current live card and planned-grid behavior, then only the integration lane was rerun. The final integration lane passed.
