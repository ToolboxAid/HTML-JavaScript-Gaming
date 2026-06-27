# PR_26162_043-user-controls-gamepad-table-and-defaults

## Branch Validation
- Current branch: `main`
- Expected branch: `main`
- Local branches found: `main`
- Branch validation: PASS

## Requirement Checklist
- PASS: Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before edits.
- PASS: Verified current git branch is `main` before edits.
- PASS: Continued from the PR_26162_042 Controls/User Controls split.
- PASS: Controls status remains Wireframe; no status metadata was changed.
- PASS: Toolbox > Controls remains prepopulated with default Game Controls rows.
- PASS: Combo Controls remains wireframe-only in Toolbox > Controls.
- PASS: No combo runtime behavior was added.
- PASS: Account > User Controls > Game Controllers excludes Keyboard and Mouse; Playwright validates only detected game controllers appear in the dropdown.
- PASS: Removed the duplicate Save button to the right of Create User Control Profile.
- PASS: Physical Controller name is prefilled from detected device data and editable before saving.
- PASS: Game Controllers profile details render through the requested table columns.
- PASS: Generated controller inputs appear under the controller row with editable Normalized Control dropdowns.
- PASS: Axis rows expose Negative and Positive normalized control dropdowns.
- PASS: Axis and trigger rows expose applicable Deadzone, Invert, and Sensitivity controls.
- PASS: Button and d-pad rows do not expose deadzone or sensitivity input fields.
- PASS: Mouse mappings are editable and persist after reload.
- PASS: Fallback wording now uses `Default profile in use` and `Create my profile`.
- PASS: Defaults remain visible fallbacks and are not silently saved as user-created profiles.
- PASS: DB-backed separation is preserved: `game_input_mappings` stays game/project owned and `player_controller_profiles` stays user/player owned.
- PASS: Normalized action contract and shared `src/engine/input` usage are preserved.
- PASS: Theme V2 HTML restrictions are preserved; no inline styles, inline scripts, or inline event handlers were added.

## Changed Files
- `account/user-controls.html`
- `account/user-controls-page.js`
- `src/dev-runtime/persistence/tool-repositories/input-mapping-mock-repository.js`
- `tests/playwright/tools/InputMappingV2Tool.spec.mjs`
- `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- `docs_build/dev/reports/coverage_changed_js_guardrail.txt`
- `docs_build/dev/reports/user-controls-gamepad-table-and-defaults-report.md`

## Impacted Lanes
- Runtime/tool lane: Toolbox > Controls and Account > User Controls.
- Dev-runtime mock DB lane: controller profile persistence through `player_controller_profiles`.
- Playwright impacted: Yes.

## Validation Performed
- PASS: `node --check account/user-controls-page.js`
- PASS: `node --check account/user-controls.js`
- PASS: `node --check toolbox/controls/controls.js`
- PASS: `node --check src/dev-runtime/persistence/tool-repositories/input-mapping-mock-repository.js`
- PASS: `node --check tests/playwright/tools/InputMappingV2Tool.spec.mjs`
- PASS: `npx playwright test tests/playwright/tools/InputMappingV2Tool.spec.mjs --reporter=line`
  - Result: 6 passed.
  - Covers targeted Toolbox Controls Playwright and Account/User Controls Playwright behavior.

## Playwright Evidence
- PASS: Game Controllers dropdown excludes Keyboard and Mouse.
- PASS: Create User Control Profile no longer has a duplicate Save button beside it.
- PASS: Physical Controller name is prefilled from `Studio Flight Pad` and can be edited to `Custom Arcade Pad`.
- PASS: Generated controller inputs render in a table with Physical Input, Normalized Control, Deadzone, Invert, and Sensitivity columns.
- PASS: Button0 and DPad Up rows do not expose deadzone/sensitivity inputs.
- PASS: Axis0 exposes Negative/Positive normalized controls, deadzone, invert, and sensitivity.
- PASS: Trigger Left exposes applicable deadzone, invert, and sensitivity controls.
- PASS: Mouse mapping can change from `MouseButton0` to `MouseButton1` and persists after reload.
- PASS: Saved profiles persist through `player_controller_profiles`.
- PASS: Toolbox > Controls remains prepopulated and Combo Controls remains wireframe-only.

## Search Evidence
- PASS: `rg "Visible fallback|data-account-user-controls-save-all|Edit Keyboard Mappings|Edit Mouse Mappings" account -n` returned no active Account UI matches.
- PASS: `rg "<script(?![^>]*src=)|<style|\s(onclick|onchange|oninput|onsubmit)=" account/user-controls.html toolbox/controls/index.html -n --pcre2` returned no matches.
- NOTE: The removed phrases appear only in Playwright negative assertions that prove absence from active UI.

## V8 Coverage
- Coverage report: `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- PASS: `(93%) account/user-controls-page.js - changed JS file with browser V8 coverage`
- PASS: `(95%) toolbox/controls/controls.js - changed JS file with browser V8 coverage`
- WARN: `(0%) src/dev-runtime/persistence/tool-repositories/input-mapping-mock-repository.js - changed JS file not collected as browser runtime coverage`
- WARN is advisory only per project coverage rules because dev-runtime repository code is exercised through API/server path rather than browser V8 collection.

## Manual Validation Steps
1. Open `/account/user-controls.html` as a signed-in mock user.
2. Confirm Keyboard and Mouse sections say `Default profile in use` and expose `Create my profile`.
3. Confirm Game Controllers dropdown lists detected game controllers only.
4. Select a detected game controller and click `Create User Control Profile`.
5. Confirm Physical Controller name is prefilled, editable, and saved.
6. Confirm generated controller inputs appear under the profile row as table rows.
7. Confirm Axis rows expose Negative/Positive controls plus deadzone, invert, and sensitivity.
8. Confirm Button/d-pad rows do not expose deadzone or sensitivity inputs.
9. Save, reload, and confirm Keyboard, Mouse, and Game Controller profiles persist.
10. Open `/toolbox/controls/index.html` and confirm default Game Controls rows and Combo Controls wireframe remain visible.

## Skipped Lanes
- SKIP: Full samples validation. Safe to skip because no sample JSON, sample runtime, or playable sample behavior changed.
- SKIP: Full repository test suite. Safe to skip because the PR touched scoped Controls/User Controls UI, targeted Playwright coverage, and the directly affected mock repository only.
- SKIP: `npm run test:workspace-v2`. Safe to skip because this PR did not change Workspace contract behavior; targeted Controls/User Controls Playwright covered the impacted surfaces.

## Samples Decision
- Full samples validation: SKIP.
- Reason: Samples were explicitly out of scope and no sample files were changed.

## Notes
- The shared mock DB repository was corrected so `player_controller_profiles` preserves ordered `inputs` and corresponding `inputMappings` through raw mock DB snapshots and reloads.
