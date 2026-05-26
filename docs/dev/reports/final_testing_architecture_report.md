# PR_26146_043 Final Testing Architecture Report

Generated: 2026-05-26
Status: PASS

## Final Lane Ownership Model

| Lane | Ownership | Authoritative scope |
| --- | --- | --- |
| `workspace-contract` | Workspace contract | Workspace Manager V2 launch, manifest handoff, toolState open/save, invalid payload handling, and lifecycle contracts. It is isolated from `tool-runtime` scheduling. |
| `tool-runtime` | Tools | First-class tool runtime behavior for Asset Manager, Preview Generator, Collision Inspector, Palette Manager, and Tool Template. |
| `game-runtime` | Games | Explicit game-owned Playwright behavior, currently Asteroids runtime and asset/visual checks. |
| `engine-src` | Engine | Node tests for reusable engine, input, render, asset, and audio runtime modules. |
| `integration` | Integration | Cross-surface handoffs such as game index manifest preview resolution and tools index registration. |
| `samples` | Samples | Explicit samples lane only; not full samples smoke. |

Workspace contract assertions stay isolated from tool runtime assertions by lane routing: `tool-runtime` no longer reaches `WorkspaceManagerV2.spec.mjs`, and `workspace-contract` remains selected only by `--lane workspace-contract`, `test:lane:workspace-contract`, or the compatibility `test:workspace-v2` wrapper.

## Operational Architecture

| Principle | Final state |
| --- | --- |
| Targeted lanes are authoritative default | `npm run test:lanes` has safe no-lane mode; runtime starts only for explicit lanes or `--all`. |
| Broad Workspace/full samples are explicit/on-request only | Workspace compatibility routes to `workspace-contract`; samples require the samples lane wrapper and `--include-samples`; full samples smoke was not run. |
| Deterministic failures stop before runtime | Lane registration, runner preflight, scoped discovery, manifest input validation, warm-start validation, snapshot validation, lane compilation, and dependency gating precede runtime scheduling. |
| Manifest/snapshot reuse remains authoritative | Selected affected lanes regenerate/reuse persistent manifests, warm starts, and lane snapshots before runtime. |
| Zero-browser preflight remains authoritative | Zero-browser preflight ran first and passed before targeted lanes were launched. |
| Broad discovery fallback is prohibited | Lane manifests now use only explicit `discoveryTargets`; command targets missing from those targets fail preflight. |

## Accepted Routing Layers

| Layer | Status | Notes |
| --- | --- | --- |
| `package.json` lane scripts | Accepted | `test:lane:*` scripts route through `scripts/run-targeted-test-lanes.mjs`. |
| `test:workspace-v2` | Accepted compatibility wrapper | Preserved because existing workflows use it; it routes to `workspace-contract`. |
| Static structure/audit scripts | Accepted explicit broad zero-browser layer | Preserved because they inspect broad Playwright structure without browser startup. |
| Direct Playwright package scripts | Removed | The obsolete Asset Manager and Preview Generator shortcuts were removed. |
| Runner lane manifest validation | Accepted authoritative layer | Explicit targets, manifests, warm starts, and snapshots define lane inputs. |

## Remaining Intentionally Expensive Tests

| Test or command | Owner | Execution policy |
| --- | --- | --- |
| `tests/playwright/tools/WorkspaceManagerV2.spec.mjs` | Workspace contract | Run only through `workspace-contract` selection. |
| `tests/playwright/integration/GameIndexPreviewManifestBroadScan.spec.mjs` | Integration broad scan | Explicit/on-request only; outside targeted integration defaults. |
| `npm run test:launch-smoke` | Runtime smoke | Explicit/on-request only. |
| `npm run test:launch-smoke:games` | Game runtime smoke | Explicit/on-request only. |
| `npm run test:workspace-manager:games` | Workspace/game runtime | Explicit/on-request only. |
| `npm run test:manifest-payload:games` | Game manifest payload | Explicit/on-request only. |
| `npm run test:sample-standalone:data-flow` | Samples/runtime | Explicit/on-request only. |
| `npm run test:lane:samples` | Samples | Explicit samples lane only; not full samples smoke. |

## Remaining Accepted Technical Debt

| Item | Accepted debt |
| --- | --- |
| `tests/playwright/tools/WorkspaceManagerV2.spec.mjs` | Physical file remains large and under `tests/playwright/tools`; lane routing keeps it isolated from tool-runtime until a dedicated Workspace spec relocation/split is approved. |
| `scripts/run-targeted-test-lanes.mjs` | Runner still owns many responsibilities physically; this PR only removed obsolete routing and fallback behavior. |
| `scripts/audit-playwright-test-locations.mjs` | Static audit remains broad by design and zero-browser. |
| `tests/helpers/playwrightV8CoverageReporter.mjs` | Coverage collection/reporting remains shared until more consumers justify splitting it. |
| `tests/helpers/runtimeSceneLoaderHotReload.helpers.mjs` | Helper ownership remains future cleanup scope. |
| `tests/playwright/tools/CollisionInspectorV2.spec.mjs` | Retained as current tool-runtime coverage with explicit game fixtures. |

## Before And After Cleanup Observations

| Area | Before | After |
| --- | --- | --- |
| Package runtime entry points | Direct tool Playwright shortcuts existed outside lane preflight. | Browser-backed tool validation enters through `tool-runtime`. |
| Lane manifests | Engine/samples targets could be inferred from command args. | Engine/samples targets are explicit manifest inputs. |
| Discovery fallback | Missing `discoveryTargets` could be hidden by command-target fallback. | Missing target declarations fail before runtime. |
| Tool/Workspace isolation | Tool lane already skipped Workspace spec, but direct tool scripts still bypassed runner safeguards. | Tool runtime uses the lane runner only; Workspace remains a separate compatibility-routed lane. |
