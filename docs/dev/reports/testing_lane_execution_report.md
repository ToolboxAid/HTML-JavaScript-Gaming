# Testing Lane Execution Report

Generated: 2026-05-26T19:05:55.095Z
Dry run: No

## Summary

PASS: 2
WARN: 0
FAIL: 0
SKIP: 3

## Full Samples Smoke

Status: SKIP
Reason: Skipped because changed files do not modify sample JSON or shared sample loader/framework behavior.

## Preflight

Status: PASS
Reason: Runner preflight and Playwright structure audit passed before expensive lane execution.
Command: C:\nvm4w\nodejs\node.exe scripts/audit-playwright-test-locations.mjs
Details: Lane tool-runtime grep pattern is passed as a literal Node argv value: launch guard|temporary UAT context|rejects non-Workspace

## Dependency Gate

Status: PASS
Reason: No deterministic dependency failures before runtime.

## Runtime Scheduling

Status: PASS
Scheduled lane order: tool-runtime, integration
Reused runtime sessions: 2
Prevented redundant browser launches: 1
Prevented redundant lane execution: 3

## Validation Sequence

- PASS zero-browser preflight first: `npm run test:playwright:zero-browser`
- PASS lane compilation validation second: `node ./scripts/run-targeted-test-lanes.mjs --zero-browser-only --lanes tool-runtime,integration`
- PASS affected targeted runtime lanes after dependency validation: `PLAYWRIGHT_BROWSERS_PATH=0 node ./scripts/run-targeted-test-lanes.mjs --lanes tool-runtime,integration`
- SKIP Workspace V2 lane: no Workspace V2 contract behavior was changed, and workspace-contract lane was not in scope.
- SKIP full samples smoke: changed files do not modify sample JSON or shared sample loader/framework behavior.

## Lanes

| Lane | Status | Executed/Skipped Reason | Affected Surface | Fixtures / Inputs |
| --- | --- | --- | --- | --- |
| workspace-contract | SKIP | Lane was not selected for this targeted run. | Workspace Manager V2 contract and lifecycle behavior | tests/fixtures/workspace-v2/uat.manifest.json; mocked File System Access repo handles; explicit game manifest/toolState payloads |
| tool-runtime | PASS | Tool runtime lane validates focused tool behavior without treating unrelated stale product assertions as blockers. | First-class tool runtime behavior | tool-specific mocked repo/file picker inputs; explicit manifest/toolState launch contexts |
| integration | PASS | Integration lane validates explicit cross-surface handoffs only; broad all-game thumbnail coverage is outside the default targeted lane. | Workspace, tool, game index, and manifest handoff behavior | repo game manifests; manifest preview asset roles; repo-served browser pages |
| engine-src | SKIP | Lane was not selected for this targeted run. | src/ engine and shared runtime capability behavior | explicit node unit fixtures; fresh in-memory localStorage/sessionStorage mocks per file |
| samples | SKIP | Lane was not selected for this targeted run. | Affected samples lane, on request only | sample metadata and validation artifacts; sample structure fixtures |

## Commands

### workspace-contract
- SKIP

### tool-runtime
- PASS C:\nvm4w\nodejs\node.exe C:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming\node_modules\@playwright\test\cli.js test tests/playwright/tools/AssetManagerV2.spec.mjs --grep "launch guard|temporary UAT context|rejects non-Workspace" --project=playwright --workers=1 --reporter=list
- PASS C:\nvm4w\nodejs\node.exe C:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming\node_modules\@playwright\test\cli.js test tests/playwright/tools/PreviewGeneratorV2Baseline.spec.mjs tests/playwright/tools/CollisionInspectorV2.spec.mjs --project=playwright --workers=1 --reporter=list

### integration
- PASS C:\nvm4w\nodejs\node.exe C:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming\node_modules\@playwright\test\cli.js test tests/playwright/integration/GameIndexPreviewManifestResolution.spec.mjs --grep Pong --project=playwright --workers=1 --reporter=list

### engine-src
- SKIP

### samples
- SKIP
