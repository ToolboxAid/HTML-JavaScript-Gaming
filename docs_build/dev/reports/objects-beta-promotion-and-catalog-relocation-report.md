# PR_26161_014 Objects Beta Promotion And Catalog Relocation Report

## Branch Validation

PASS

- Current branch: `main`
- Expected branch: `main`
- Local branches observed: `* main`

## Scope

- Impacted lane: Objects tool UI/runtime plus Toolbox tool metadata registry.
- Playwright impacted: Yes.
- Runtime engine behavior changed: No.
- Samples validation: Skipped as requested. No sample JSON, auth behavior, production DB behavior, engine runtime behavior, or unrelated tool behavior changed.

## Requirement Checklist

- PASS: Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before edits.
- PASS: Verified current git branch was `main` before edits.
- PASS: Moved the Object Type Catalog selector into the Objects Table footer.
- PASS: Placed the selector in the right-side footer group.
- PASS: Kept `Add Object` and `Reset Table` in the left-side footer group.
- PASS: Kept Object Type Catalog display limited to `Template` and `Capability`.
- PASS: Preserved object creation workflows, including template-prefilled row creation.
- PASS: Preserved DB/mock-adapter persistence after reload.
- PASS: Preserved Sprite asset linking after reload.
- PASS: Preserved row action buttons: `Edit`, `Edit Sprite`, `Open Hitboxes`, `Open Events`, and `Trash`.
- PASS: Preserved Missing/Complete button highlighting through existing Theme V2 button classes.
- PASS: Updated Objects tool metadata/status registry to `status = beta`.
- PASS: Removed remaining Objects wireframe-only messaging from the displayed Objects tool surface.
- PASS: Did not add sample JSON alignment, auth behavior, production DB behavior, or unrelated tool rewrites.
- PASS: Kept Theme V2 only and preserved HTML restrictions.

## Testing Performed

- PASS: `node --check toolbox/objects/objects.js`
- PASS: `node --check tests/playwright/tools/ObjectsTool.spec.mjs`
- PASS: `node --check src/dev-runtime/guest-seeds/tool-metadata-inventory.js`
- PASS: `rg --pcre2 -n '<script(?![^>]*\bsrc=)|<style\b|\son[a-z]+\s*=' toolbox/objects/index.html`
  - Expected no matches; command exited with no matches.
- PASS: `rg -n 'Wireframe|wireframe|Static wireframe|not wired|Not implemented yet|Role|Traits|Not connected yet' toolbox/objects/index.html`
  - Expected no matches; command exited with no matches.
- PASS: `node --input-type=module -e "...getToolById('objects')..."`
  - Result: Objects registry seed reports `status: "beta"`, `releaseChannel: "beta"`, and `releaseChannelLabel: "Beta"`.
- PASS: `npx playwright test tests/playwright/tools/ObjectsTool.spec.mjs --workers=1 --reporter=line`
  - Result: 6 passed.
- PASS: `git diff --check`
  - Result: PASS. Git reported line-ending normalization warnings only.

## Playwright Behavior Covered

- PASS: Object Type Catalog selector appears inside the Objects Table footer.
- PASS: Footer selector is in the right-side catalog group.
- PASS: `Add Object` and `Reset Table` remain in the left-side footer group.
- PASS: Selecting a footer template before adding an object still prefills Type, State, Render, and Capabilities.
- PASS: Add, cancel, save, edit, trash, reset, and DB persistence after reload still work.
- PASS: Sprite asset creation/resolution and linked sprite asset display persist after reload.
- PASS: Row actions and Missing/Complete visual classes remain intact.
- PASS: Toolbox displays Objects as `Beta`, not `Wireframe`.
- PASS: Toolbox registry API reports Objects as `status: "beta"`.

## Playwright V8 Coverage

- Report: `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- Changed runtime JavaScript coverage notes:
  - `(94%) toolbox/objects/objects.js - executed lines 1107/1107; executed functions 99/105`
  - `(0%) src/dev-runtime/guest-seeds/tool-metadata-inventory.js - WARNING: changed runtime JS file was not collected by Playwright V8 coverage; advisory only`
- The warning is safe for this PR because `tool-metadata-inventory.js` is a dev-runtime seed module validated by syntax check and by the targeted Playwright registry/API status assertion.

## Manual Validation Steps

1. Open `/toolbox/objects/index.html`.
2. Confirm the Objects Table footer has `Add Object` and `Reset Table` on the left.
3. Confirm the Object Type Catalog selector is in the right side of the table footer.
4. Select `Hero` in the footer selector, click `Add Object`, and confirm the active row is prefilled.
5. Save a Sprite object, reload the page, and confirm the row and linked sprite asset remain.
6. Open `/toolbox/index.html` and confirm the Objects card displays `Beta`.

## Skipped Lanes

- Full samples validation: SKIP, explicitly requested and no samples changed.
- Broad workspace/project suite: SKIP, no shared Project Workspace contract, engine runtime behavior, public navigation behavior, auth behavior, production DB behavior, or sample behavior changed.
- Full registry suite: SKIP, registry impact is scoped to the Objects metadata seed and covered by targeted Objects Playwright plus direct seed inspection.

