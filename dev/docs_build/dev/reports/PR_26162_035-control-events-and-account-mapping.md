# PR_26162_035-control-events-and-account-mapping

## Branch Validation
- PASS: Current branch is `main`.
- PASS: Expected branch is `main`.

## Impacted Lane
- Controls/Input Mapping runtime.
- Account user control mapping page.
- Game Configuration setup surface.
- Shared mock DB adapter schemas/repositories for input mappings and game configuration.
- `src/engine/input` normalized input registry.
- Workspace V2 contract tests touched only to keep required `npm run test:workspace-v2` aligned with the current root tools surface.

## Requirement Checklist
- PASS: Game Controls and Account User Controls are separated. Game Controls owns project/game normalized mappings; Account User Controls owns physical keyboard/mouse/gamepad/controller profile mappings.
- PASS: Game Controls no longer displays or owns controller profile UI, controller profile DB writes, physical input rows, controller ids, or controller names.
- PASS: Account User Controls page maps physical inputs to generic normalized controls and does not define game behavior or gameplay event phases.
- PASS: Game Control event model persists only `D`, `H`, `U`, `DC`, `Drag`, and `Axis` event fields.
- PASS: `DU` and `DHU` are not persisted as gameplay event types.
- PASS: Separate `D`, `H`, and `U` rows on the same normalized input are supported and tested.
- PASS: Game Input Mapping columns include Enabled, Normalized Action Type, Usage Label, Input Family, D, H, U, DC, Drag, Axis, Object, State, and Actions.
- PASS: Usage labels are user-editable.
- PASS: Normalized action types are fixed registry values; custom normalized action types are rejected.
- PASS: Enabled + unmapped rows show actionable validation and do not save as valid.
- PASS: Disabled unmapped rows are intentional alternates and do not block validation.
- PASS: Presets were added for Platformer, Shooter, Paddle/Ball, Menu, Vehicle, Fighting, and Party/Arena.
- PASS: Common preset rows are enabled by default and alternate preset rows are disabled by default.
- PASS: Player Mode moved to Game Configuration and persists outside Controls with `1 Player`, `2+ Turn Based`, and `2+ Concurrent`.
- PASS: Controls does not own Player Mode.
- PASS: Supported generic control types are surfaced in Game Controls and Account User Controls.
- PASS: Existing `src/engine/input` services/classes are used for normalized input options, gamepad/device detection, and profile mapping support.
- PASS: No inline script blocks, inline style blocks, or inline event handlers were added.
- PASS: No sample JSON, auth behavior, production account system, or unrelated runtime behavior was added.

## Changed Files
- Account navigation/page: `account/user-controls.html`, `account/user-controls.js`, `account/user-controls-page.js`, account side-nav pages.
- Shared navigation: `assets/theme-v2/js/gamefoundry-partials.js`, Theme V2 partials.
- Controls: `toolbox/controls/index.html`, `toolbox/controls/controls.js`.
- Game setup: `toolbox/game-configuration/index.html`, `toolbox/game-configuration/game-configuration.js`, `toolbox/game-configuration/game-configuration-api-client.js`.
- Shared persistence/runtime: `src/dev-runtime/persistence/mock-db-store.js`, `src/dev-runtime/persistence/tool-repositories/input-mapping-mock-repository.js`, `src/dev-runtime/persistence/tool-repositories/game-configuration-mock-repository.js`, `src/dev-runtime/server/mock-api-router.mjs`.
- Engine input: `src/engine/input/NormalizedInputRegistry.js`.
- Tests: `tests/playwright/tools/InputMappingV2Tool.spec.mjs`, `tests/playwright/tools/RootToolsFutureState.spec.mjs`, `tests/playwright/tools/AdminDbViewer.spec.mjs`, `tests/playwright/tools/GameConfigurationMockRepository.spec.mjs`, `tests/input/NormalizedInputRegistry.test.mjs`.
- Validation generated reports under `docs_build/dev/reports/`.

