# PR_26162_038-game-workspace-controls-cleanup

## Branch Validation
- PASS: Current branch is `main`.
- Expected branch: `main`.
- Evidence: `git status --short --branch` returned `## main...origin/main` before edits.

## Requirement Checklist
- PASS: Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before implementation.
- PASS: Stacked on the PR_26162_037 Game Workspace/Game Journey rename state already present in the repo.
- PASS: Removed duplicate leftover `toolbox/project-workspace` JavaScript artifacts.
- PASS: Kept `toolbox/project-workspace/index.html` only as an explicitly deprecated old-link shim to Game Workspace.
- PASS: Audited remaining Project terminology and removed active PR_037 cleanup leftovers in Controls.
- PASS: Renamed Controls game mapping persistence from dropped `projectId` writes to schema-backed `gameId` writes.
- PASS: Preserved `projectId` only as a compatibility read fallback for existing legacy in-memory rows before normalization.
- PASS: Reverted unrelated generated lane-report churn from `npm run test:workspace-v2`; retained only requested V8 coverage output.
- PASS: Regenerated final search evidence from the actual repo tree.
- PASS: Add Game Control visibly adds the full normalized game control set.
- PASS: Mapping count updates to the visible row count.
- PASS: Missing Game Control Mapping disappears after rows exist.
- PASS: Common rows are enabled and alternate rows are disabled.
- PASS: Rows display the requested columns: Enabled, Normalized Action Type, Usage Label, Input Family, D, H, U, DC, Drag, Axis, Object, State, Actions.
- PASS: Devices list renders seven accessible device/input capability rows with `title` and `aria-label` help text from shared engine input capability descriptors.
- PASS: Generic keyboard rows can be added and configured without binding to a physical user device.
- PASS: Generic mouse rows can be added and configured without binding to a physical user device.
- PASS: Account User Controls remains the physical user-specific mapping surface.
- PASS: Controls continues to use `src/engine/input` contracts and does not implement local keyboard/mouse/gamepad polling.
- PASS: No sample JSON, auth, production DB, or unrelated runtime changes were added.
- PASS: Required Playwright coverage was added/updated.
- PASS: Required V8 coverage report was produced at `docs_build/dev/reports/playwright_v8_coverage_report.txt`.

## Final Search Evidence
- PASS: `rg -n "Project Workspace|Project Journey|Project Progress|Project Status|Project Identity|Project Build Path" toolbox src/dev-runtime assets/theme-v2 tests/playwright package.json scripts -g "!docs_build/dev/reports/**"` returns only `tests/playwright/tools/GameWorkspaceMockRepository.spec.mjs:55`, a negative assertion that the deprecated page does not display Project Workspace.
- PASS: `rg -n "project-workspace|project-journey" toolbox src/dev-runtime assets/theme-v2 tests/playwright package.json scripts -g "!docs_build/dev/reports/**"` returns only `tests/playwright/tools/GameWorkspaceMockRepository.spec.mjs:50`, the intentional deprecated route validation.
- PASS: `Get-ChildItem -Recurse toolbox/project-workspace -File` returns only `toolbox/project-workspace/index.html`.
- PASS: `Get-ChildItem -Recurse toolbox/project-journey -File` returns no files.
- PASS: `rg -n "project-owned|Project" toolbox/controls toolbox/game-workspace toolbox/game-journey src/dev-runtime/persistence/tool-repositories/input-mapping-mock-repository.js tests/playwright/tools/InputMappingV2Tool.spec.mjs tests/playwright/tools/GameWorkspaceMockRepository.spec.mjs -g "!docs_build/dev/reports/**"` returns only the test negative assertion for Project Workspace.
- PASS with documented compatibility: `rg -n "projectId" src/dev-runtime/persistence/tool-repositories/input-mapping-mock-repository.js` returns compatibility fallback reads only. New Controls game input and custom action rows persist with `gameId`.
- DOCUMENTED: Broader `Project` hits remain in unrelated palette/assets compatibility surfaces such as Project Swatches, Project Assets, and `ownerProjectId`. They were not renamed in this Controls cleanup PR because they are outside the PR_037 old/new workflow mappings and would require a separate palette/assets rename PR.

