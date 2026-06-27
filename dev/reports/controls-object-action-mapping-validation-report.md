# PR_26161_026-controls-object-action-mapping-validation

## Branch Validation

- Current branch: `main`
- Expected branch: `main`
- Result: PASS

## Scope

- Impacted lane: Controls/Input Mapping tool.
- Playwright impacted: Yes.
- Controls status: Wireframe preserved.
- Runtime engine behavior: Not changed.
- Samples: Skipped.

## Requirement Checklist

- PASS - Controls data remains DB-backed through the shared DB/mock adapter.
- PASS - Object dropdown loads DB-backed Objects records through the Objects repository client.
- PASS - Footer Action dropdown filters from the selected Object.
- PASS - Inline row Action dropdown filters from the row Object.
- PASS - Collectible objects do not expose Move Left, Move Right, or Jump.
- PASS - Hero objects expose movement and interaction actions.
- PASS - Projectile objects expose fire/launch actions.
- PASS - Invalid Object/Action combinations show creator-facing row validation.
- PASS - Invalid Object/Action combinations are blocked from UI save.
- PASS - Existing invalid persisted mappings are visible as `Pending Setup`.
- PASS - Valid Object/Action combinations save and persist after reload.
- PASS - Object Summary information appears in the mappings footer:
  - Selected Object
  - Object Role/Template
  - Available Actions
- PASS - Controller profiles and device detection behavior preserved.
- PASS - Edit-gated capture preserved.
- PASS - Accordion layout preserved.
- PASS - Reset confirmation preserved and covered.
- PASS - Theme V2 only; no inline CSS, inline JS, script blocks, style blocks, or inline event handlers added.
- PASS - No sample JSON alignment, auth behavior, production game runtime behavior, or unrelated rewrites added.

## Implementation Notes

- Added object/template action rules in `toolbox/controls/controls.js`.
- Preserved Objects as the source for selectable object records and carried object role/capability metadata into Controls.
- Updated footer Action options whenever the selected Object changes.
- Updated row Action options whenever the row Object changes.
- Added row-level validation for saved mappings that reference invalid Object/Action combinations.
- Added a save guard so invalid combinations cannot be newly saved from the Controls UI.
- Added footer Object Summary display in `toolbox/controls/index.html`.
- Added reset confirmation before clearing mappings.

## Validation Performed

- PASS - `node --check toolbox/controls/controls.js`
- PASS - `node --check tests/playwright/tools/InputMappingV2Tool.spec.mjs`
- PASS - HTML restriction scan on `toolbox/controls/index.html`
- PASS - `git diff --check` passed with line-ending warnings only.
- PASS - `npx playwright test tests/playwright/tools/InputMappingV2Tool.spec.mjs`: 6/6 passed.

## Playwright Behavior Coverage

- PASS - Object dropdown loads DB-backed Hero, Coin, and Bolt records.
- PASS - Collectible action list filters to Confirm, Interact, and Select.
- PASS - Hero action list includes movement, Jump, and Interact.
- PASS - Projectile action list filters to Fire, Rotate Left, Rotate Right, and Thrust.
- PASS - Valid Projectile + Fire mapping saves and persists after reload.
- PASS - Invalid Coin + Move Left persisted mapping shows actionable row validation.
- PASS - Repairing the invalid row to Coin + Interact saves and persists.
- PASS - Device refresh still detects a mocked gamepad.
- PASS - Reset confirmation cancel preserves mappings.
- PASS - Reset confirmation accept clears mappings through the shared DB adapter.

## V8 Coverage

- PASS - `docs_build/dev/reports/playwright_v8_coverage_report.txt` generated.
- PASS - `toolbox/controls/controls.js`: 93% function coverage in the final Controls run.
- PASS - `toolbox/controls/controls-api-client.js`: 100% function coverage in the final Controls run.
- WARN - The coverage helper also lists JS files changed in `HEAD` from the prior PR as advisory WARN entries; those files are not part of this PR's git status and were not modified here.

## Skipped Lanes

- Full samples validation: SKIPPED. Samples were not in scope and no sample JSON changed.
- Full suite: SKIPPED. Targeted Controls/Input Mapping Playwright covered the changed behavior.
- Production game runtime validation: SKIPPED. No production game runtime behavior changed.

## Manual Validation Steps

1. Open `toolbox/controls/index.html`.
2. Confirm the mappings footer shows Action, Object, and Object Summary.
3. Select a Collectible object and confirm movement actions are not available.
4. Select a Hero object and confirm movement and Interact actions are available.
5. Select a Projectile object and confirm fire/launch actions are available.
6. Add a valid mapping, reload, and confirm it remains.
7. Confirm an invalid persisted mapping shows a row warning and can be repaired by editing the row.

## Artifacts

- PASS - Review diff: `docs_build/dev/reports/codex_review.diff`
- PASS - Changed files: `docs_build/dev/reports/codex_changed_files.txt`
- PASS - V8 coverage: `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- PASS - Repo-structured delta ZIP: `tmp/PR_26161_026-controls-object-action-mapping-validation_delta.zip`
