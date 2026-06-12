# PR_26162_041 Controls Game Account User Split Report

## Branch Validation
- PASS: Current branch is `main`.
- Expected branch: `main`.
- Evidence: `git status --short --branch` returned `## main...origin/main`.

## Requirement Checklist
- PASS: Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before edits.
- PASS: Verified current branch is `main` before edits.
- PASS: Toolbox > Controls remains the game creator tool.
- PASS: Toolbox > Controls now shows Game Controls only.
- PASS: Game Controls table owns `Enabled`, `Normalized Action`, `Usage Label`, `D`, `H`, `U`, `DC`, and `Actions`.
- PASS: Removed device-specific Keyboard, Mouse, Joystick, Gamepad, and Combo accordions from Toolbox > Controls.
- PASS: Removed device-specific setup from Toolbox > Controls.
- PASS: Removed Add Game Control, Add Keyboard Control, Add Mouse Control, Add Joystick Control, Reset Mappings, Normalized Action Type footer controls, and Object Global footer controls from Toolbox > Controls.
- PASS: Account > User Controls remains the player/user input surface and is present in Account dropdown and left menu.
- PASS: Account dropdown and Account left menu are alphabetically sorted for browseable entries.
- PASS: Account > User Controls owns Physical Input -> Normalized Action mapping.
- PASS: Account > User Controls includes Keyboard, Mouse, Game Controllers, and Combo Inputs accordions.
- PASS: Keyboard defaults are prepopulated as visible fallback rows.
- PASS: Mouse defaults are prepopulated as visible fallback rows.
- PASS: Game controllers auto-detect on a timer through shared input services.
- PASS: Multiple detected controllers can be selected for configuration.
- PASS: Combo Inputs is wireframe-only.
- PASS: Defaults remain visible fallback profiles and are not silently saved as user-created profiles.
- PASS: DB-backed separation remains: `game_input_mappings` is game-owned, `player_controller_profiles` is user/player-owned.
- PASS: `game_input_mappings` no longer defaults/stores Keyboard, Mouse, Gamepad, Joystick, controller id/name, or physical input data from Toolbox Controls.
- PASS: `player_controller_profiles` does not store game action/object action/event fields.
- PASS: Normalized action contract is preserved between both surfaces.
- PASS: Shared `src/engine/input` usage is preserved; Account User Controls continues to use `InputService`, `GamepadInputClassifier`, and `NormalizedInputRegistry`; Toolbox Controls uses `NormalizedInputRegistry` only.
- PASS: Controls status remains Wireframe.
- PASS: Theme V2 restrictions preserved; no inline CSS, inline JS, script/style blocks, or inline event handlers were added.

## Search Evidence
- PASS: Removed Toolbox Controls device setup and footer controls:
  - `rg -n "data-input-family-panel|data-input-combo-controls|data-input-add-mapping|data-input-add-keyboard-family|data-input-add-mouse-family|data-input-add-joystick-family|data-input-reset-mappings|data-input-action-select|data-input-object-select|Input Family|Add Game Control|Add Keyboard Control|Add Mouse Control|Add Joystick Control|Reset Mappings|Normalized Action Type|Object Global" toolbox/controls/index.html toolbox/controls/controls.js tests/playwright/tools/InputMappingV2Tool.spec.mjs`
  - Results are only negative Playwright assertions in `tests/playwright/tools/InputMappingV2Tool.spec.mjs`.
- PASS: Device terminology remains in Account User Controls only:
  - `rg -n "Keyboard|Mouse|Joystick|Gamepad|Combo Inputs|Game Controllers" toolbox/controls/index.html toolbox/controls/controls.js account/user-controls.html account/user-controls-page.js`
  - Results are limited to `account/user-controls.html` and `account/user-controls-page.js`.
- PASS: No active Toolbox Controls local physical/device input ownership:
  - `rg -n "InputService|DEVICE_POLL_INTERVAL_MS|navigator\\.getGamepads|gamepadconnected" toolbox/controls/controls.js`
  - No matches.
- PASS: Mock repository no longer defaults game mappings to Keyboard:
  - `rg -n "inputFamily:\\s*normalizeText\\(mapping\\.inputFamily\\) \\|\\||inputFamily:\\s*normalizeText\\(record\\.inputFamily\\) \\|\\|" src/dev-runtime/persistence/tool-repositories/input-mapping-mock-repository.js`
  - No matches.

