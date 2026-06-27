# PR_26146_011-midi-studio-v2-multi-instrument-grid Validation

## Summary
- Added a shared `InstrumentGridParser` under `src/engine/audio/` for section/bar/beat/subdivision parsing.
- Added an advanced MIDI Studio V2 multi-instrument grid editor with aligned lanes for chords, bass, pad, lead, and drums.
- Kept guided Song Sheet fields as the primary/default workflow.
- Grid normalization emits reusable section, cell, and timeline event structures without adding live synthesis, piano-roll editing, DAW sequencing, MIDI input, or fallback notes.

## Lanes Executed
- Engine/shared audio parser: `InstrumentGridParser` syntax and targeted runtime exercise through MIDI Studio V2 Playwright.
- Runtime/tool: MIDI Studio V2 advanced grid input, aligned rendering, validation logging, Song Sheet coexistence, MIDI inspection preservation, and rendered export header preservation.
- Contract/static: external-only HTML guard and `git diff --check`.

## Lanes Skipped
- Workspace Manager V2 registration/handoff: SKIP because this PR did not touch Workspace Manager files.
- Samples: SKIP because sample JSON alignment is out of scope.
- Full samples smoke: SKIP per BUILD instruction.

## Validation Commands
- PASS: `node --check src/engine/audio/InstrumentGridParser.js`
- PASS: `node --check toolbox/midi-studio-v2/js/MidiStudioV2App.js`
- PASS: `node --check toolbox/midi-studio-v2/js/bootstrap.js`
- PASS: `node --check toolbox/midi-studio-v2/js/controls/InstrumentGridControl.js`
- PASS: `node --check tests/playwright/tools/MidiStudioV2.spec.mjs`
- PASS: `Select-String -Path toolbox/midi-studio-v2/index.html -Pattern '<script(?![^>]*src=)|<style|\son[a-z]+\s*='`
- PASS: `npx.cmd playwright test tests/playwright/tools/MidiStudioV2.spec.mjs --project=playwright --workers=1 --reporter=line`
- PASS: `git diff --check`

## Playwright Coverage
- PASS: 21 targeted MIDI Studio V2 tests.
- Covered aligned grid rendering with section headers, bars, beats, and lane rows.
- Covered beat/bar alignment consistency across chords, bass, pad, lead, and drums.
- Covered note/chord/drum entry per lane and normalized timeline structures from the shared parser.
- Covered invalid note failure without partial grid render.
- Covered unsupported subdivision failure.
- Covered malformed lane bar-count failure.
- Covered invalid drum token warning with skipped invalid drum event.
- Covered coexistence with guided Song Sheet parsing.
- Covered existing MIDI source inspection, rendered preview, rendered export header actions, accordion/header behavior, and invalid payload rejection.

## Notes
- One early Playwright assertion used computed `grid-column-end`; Chromium returned `auto` for the shorthand. The test was corrected to assert the applied section span from the grid cell style before the final passing run.
- Browser availability was already satisfied through `PLAYWRIGHT_BROWSERS_PATH=$env:TEMP\ms-playwright`; no Chromium install was required.
