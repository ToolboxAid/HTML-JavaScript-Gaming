# PR_26146_066 MIDI Studio V2 Timeline Instrument Compact Duplicate Validation

## Scope

PASS - Continued from PR_26146_065 and kept this PR focused on MIDI Studio V2 Octave Timeline quick instrument controls plus Instruments tab setting ownership.

## Implementation

- PASS - Octave Timeline Instruments accordion now uses 10px top and bottom margins on the accordion and content.
- PASS - Octave Timeline quick instrument rows are compact and contain only active instrument selection plus mute, solo, and hide/show controls.
- PASS - Added icon-only Duplicate control to the Octave Timeline Instruments header before the Add and X controls.
- PASS - Duplicate copies the selected instrument lane data, GM type, GM patch, volume, pan, visibility, mute, and solo state into a unique new instrument id/name.
- PASS - Duplicated instrument becomes the shared selected instrument and updates the canonical song model.
- PASS - Instruments > Instrument Settings no longer exposes Mute default or Solo default fields.
- PASS - GM Type and GM Instrument editing remain owned by the Instruments tab.

## Validation

- PASS - `node --check tools/midi-studio-v2/js/controls/InstrumentGridControl.js`
- PASS - `node --check tools/midi-studio-v2/js/MidiStudioV2App.js`
- PASS - `node --check tools/midi-studio-v2/js/bootstrap.js`
- PASS - `node --check tests/playwright/tools/MidiStudioV2.spec.mjs`
- PASS - `rg --pcre2 -n "<script(?![^>]*src=)|<style\\b|\\sstyle=|\\son[a-z]+=" tools/midi-studio-v2/index.html` returned no inline script/style/event handler matches.
- PASS - `npx playwright test tests/playwright/tools/MidiStudioV2.spec.mjs --project=playwright --grep "PR066"` passed 1 test.
- PASS - `npx playwright test tests/playwright/tools/MidiStudioV2.spec.mjs --project=playwright --grep "PR0(60|61|62|63|64|65|66)"` passed 7 tests.
- PASS - `git diff --check`
- PASS - `npm run codex:review-artifacts`

## Notes

- Full samples smoke test was not run per instruction.
- Earlier PR066 validation attempts found and fixed the timeline margin specificity, row stretch compactness, and the test setup for Play/Stop after duplicating a hidden/muted lane.
