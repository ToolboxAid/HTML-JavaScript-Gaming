# Monolithic Test Code Audit

PR: PR_26146_041-monolithic-test-code-audit
Generated: 2026-05-26
Status: PASS, audit-only

## Scope

Inspected:
- `tests/playwright`
- shared Playwright helpers under `tests/helpers`
- `scripts/run-targeted-test-lanes.mjs`
- `scripts/audit-playwright-test-locations.mjs`
- npm test scripts in `package.json`
- Workspace V2 test entry points
- lane manifest, warm-start, and snapshot generation/report artifacts

No test files, helpers, scripts, runtime code, or sample JSON were split or deleted in this PR.

## Summary Findings

| Finding | Status | Notes |
| --- | --- | --- |
| Broad discovery still embedded in old files | DOCUMENTED | Standalone structural audit can enumerate all Playwright buckets, but it is explicit/static and zero-browser. |
| Cross-tool assertions inside single tool tests | FOUND | Workspace spec and several tool specs still validate multiple tool surfaces. |
| Game-specific assertions inside tool tests | MOSTLY CONTAINED | Game-owned specs now live under `tests/playwright/games`; some tool specs use games as explicit fixtures. |
| Workspace tests validating tool runtime behavior | FOUND | `WorkspaceManagerV2.spec.mjs` still contains deep Input Mapping, Object Vector, Text to Speech, Preview Generator, Asset Manager, audio/gameplay, and storage/runtime assertions. |
| Tool tests validating engine behavior | LIMITED | Collision/Object Vector/Preview tests touch engine-like runtime details through explicit tool fixtures; follow-up split may clarify ownership. |
| Helper files owning too much routing logic | FOUND | `run-targeted-test-lanes.mjs` owns routing, preflight, manifests, snapshots, caching, reporting, and execution. |
| Commands triggering broad Playwright unintentionally | NOT FOUND | Remaining broad lane behavior is explicit: `--all` or static audit commands. |
| Files with many unrelated responsibilities | FOUND | Primary: `WorkspaceManagerV2.spec.mjs`; secondary: `run-targeted-test-lanes.mjs`, `AssetManagerV2.spec.mjs`, `PreviewGeneratorV2Baseline.spec.mjs`. |

## Physical File Audit

