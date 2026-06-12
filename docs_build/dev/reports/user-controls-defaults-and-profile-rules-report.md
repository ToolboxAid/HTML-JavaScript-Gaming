# PR_26162_050-user-controls-defaults-and-profile-rules

## Branch Validation
- PASS: current branch `main`.
- Expected branch: `main`.

## Requirement Checklist
- PASS: Controls status remains Wireframe; no tool metadata/status files were changed.
- PASS: Create Profile creates a saved new profile row only and does not immediately enter edit mode.
- PASS: duplicate profile names are blocked within the same device section/type when saving edits.
- PASS: duplicate names across different device types remain allowed because validation is scoped by device family.
- PASS: system defaults render from shared `src/engine/input` default profile records and are not copied into `player_controller_profiles` until Create Profile is clicked.
- PASS: default and user profiles are combined into one table per device section; Default appears first, is read-only, and has View only.
- PASS: user-created profiles keep Edit and Trash.
- PASS: Create my profile / Create User Control Profile appears below each combined profile table.
- PASS: Account User Controls page copy was renamed to User Controls.
- PASS: `Default profile in use` is not present; `Default Profile` is used.
- PASS: `Not applicable` is not present; page output uses `N/A`.
- PASS: keyboard defaults match the requested list and do not use Escape or Tab.
- PASS: mouse defaults include MouseButton0/2/1, wheel up/down, split MouseX/MouseY directions, and mouse movement rows show Deadzone `N/A`, Invert `N/A`, Sensitivity `100%`.
- PASS: joystick/controller defaults include extra unassigned buttons, DPad movement, triggers as `trigger.left/right`, and axis direction defaults.
- PASS: joystick/controller analog defaults show Deadzone `0.2`, Invert `Off`, Sensitivity `100%`.
- PASS: Keyboard Normalized Control choices exclude dpad and trigger controls.
- PASS: Keyboard does not show Deadzone, Invert, or Sensitivity.
- PASS: User Controls Normalized Control is editable for user profiles.
- PASS: Game Controls remains game-owned and device-agnostic; physical user controls stay in User Controls.
- PASS: DB-backed separation is preserved:
  - system defaults are system-owned shared input defaults.
  - `player_controller_profiles` is user/player owned.
  - `game_input_mappings` is game/project owned.
- PASS: shared `src/engine/input` usage is preserved.
- PASS: no sample JSON alignment, auth behavior, production account system, or unrelated rewrites were added.

## Changed Files
- `account/user-controls.html`
- `account/user-controls-page.js`
- `src/engine/input/NormalizedInputRegistry.js`
- `tests/playwright/tools/InputMappingV2Tool.spec.mjs`
- `docs_build/dev/reports/coverage_changed_js_guardrail.txt`
- `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- `docs_build/dev/reports/user-controls-defaults-and-profile-rules-report.md`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`

## Impacted Lanes
- runtime: Account/User Controls browser UI.
- engine: shared normalized input default registry.
- integration: Controls/User Controls shared DB/mock adapter usage.
- Playwright impacted: Yes.

## Testing Performed
- PASS: `node --check account/user-controls-page.js`
- PASS: `node --check src/engine/input/NormalizedInputRegistry.js`
- PASS: `node --check tests/playwright/tools/InputMappingV2Tool.spec.mjs`
- PASS: `node --check toolbox/controls/controls.js`
- PASS: `git diff --check`
- PASS: `npx playwright test tests/playwright/tools/InputMappingV2Tool.spec.mjs --grep "User Controls owns physical input mapping accordions and profiles"`
- PASS: `npx playwright test tests/playwright/tools/InputMappingV2Tool.spec.mjs --grep "Toolbox Controls|Game Controls"`
- PASS: `npx playwright test tests/playwright/tools/InputMappingV2Tool.spec.mjs`

## Playwright Result
- PASS: full targeted Controls/Input Mapping spec passed, 7/7 tests.
- V8 coverage report updated at `docs_build/dev/reports/playwright_v8_coverage_report.txt`.
- Covered changed runtime files:
  - `account/user-controls-page.js`: 93% function coverage.
  - `src/engine/input/NormalizedInputRegistry.js`: 89% function coverage.
- Note: the coverage reporter also includes advisory HEAD-diff warnings for dev-runtime mock DB files from prior stacked work; those files were not changed by this PR.

## Manual Validation Steps
1. Open `/account/user-controls.html`.
2. Confirm page copy says `User Controls`, not `Account User Controls`.
3. Confirm each Keyboard, Mouse, and Game Controllers table starts with `Default Profile` and only a `View` action.
4. Click `View` for each default and verify the requested keyboard, mouse, and joystick/controller defaults.
5. Click `Create my profile` for Keyboard and confirm a saved profile row appears without opening edit mode.
6. Click `Edit` on the saved profile and confirm Normalized Control is editable and keyboard choices exclude dpad/trigger.
7. Create a second Keyboard profile, edit its name to duplicate the first, and confirm save is blocked.
8. Confirm created profiles persist after reload and defaults were not saved into `player_controller_profiles` before Create Profile.

## Skipped Lanes
- samples: skipped by request; this PR changes setup UI/defaults and does not touch sample JSON/runtime games.
- full samples smoke: skipped by request.
- production account/auth validation: skipped because no production account or auth behavior changed.

## 100% Completion Check
- PASS: every requested PR_26162_050 defaults/profile-rules item is implemented, validated, and explicitly checked above.
