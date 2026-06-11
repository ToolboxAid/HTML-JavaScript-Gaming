# PR_26162_036 Controls Account Followup

## Branch Validation

PASS: Current git branch was verified as `main` before edits.

## Requirement Checklist

- PASS: `account/user-controls.html` includes a visible Save button.
- PASS: Account User Controls Save reports visible PASS/FAIL status through the existing shared controls repository path.
- PASS: Invalid account user-control rows block save with actionable row validation.
- PASS: Refresh Devices renders browser-exposed devices on first click and reports an actionable browser/gamepad limitation when only keyboard/mouse is available.
- PASS: Sensitivity sliders were added for analog-like physical inputs through `src/engine/input` descriptors, including mouse movement, mouse wheel, potentiometer/analog knob labels, joystick/gamepad axes, and standard trigger labels.
- PASS: Sensitivity sliders show live percent values and reset to default on double-click.
- PASS: Controls Add Game Control creates a complete normalized game-control set in one click for the selected object context.
- PASS: Common generated rows are enabled by default and alternate rows are disabled.
- PASS: Game controls remain generic and do not store controller name/id/raw physical input fields.
- PASS: Active Project Workspace user-facing route/copy moved to Game Workspace.
- PASS: Legacy `project-workspace` route remains as compatibility guidance and no longer owns duplicate UI.
- PASS: Player Mode moved beside Play Style in Game Design.
- PASS: Game Configuration no longer exposes duplicate editable Player Mode; it displays the value from the Game Design handoff.
- PASS: Account pages consume one shared Account side-nav partial and preserve active page state.
- PASS: Controls/account input behavior uses `src/engine/input` services/contracts instead of local keyboard/mouse/gamepad polling.
- PASS: No sample JSON alignment, auth behavior, production DB behavior, or production game runtime behavior was added.

## Impacted Lanes

- Controls/Input Mapping Playwright behavior.
- Account User Controls runtime behavior.
- Game Workspace route and metadata.
- Game Design Player Mode ownership.
- Game Configuration handoff display.
- Workspace contract legacy command lane.

## Input Ownership Verification

PASS: `toolbox/controls/controls.js` imports `InputService` and `NormalizedInputRegistry`.

PASS: `account/user-controls-page.js` imports `InputService`, `GamepadInputClassifier`, and `NormalizedInputRegistry`.

PASS: Playwright source checks assert Controls/account runtime files do not use local `keydown`/`keyup` listeners, `gamepadconnected`, or direct `navigator.getGamepads` polling.

## Testing Performed

- PASS: `node tests/input/NormalizedInputRegistry.test.mjs`
- PASS: changed-file JS syntax sweep with `node --check`
- PASS: `git diff --check` (line-ending warnings only, no whitespace errors)
- PASS: `npx playwright test tests/playwright/tools/InputMappingV2Tool.spec.mjs --reporter=line` (7 passed)
- PASS: `npx playwright test tests/playwright/tools/ProjectWorkspaceMockRepository.spec.mjs --reporter=line` (7 passed)
- PASS: `npx playwright test tests/playwright/tools/GameDesignMockRepository.spec.mjs --reporter=line` (4 passed)
- PASS: `npx playwright test tests/playwright/tools/GameConfigurationMockRepository.spec.mjs --reporter=line` (4 passed)
- PASS: `npm run test:workspace-v2` (legacy command name; workspace-contract lane passed 5 Playwright tests)

## Playwright And V8

Playwright impacted: Yes.

V8 coverage report: `docs_build/dev/reports/playwright_v8_coverage_report.txt`

Final coverage report was refreshed by the Controls/Input Mapping Playwright run and includes changed runtime coverage for:

- `account/user-controls-page.js`
- `account/user-controls.js`
- `toolbox/controls/controls.js`
- `src/engine/input/NormalizedInputRegistry.js`
- `assets/theme-v2/js/gamefoundry-partials.js`

## Manual Validation Steps

1. Open `/account/user-controls.html`, click Save with no profiles, confirm visible FAIL.
2. Expose a browser gamepad, click Refresh Devices once, confirm Keyboard/Mouse and the gamepad appear.
3. Create a gamepad profile, adjust Axis0 sensitivity, confirm live percent value updates and double-click resets to 100%.
4. Save the profile and confirm PASS plus persisted sensitivity in `player_controller_profiles`.
5. Open `/toolbox/controls/index.html`, click Add Game Control, confirm a complete normalized control set is created.
6. Confirm common generated game-control rows are Active/enabled and alternate rows are Disabled.
7. Open `/toolbox/game-workspace/index.html`, confirm Game Workspace copy and create/open/delete behavior.
8. Open `/toolbox/game-design/index.html`, confirm Play Style and Player Mode are on the same design surface.
9. Open `/toolbox/game-configuration/index.html`, confirm Player Mode is output-only and no editable Player Mode selector remains.
10. Open account pages and confirm the shared side-nav active state follows the current page.

## Skipped Lanes

- Full samples validation was skipped by request. Safe to skip because this PR does not modify sample runtime JSON, sample scene code, or production game runtime behavior.
- Full samples smoke was skipped by request.

## Runtime Behavior Confirmation

No production game runtime behavior was changed. The only shared engine/input change is a small normalized input descriptor extension for creator-facing sensitivity metadata and persisted profile sensitivity values.
