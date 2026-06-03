# PR_26146_063 MIDI Studio V2 Song Notes And Timeline Instruments Layout Validation

## Scope

- Continued from `PR_26146_062`.
- Moved editable Notes to the bottom of Song Setup > Song Details.
- Kept Notes as the only field on the bottom Song Details row and spanning the full Song Details width.
- Restored Octave Timeline quick Instruments in the left column as an accordion.
- Kept Octave Timeline quick controls limited to select, mute, solo, and hide/show.
- Preserved GM Type and GM Instrument/Patch ownership in the Instruments tab.
- Preserved selectedInstrumentId sync, canvas-backed note editing, and Play/Stop.

## Validation

PASS - `node --check tools/midi-studio-v2/js/controls/SongDetailsControl.js`

PASS - `node --check tools/midi-studio-v2/js/bootstrap.js`

PASS - `node --check tools/midi-studio-v2/js/MidiStudioV2App.js`

PASS - `node --check tools/midi-studio-v2/js/controls/SongSheetControl.js`

PASS - `node --check tools/midi-studio-v2/js/services/MidiStudioStateSerializer.js`

PASS - `node --check tools/midi-studio-v2/js/controls/InstrumentGridControl.js`

PASS - `node --check tests/playwright/tools/MidiStudioV2.spec.mjs`

PASS - HTML restriction check found no inline script blocks, style blocks, inline event handlers, or inline style attributes in `tools/midi-studio-v2/index.html`.

WARN - `npx playwright test tests/playwright/tools/MidiStudioV2.spec.mjs --project=chromium -g "PR063|PR062|PR061|PR060"` was not a valid local project name. The repo exposes `playwright`.

PASS - `npx playwright test tests/playwright/tools/MidiStudioV2.spec.mjs --project=playwright -g "PR063|PR062|PR061|PR060"`

Result: 4 passed.

PASS - `git diff --check`

PASS - Playwright V8 coverage report generated at `docs_build/dev/reports/playwright_v8_coverage_report.txt`.

PASS - Changed runtime JS coverage guardrail generated at `docs_build/dev/reports/coverage_changed_js_guardrail.txt`.

## Playwright Evidence

- Notes renders below the Song Details core fields.
- Notes is the only bottom-row Song Details field.
- Notes spans the available Song Details width.
- Tempo/BPM, Key, and Style remain editable in Song Details.
- Song Sheet remains structure-only and does not duplicate Tempo/BPM, Key, or Style.
- Octave Timeline left column contains the Instruments accordion.
- Octave Timeline Instruments contains quick select, mute, solo, and hide/show controls.
- GM Type and GM Instrument/Patch dropdowns are absent from Octave Timeline and visible in the Instruments tab.
- Selecting an instrument in Octave Timeline syncs `selectedInstrumentId` to the Instruments tab.
- Selecting an instrument in Instruments syncs back to Octave Timeline quick controls.
- Play and Stop still transition correctly.

## Samples Decision

SKIP - Full samples smoke test was not run per PR instruction. This PR is scoped to MIDI Studio V2 layout and targeted tool behavior.

