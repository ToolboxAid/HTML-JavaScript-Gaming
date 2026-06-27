# PR_26161_032-controls-player-controller-split

## Branch Validation
- Current branch: `main`
- Expected branch: `main`
- Result: PASS

## Impacted Lane
- Tool/runtime lane: Controls / Input Mapping
- Shared engine lane: `src/engine/input` normalization
- Shared DB lane: mock adapter schemas for Controls tables
- Playwright impacted: Yes

## Scope Summary
- Split Controls into visible `Game Controls` and `Player Controller Profiles` sections.
- `Game Controls` now owns normalized-input-to-game-action mappings: `Normalized Input`, `Game Action`, `Object`, `State`.
- `Player Controller Profiles` now owns physical-input-to-normalized-input mappings: `Physical Controller`, `Physical Input`, `Normalized Input`, analog `Deadzone`, analog `Invert`.
- Added shared `src/engine/input/NormalizedInputRegistry.js` for the normalized input registry and default physical-input normalization.
- Exposed normalized input helpers through `InputService`.
- Extended the shared mock DB adapter so game mappings persist `normalizedInput` and player profiles persist `inputMappings`.

## Requirement Checklist
- PASS - Read `docs_build/dev/PROJECT_INSTRUCTIONS.md`.
- PASS - Verified branch is `main` before edits.
- PASS - Continued from PR_26161_031 behavior while changing ownership.
- PASS - Controller normalization is required for current Controls flow.
- PASS - Controls has clear `Game Controls` and `Player Controller Profiles` sections.
- PASS - Game mappings use `Normalized Input`, `Game Action`, `Object`, and `State`.
- PASS - Player profiles use `Physical Controller`, `Physical Input`, `Normalized Input`, `Deadzone`, and `Invert`.
- PASS - Physical controller buttons are not mapped directly to game actions.
- PASS - Physical inputs route through normalized inputs before game actions.
- PASS - Added normalized registry entries: `move.x`, `move.y`, `aim.x`, `aim.y`, `button.south`, `button.east`, `button.west`, `button.north`, `dpad.up`, `dpad.down`, `dpad.left`, `dpad.right`, `trigger.left`, `trigger.right`, `start`, `select`.
- PASS - Controller profile data persists through the shared DB/mock adapter.
- PASS - Game control mapping data persists through the shared DB/mock adapter.
- PASS - Keyboard and Mouse are included in the same normalization model.
- PASS - Missing profile status appears as `Missing Controller Profile` with `Create Player Controller Profile`.
- PASS - Missing game mapping status appears as `Missing Game Control Mapping`.
- PASS - Controls uses `src/engine/input` services/helpers; no direct `navigator.getGamepads` polling is present in `toolbox/controls/controls.js`.
- PASS - Added the smallest shared engine/input extension needed for normalization.
- PASS - Preserved compatible table-first editing, Add, Cancel, Edit, Trash, Reset confirmation, custom actions, object-aware action filtering, DB reload persistence, and deprecated input-mapping-v2 guidance.
- PASS - Did not add sample JSON alignment, auth behavior, production account behavior, or unrelated rewrites.
- PASS - Kept Theme V2 only; no inline CSS, inline JS, script blocks, style blocks, or inline event handlers were added.

## Testing Performed
- PASS - `node --check toolbox/controls/controls.js`
- PASS - `node --check src/engine/input/NormalizedInputRegistry.js`
- PASS - `node --check src/engine/input/InputService.js`
- PASS - `node --check src/dev-runtime/persistence/mock-db-store.js`
- PASS - `node --check src/dev-runtime/persistence/tool-repositories/input-mapping-mock-repository.js`
- PASS - `node --check tests/playwright/tools/InputMappingV2Tool.spec.mjs`
- PASS - `git diff --check -- toolbox/controls/index.html toolbox/controls/controls.js src/engine/input/InputService.js src/engine/input/NormalizedInputRegistry.js src/dev-runtime/persistence/mock-db-store.js src/dev-runtime/persistence/tool-repositories/input-mapping-mock-repository.js tests/input/NormalizedInputRegistry.test.mjs tests/playwright/tools/InputMappingV2Tool.spec.mjs`
- PASS - `node tests/input/NormalizedInputRegistry.test.mjs`
- PASS - `node tests/input/InputService.test.mjs`
- PASS - `npx playwright test tests/playwright/tools/InputMappingV2Tool.spec.mjs --workers=1` (5 passed)

## Playwright Coverage
- PASS - `docs_build/dev/reports/playwright_v8_coverage_report.txt` generated.
- PASS - `toolbox/controls/controls.js` covered at 93%.
- PASS - `src/engine/input/NormalizedInputRegistry.js` covered at 100%.
- WARN - `src/dev-runtime/persistence/mock-db-store.js` and `src/dev-runtime/persistence/tool-repositories/input-mapping-mock-repository.js` are server/dev-runtime files and were not collected by browser V8 coverage.
- WARN - `src/engine/input/InputService.js` has advisory low function coverage, but all executed lines were collected and existing targeted Node validation passed.

## Manual Validation Steps
- Open `/toolbox/controls/index.html`.
- Confirm the center panel shows `Game Controls` and `Player Controller Profiles`.
- In `Game Controls`, add a row with a normalized input such as `move.x`, choose a game action and object, save, reload, and confirm persistence.
- In `Player Controller Profiles`, select Keyboard, Mouse, or a detected gamepad and create a player profile.
- Edit a player profile and confirm physical inputs map only to normalized inputs, with deadzone/invert controls on analog axes.
- Delete/reset records and confirm persistence after reload.

## Skipped Lanes
- Full samples validation: SKIP. Samples are explicitly out of scope for this Controls/input normalization PR.
- Full workspace suite: SKIP. Targeted Controls Playwright covered the changed tool behavior; no sample JSON, auth, or production account changes were made.
- Production runtime/gameplay validation: SKIP. This PR updates Controls authoring data and shared normalization helpers only; no production gameplay runtime integration was added.

## Runtime Behavior
- No sample JSON alignment changed.
- No auth behavior changed.
- No production account behavior changed.
- No unrelated tool ownership changed.
- Engine input was extended only with the normalized registry/helper surface required by this PR.

## Required Artifacts
- PASS - `docs_build/dev/reports/controls-player-controller-split-report.md`
- PASS - `docs_build/dev/reports/codex_review.diff`
- PASS - `docs_build/dev/reports/codex_changed_files.txt`
- PASS - `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- PASS - `tmp/PR_26161_032-controls-player-controller-split_delta.zip`