## Validation Performed
- PASS: `node --check toolbox/controls/controls.js; node --check account/user-controls.js; node --check account/user-controls-page.js; node --check toolbox/game-configuration/game-configuration.js; node --check toolbox/game-configuration/game-configuration-api-client.js`
- PASS: `node --check src/dev-runtime/persistence/tool-repositories/input-mapping-mock-repository.js; node --check src/dev-runtime/persistence/tool-repositories/game-configuration-mock-repository.js; node --check src/dev-runtime/persistence/mock-db-store.js; node --check src/dev-runtime/server/mock-api-router.mjs; node --check src/engine/input/NormalizedInputRegistry.js`
- PASS: `node --check tests/playwright/tools/InputMappingV2Tool.spec.mjs; node --check tests/playwright/tools/AdminDbViewer.spec.mjs; node --check tests/playwright/tools/GameConfigurationMockRepository.spec.mjs; node --check tests/playwright/tools/RootToolsFutureState.spec.mjs; node --check tests/input/NormalizedInputRegistry.test.mjs`
- PASS: `node tests/input/NormalizedInputRegistry.test.mjs`
- PASS: `npx playwright test tests/playwright/tools/InputMappingV2Tool.spec.mjs --reporter=line` (5 passed)
- PASS: `npm run test:workspace-v2` (5 passed)

## Playwright Result
- PASS: Targeted Controls/Input Mapping Playwright coverage verifies preset population, enabled validation, D/H/U split rows, DC/Drag/Axis persistence, Account User Controls physical-to-normalized mapping, Player Mode persistence from Game Configuration, and generic game mapping records without controller identity fields.
- PASS: Playwright impacted: Yes.

## V8 Coverage
- Report: `docs_build/dev/reports/playwright_v8_coverage_report.txt`.
- Covered changed browser runtime files include `toolbox/controls/controls.js` (83%), `account/user-controls-page.js` (88%), `account/user-controls.js` (100%), `toolbox/game-configuration/game-configuration.js` (100%), `toolbox/game-configuration/game-configuration-api-client.js` (100%), `src/engine/input/NormalizedInputRegistry.js` (80%), and `assets/theme-v2/js/gamefoundry-partials.js` (60%).
- Advisory WARN entries remain for Node-side mock DB/router modules because Playwright/Chromium V8 coverage does not collect server-side modules.

## Manual Validation Steps
1. Open `/toolbox/controls/index.html` and confirm the page is titled Game Controls and contains no controller-profile editor.
2. Use each preset button and confirm common rows are enabled and alternates are disabled.
3. Add/edit a row and confirm fixed Normalized Action Type values, Usage Label, Input Family, D/H/U/DC/Drag/Axis fields, Object, State, and Actions are available.
4. Try saving an enabled row without a normalized action type, usage label, or event and confirm visible validation.
5. Save separate `action.primary` rows for D, H, and U and confirm they persist after reload.
6. Open `/account/user-controls.html`, refresh devices, create a profile, assign physical inputs to normalized controls, and confirm no game action or gameplay event fields appear.
7. Open `/toolbox/game-configuration/index.html`, set Player Mode, reload, and confirm Controls does not own that setting.

## Skipped Lanes
- Samples validation skipped: safe to skip because this PR did not change sample JSON, sample runtime, sample assets, or sample launch behavior.
- Full samples smoke skipped: not part of the requested validation and no sample lane was impacted.
- Production account/auth validation skipped: Account User Controls uses the shared DB/mock adapter only; no auth or production account behavior was added.

## Review Artifacts
- Required diff artifact: `docs_build/dev/reports/codex_review.diff`.
- Required changed-files artifact: `docs_build/dev/reports/codex_changed_files.txt`.

## Packaging
- Required repo-structured delta ZIP path: `tmp/PR_26162_035-control-events-and-account-mapping_delta.zip`.
