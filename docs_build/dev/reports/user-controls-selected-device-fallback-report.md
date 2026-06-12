# PR_26162_050-user-controls-selected-device-fallback

## Branch Validation
- PASS: current branch `main`.
- Expected branch: `main`.

## Requirement Checklist
- PASS: `account/user-controls.html` includes a `Selected Device` radio workflow.
- PASS: radio choices include Keyboard, Mouse, detected game controllers, and saved user-created profiles.
- PASS: selected device/profile is persisted through the shared DB/mock adapter in `player_input_device_selections`.
- PASS: connected selections show the selected device/profile as active.
- PASS: unavailable saved device/profile shows `Selected device not connected. Using Default Profile.`
- PASS: no game-start controller picker behavior was added.
- PASS: default profiles are rendered from system default profile records and are not copied into `player_controller_profiles`.
- PASS: default rows are read-only and expose `View` only.
- PASS: user-created profile rows remain editable and deletable with `Edit` and `Trash`.
- PASS: `Create my profile` / `Create User Control Profile` actions are below the combined profile tables.
- PASS: DB-backed ownership separation is preserved:
  - system defaults are system-owned runtime defaults.
  - `player_controller_profiles` remains user/player owned.
  - `game_input_mappings` remains game/project owned.
- PASS: no sample JSON alignment, auth behavior, production account system, or unrelated rewrites were added.

## Changed Files
- `account/user-controls.html`
- `account/user-controls-page.js`
- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/codex_review.diff`
- `src/dev-runtime/persistence/mock-db-store.js`
- `src/dev-runtime/persistence/tool-repositories/input-mapping-mock-repository.js`
- `tests/playwright/tools/InputMappingV2Tool.spec.mjs`
- `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- `docs_build/dev/reports/coverage_changed_js_guardrail.txt`
- `docs_build/dev/reports/user-controls-selected-device-fallback-report.md`

## Impacted Lanes
- runtime: Account User Controls browser UI.
- integration: shared controls mock DB adapter.
- Playwright impacted: Yes.

## Testing Performed
- PASS: `node --check account/user-controls-page.js`
- PASS: `node --check src/dev-runtime/persistence/tool-repositories/input-mapping-mock-repository.js`
- PASS: `node --check src/dev-runtime/persistence/mock-db-store.js`
- PASS: `node --check tests/playwright/tools/InputMappingV2Tool.spec.mjs`
- PASS: `git diff --check`
- PASS: `npx playwright test tests/playwright/tools/InputMappingV2Tool.spec.mjs --grep "Account User Controls owns physical input mapping accordions and profiles"`
- PASS: `npx playwright test tests/playwright/tools/InputMappingV2Tool.spec.mjs --grep "Account|shared engine input contracts"`
- PASS: `npx playwright test tests/playwright/tools/InputMappingV2Tool.spec.mjs`

## Playwright Result
- PASS: 7/7 targeted Controls/Input Mapping tests passed.
- Coverage artifact updated: `docs_build/dev/reports/playwright_v8_coverage_report.txt`.
- V8 coverage exercised `account/user-controls-page.js` at 92% function coverage.
- Advisory warnings remain for dev-runtime repository files because Playwright V8 browser coverage does not collect server-side mock adapter modules.

## Manual Validation Steps
1. Open `/account/user-controls.html`.
2. Confirm `Selected Device` shows Keyboard and Mouse choices before profile creation.
3. Select Mouse, reload, and confirm Mouse remains selected.
4. Confirm Keyboard, Mouse, and Game Controllers tables each show a `Default Profile` row with `View` only.
5. Create Keyboard, Mouse, and Game Controller user profiles.
6. Confirm saved user profile rows show `Edit` and `Trash`.
7. Select a saved game controller profile, reload without a connected gamepad, and confirm `Selected device not connected. Using Default Profile.`
8. Confirm `player_controller_profiles` does not contain copied default profile rows.

## Skipped Lanes
- samples: skipped by request; this PR changes Account/User Controls setup and shared mock adapter state only.
- full samples smoke: skipped by request.
- production account/auth validation: skipped because no production account/auth behavior was changed.

## 100% Completion Check
- PASS: every requested PR_26162_050 item is implemented and validated.