## Changed Files
- `account/user-controls-page.js`
- `account/user-controls.html`
- `docs_build/dev/reports/coverage_changed_js_guardrail.txt`
- `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- `docs_build/dev/reports/controls-game-account-user-split-report.md`
- `src/dev-runtime/guest-seeds/tool-metadata-inventory.js`
- `src/dev-runtime/persistence/tool-repositories/input-mapping-mock-repository.js`
- `tests/playwright/tools/InputMappingV2Tool.spec.mjs`
- `toolbox/controls/controls.js`
- `toolbox/controls/index.html`

## Impacted Lanes
- Controls tool runtime lane.
- Account/User Controls runtime lane.
- Shared DB/mock adapter Controls tables lane.
- Account navigation lane.
- Targeted Playwright/V8 coverage lane.

## Validation Performed
- PASS: `node --check toolbox/controls/controls.js`
- PASS: `node --check account/user-controls-page.js`
- PASS: `node --check account/user-controls.js`
- PASS: `node --check src/dev-runtime/persistence/tool-repositories/input-mapping-mock-repository.js`
- PASS: `node --check src/dev-runtime/guest-seeds/tool-metadata-inventory.js`
- PASS: `node --check tests/playwright/tools/InputMappingV2Tool.spec.mjs`
- PASS: `rg -n --pcre2 "<script(?![^>]*\\bsrc=)|<style\\b|\\son[a-z]+\\s*=" toolbox/controls/index.html account/user-controls.html` returned no matches.
- PASS: `npx playwright test tests/playwright/tools/InputMappingV2Tool.spec.mjs --reporter=line`
  - Final result: 6 passed.

## Playwright Result
- PASS: Toolbox > Controls shows Game Controls only.
- PASS: Game Controls table uses `D`, `H`, `U`, `DC` columns.
- PASS: Device-specific accordions and footer controls are absent from Toolbox > Controls.
- PASS: Account > User Controls exposes Keyboard, Mouse, Game Controllers, and Combo Inputs accordions.
- PASS: Keyboard and Mouse defaults are visible fallbacks and are not saved until profiles are explicitly created.
- PASS: Game controller auto-detect updates without manual refresh.
- PASS: Multiple detected controllers can be selected and saved.
- PASS: DB ownership separation is validated from mock DB snapshots.
- PASS: Persistence after reload is validated for game controls and user controller profiles.
- PASS: Account dropdown and left menu expose User Controls in sorted browseable menus.

## V8 Coverage
- PASS: `docs_build/dev/reports/playwright_v8_coverage_report.txt` regenerated from the final Playwright run.
- Covered changed browser runtime files:
  - `toolbox/controls/controls.js`: 95% function coverage.
  - `account/user-controls-page.js`: 90% function coverage.
  - `account/user-controls.js`: 100% function coverage.
- WARN advisory only: `src/dev-runtime/guest-seeds/tool-metadata-inventory.js` and `src/dev-runtime/persistence/tool-repositories/input-mapping-mock-repository.js` are server/dev-runtime JS and are not collected by browser V8 coverage. Their behavior is covered by syntax checks and Playwright DB snapshot assertions.

## Skipped Lanes
- Full samples validation: SKIPPED as requested; no sample JSON, sample runtime, or sample alignment behavior changed.
- Production auth/account system validation: SKIPPED; Account User Controls continues to use the existing session and shared DB/mock adapter path only.
- Production game runtime validation: SKIPPED; this PR changes creator/account tooling surfaces and does not add production input runtime behavior.
- Full workspace suite / `npm run test:workspace-v2`: SKIPPED because PR_26162_041 requested targeted Controls and Account/User Controls Playwright validation, which covers the changed surfaces directly.

## Manual Validation Steps
1. Open `/toolbox/controls/index.html`.
2. Confirm the center surface is Game Controls only and the table headers are `Enabled`, `Normalized Action`, `Usage Label`, `D`, `H`, `U`, `DC`, `Actions`.
3. Confirm no Keyboard, Mouse, Joystick, Gamepad, or Combo accordions appear in Toolbox > Controls.
4. Apply a preset and confirm mappings appear, counts update, and saved rows reload.
5. Open `/account/user-controls.html`.
6. Confirm Keyboard, Mouse, Game Controllers, and Combo Inputs accordions appear.
7. Confirm keyboard/mouse default rows are visible fallback rows.
8. Connect or expose multiple game controllers, wait for auto-detect, and select the controller to configure.
9. Save a User Control profile and reload to confirm persistence.

## Samples Decision
- Samples validation was skipped intentionally and safely because the PR does not change sample data, sample loaders, sample JSON alignment, or production game runtime behavior.

## Completion
- PASS: 100% of requested PR_26162_041 requirements are implemented, validated, and marked PASS.
