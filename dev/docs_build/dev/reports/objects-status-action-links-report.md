# PR_26161_007 Objects Status Action Links Report

## Branch Guard
- Current branch: `main`
- Expected branch: `main`
- Local branches found: `* main`
- Branch validation: PASS

## Source Of Truth
- PASS: Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before branch validation and edits.
- PASS: Used the user-provided `PR_26161_007-objects-status-action-links` request as the active BUILD source.
- PASS: Confirmed the PR purpose is singular: make Object Status actionable in the Objects tool.

## Requirement Checklist
- PASS: Replaced the Object Status aggregate rows with per-object status rows.
- PASS: Per-object status labels use creator-facing gap labels: `Missing Render Asset`, `Missing Hitbox`, `Missing Events`, and `Ready`.
- PASS: Added row-level `Edit Sprite` links for saved Sprite render assets.
- PASS: Added row-level `Open Hitboxes` and `Open Events` links when an object has a usable object key.
- PASS: `Edit Sprite` is hidden for non-Sprite rows and active rows before the Sprite render asset exists.
- PASS: Preserved table-first input, `Add Object` below the table, disabled Add while editing, Cancel, Edit, Trash, and Reset Table.
- PASS: Preserved real Sprite render asset create/resolve behavior.
- PASS: Kept Objects wireframe/clickable; no status promotion was made.
- PASS: Did not add sample JSON alignment, auth behavior, production DB behavior, or unrelated tool rewrites.
- PASS: Kept Theme V2 only and preserved HTML restrictions.

## Implementation Evidence
- `toolbox/objects/index.html`: changed Object Status headers to `Object`, `Status`, and `Actions`.
- `toolbox/objects/objects.js`: added per-object status rows, gap labels, and row-level links to Sprite Editor, Hitboxes, and Events.
- `tests/playwright/tools/ObjectsTool.spec.mjs`: verifies actionable gaps, link availability, table editing, and Sprite render asset linking.

## Impacted Lane
- Impacted lane: Objects tool UI/runtime.
- Playwright impacted: Yes.
- Changed runtime JavaScript: `toolbox/objects/objects.js`.

## Validation
- PASS: `node --check toolbox/objects/objects.js`
- PASS: `node --check tests/playwright/tools/ObjectsTool.spec.mjs`
- PASS: HTML restriction check for `toolbox/objects/index.html`
- PASS: Objects forbidden wording scan for the requested terms.
- PASS: `npx playwright test tests/playwright/tools/ObjectsTool.spec.mjs --workers=1 --reporter=line` (5 passed)
- PASS: `git diff --check` exited 0 with line-ending warnings only.

## Playwright Coverage
- PASS: `docs_build/dev/reports/playwright_v8_coverage_report.txt` was produced by targeted Objects Playwright.
- PASS: `toolbox/objects/objects.js` coverage is listed as `(95%) toolbox/objects/objects.js - executed lines 987/987; executed functions 94/99`.
- PASS: `docs_build/dev/reports/coverage_changed_js_guardrail.txt` reports no changed runtime JS coverage warnings.

## Skipped Lanes
- Full samples validation: SKIP. Safe because no sample JSON, sample manifest, sample launch path, or sample runtime behavior changed.
- Production DB/auth validation: SKIP. Safe because no production DB or auth behavior changed.
- Broad Toolbox/Admin metadata validation: SKIP. Safe because tool metadata and Toolbox registration were not changed.
- Engine runtime validation beyond changed-file syntax/import coverage: SKIP. Safe because no engine runtime files or execution behavior changed.

## Manual Validation Steps
- Open `/toolbox/objects/index.html`.
- Add a Sprite object row, enter a name, and confirm Object Status shows `Missing Render Asset`, `Missing Hitbox`, and `Missing Events` before saving.
- Confirm the active row shows `Open Hitboxes` and `Open Events` once it has a name, and does not show `Edit Sprite` before save.
- Save the Sprite row and confirm Object Status no longer shows `Missing Render Asset` and now shows `Edit Sprite`.
- Seed starter objects and confirm non-Sprite rows show `Open Hitboxes` and `Open Events`, but not `Edit Sprite`.
- Confirm table editing controls still support Add, Cancel, Save, Edit, Trash, and Reset Table.

## Required Artifacts
- PASS: `docs_build/dev/reports/objects-status-action-links-report.md`
- PASS: `docs_build/dev/reports/codex_review.diff`
- PASS: `docs_build/dev/reports/codex_changed_files.txt`
- PASS: `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- PASS: `tmp/PR_26161_007-objects-status-action-links_delta.zip`