| File Path | Classification | Reason | Recommended Action | Risk | Required |
| --- | --- | --- | --- | --- | --- |
| `tests/playwright/tools/WorkspaceManagerV2.spec.mjs` | split required | 15,417 lines, 80 tests, and 3,735 `expect` calls. Contains Workspace contract checks plus Input Mapping V2 runtime, Object Vector Studio V2 editor behavior, Text to Speech V2 behavior, Storage Inspector behavior, Preview Generator behavior, Asset Manager behavior, Asteroids audio/gameplay rendering, tool registry, repo discovery, dirty lifecycle, and recovery assertions. | Split into Workspace contract/core lifecycle spec plus tool-runtime, integration, and game-runtime specs. Keep only launch, manifest handoff, palette propagation, toolState open/save, dirty lifecycle, and invalid payload rejection in the Workspace lane. | High | Yes |
| `tests/playwright/tools/AssetManagerV2.spec.mjs` | split required | 1,696 lines. Mostly Asset Manager V2, but also verifies Workspace Manager launch/return/save behavior, tools index registration, Collision Inspector card visibility, planned tool names, Asteroids manifest details, Palette Manager data, and Object Vector payload presence. | Keep Asset Manager runtime assertions in this file; move index registry and cross-tool/workspace-return assertions into integration or Workspace contract fixtures. | Medium | Yes |
| `tests/playwright/tools/PreviewGeneratorV2Baseline.spec.mjs` | split required | 770 lines. Preview Generator checks also launch Palette Manager V2 and Tool Template V2, enumerate sample folders, and exercise batch output fixture behavior. | Keep Preview Generator runtime checks; split Palette Manager coverage and Tool Template launch checks into their own tool/runtime or template contract specs; keep sample folder enumeration explicit. | Medium | Yes |
| `tests/playwright/tools/CollisionInspectorV2.spec.mjs` | requires follow-up investigation | 866 lines. Primarily Collision Inspector V2, but includes Object Vector Studio zoom/world-scale behavior and Asteroids workspace manifest context. These may be valid tool fixtures, but ownership should be documented more narrowly. | Review whether Object Vector zoom/editor-only assertion belongs in Object Vector, Collision Inspector, or integration. Keep Asteroids as an explicit collision fixture if retained. | Medium | Optional |
| `tests/playwright/tools/ObjectVectorStudioV2FirstClassToolStarter.spec.mjs` | already lane-safe | 165 lines and 4 tests. Focuses on Object Vector Studio V2 shell, import validation, workspace nav mode, accordions, and fullscreen shell behavior. | Keep as a focused tool-runtime spec. | Low | No |
| `tests/playwright/integration/GameIndexPreviewManifestResolution.spec.mjs` | split required | 227 lines. Contains targeted Pong handoff tests plus a broad `games index resolves every game thumbnail from manifest preview roles` test that scans every game manifest. The integration lane currently targets Pong with grep, so the broad test is physical residue. | Keep Pong targeted integration tests; move the all-game thumbnail scan into an explicit broad/on-request integration or samples-adjacent smoke command. | Medium | Yes |
| `tests/playwright/games/AsteroidsBackgroundAssetResolution.spec.mjs` | already lane-safe | 202 lines. Game-owned Asteroids background/bezel asset resolution with manifest-role fixtures. | Keep under game-runtime. | Low | No |
| `tests/playwright/games/AsteroidsBeatTiming.spec.mjs` | already lane-safe | 72 lines. Game-owned Asteroids beat cadence behavior. | Keep under game-runtime. | Low | No |
| `tests/playwright/games/AsteroidsGameSceneCleanup.spec.mjs` | already lane-safe | 82 lines. Game-owned Asteroids smoke/debug diagnostics. | Keep under game-runtime. | Low | No |
| `tests/playwright/games/AsteroidsShipStateVisuals.spec.mjs` | already lane-safe | 106 lines. Game-owned Asteroids visual-state rendering check; currently has a known runtime assertion failure for missing `destroyed` state. | Keep under game-runtime; handle the known failing expectation in a separate game-runtime PR. | Medium | No |
| `scripts/run-targeted-test-lanes.mjs` | split required | 5,744 lines. Owns lane definitions, CLI parsing, command execution, routing validation, preflight, manifests, snapshots, warm starts, validation caching, failure fingerprinting, slow-path reports, monolith reports, and final reports. Behavior is lane-safe, but physical ownership is too broad. | Split into focused modules for lane definitions, CLI/options, manifest/snapshot validation, scheduler, command execution, and report writers. Do this gradually with snapshot-preserving validation. | High | Yes |
| `scripts/audit-playwright-test-locations.mjs` | requires follow-up investigation | 1,242 lines. Static ownership audit intentionally owns broad zero-browser scans, scoped discovery checks, import validation, fixture ownership, helper naming, and report generation. | Keep as explicit static audit for now; consider extracting shared classification helpers after runner split starts. | Medium | Optional |
| `tests/helpers/playwrightV8CoverageReporter.mjs` | requires follow-up investigation | 470 lines. Shared helper owns coverage collection, catalog reconciliation, and report formatting across tool/Workspace browser suites. | Consider splitting coverage collection from report rendering/catalog checks. Keep helper shared until more coverage consumers exist. | Medium | Optional |
| `tests/helpers/runtimeSceneLoaderHotReload.helpers.mjs` | requires follow-up investigation | 236 lines. Shared runtime helper outside Playwright lane buckets; not currently part of the targeted Playwright lane paths. | Confirm whether this belongs under engine/runtime test helpers or game fixtures in a future helper ownership pass. | Low | Optional |
| `tests/helpers/playwrightRepoServer.mjs` | already lane-safe | 80 lines. Shared HTTP repo server fixture used by tool, game, and integration lanes. | Keep as shared helper. | Low | No |
| `tests/helpers/playwrightStorageIsolation.mjs` | already lane-safe | 34 lines. Focused storage cleanup helper. | Keep as shared helper. | Low | No |
| `tests/helpers/workspaceV2CoverageReporter.mjs` | keep as compatibility wrapper | 4 lines. Thin compatibility wrapper around shared V8 coverage reporting. | Keep until all call sites import the generic reporter directly. | Low | No |
| `tests/helpers/testCoverageCatalog.mjs` | already lane-safe | 39 lines. Catalog-only helper. | Keep as shared helper. | Low | No |
| `tests/helpers/playwrightCtrlTapClick.mjs` | already lane-safe | 10 lines. Focused interaction helper. | Keep as shared helper. | Low | No |

