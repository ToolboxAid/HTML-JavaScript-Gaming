# PR_26139_030 Shared Utils Duplicate Method Extraction Report

## Scope

- Read `docs/dev/PROJECT_INSTRUCTIONS.md` and `tmp/dups.txt`.
- Treated `tmp/dups.txt` as broad duplicate-input signal only; ignored vendor, bundled, Playwright/test-runner, generated, and unrelated tool noise.
- Limited extraction to high-confidence helpers whose behavior matched current callers.

## Changes

- Added shared geometry helpers in `src/shared/utils/geometryUtils.js`:
  - `normalizePoints`
  - `centerPoints`
  - `maxRadius`
- Added exact JSON-clone helper `deepClone` in `src/shared/utils/jsonUtils.js`.
  - Preserved existing `cloneJson` nullish behavior by delegating non-nullish values to `deepClone`.
- Reused existing `asArray` from `src/shared/utils/arrayUtils.js`.
- Reused existing `isRecord` / `isPlainObject` shared guards where local semantics matched.
- Replaced duplicate local helpers in:
  - Asteroids ship, bullet, UFO, ship debris, and asteroid profile geometry modules.
  - Asteroids manifest object geometry loader.
  - Shared Object Vector collision path.
  - Collision Inspector V2 constants.
  - Object Vector Studio V2 app/schema service.

## Deliberate Non-Changes

- Did not merge `src/engine/collision/objectVector.js` local `normalizePoints`; it preserves non-finite point entries via fallback conversion, while the extracted Asteroids helper filters non-finite points.
- Did not normalize broad `sanitizeText`, `normalizeText`, `clamp`, or `toFiniteNumber` duplicates because `tmp/dups.txt` includes many unrelated or semantically different active/tool/vendor definitions.
- Did not touch deprecated Vector Map Editor, Playwright internals, CodeMirror/bundled code, generated artifacts, or test-runner code.

## Validation

- PASS `npm run build:manifest`
- PASS `node tests/games/AsteroidsValidation.test.mjs`
- PASS `node tests/games/AsteroidsPresentation.test.mjs`
- PASS `node tests/tools/ObjectVectorStudioV2DeleteCleanup.test.mjs`
- PASS `npx playwright test tests/playwright/tools/AsteroidsGameSceneCleanup.spec.mjs --project=playwright --workers=1 --reporter=list`
- PASS `npx playwright test tests/playwright/tools/ObjectVectorStudioV2FirstClassToolStarter.spec.mjs --project=playwright --workers=1 --reporter=list`
- PASS `npx playwright test tests/playwright/tools/CollisionInspectorV2.spec.mjs --project=playwright --workers=1 --reporter=list`
- PASS `npx playwright test tests/playwright/tools/AsteroidsGameSceneCleanup.spec.mjs tests/playwright/tools/ObjectVectorStudioV2FirstClassToolStarter.spec.mjs tests/playwright/tools/CollisionInspectorV2.spec.mjs --project=playwright --workers=1 --reporter=list`
- PASS vendor/generated modification check: no `vendor`, bundled, minified, generated, Playwright-report, or test-results paths were modified.
- Advisory Playwright V8 coverage refreshed in `docs/dev/reports/playwright_v8_coverage_report.txt` and `docs/dev/reports/coverage_changed_js_guardrail.txt`.

## Notes

- `npm run build:manifest` generated `docs/build/sample-manifest.json`; it was removed after validation because it is a generated build artifact outside this PR scope.
- Full samples smoke test was skipped; this PR is a scoped helper extraction and requested targeted Asteroids/Object Vector/Collision Inspector validation instead.
