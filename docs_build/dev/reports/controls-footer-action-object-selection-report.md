# PR_26161_023 Controls Footer Action Object Selection Report

## Branch Validation
- Current branch: `main`
- Expected branch: `main`
- Result: PASS

## Summary
- Moved the Action and Object creation selectors into the Table Input > Mappings footer.
- Replaced the prior Selected Action / Selected Object text with footer dropdown controls.
- Kept the Action dropdown backed by the Controls action registry.
- Kept the Object dropdown backed by shared DB/mock-adapter Object records.
- Removed duplicate Action/Object selectors from Controls > Actions.
- Converted Controls > Actions into a reference-only action catalog with Action Name and Description.
- Preserved action descriptions from PR_26161_022.
- Preserved device-specific input capture, Controller Profile center placement, State explanation, table editing, Add Mapping, Cancel, Edit, Trash, DB reload persistence, and Wireframe status.

## Impacted Lane
- runtime
- recovery/UAT

## Playwright Impacted
- Yes

## Testing Performed
- `node --check toolbox/input-mapping-v2/input-mapping-v2.js` - PASS
- `node --check tests/playwright/tools/InputMappingV2Tool.spec.mjs` - PASS
- `rg --pcre2 -n "<style|style=|<script(?![^>]*\\bsrc=)|on(click|change|input|submit|keydown|keyup|pointerdown|mousedown|mouseup)=" toolbox/input-mapping-v2/index.html toolbox/controls/index.html` - PASS, no inline CSS/JS/event handlers found
- `git diff --check` - PASS
- `npx playwright test tests/playwright/tools/InputMappingV2Tool.spec.mjs --workers=1 --reporter=line` - PASS, 5 passed

## Playwright Behavior Covered
- Mappings footer contains Action and Object dropdowns.
- Controls > Actions no longer contains Action/Object selectors.
- Controls > Actions displays Action Name and Description reference catalog.
- Action catalog descriptions remain visible and alphabetically ordered by action name.
- Object dropdown loads DB-backed Object records, including seeded Hero object.
- Footer Action/Object dropdown selections drive Add Mapping defaults.
- Captured mappings persist after reload.
- Device-specific capture still works.

## V8 Coverage
- Report: `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- Changed runtime JS covered: `toolbox/input-mapping-v2/input-mapping-v2.js`
- Coverage result: 91% function coverage, 105/116 functions

## Manual Validation Steps
1. Open `/toolbox/input-mapping-v2/index.html`.
2. Confirm Controls > Actions shows only the Action Name / Description catalog.
3. Confirm the Mappings footer shows Action and Object dropdowns next to Add Mapping and Reset Mappings.
4. Add or seed an Object record and confirm it appears in the footer Object dropdown.
5. Choose an Action and Object in the footer, click Add Mapping, and confirm the edit row uses those defaults.
6. Capture an input, save, reload, and confirm the mapping persists.

## Skipped Lanes
- Full samples validation was skipped as required by the PR instructions; this change is scoped to Controls/Input Mapping UI and targeted behavior tests.
- Full workspace contract lane was skipped because no Workspace V2 contract/runtime files changed; workspace return remains covered by targeted Controls Playwright.

## Runtime Scope Confirmation
- Controls remains Wireframe.
- Controls mapping and controller profile data remain persisted through the shared DB/mock adapter.
- No sample JSON alignment, auth behavior, production DB behavior, engine runtime behavior, or unrelated rewrites were added.