## Command Audit

| Command | Classification | Reason | Recommended Action | Risk | Required |
| --- | --- | --- | --- | --- | --- |
| `npm run test:lanes` | already lane-safe | No-lane runner defaults to safe zero-runtime mode after PR_26146_039. | Keep as targeted runner entry. | Low | No |
| `npm run test:lanes:preflight` | already lane-safe | Zero-browser preflight only. | Keep. | Low | No |
| `npm run test:playwright:zero-browser` | already lane-safe | Zero-browser preflight only. | Keep. | Low | No |
| `npm run test:playwright:static` | already lane-safe | Static runner only. | Keep. | Low | No |
| `npm run test:lane:workspace-contract` | already lane-safe | Routes through `run-targeted-test-lanes.mjs --lane workspace-contract`; physical spec remains monolithic. | Keep command; split underlying Workspace spec later. | Medium | No |
| `npm run test:lane:tool-runtime` | already lane-safe | Routes through targeted lane runner. | Keep. | Low | No |
| `npm run test:lane:game-runtime` | already lane-safe | Routes through targeted lane runner. | Keep. | Low | No |
| `npm run test:lane:integration` | already lane-safe | Routes through targeted lane runner. | Keep. | Low | No |
| `npm run test:lane:engine-src` | already lane-safe | Routes to targeted Node engine/src tests. | Keep. | Low | No |
| `npm run test:lane:samples` | keep as compatibility wrapper | Explicit `samples` lane with `--include-samples`; not default. | Keep explicit/on-request only. | Medium | No |
| `npm run test:workspace-v2` | keep as compatibility wrapper | Redirects to `workspace-contract` lane and no longer launches Playwright directly. | Keep compatibility script while splitting Workspace spec. | Medium | No |
| `npm run test:audit:locations` | keep as compatibility wrapper | Broad file enumeration is explicit, static, and zero-browser. | Keep; document as broad static audit only. | Low | No |
| `npm run test:playwright:structure` | keep as compatibility wrapper | Alias for static structure audit; broad but zero-browser and explicit. | Keep. | Low | No |
| `npm run test:asset-manager-v2` | keep as compatibility wrapper | Direct Playwright command but names one explicit spec; bypasses lane preflight. | Keep temporarily for developer convenience; prefer `npm run test:lane:tool-runtime` for PR validation. | Low | No |
| `npm run test:preview-generator-v2` | keep as compatibility wrapper | Direct Playwright command but names one explicit spec; bypasses lane preflight. | Keep temporarily for developer convenience; prefer `npm run test:lane:tool-runtime` for PR validation. | Low | No |
| `npm run test:launch-smoke` | requires follow-up investigation | Node runtime smoke can be broad by design but is not part of targeted Playwright lanes. | Document as explicit smoke/UAT command and keep out of default targeted validation. | Medium | Optional |
| `npm run test:launch-smoke:games` | requires follow-up investigation | Broad game runtime launch smoke; not Playwright but may be costly. | Keep explicit/on-request; consider lane labeling if used in future validation reports. | Medium | Optional |
| `npm run test:workspace-manager:games` | requires follow-up investigation | Workspace/game index runtime entry point outside lane runner. | Confirm whether this belongs under integration or recovery/UAT lane documentation. | Medium | Optional |
| `npm run test:manifest-payload:games` | requires follow-up investigation | Game manifest payload command outside lane runner. | Confirm whether this is game-runtime, engine parser, or samples-adjacent validation. | Medium | Optional |
| `npm run test:sample-standalone:data-flow` | requires follow-up investigation | Sample-related runtime command outside default samples lane. | Keep explicit/on-request; do not use as implicit PR gate. | Medium | Optional |

