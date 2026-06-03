# Monolithic Test Split Candidates

PR: PR_26146_041-monolithic-test-code-audit
Generated: 2026-05-26
Status: AUDIT ONLY

## Required Split Candidates

| Priority | File Path | Classification | Reason | Recommended Split | Risk | Required | Proposed Follow-Up |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | `tests/playwright/tools/WorkspaceManagerV2.spec.mjs` | split required | 15,417 lines and 80 tests span Workspace contract, multiple tool runtimes, game/runtime behavior, repo discovery, recovery, and UI lifecycle checks. | Keep Workspace contract/lifecycle in the Workspace lane. Move Input Mapping, Object Vector Studio, Text to Speech, Storage Inspector, Preview Generator, Asset Manager, audio/gameplay, and game-specific assertions to their owning lanes. | High | Yes | `PR_26146_042-workspace-v2-spec-contract-split` |
| 2 | `scripts/run-targeted-test-lanes.mjs` | split required | 5,744-line runner owns lane definitions, CLI, preflight, discovery, manifests, snapshots, cache, scheduling, execution, failure classification, and report rendering. | Extract lane definitions, CLI/options, manifest/snapshot validation, warm-start/cache logic, scheduler, command runner, and report writers into focused modules. | High | Yes | `PR_26146_043-lane-runner-module-boundaries` |
| 3 | `tests/playwright/tools/AssetManagerV2.spec.mjs` | split required | Asset Manager tests include tools index, Collision Inspector card, planned tool names, Workspace return/save, Asteroids manifest details, Palette Manager, and Object Vector payload assertions. | Keep Asset Manager tool runtime coverage; move tools-index registration checks to integration/registry coverage and Workspace return/save assertions to Workspace contract/integration. | Medium | Yes | `PR_26146_044-tool-runtime-spec-ownership-split` |
| 4 | `tests/playwright/tools/PreviewGeneratorV2Baseline.spec.mjs` | split required | Preview Generator baseline also launches Palette Manager V2 and Tool Template V2 and includes sample-folder enumeration. | Keep Preview Generator runtime and failure cases; move Palette Manager coverage to Palette Manager/tool-runtime coverage and Tool Template launch checks to template contract coverage. | Medium | Yes | `PR_26146_044-tool-runtime-spec-ownership-split` |
| 5 | `tests/playwright/integration/GameIndexPreviewManifestResolution.spec.mjs` | split required | Contains targeted Pong integration checks plus a broad all-game thumbnail scan; lane command greps Pong so the broad test is no longer part of normal targeted execution. | Keep Pong targeted integration tests; move all-game thumbnail scan into explicit broad/on-request integration or samples-adjacent smoke. | Medium | Yes | `PR_26146_045-integration-broad-thumbnail-scan-isolation` |

## Follow-Up Investigation Candidates

| File Path | Classification | Reason | Recommended Action | Risk | Required | Proposed Follow-Up |
| --- | --- | --- | --- | --- | --- | --- |
| `tests/playwright/tools/CollisionInspectorV2.spec.mjs` | requires follow-up investigation | Includes Collision Inspector coverage plus Object Vector zoom/editor-only and Asteroids workspace manifest context. | Confirm whether Object Vector zoom assertion should move to Object Vector or integration; document retained game fixtures. | Medium | Optional | `PR_26146_044-tool-runtime-spec-ownership-split` |
| `scripts/audit-playwright-test-locations.mjs` | requires follow-up investigation | Static audit is 1,242 lines and owns file discovery, ownership classification, import validation, fixture checks, helper checks, and reports. | Keep as explicit static audit until runner split begins; consider extracting reusable ownership classifiers. | Medium | Optional | `PR_26146_046-shared-helper-ownership-pass` |
| `tests/helpers/playwrightV8CoverageReporter.mjs` | requires follow-up investigation | Shared helper mixes coverage collection, catalog matching, and report formatting. | Split only if more coverage consumers need independent pieces. | Medium | Optional | `PR_26146_046-shared-helper-ownership-pass` |
| `tests/helpers/runtimeSceneLoaderHotReload.helpers.mjs` | requires follow-up investigation | Shared runtime helper is outside Playwright lane buckets and not currently used by targeted Playwright lanes. | Confirm owner: engine/runtime helper, game fixture, or obsolete helper. | Low | Optional | `PR_26146_046-shared-helper-ownership-pass` |
| `npm run test:launch-smoke` | requires follow-up investigation | Broad Node runtime launch smoke outside lane runner. | Keep explicit/on-request; decide whether it belongs to recovery/UAT or samples lane docs. | Medium | Optional | `PR_26146_046-shared-helper-ownership-pass` |
| `npm run test:workspace-manager:games` | requires follow-up investigation | Workspace/game integration command outside lane runner. | Decide whether to route into integration/recovery lane or keep as explicit compatibility smoke. | Medium | Optional | `PR_26146_046-shared-helper-ownership-pass` |
| `npm run test:manifest-payload:games` | requires follow-up investigation | Game manifest payload command outside lane runner. | Decide whether owner is game-runtime, engine parser, or samples-adjacent validation. | Medium | Optional | `PR_26146_046-shared-helper-ownership-pass` |
| `npm run test:sample-standalone:data-flow` | requires follow-up investigation | Sample data-flow command outside samples lane. | Keep explicit/on-request until sample alignment is active. | Medium | Optional | `PR_26146_046-shared-helper-ownership-pass` |

