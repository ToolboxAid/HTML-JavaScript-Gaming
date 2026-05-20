# PR_26140_035 Shared Utils Phase 4 Finalization Report

## Scope
- Continued shared utility normalization cleanup from PR_26140_034.
- Migrated only behavior-identical active helper implementations to shared utility modules.
- Kept gameplay, schema behavior, manifest contracts, and public APIs intact.
- Did not touch node_modules, tests/results, docs/dev/report snapshots, archived tools, generated bundles, or broad formatting-only files in the final content diff.

## Implementation Summary
- Reused shared `asArray` in `games/index.render.js`, tool pipeline helpers, `debugInspectorData`, and 3D debug utilities.
- Reused shared object/record guards in active tool validators/loaders where local semantics matched non-array object checks.
- Preserved stricter prototype-based `isPlainObject` checks in network contracts because their semantics differ.
- Reused shared JSON `deepClone` for behavior-identical JSON clone wrappers in network, Asset Manager V2, Text to Speech V2, Workspace Manager V2, and Settings System code.
- Reused shared finite-number coercion in 3D physics helpers.
- Added shared `near(a, b, epsilon = 0.5)` and routed Pacman AI callers through it.
- Re-exported Asteroids `randomRange` from the shared math utility while preserving its public game utility API.
- Re-exported `isRecord` from the shared type guard in `GameManifestLoader` while preserving its public export.

## Duplicate Scanner Results
Source: `tools/shared/powerShell/find_dupes_called.ps1`, refreshed to `tmp/dupes_called.txt`.

| Candidate | PR034 Count | PR035 Count | Notes |
| --- | ---: | ---: | --- |
| `function isPlainObject(value)` | 14 | 6 | Remaining active engine copies use stricter prototype checks; archive/sample hits are out of scope. |
| `function asArray(value)` | 7 | 2 | Remaining hit is sample plus shared helper. |
| `export function asArray(value)` | 2 | 0 | 3D debug utility now reuses shared export. |
| `function clone(value)` | 19 | 2 | Remaining clones are Vector Map Editor files, left out because that tool is deprecated/out of scope. |
| `function toFinite(value...)` | 3 | 0 | Consolidated active 3D physics helpers. |
| `function near(a, b, epsilon = 0.5)` | 2 | 0 | Consolidated Pacman AI helpers into shared math. |
| `export function asFinite(value, fallback = 0)` | 2 | 0 | 3D debug utility now reuses shared export. |
| `function normalizeText(value)` | 4 | 4 | Remaining active helper lowercases or sits in stale/non-V2 tool scope; sample hits out of scope. |
| `function normalizePath(value)` | 2 | 2 | Remaining helpers differ by fallback/trimming/slash-collapse behavior. |
| `function normalizePoint(point)` | 2 | 2 | Kept local because invalid point handling differs. |
| `function normalizePoints(points)` | 2 | 2 | Kept local because filtering/rounding semantics differ. |
| `function toObject(value)` | 2 | 2 | Remaining duplicate includes old report snapshot plus shared utility. |
| `node_modules` paths | not found | not found | Scanner stayed focused away from dependency tree. |

## Remaining Repo-Owned Candidates
- `src/engine/network/*Contract.js` strict `isPlainObject` helpers intentionally require `Object.getPrototypeOf(value) === Object.prototype`; shared non-array object guards would broaden accepted inputs.
- `src/engine/runtime/fullscreenBezel.js` and `tools/preview-generator-v2/PreviewGeneratorV2RepoAccess.js` path helpers differ in coercion and slash normalization semantics.
- `src/engine/collision/objectVector.js` and `tools/shared/vector/vectorAssetContract.js` point helpers differ in invalid point handling and precision behavior.
- `src/engine/rendering/ObjectVectorRuntimeAssetService.js` and Object Vector Studio V2 shape helpers look similar but have different triangle/square normalization responsibilities.
- Vector Map Editor clone helpers remain because the tool is deprecated/out of PR scope.
- Sample-phase and report snapshot duplicates remain out of scope by request.

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
- PASS: duplicate scanner rerun and summarized above.
- PASS: `git diff --check` (CRLF normalization warnings only; no whitespace errors).

## Playwright Impact
Playwright impacted: Yes. Shared runtime/tool imports changed across Workspace Manager V2, Object Vector Studio V2, Collision Inspector V2, and game/runtime code paths. Expected pass behavior is unchanged tool launch/load/collision/render behavior. Expected fail behavior would be import errors, page errors, failed tool launch, or schema/load regressions; none appeared in the final passing runs.

## Coverage
- Advisory Playwright V8 coverage artifacts were refreshed at `docs/dev/reports/playwright_v8_coverage_report.txt` and `docs/dev/reports/coverage_changed_js_guardrail.txt`.
- Missing changed runtime JS coverage is reported as WARN per project rules, not FAIL.

## Full Samples Smoke
Skipped. This PR is a scoped utility extraction/refactor and was covered by targeted Workspace, Asteroids, Object Vector Studio V2, and Collision Inspector V2 validation; it does not broadly change the sample loader/framework.

## Manual Validation Notes
1. Open Workspace Manager V2, select the repo, and confirm game/tool loading still works.
2. Launch Object Vector Studio V2 and Collision Inspector V2 from Workspace Manager V2.
3. Launch Asteroids and confirm normal gameplay smoke behavior.
4. Review `tmp/dupes_called.txt` for remaining out-of-scope duplicate helper candidates.