## Lane Manifest And Snapshot Audit

| File Path | Classification | Reason | Recommended Action | Risk | Required |
| --- | --- | --- | --- | --- | --- |
| `docs_build/dev/reports/lane_manifests/workspace-contract.json` | already lane-safe | Persisted manifest names one Workspace spec, 13 explicit fixtures, and 4 helpers. | Keep generated artifact; regenerate through targeted runner. | Low | No |
| `docs_build/dev/reports/lane_manifests/tool-runtime.json` | already lane-safe | Persisted manifest names 3 tool specs, 4 explicit fixtures, and 4 helpers. | Keep generated artifact; split physical tool specs separately. | Low | No |
| `docs_build/dev/reports/lane_manifests/game-runtime.json` | already lane-safe | Persisted manifest names 4 game specs, 1 fixture, and 3 helpers. | Keep generated artifact. | Low | No |
| `docs_build/dev/reports/lane_manifests/integration.json` | already lane-safe | Persisted manifest names 1 integration spec, 1 fixture, and 4 helpers. | Keep generated artifact; split broad all-game test from physical spec later. | Low | No |
| `docs_build/dev/reports/lane_manifests/engine-src.json` | already lane-safe | Persisted manifest names 11 targeted Node tests and no browser helpers/fixtures. | Keep generated artifact. | Low | No |
| `docs_build/dev/reports/lane_snapshots/*.json` | already lane-safe | Snapshot files mirror lane ownership metadata and dependency graph hashes. | Keep generated artifacts; regenerate when lane inputs change. | Low | No |
| `docs_build/dev/reports/lane_warm_starts/*.json` | already lane-safe | Warm-start files are lane-scoped and versioned. | Keep generated artifacts. | Low | No |

## Proposed Follow-Up PRs

| Proposed PR | Purpose | Blocks Current PR? |
| --- | --- | --- |
| `PR_26146_042-workspace-v2-spec-contract-split` | Split `WorkspaceManagerV2.spec.mjs` into Workspace contract core plus first extraction targets for tool-runtime/integration/game assertions. | No |
| `PR_26146_043-lane-runner-module-boundaries` | Extract lane definitions, CLI parsing, manifest/snapshot validation, scheduler, command execution, and report writers from `run-targeted-test-lanes.mjs`. | No |
| `PR_26146_044-tool-runtime-spec-ownership-split` | Split Asset Manager and Preview Generator mixed tool/index/template assertions into focused tool/integration/template specs. | No |
| `PR_26146_045-integration-broad-thumbnail-scan-isolation` | Move the all-game thumbnail integration scan into an explicit broad/on-request integration command. | No |
| `PR_26146_046-shared-helper-ownership-pass` | Review coverage reporter and runtime scene loader helper placement after runner/spec splits. | No |

## Validation

- PASS: `PLAYWRIGHT_BROWSERS_PATH=0 node ./scripts/run-targeted-test-lanes.mjs --zero-browser-only`
- PASS: `node ./scripts/audit-playwright-test-locations.mjs`
- PASS: `node --check scripts/run-targeted-test-lanes.mjs`
- PASS: `node --check scripts/audit-playwright-test-locations.mjs`
- PASS: `package.json` parse check
- Full samples smoke: SKIP, no sample JSON or shared sample loader/framework changes.
- Targeted Playwright lanes: SKIP, no executable test routing changed.
