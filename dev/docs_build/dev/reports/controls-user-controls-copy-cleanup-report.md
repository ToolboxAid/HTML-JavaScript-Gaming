# PR_26162_044-controls-user-controls-copy-cleanup

## Branch Validation
- Current branch: `main`
- Expected branch: `main`
- Local branches found: `main`
- Branch validation: PASS

## Requirement Checklist
- PASS: Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before edits.
- PASS: Verified current git branch is `main` before edits.
- PASS: Continued from PR_26162_043.
- PASS: Removed the `Normalized Controls` accordion from `toolbox/controls/`.
- PASS: Reviewed `Presets` in `toolbox/controls/`.
- PASS: Presets kept only as wireframe-safe future functionality; active preset buttons and DB mutation code were removed.
- PASS: Presets unique value documented: genre-specific starter templates such as Platformer, Shooter, Vehicle, Fighting, Menu, Paddle / Ball, and Party / Arena remain useful future planning references distinct from seeded default Game Controls.
- PASS: Keyboard scoped User Controls rows no longer show redundant `Keyboard:` prefixes.
- PASS: Mouse scoped User Controls rows no longer show redundant `Mouse:` prefixes.
- PASS: Game Controllers scoped rows/dropdown labels no longer show redundant `Gamepad:` prefixes.
- PASS: `Not applicable` was replaced with `N/A` in active Controls/User Controls UI.
- PASS: DB-backed separation is preserved: `game_input_mappings` remains game/project owned; `player_controller_profiles` remains user/player owned.
- PASS: Normalized action contract is preserved.
- PASS: Editable keyboard/mouse mappings are preserved.
- PASS: Editable game controller names are preserved.
- PASS: Gamepad table layout, defaults, and persistence are preserved.
- PASS: No sample JSON alignment, auth behavior, production account system, or unrelated rewrites were added.
- PASS: Theme V2 restrictions preserved; no inline CSS, inline JS, script/style blocks, or inline event handlers were added.

## Changed Files
- `toolbox/controls/index.html`
- `toolbox/controls/controls.js`
- `account/user-controls-page.js`
- `tests/playwright/tools/InputMappingV2Tool.spec.mjs`
- `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- `docs_build/dev/reports/coverage_changed_js_guardrail.txt`
- `docs_build/dev/reports/controls-user-controls-copy-cleanup-report.md`

## Impacted Lanes
- Runtime/tool lane: Toolbox > Controls.
- Account runtime lane: Account > User Controls.
- Playwright impacted: Yes.

## Presets Review
- Decision: Keep Presets as wireframe-safe future functionality.
- Reason: Presets are not identical to seeded default Game Controls; they represent future genre templates that could quickly reshape Game Controls for a specific game style.
- Safety change: Removed active preset buttons and the `applyGameControlPreset` mutation path, so Presets no longer write to `game_input_mappings`.

## Validation Performed
- PASS: `node --check toolbox/controls/controls.js`
- PASS: `node --check account/user-controls-page.js`
- PASS: `node --check account/user-controls.js`
- PASS: `node --check tests/playwright/tools/InputMappingV2Tool.spec.mjs`
- PASS: `npx playwright test tests/playwright/tools/InputMappingV2Tool.spec.mjs --reporter=line`
  - Result: 6 passed.
- PASS: `git diff --check`

## Playwright Evidence
- PASS: Normalized Controls accordion is absent.
- PASS: Normalized Controls catalog selectors are absent.
- PASS: Presets has no active preset buttons and renders a wireframe planning list.
- PASS: Game Controls default rows still load and persist.
- PASS: Game Controls row editing and persistence still work.
- PASS: Keyboard, Mouse, and Game Controller scoped sections do not repeat `Keyboard:`, `Mouse:`, or `Gamepad:` prefixes.
- PASS: `N/A` appears for non-applicable controller tuning fields.
- PASS: `Not applicable` does not appear in the active page body.
- PASS: Keyboard/mouse profile editing persists after reload.
- PASS: Gamepad name editing, table layout, axis/trigger controls, and profile persistence still work.

## Search Evidence
- PASS: `rg "Not applicable|Keyboard:|Mouse:|Gamepad:" account/user-controls.html account/user-controls-page.js toolbox/controls/index.html toolbox/controls/controls.js -n` returned no matches.
- PASS: `rg "Normalized Controls|data-input-action-catalog|data-input-default-actions|data-input-preset=|GAME_CONTROL_PRESETS|applyGameControlPreset|Applied .* preset|Apply a preset" toolbox/controls -n` returned no matches.
- PASS: `rg "<script(?![^>]*src=)|<style|\s(onclick|onchange|oninput|onsubmit)=" account/user-controls.html toolbox/controls/index.html -n --pcre2` returned no matches.

## V8 Coverage
- Coverage report: `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- PASS: `(93%) account/user-controls-page.js - executed lines 820/820; executed functions 98/105`
- PASS: `(96%) toolbox/controls/controls.js - executed lines 509/509; executed functions 51/53`
- PASS: No changed runtime JS coverage warnings after normalizing the report to PR_26162_044 changed runtime JavaScript files.

## Manual Validation Steps
1. Open `/toolbox/controls/index.html`.
2. Confirm `Normalized Controls` is not present.
3. Confirm Presets is a wireframe-only planning list with no clickable preset buttons.
4. Confirm default Game Controls rows still appear and the mapping count is populated.
5. Edit a Game Controls row, save, reload, and confirm persistence.
6. Open `/account/user-controls.html`.
7. Confirm Keyboard and Mouse sections do not show `Keyboard:` or `Mouse:` prefixes in saved rows.
8. Confirm Game Controllers does not show `Gamepad:` prefixes in the dropdown or saved rows.
9. Create/edit a game controller profile and confirm non-applicable fields show `N/A`.
10. Save and reload to confirm profile persistence.

## Skipped Lanes
- SKIP: Full samples validation. Safe to skip because no sample JSON or sample runtime files were changed.
- SKIP: Full repository test suite. Safe to skip because the PR only changes scoped Controls/User Controls UI/runtime and targeted Playwright covers the affected behavior.
- SKIP: Broader engine validation. Safe to skip because no `src/engine/input` code was changed.

## Samples Decision
- Full samples validation: SKIP.
- Reason: Samples are explicitly out of scope and unchanged.
