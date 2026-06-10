# PR_26161_024 Controls Edit-Gated Capture Devices Report

## Branch Validation
- Current branch: `main`
- Expected branch: `main`
- Result: PASS

## Summary
- Changed saved-row Input tokens so non-edit clicks do nothing.
- Changed edit-row Input value clicks so they start capture for the row currently being edited.
- Added a Controller dropdown in the Controller Profile section with Keyboard, Mouse, detected gamepads, and an actionable unknown/unavailable option.
- Device selection pre-populates an unsaved controller profile row for review and explicit Save.
- Preserved footer Action/Object dropdowns, action descriptions, table-first editing, Add Mapping, Cancel, Edit, Trash, State explanation, Devices, Status, DB reload persistence, and Wireframe status.

## Requirement Checklist
| Requirement | Result | Evidence |
| --- | --- | --- |
| Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` first | PASS | Read before edits. |
| Verify branch is `main` before edits | PASS | `git branch --show-current` returned `main`. |
| Continue from PR_26161_023 | PASS | Footer Action/Object dropdowns and Actions reference catalog preserved. |
| Keep Controls status as Wireframe | PASS | Targeted Playwright asserts registry status/release channel remain `wireframe` and not `beta`. |
| Keep Controls data DB-backed through shared DB/mock adapter only | PASS | Mapping and controller profile saves still use `inputRepository`; no browser storage added. |
| Non-edit row Input click does nothing | PASS | Playwright clicks a saved Input token and verifies no edit row opens and DB records remain unchanged. |
| Edit-mode Input click enables capture for that row | PASS | Playwright clicks the edit-row Input value, captures `KeyB`, and saves. |
| Capture updates only the edited row | PASS | Playwright keeps a second `Fire` mapping at `KeyF` while editing only the `Move Left` mapping to `KeyB`. |
| Captured input persists through shared DB/mock adapter | PASS | Playwright reloads and verifies edited `KeyB` and untouched `KeyF` mappings persist. |
| Add Controller dropdown/list for connected devices | PASS | Controller selector renders Keyboard, Mouse, and a detected test gamepad after device refresh. |
| Selecting a device pre-populates Controller Name, Controller ID, and Mapping Profile | PASS | Playwright verifies Keyboard, Mouse, and detected gamepad prefilled values. |
| Do not silently create fake controller data | PASS | Device selection only creates an unsaved edit row; DB controller profile records remain empty until Save. |
| Unknown/unavailable device path is actionable | PASS | Playwright selects the unknown/unavailable option and verifies WARN status with refresh/connect guidance. |
| Preserve footer Action/Object dropdowns | PASS | Existing targeted Playwright checks remain passing. |
| Preserve action descriptions | PASS | Existing targeted Playwright checks all action descriptions remain visible and sorted. |
| Preserve table-first editing, Add Mapping, Cancel, Edit, Trash, State explanation, Devices, Status, reload persistence | PASS | Covered by targeted Controls/Input Mapping Playwright. |
| Avoid sample JSON, auth, production game runtime behavior, unrelated rewrites | PASS | No samples, auth, production runtime, or engine files changed. |
| Keep Theme V2 only; no inline CSS/JS/event handlers | PASS | HTML restriction scan found no inline style/script/event-handler violations. |

## Impacted Lane
- runtime
- recovery/UAT

## Playwright Impacted
- Yes

## Testing Performed
- `node --check toolbox/input-mapping-v2/input-mapping-v2.js` - PASS
- `node --check tests/playwright/tools/InputMappingV2Tool.spec.mjs` - PASS
- `node --check toolbox/input-mapping-v2/input-mapping-api-client.js` - PASS
- `rg -n --pcre2 "<script(?![^>]*\\bsrc=)|<style\\b|\\son[a-z]+=" toolbox/input-mapping-v2/index.html toolbox/controls/index.html` - PASS, no matches
- `git diff --check` - PASS, CRLF warnings only
- `npx playwright test tests/playwright/tools/InputMappingV2Tool.spec.mjs` - PASS, 5 passed

## Playwright Behavior Covered
- Launch/UAT panels still render and Controls remains Wireframe.
- Controller dropdown renders Keyboard, Mouse, and unknown/unavailable choices on initial load.
- Device refresh adds a detected gamepad exposed through `navigator.getGamepads`.
- Keyboard, Mouse, and detected gamepad selections pre-populate controller profile fields without saving records.
- Unknown/unavailable controller selection shows actionable WARN guidance.
- Saved-row Input token clicks do not enter edit mode.
- Edit-row Input value clicks start capture and update only the edited row.
- Captured inputs persist after reload.
- Trash remains the only covered row deletion path.

## V8 Coverage
- Report: `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- Guardrail: `docs_build/dev/reports/coverage_changed_js_guardrail.txt`
- Changed runtime JS covered: `toolbox/input-mapping-v2/input-mapping-v2.js`
- Coverage result: 91% function coverage, 117/128 functions

## Manual Validation Steps
1. Open `/toolbox/input-mapping-v2/index.html`.
2. Confirm Controls status remains Wireframe in the tool display/registry surfaces.
3. Confirm the Controller Profile section contains a Controller dropdown.
4. Confirm Keyboard and Mouse appear in the dropdown before a gamepad is connected.
5. Connect or expose a gamepad, click Refresh Devices, and confirm the detected gamepad appears.
6. Select Keyboard, Mouse, and a gamepad and confirm Controller Name, Controller ID, and Mapping Profile pre-populate before saving.
7. Select the unknown/unavailable option and confirm WARN guidance explains how to connect/refresh/select a detected device.
8. Add two mappings, save, reload, and confirm both persist.
9. Click a saved Input token and confirm it does not open edit mode.
10. Click Edit on one row, click the row Input value, capture a new key, save, reload, and confirm only that row changed.
11. Delete mappings with Trash and confirm no other click path deletes a row.

## Skipped Lanes
- Full samples validation was skipped as required; this PR does not touch sample JSON or sample runtime behavior.
- Full workspace contract lane was skipped because no Project Workspace contract/runtime files changed; workspace return remains covered by the targeted Controls/Input Mapping Playwright spec.
- Engine lane was skipped because no engine runtime behavior changed.
- Auth and production DB lanes were skipped because no auth or production DB behavior changed.

## Runtime Scope Confirmation
- Controls remains Wireframe.
- Controls mapping and controller profile data remain persisted through the shared DB/mock adapter.
- No page-local storage, `localStorage`, or `sessionStorage` source of truth was added.
- No production controller runtime or production game runtime behavior was added.
- No sample JSON alignment, auth behavior, production DB behavior, or unrelated rewrites were added.
