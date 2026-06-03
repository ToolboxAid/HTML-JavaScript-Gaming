# PR_26140_039 Intentional Alias Ledger Guard

## Scope
- Used PR_26140_038 as the prior delta.
- Added a narrow intentional import/export alias ledger and guard script.
- Added a dedicated package script: `npm run check:intentional-alias-ledger`.
- Did not rename runtime symbols, change gameplay behavior, change schemas, or perform repo-wide cleanup.

## Guardrail Behavior
- `toolbox/dev/checkIntentionalAliasLedgerGuard.mjs` scans repo-owned JS/MJS under `src`, `games`, `tools`, `tests`, and `samples`.
- It skips `node_modules`, `tmp`, `tests/results`, generated/vendor/minified files, docs report/archive paths, and the archived `toolbox/Vector Map Editor` path.
- It collects import/export statements containing `as` and requires each occurrence to match `toolbox/dev/intentionalAliasLedger.json`.
- The guard also fails if a ledger entry goes stale and no longer matches current code.

## Intentional Alias Ledger Entries
- Engine and shared-tool default public barrels: compatibility public APIs exposing default modules as named exports.
- `src/shared/index.js` shared-family namespace barrels.
- `tests/run-tests.mjs` `run as run...` imports because every Node test module exports `run`.
- Engine and overlay namespace surface tests.
- Shared legacy compatibility comparison tests.
- Shared number legacy bridge local helper name.
- Object Vector Studio V2 local transform adapter aliases.
- Asteroids local `wrap(value, max)` gameplay adapter over the shared `wrap(value, min, max)` helper.

## Validation
- PASS: `node --check toolbox/dev/checkIntentionalAliasLedgerGuard.mjs`.
- PASS: `npm run check:intentional-alias-ledger`.
  - `files_scanned=1772`
  - `aliases_found=297`
  - `ledger_entries=10`
- INFO: `npm run build` is not defined in `package.json`.
- PASS: `npm run build:manifest`; generated `docs/build/sample-manifest.json` was removed after validation.
- PASS: `node tests\games\AsteroidsValidation.test.mjs`.
- PASS: `node tests\games\AsteroidsManifestScreenDimensions.test.mjs`.
- PASS: `node tests\games\AsteroidsPresentation.test.mjs`.
- PASS: `npx playwright test tests/playwright/tools/AsteroidsGameSceneCleanup.spec.mjs --project=playwright --workers=1 --reporter=list`.
- PASS: `node tests\tools\ObjectVectorFinalRuntimeCleanup.test.mjs`.
- PASS: `node tests\tools\ObjectVectorStudioV2DeleteCleanup.test.mjs`.
- PASS: `npx playwright test tests/playwright/tools/ObjectVectorStudioV2FirstClassToolStarter.spec.mjs --project=playwright --workers=1 --reporter=list`.
- PASS: `npm run test:workspace-v2` (58 passed).
- PASS: required alias search completed:
  - `rg -n "^\s*import\b.*\bas\b|^\s*export\b.*\bas\b" src games tools tests samples -g "*.js" -g "*.mjs" -g "!**/node_modules/**" -g "!**/tests/results/**" -g "!docs_build/dev/reports/**" -g "!docs_build/archive/**" -g "!tools/Vector Map Editor/**" -g "!**/generated/**" -g "!**/vendor/**" -g "!**/*.min.js"`
  - Remaining line-level hits are intentional categories covered by the ledger.
- PASS: `git diff --check` returned no whitespace errors; Git reported line-ending normalization warnings only.
- PASS: changed-file guard found no modified node_modules, tests/results, docs_build/dev/reports snapshots, archived tools, generated bundles, vendor files, bundled files, or minified JS files.

## Observed Existing Guard
- INFO: `npm run check:shared-extraction-guard` was run while checking guard patterns and currently fails against its existing baseline with unrelated shared-extraction backlog drift. This PR does not change that guard or its baseline.

## Notes
- The new alias guard is intentionally separate from `pretest` because the existing shared-extraction guard is already noisy against its baseline. The dedicated script gives reviewers and future PRs a precise guardrail without changing runtime behavior.
