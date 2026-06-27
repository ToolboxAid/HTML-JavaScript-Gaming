# PR_26162_040-controls-game-and-user-input-foundation

## Branch Validation
- PASS: Current branch is `main`.
- Expected branch: `main`.
- Evidence: `git status --short --branch` returned `## main...origin/main` before edits and again during closeout.

## Requirement Checklist
- PASS: Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before edits.
- PASS: Verified branch `main` before edits.
- PASS: Continued from PR_26162_039.
- PASS: Controls status remains Wireframe. Evidence: `src/dev-runtime/guest-seeds/tool-metadata-inventory.js` still shows the Controls metadata with `"status": "Wireframe"`.
- PASS: Controls data remains DB-backed through the shared Controls repository. Evidence: `toolbox/controls/controls.js` and `account/user-controls-page.js` continue to use `createControlsToolApiRepository()`.
- PASS: User-facing `Game Input Mapping` surface was renamed to `Game Controls`.
- PASS: `Add Game Control` seeds default Keyboard, Mouse, and Joystick game control rows while preserving normalized game action rows.
- PASS: Keyboard, Mouse, Joystick, and Gamepad game controls render in separate accordions.
- PASS: Gamepad device status auto-detects on a timer through `InputService`; no direct Controls or Account page `navigator.getGamepads` polling was added.
- PASS: Checked Press/Hold/Release/Double Press/Drag/Axis event boxes receive visible Theme V2 status styling and checked-state metadata.
- PASS: The Object table column is hidden when Global is the only object option. The Object footer selector and summary remain available for future object-backed rows.
- PASS: The visible State column was removed because it duplicated Enabled. The persisted `state` compatibility field now mirrors Enabled as `Active` or `Disabled`.
- PASS: Added bottom `Combo Controls` accordion as wireframe-only copy with the example `Keyboard Shift + Mouse Right Click`.
- PASS: No combo runtime behavior was implemented.
- PASS: User Controls appears in the Account dropdown and dev-runtime local header mirror; Account dropdown and side navigation remain alphabetically sorted browseable lists.
- PASS: Account/User Controls owns physical input to normalized input. Game Controls owns normalized input to game action.
- PASS: Keyboard and Mouse User Controls are visible as default fallbacks and can be saved as generic DB-backed user profiles.
- PASS: Keyboard and Mouse defaults are not silently saved as user-created profiles; Playwright verifies zero saved profiles before the creator saves one.
- PASS: Gamepads auto-detect on a timer in Account/User Controls.
- PASS: Defaults remain visible fallbacks and are not silently saved as user-created profiles.
- PASS: No sample JSON alignment, auth behavior, production account system, or unrelated runtime rewrites were added.

## Search Evidence
- PASS: `rg -n "Game Input Mapping|State: Active|Mapping State|<th>State</th>|Double Click" toolbox/controls account/user-controls.html account/user-controls-page.js tests/playwright/tools/InputMappingV2Tool.spec.mjs src/dev-runtime/admin/header-nav.local.html` returned no matches.
- PASS: `rg --pcre2 -n "<script(?![^>]*\\bsrc=)|<style\\b|\\son[a-z]+=" toolbox/controls/index.html account/user-controls.html src/dev-runtime/admin/header-nav.local.html` returned no matches.
- PASS: `rg -n "navigator\\.getGamepads|gamepadconnected" toolbox/controls/controls.js account/user-controls-page.js` returned no matches.
- PASS: `rg -n "State|Object" toolbox/controls/index.html` shows only hidden Object headers plus footer Object selector/summary; no visible State table column remains.
- PASS: Final Playwright assertions validate `Game Controls`, `Keyboard Controls`, `Mouse Controls`, `Joystick Controls`, `Gamepad Controls`, `Combo Controls`, and `Default Keyboard/Mouse Fallbacks`.

## Changed Files
- `account/user-controls-page.js`
- `account/user-controls.html`
- `src/dev-runtime/admin/header-nav.local.html`
- `tests/playwright/tools/InputMappingV2Tool.spec.mjs`
- `toolbox/controls/controls.js`
- `toolbox/controls/index.html`
- Required/generated reports under `docs_build/dev/reports/`

