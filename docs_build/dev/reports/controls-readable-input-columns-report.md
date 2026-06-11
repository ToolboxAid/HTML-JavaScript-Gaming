# PR_26162_039-controls-readable-input-columns

## Branch Validation
- PASS: Current branch is `main`.
- Expected branch: `main`.
- Evidence: `git status --short --branch` returned `## main...origin/main` before edits.

## Requirement Checklist
- PASS: Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before edits.
- PASS: Verified branch `main` before edits.
- PASS: Continued from PR_26162_038 Controls state.
- PASS: Controls status remains Wireframe. Evidence: `src/dev-runtime/guest-seeds/tool-metadata-inventory.js` keeps `"status": "Wireframe"` for `controls`.
- PASS: Game Control Mapping headers now read `Down`, `Hold`, `Up`, `Double Click`, `Drag`, and `Axis`.
- PASS: Matching generated Controls labels now use readable text through `CONTROL_EVENT_OPTIONS`.
- PASS: Validation copy now says `Down, Hold, Up, Double Click, Drag, or Axis`.
- PASS: Internal DB field names such as `eventD`, `eventH`, `eventU`, and `eventDC` were preserved to avoid changing persisted mapping contracts.
- PASS: Existing DB-backed game input mappings and player controller profiles were preserved.
- PASS: Normalized input architecture and shared `src/engine/input` usage were preserved.
- PASS: Add Game Control behavior, seven device rows, common/alternate enabled state, and mapping counts were preserved by targeted Playwright coverage.
- PASS: No sample JSON alignment, auth behavior, production account system, or unrelated rewrites were added.

## Search Evidence
- PASS: Fixed-string search found no `<th>D</th>`, `<th>H</th>`, `<th>U</th>`, or `<th>DC</th>` in `toolbox/controls`.
- PASS: Fixed-string search found no `Choose at least one event: D, H, U, DC` in `toolbox/controls`.
- PASS: Fixed-string search found no `label: "D"`, `label: "H"`, `label: "U"`, or `label: "DC"` in `toolbox/controls`.
- DOCUMENTED: `eventD`, `eventH`, `eventU`, and `eventDC` remain as internal persisted field names only.

## Changed Files
- `docs_build/dev/reports/controls-readable-input-columns-report.md`
- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- `tests/playwright/tools/InputMappingV2Tool.spec.mjs`
- `toolbox/controls/controls.js`
- `toolbox/controls/index.html`

## Impacted Lane
- Controls/Input Mapping runtime lane.
- Playwright impacted: Yes.

## Skipped Lanes
- Samples lane: SKIPPED because no sample files or sample JSON contracts changed.
- Auth/account production lane: SKIPPED because no auth or production account behavior changed.
- Engine input lane: SKIPPED because no `src/engine/input` files changed; shared engine-input usage is covered by the targeted Controls Playwright spec.

## Validation Performed
- PASS: `node --check toolbox/controls/controls.js`
- PASS: `node --check tests/playwright/tools/InputMappingV2Tool.spec.mjs`
- PASS: `npx playwright test tests/playwright/tools/InputMappingV2Tool.spec.mjs --reporter=line` - 7 passed.

## Playwright Result
- PASS: Table headers show readable event labels instead of `D`, `H`, `U`, and `DC`.
- PASS: Add Game Control still adds all normalized rows.
- PASS: Mapping count still updates.
- PASS: Seven device rows still render with hover/aria help.
- PASS: Persistence after reload remains covered by the Controls/Input Mapping spec.

## V8 Coverage
- PASS: `docs_build/dev/reports/playwright_v8_coverage_report.txt` was produced from the targeted Playwright run.
- PASS: `toolbox/controls/controls.js` appears in the coverage report with 83 percent advisory coverage.

## Manual Validation Steps
1. Open `/toolbox/controls/index.html`.
2. Confirm the Game Controls table headers read `Down`, `Hold`, `Up`, `Double Click`, `Drag`, and `Axis`.
3. Click `Add Game Control`.
4. Confirm all normalized rows appear, mapping counts update, and Missing Game Control Mapping disappears.
5. Inspect a row and confirm checkbox accessible labels use readable event text.
6. Reload the page and confirm saved mappings persist.
7. Confirm the Devices list still shows seven rows with hover/aria help.

## Samples Validation Decision
- SKIP: Full samples validation was not run because this PR only changes Controls UI labels/tests and does not touch sample JSON or sample runtime behavior.
