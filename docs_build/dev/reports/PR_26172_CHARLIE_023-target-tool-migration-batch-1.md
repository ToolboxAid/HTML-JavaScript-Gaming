# PR_26172_CHARLIE_023-target-tool-migration-batch-1

Status: PARTIAL PASS with documented external validation blockers.

Branch: `PR_26172_CHARLIE_repository-compliance-stack`

## Purpose

Migrate the first SAFE target tool from `PR_26172_CHARLIE_022-target-tool-migration-audit` into canonical tool asset structure.

## Tool Selected

Selected SAFE tool: Objects.

Reason:
- Objects had one active page script and one small API wrapper.
- No tool-specific CSS was present.
- Inline script, inline style, and inline event handler findings were zero.
- Direct tests existed for the Objects tool.

## Files Changed

- `assets/toolbox/objects/js/index.js`
- `toolbox/objects/index.html`
- `scripts/validate-browser-env-agnostic.mjs`
- `scripts/validate-canonical-repository-structure.mjs`
- `tests/dev-runtime/ProductDataProviderContractHardening.test.mjs`
- `tests/playwright/tools/ObjectsTool.spec.mjs`
- Removed `toolbox/objects/objects-api-client.js`
- Removed active path `toolbox/objects/objects.js`

## Migration Notes

- Moved Objects page JavaScript to `assets/toolbox/objects/js/index.js`.
- Folded the previous Objects API wrapper into the canonical module.
- Preserved server-owned constants through `readServerToolConstants("objects")` and `requireServerConstant(...)`.
- Preserved the existing Objects repository contract through `createServerRepositoryClient("objects", options)`.
- Updated the Objects HTML module reference to the canonical path.
- Removed Objects from the approved legacy toolbox JavaScript exception list.
- Updated browser environment and product-data contract path references.
- Updated the Objects Playwright source-path assertion for the canonical module.

## CSS Review

No Objects-specific CSS file was present, so no CSS migration was required.

## Validation Lane Report

PASS:
- `node --check assets/toolbox/objects/js/index.js`
- `node --check scripts/validate-canonical-repository-structure.mjs`
- `node --check scripts/validate-browser-env-agnostic.mjs`
- `node --check tests/dev-runtime/ProductDataProviderContractHardening.test.mjs`
- `node --check tests/playwright/tools/ObjectsTool.spec.mjs`
- `git diff --check`
- `npm run validate:canonical-structure`
  - Result: PASS
  - Blocking violations: 0
  - Approved legacy exceptions: 484
- Active stale-reference check for `toolbox/objects/objects.js` and `toolbox/objects/objects-api-client.js`
  - Result: no active matches outside reports/tmp/node_modules.
- Direct Objects-page Playwright probe
  - Result: PASS
  - Canonical module fetched successfully.
  - Template catalog hydrated.
  - No page errors, console errors, request failures, or HTTP >=400 responses.

DOCUMENTED BLOCKERS:
- `npx playwright test tests/playwright/tools/ObjectsTool.spec.mjs --grep "Objects exposes production copy" --workers=1 --reporter=line --timeout=60000`
  - Result: FAIL
  - Failure: Objects seed action reported `Start the local server API or restore the server data source.`
  - Assessment: deeper Objects persistence validation requires a configured product-data repository and is outside this canonical file-move PR.
- `npx playwright test tests/playwright/tools/ObjectsTool.spec.mjs --grep "Objects is a clickable beta tool" --workers=1 --reporter=line --timeout=60000`
  - Result: FAIL
  - Failure: existing `/api/game-journey/completion-metrics` returned HTTP 500 from Toolbox index validation.
  - Assessment: matches the previously documented Game Journey validation blocker and was not caused by the Objects migration.
- `node --test tests/dev-runtime/ProductDataProviderContractHardening.test.mjs`
  - Result: FAIL
  - Failure: unrelated existing assertions around public API URL/config and admin tool votes import expectations failed.
  - Assessment: not caused by this Objects path migration.

## Requirement Checklist

- [x] Select up to 3 SAFE tools only.
- [x] Migrated exactly one SAFE tool: Objects.
- [x] Moved JS to `assets/toolbox/objects/js/index.js`.
- [x] Moved CSS only if required. No Objects CSS migration was required.
- [x] Updated HTML references.
- [x] Updated affected tests/references.
- [x] Preserved behavior for the canonical module path and catalog hydration.
- [x] No feature changes.
- [x] No unrelated runtime behavior changes.
- [x] Canonical repository guardrail passes.
- [x] ZIP artifact required under `tmp/`.

## Manual Validation Notes

- The direct Objects-page probe validated the migrated module path without crossing unrelated Toolbox/Game Journey routes.
- Broader Objects Playwright interaction coverage remains blocked by product-data repository setup requirements.
- Toolbox index validation remains blocked by the previously documented Game Journey completion metrics HTTP 500.

## Recommendation

Continue the Charlie stack with stop-gate reports for PR024 through PR026 because PR022 identified no additional SAFE target-tool migrations after Objects.
