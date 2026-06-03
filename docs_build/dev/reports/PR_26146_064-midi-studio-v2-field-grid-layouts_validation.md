# PR_26146_064 MIDI Studio V2 Field Grid Layouts Validation

## Scope

- Continued from `PR_26146_063`.
- Refined Song Setup > Song Sheet into responsive editable and read-only/display field grids.
- Preserved Song Sheet structure-only ownership for Sections and Loop sections.
- Added shared MIDI Studio field-card states for editable, read-only, and unwired controls.
- Refined Instruments > Instrument Settings into a responsive bucket/field grid.
- Added a read-only derived Audible preview display field in Instrument Settings.
- Preserved Instruments as the SSoT owner for GM Type, GM Instrument/Patch, volume, and related configuration.
- Preserved Song Details Notes full-width bottom row, Octave Timeline Instruments accordion, selectedInstrumentId sync, canvas-backed Octave Timeline, Play/Stop, manifest import, multiple songs, Export tab ownership, and launch-specific NAV.

## Validation

PASS - `node --check tools/midi-studio-v2/js/controls/InstrumentGridControl.js`

PASS - `node --check tools/midi-studio-v2/js/controls/SongSheetControl.js`

PASS - `node --check tests/playwright/tools/MidiStudioV2.spec.mjs`

PASS - HTML restriction check found no inline script blocks, style blocks, inline event handlers, or inline style attributes in `tools/midi-studio-v2/index.html`.

PASS - `npx playwright test tests/playwright/tools/MidiStudioV2.spec.mjs --project=playwright -g "PR064"`

Result: 1 passed.

PASS - `npx playwright test tests/playwright/tools/MidiStudioV2.spec.mjs --project=playwright -g "PR064|PR063|PR062|PR061|PR060"`

Result: 5 passed.

PASS - `git diff --check`

PASS - Playwright V8 coverage report generated at `docs_build/dev/reports/playwright_v8_coverage_report.txt`.

PASS - Changed runtime JS coverage guardrail generated at `docs_build/dev/reports/coverage_changed_js_guardrail.txt`.

## Playwright Evidence

- Song Sheet editable fields render in a responsive grid with multiple columns when width is available.
- Song Sheet editable fields use editable field-card styling and remain enabled.
- Song Sheet derived fields render in a responsive read-only/display grid with no editable controls.
- Song Sheet derived fields expose read-only state.
- Song Sheet Sections and Loop sections continue updating the canonical song model.
- Instrument Settings buckets render in a responsive grid with multiple columns when width is available.
- Instrument Settings fields inside buckets render in responsive grids.
- Instrument editable fields use editable styling and remain enabled.
- Instrument derived Audible preview uses read-only/display styling.
- Future instrument controls remain red/unwired with tooltip/status.
- Instrument configuration edits continue updating canonical instrument data.
- Play and Stop still transition correctly.

## Samples Decision

SKIP - Full samples smoke test was not run per PR instruction. This PR is scoped to MIDI Studio V2 form layout and targeted tool behavior.