## Impacted Lanes
- Controls/Input Mapping runtime lane.
- Account/User Controls navigation and runtime lane.
- Workspace contract lane because the request explicitly required `npm run test:workspace-v2`.
- Playwright impacted: Yes.

## Skipped Lanes
- Full samples validation: SKIPPED because no sample JSON, sample runtime, or sample launch behavior changed.
- Production auth/account lane: SKIPPED because the Account/User Controls work remains mock-adapter-backed and does not change production auth.
- Engine input lane: SKIPPED because no `src/engine/input` source files changed; targeted Playwright verifies Controls and Account/User Controls consume engine input services instead of local input polling.

## Validation Performed
- PASS: `node --check toolbox/controls/controls.js`
- PASS: `node --check account/user-controls-page.js`
- PASS: `node --check account/user-controls.js`
- PASS: `node --check tests/playwright/tools/InputMappingV2Tool.spec.mjs`
- PASS: `npx playwright test tests/playwright/tools/InputMappingV2Tool.spec.mjs --reporter=line` - final run 7 passed.
- PASS: `npm run test:workspace-v2` - 5 passed.
- NOTE: One intermediate targeted Playwright rerun reported a transient failed request for `assets/theme-v2/js/gamefoundry-partials.js`; the same command was rerun without code changes and passed 7/7.

## Playwright Result
- PASS: Keyboard, Mouse, Joystick, and Gamepad accordions render separately.
- PASS: Add Game Control adds visible normalized rows and updates mapping counts.
- PASS: Missing Game Control Mapping disappears once rows exist.
- PASS: Common rows are enabled and alternate rows are disabled.
- PASS: Event headers use `Press`, `Hold`, `Release`, `Double Press`, `Drag`, and `Axis`.
- PASS: Checked event boxes expose visible checked-state styling.
- PASS: Object column is hidden when only Global is available.
- PASS: State column is removed from the table.
- PASS: Combo Controls accordion exists as wireframe-only.
- PASS: Account/User Controls default Keyboard and Mouse fallbacks are visible and not silently saved.
- PASS: Generic Keyboard and Mouse user profiles can be saved through the shared DB/mock adapter.
- PASS: Gamepads auto-detect in Account/User Controls without clicking Refresh Devices.
- PASS: User Controls appears in Account navigation and sorted Account side navigation remains intact.
- PASS: Persistence after reload remains covered for game mappings and player controller profiles.

## V8 Coverage
- PASS: `docs_build/dev/reports/playwright_v8_coverage_report.txt` was produced from the final targeted Playwright run.
- PASS: Changed runtime JS coverage includes `toolbox/controls/controls.js` at 87 percent advisory coverage.
- PASS: Changed runtime JS coverage includes `account/user-controls-page.js` at 92 percent advisory coverage.

## Manual Validation Steps
1. Open `/toolbox/controls/index.html`.
2. Confirm the center accordion is labeled `Game Controls`.
3. Click `Add Game Control`.
4. Confirm Keyboard, Mouse, and Joystick rows appear in their separate accordions and the mapping count updates.
5. Confirm the Gamepad accordion is present and device diagnostics update after a browser-exposed gamepad appears.
6. Confirm checked event boxes are visibly highlighted.
7. Confirm Object is not visible as a table column when only Global exists and State is not visible as a table column.
8. Open the Combo Controls accordion and confirm it is wireframe-only with `Keyboard Shift + Mouse Right Click`.
9. Open `/account/user-controls.html`.
10. Confirm `Default Keyboard/Mouse Fallbacks` are visible before any profile is saved.
11. Create and save generic Keyboard and Mouse profiles, then reload and confirm they persist.
12. Confirm User Controls appears in the Account dropdown and side navigation.

## Samples Validation Decision
- SKIP: Full samples validation was not run because this PR does not change samples, sample JSON, or playable sample runtime behavior.