## Keep As Compatibility Wrapper

| File Or Command | Classification | Reason | Recommended Action | Risk | Required |
| --- | --- | --- | --- | --- | --- |
| `npm run test:workspace-v2` | keep as compatibility wrapper | Redirects to `node ./scripts/run-targeted-test-lanes.mjs --lane workspace-contract`. | Keep for existing workflow compatibility. | Low | No |
| `npm run test:audit:locations` | keep as compatibility wrapper | Explicit static structural audit; no browser launch. | Keep. | Low | No |
| `npm run test:playwright:structure` | keep as compatibility wrapper | Alias for static structural audit; no browser launch. | Keep. | Low | No |
| `npm run test:asset-manager-v2` | keep as compatibility wrapper | Explicit single-spec Playwright shortcut; not broad discovery. | Prefer lane command for PR validation, but keep shortcut. | Low | No |
| `npm run test:preview-generator-v2` | keep as compatibility wrapper | Explicit single-spec Playwright shortcut; not broad discovery. | Prefer lane command for PR validation, but keep shortcut. | Low | No |
| `tests/helpers/workspaceV2CoverageReporter.mjs` | keep as compatibility wrapper | Thin wrapper around generic coverage reporter. | Keep until call sites can safely import the generic helper directly. | Low | No |

## Already Lane-Safe Files

| File Path | Classification | Reason | Recommended Action | Risk | Required |
| --- | --- | --- | --- | --- | --- |
| `tests/playwright/tools/ObjectVectorStudioV2FirstClassToolStarter.spec.mjs` | already lane-safe | Focused Object Vector Studio V2 tool starter coverage. | Keep. | Low | No |
| `tests/playwright/games/AsteroidsBackgroundAssetResolution.spec.mjs` | already lane-safe | Game-owned Asteroids manifest asset behavior. | Keep. | Low | No |
| `tests/playwright/games/AsteroidsBeatTiming.spec.mjs` | already lane-safe | Game-owned Asteroids beat timing. | Keep. | Low | No |
| `tests/playwright/games/AsteroidsGameSceneCleanup.spec.mjs` | already lane-safe | Game-owned Asteroids gameplay smoke/debug diagnostics. | Keep. | Low | No |
| `tests/playwright/games/AsteroidsShipStateVisuals.spec.mjs` | already lane-safe | Game-owned Asteroids visual-state behavior, though currently failing. | Keep in game-runtime and fix behavior separately. | Medium | No |
| `tests/helpers/playwrightRepoServer.mjs` | already lane-safe | Focused shared repo server fixture. | Keep. | Low | No |
| `tests/helpers/playwrightStorageIsolation.mjs` | already lane-safe | Focused storage cleanup helper. | Keep. | Low | No |
| `tests/helpers/testCoverageCatalog.mjs` | already lane-safe | Focused coverage catalog helper. | Keep. | Low | No |
| `tests/helpers/playwrightCtrlTapClick.mjs` | already lane-safe | Focused input helper. | Keep. | Low | No |
| `docs_build/dev/reports/lane_manifests/*.json` | already lane-safe | Persisted lane inputs are lane-scoped and versioned. | Keep generated by runner. | Low | No |
| `docs_build/dev/reports/lane_snapshots/*.json` | already lane-safe | Snapshot artifacts are lane-scoped and versioned. | Keep generated by runner. | Low | No |
| `docs_build/dev/reports/lane_warm_starts/*.json` | already lane-safe | Warm-start artifacts are lane-scoped and versioned. | Keep generated by runner. | Low | No |

## Split Order Recommendation

1. Split `WorkspaceManagerV2.spec.mjs` first because it is the largest physical monolith and contains cross-owner runtime assertions.
2. Split `run-targeted-test-lanes.mjs` second, after spec ownership is clearer, so report and lane behavior can remain stable.
3. Split mixed tool-runtime specs (`AssetManagerV2`, `PreviewGeneratorV2Baseline`) into tool-owned and integration-owned surfaces.
4. Isolate the all-game thumbnail scan into explicit broad/on-request validation.
5. Revisit helper ownership after the large split points stop changing.