## Changed Files
- `docs_build/dev/reports/PR_26162_038-game-workspace-controls-cleanup.md`
- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- `src/dev-runtime/persistence/tool-repositories/input-mapping-mock-repository.js`
- `tests/playwright/tools/GameWorkspaceMockRepository.spec.mjs`
- `tests/playwright/tools/InputMappingV2Tool.spec.mjs`
- `toolbox/controls/controls.js`
- `toolbox/controls/index.html`
- `toolbox/project-workspace/index.html`
- `toolbox/project-workspace/project-workspace-api-client.js` deleted
- `toolbox/project-workspace/project-workspace.js` deleted

## Impacted Lanes
- Controls tool runtime lane.
- Controls shared DB/mock adapter lane.
- Game Workspace/Game Journey route cleanup lane.
- Workspace contract lane through required `npm run test:workspace-v2`.
- Playwright impacted: Yes.

## Skipped Lanes
- Engine input lane: SKIPPED because no `src/engine/input` files changed. Existing shared input service usage was validated by Playwright source checks and runtime coverage.
- Samples lane: SKIPPED because no samples or sample JSON were changed, and the request explicitly scoped cleanup to Game Workspace route cleanup and Controls behavior.
- Full samples smoke: SKIPPED for the same reason.

## Samples Validation Decision
- SKIP: No sample JSON alignment, sample launch behavior, or samples smoke was in scope.

## Validation Performed
- PASS: `node --check toolbox/controls/controls.js`
- PASS: `node --check src/dev-runtime/persistence/tool-repositories/input-mapping-mock-repository.js`
- PASS: `node --check tests/playwright/tools/InputMappingV2Tool.spec.mjs`
- PASS: `node --check tests/playwright/tools/GameWorkspaceMockRepository.spec.mjs`
- PASS: `npx playwright test tests/playwright/tools/InputMappingV2Tool.spec.mjs --reporter=line` - 7 passed.
- PASS: `npx playwright test tests/playwright/tools/GameWorkspaceMockRepository.spec.mjs tests/playwright/tools/GameJourneyTool.spec.mjs --reporter=line` - 21 passed.
- PASS: `npm run test:workspace-v2` - workspace-contract lane passed, 5 passed.
- PASS: Final targeted Controls Playwright run regenerated V8 coverage after workspace-v2.

## Playwright Result
- PASS: Controls/Input Mapping Playwright coverage validates visible Add Game Control rows, mapping counts, missing-state removal, common/alternate enabled state, device help text, generic Keyboard/Mouse row creation and editing, persistence, and shared engine input ownership.
- PASS: Game Workspace/Game Journey Playwright coverage validates active Game Workspace and Game Journey routes, deprecated project-workspace old-link guidance, route registration, and route handoff.

## V8 Coverage
- PASS: `docs_build/dev/reports/playwright_v8_coverage_report.txt` produced from Playwright V8 coverage.
- PASS: `toolbox/controls/controls.js` collected at 83 percent advisory coverage in the final targeted Controls run.
- WARN: `src/dev-runtime/persistence/tool-repositories/input-mapping-mock-repository.js` is server/dev-runtime code and is not collected by browser V8 coverage. It is covered by the Controls Playwright behavior that writes and reads the shared mock DB adapter.

## Manual Validation Steps
1. Open `/toolbox/controls/index.html`.
2. Confirm the Controls lede and Devices guidance use game-owned wording.
3. Click `Add Game Control`.
4. Confirm 24 normalized rows are visible, `Mappings` shows 24, and `Missing Game Control Mapping` is gone.
5. Confirm common rows such as `action.primary` are enabled and Active, while alternate rows such as `aim.x+` are disabled.
6. Hover or inspect the Devices list and confirm seven device/input capability rows expose `title` and `aria-label` help text.
7. Click `Add Keyboard Control`, edit a row, save, and confirm the row persists through the shared mock DB.
8. Click `Add Mouse Control` and confirm Mouse rows are visible and persist.
9. Open `/toolbox/project-workspace/index.html` and confirm it displays Game Workspace old-link guidance without Project Workspace user-facing copy.
10. Open `/toolbox/game-workspace/index.html` and `/toolbox/game-journey/index.html` from active navigation and confirm both routes resolve.

## Notes
- `npm run test:workspace-v2` is a legacy command name retained by repo scripts. It was required by the request and passed.
- No package/script behavior changes were made.
- No active navigation points to old project-workspace or project-journey paths.
- No old project mock repositories are active.
- No broken imports from deleted project-workspace JavaScript artifacts remain.
