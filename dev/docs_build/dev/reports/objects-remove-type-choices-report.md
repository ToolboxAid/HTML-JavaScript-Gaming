# PR_26161_015 Objects Remove Type Choices Report

## Branch Validation

PASS

- Current branch: `main`
- Expected branch: `main`
- Worktree was clean before PR_26161_015 edits.

## Scope

- Impacted lane: Objects tool UI/runtime and targeted Objects Playwright coverage.
- Playwright impacted: Yes.
- Runtime engine behavior changed: No.
- Samples validation: Skipped as requested. No sample JSON, auth behavior, production DB behavior, engine runtime behavior, or unrelated tool behavior changed.

## Requirement Checklist

- PASS: Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before edits.
- PASS: Verified current git branch was `main` before edits.
- PASS: Removed the duplicate visible `Type Choices` section from Objects.
- PASS: Kept `Object Type Catalog` as the single visible reference list for object templates and capabilities.
- PASS: Kept the catalog display limited to `Template` and `Capability`.
- PASS: Preserved object template/type values in the underlying registry, validator, row type dropdown, and footer template selector.
- PASS: Preserved Render, State, Asset, Sprite linking, DB persistence, and table editing behavior.
- PASS: Kept Events integration framed as future behavior/event configuration by updating the user-facing Events action title to `Events configure when object behavior happens.`
- PASS: Preserved Objects beta status.
- PASS: Did not add sample JSON alignment, auth behavior, production DB behavior, or unrelated tool rewrites.
- PASS: Kept Theme V2 only and preserved HTML restrictions.

## Testing Performed

- PASS: `node --check toolbox/objects/objects.js`
- PASS: `node --check tests/playwright/tools/ObjectsTool.spec.mjs`
- PASS: `git diff --check`
  - Result: PASS. Git reported line-ending normalization warnings only.
- PASS: `rg --pcre2 -n '<script(?![^>]*\bsrc=)|<style\b|\son[a-z]+\s*=' toolbox/objects/index.html`
  - Expected no matches; command exited with no matches.
- PASS: `rg -n 'Type Choices|data-objects-type-basics' toolbox/objects/index.html`
  - Expected no matches; command exited with no matches.
- PASS: `npx playwright test tests/playwright/tools/ObjectsTool.spec.mjs --workers=1 --reporter=line`
  - Result: 6 passed.

## Playwright Behavior Covered

- PASS: `Type Choices` no longer appears in the primary Objects UI.
- PASS: `Object Type Catalog` remains visible.
- PASS: Catalog headers remain `Template` and `Capability` only.
- PASS: Events is not exposed as an object template/type in the catalog.
- PASS: Footer template selector still offers object templates and can prefill active rows.
- PASS: Row type dropdown still offers object type values.
- PASS: Add, edit, delete, reset, and DB persistence after reload still work.
- PASS: Sprite asset creation/resolution and linked sprite asset display still work.
- PASS: Objects remains a clickable beta tool from Toolbox.

## Playwright V8 Coverage

- Report: `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- Changed runtime JavaScript coverage notes:
  - `(93%) toolbox/objects/objects.js - executed lines 1107/1107; executed functions 98/105`
  - `(0%) src/dev-runtime/guest-seeds/tool-metadata-inventory.js - WARNING: changed runtime JS file was not collected by Playwright V8 coverage; advisory only`
- The advisory warning is safe for this PR because PR_26161_015 did not modify `src/dev-runtime/guest-seeds/tool-metadata-inventory.js`; this change only touched Objects UI/runtime, Objects Playwright coverage, and generated reports.

## Manual Validation Steps

1. Open `/toolbox/objects/index.html`.
2. Confirm the left Objects panel shows `Object Setup` and `Object Type Catalog`, with no `Type Choices` section.
3. Confirm the Object Type Catalog table shows only `Template` and `Capability`.
4. Use the table footer template selector to choose `Hero`, then click `Add Object` and confirm the active row is prefilled.
5. Save a Sprite object, reload the Objects page, and confirm the row plus linked sprite asset remain.
6. Confirm `Open Events` is presented as event configuration for when object behavior happens, not as an object type.

## Skipped Lanes

- Full samples validation: SKIP, explicitly requested and no samples changed.
- Broad workspace/project suite: SKIP, no shared Project Workspace contract, engine runtime behavior, public navigation behavior, auth behavior, production DB behavior, or sample behavior changed.
- Full registry suite: SKIP, registry and validator values were intentionally preserved; targeted Objects Playwright validates row type/template dropdown behavior.
