# PR_26140_034-shared-utils-phase-3 Report

## Scope
- Continued Phase 3 shared utility cleanup from PR_26140_033.
- Extracted only behavior-identical helpers and switched local duplicates to shared imports.
- Did not change gameplay logic, schema behavior, manifest contracts, generated/vendor/archive files, or report snapshots.

## Implementation Summary
- Added shared `normalizePathSeparators` to `src/shared/string/stringHelpers.js` and exported it through shared string/utils indexes.
- Replaced behavior-identical local text helpers with shared `normalizeText` and `sanitizeText` imports across active game/tool/shared modules.
- Replaced array-rejecting object helpers with shared `asObject`; replaced array-allowing pipeline helpers with shared `toObject` where semantics matched.
- Replaced duplicated finite number helpers with shared `toFiniteNumber` or `asFiniteNumber` in runtime, games, and Collision Inspector V2.
- Kept local helpers where semantics differ, including path helpers with slash-collapse/fallback differences and geometry point helpers with invalid-point/rounding differences.

## Duplicate Scanner Results
Source: `tools/shared/powerShell/find_dupes_called.ps1`, refreshed to `tmp/dupes_called.txt`.

| Candidate | Before Phase 3 | After Phase 3 | Notes |
| --- | ---: | ---: | --- |
| `sanitizeText` | 38 | 8 | Remaining hits are samples and an old report snapshot, out of PR scope. |
| `normalizeText` | 11 | 4 | Remaining active hits differ by lowercase semantics or deprecated tool scope; samples are out of scope. |
| `normalizePath` | 4 | 2 | Remaining active helpers differ by fallback, trimming, or slash-collapse behavior. |
| `asObject` | 8 | 2 | Remaining duplicate includes sample runtime plus shared utility. |
| `toFiniteNumber` | 4 | 0 | Consolidated. |
| `numberValue` | 2 | 0 | Consolidated active engine/tool numeric helpers; unrelated DOM-specific helper remains outside matched duplicate line. |
| `normalizePoint` | 2 | 2 | Kept local because invalid point handling differs. |
| `normalizePoints` | 2 | 2 | Kept local because filtering/rounding semantics differ. |
| `toObject` | 2 | 2 | Remaining duplicate includes old report snapshot plus shared utility. |
| `node_modules` paths | not found | not found | Scanner output stayed focused away from dependency tree. |

## Remaining Repo-Owned Candidates
- `src/engine/runtime/fullscreenBezel.js` and `tools/preview-generator-v2/PreviewGeneratorV2RepoAccess.js` both contain `normalizePath`, but they do not have identical behavior.
- `tools/shared/assetPipelineConverters.js` has a path normalizer built around `normalizeProjectRelativePath` and fallback behavior, so it was left local.
- `tools/asset-manager-v2/js/assetPreviewHelpers.js` has `normalizeText` with lowercase semantics, so it was not merged into the trim-only helper.
- `src/engine/collision/objectVector.js` and `tools/shared/vector/vectorAssetContract.js` keep separate `normalizePoint(s)` helpers because invalid point and precision behavior differ.
- Sample-phase helpers and old report snapshots are intentionally out of scope for this PR.

## Validation
- PASS: `npm run build:manifest`
- PASS: `node tests/games/AsteroidsValidation.test.mjs`
- PASS: `node tests/games/AsteroidsManifestScreenDimensions.test.mjs`
- PASS: `node tests/games/AsteroidsPresentation.test.mjs`
- PASS: `node tests/tools/ObjectVectorFinalRuntimeCleanup.test.mjs`
- PASS: `node tests/tools/ObjectVectorStudioV2DeleteCleanup.test.mjs`
- PASS: `npm run test:workspace-v2` (58 passed)
- PASS: `npx playwright test tests/playwright/tools/ObjectVectorStudioV2FirstClassToolStarter.spec.mjs --project=playwright --workers=1 --reporter=list` (4 passed)
- PASS: `npx playwright test tests/playwright/tools/CollisionInspectorV2.spec.mjs --project=playwright --workers=1 --reporter=list` (4 passed)
- PASS: `npx playwright test tests/playwright/tools/AsteroidsGameSceneCleanup.spec.mjs --project=playwright --workers=1 --reporter=list` (1 passed)
- PASS: `tools/shared/powerShell/find_dupes_called.ps1` rerun and summarized above.
- PASS: `git diff --check` (only existing CRLF normalization warnings reported; no whitespace errors).

## Playwright Impact
Playwright impacted: Yes. Shared runtime/tool JavaScript imports changed, so Workspace Manager V2, Object Vector Studio V2, Collision Inspector V2, and Asteroids gameplay smoke were validated.

## Coverage
- Produced advisory Playwright V8 coverage artifacts at `docs/dev/reports/playwright_v8_coverage_report.txt` and `docs/dev/reports/coverage_changed_js_guardrail.txt`.
- Missing changed runtime JS coverage is reported as WARN per project rules, not FAIL.

## Full Samples Smoke
Skipped. This PR is a scoped utility extraction with targeted Workspace, Asteroids, Object Vector Studio V2, and Collision Inspector V2 validation; it does not broadly change the sample loader/framework.

## Manual Validation Notes
1. Open Workspace Manager V2 and confirm repo selection still populates games/tools.
2. Launch Object Vector Studio V2 and Collision Inspector V2 from Workspace Manager V2.
3. Launch Asteroids and confirm normal gameplay render/collision behavior.
4. Review `tmp/dupes_called.txt` for remaining out-of-scope duplicate candidates listed above.
