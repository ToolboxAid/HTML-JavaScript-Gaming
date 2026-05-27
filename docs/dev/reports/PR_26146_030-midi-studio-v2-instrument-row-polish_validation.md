# PR_26146_030 MIDI Studio V2 Instrument Row Polish Validation

Status: PASS

## Scope

- Continued from PR_26146_029.
- Replaced visible Mute/Solo text controls with CSS-drawn icon controls.
- Kept Mute, Solo, Eye visibility, and Delete/X controls on one horizontal row.
- Increased the MIDI Studio V2 left column by 350px and verified instrument controls fit without wrapping or clipping.
- Applied gray styling to non-selected instrument notes.
- Gave selected instrument note cells a higher draw layer than dimmed/non-selected note cells.
- Preserved PR029 octave density and multi-note/chord behavior.
- Preserved GM Type + Instrument dropdown behavior.
- Preserved playback, Play/Stop, and Stop All Audio behavior.

## Changed Files

- `tools/midi-studio-v2/js/controls/InstrumentGridControl.js`
- `tools/midi-studio-v2/styles/midiStudioV2.css`
- `tests/playwright/tools/MidiStudioV2.spec.mjs`
- `docs/dev/reports/PR_26146_030-midi-studio-v2-instrument-row-polish_validation.md`

## Validation

- PASS: `node --check tools/midi-studio-v2/js/controls/InstrumentGridControl.js`
- PASS: `node --check tests/playwright/tools/MidiStudioV2.spec.mjs`
- PASS: `npx playwright test tests/playwright/tools/MidiStudioV2.spec.mjs -g "octave timeline editor is the default editable and playable Studio workflow|octave grid density supports icon controls and simultaneous chord editing" --reporter=list --workers=1 --timeout=60000`
  - 2 passed.
- PASS: `git diff --check`
  - No whitespace errors. Git emitted LF-to-CRLF working-copy warnings for touched text files.

## Required Proof Points

- PASS: Mute and Solo render as icon controls with no visible text.
- PASS: mute/solo/eye/delete controls stay on one horizontal row.
- PASS: widened left column is at least the expected PR030 width and instrument controls fit without wrapping or clipping.
- PASS: non-selected instrument notes use gray color/background treatment.
- PASS: selected instrument notes use a higher z-layer than dimmed notes.
- PASS: clicking mute, solo, eye visibility, and delete controls preserves instrument-area scroll positions.
- PASS: show/hide behavior still removes and restores hidden-lane notes.
- PASS: GM Type + Instrument dropdown behavior remains covered by the carried octave workflow.
- PASS: multi-note/chord editing still adds sibling notes without removing existing notes.
- PASS: drum simultaneous events still work.
- PASS: Play and Stop still work.
- PASS: Stop All Audio still returns playback controls to idle.
- PASS: all JS/CSS remains external; no HTML file was modified.

## Notes

- Full samples smoke test was not run, per BUILD request.
- Initial targeted Playwright run exposed a Songs/MIDI Import overlap after widening the left column; the song list now sizes to its contents and the final targeted run passed.
