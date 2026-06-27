# PR_26146_027 MIDI Studio V2 Instrument Import And Layout Repair Validation

## Status

PASS

## Scope Completed

- Added per-row Type group and Instrument dropdowns in the visible timeline row header.
- Type changes repopulate Instrument options and update the row label to the selected instrument.
- Removed the Advanced Raw Song Sheet UI and raw parser button from the primary workflow.
- Moved MIDI Import into Selected Song Details and removed MIDI Import and Export from the main tab row.
- Added a local MIDI file picker for `.mid` and `.midi` files.
- Avoided default hard-coded MIDI source fetches during normal UAT; missing MIDI source paths only appear when inspecting a selected song that declares one.
- Compacted instrument row layout and left volume/pan controls behind icon toggles.
- Added `+` row creation from the Instrument header and delete actions per timeline row.
- Add/delete row actions update the selected song arrangement, playback source data, status, and diagnostics.
- Fullscreen keeps transport and left timeline context while giving the center timeline more horizontal width.
- Preserved manifest import, multiple songs, editable Selected Song Details, consolidated Song Sheet, timeline playback, playhead, Stop All Audio, and export WARN behavior.

## Validation Commands

- PASS: `node --check toolbox/midi-studio-v2/js/controls/InstrumentGridControl.js`
- PASS: `node --check toolbox/midi-studio-v2/js/MidiStudioV2App.js`
- PASS: `node --check tests/playwright/tools/MidiStudioV2.spec.mjs`
- PASS: `node --check toolbox/midi-studio-v2/js/services/MidiSourceInspectionService.js`
- PASS: `node --check src/engine/audio/PreviewInstrumentPacks.js`
- PASS: `node --check src/engine/audio/PreviewSynthEngine.js`
- PASS: `node --check toolbox/midi-studio-v2/js/bootstrap.js`
- PASS: `node --check toolbox/midi-studio-v2/js/controls/MidiSourceDetailsControl.js`
- PASS: `node --check toolbox/midi-studio-v2/js/controls/SongSheetControl.js`
- PASS: `rg --pcre2 -n '<style|on(click|change|input|submit)=|<script(?![^>]*src)' toolbox/midi-studio-v2/index.html; if ($LASTEXITCODE -eq 1) { exit 0 }`
- PASS: `npx playwright test tests/playwright/tools/MidiStudioV2.spec.mjs -g "imports UAT manifest|imports a local MIDI source|removes the Advanced Raw Song Sheet|keeps MIDI source inspection|expands and restores" --reporter=list --workers=1 --timeout=60000`
- PASS: `npx playwright test tests/playwright/tools/MidiStudioV2.spec.mjs -g "roadmap exists|applies Preview Synth instruments|clears status content" --reporter=list --workers=1 --timeout=60000`
- PASS: `git diff --check`

## Playwright Proof Points

- UAT manifest JSON imports through Import JSON Manifest.
- Multiple UAT songs are listed and selectable.
- Frog Hop and Coal Mine Descent fixture songs still load into the visible timeline.
- Main UAT song populates visible note cells and playable Preview Synth data.
- Type dropdown exists per row and Instrument options update when Type changes.
- Row label follows the selected instrument.
- Volume and pan icon controls reveal sliders.
- Advanced Raw Song Sheet is absent.
- MIDI Import appears under Selected Song Details.
- Export tab and MIDI Import tab are absent from the main tabs.
- MIDI file picker accepts `.mid,.midi`.
- Local MIDI file import creates a selected song without default HTTP 404 noise.
- Instrument rows are compact in their collapsed state.
- `+` adds a timeline instrument row and delete removes it.
- Add/delete row changes update selected-song arrangement playback data.
- Fullscreen preserves transport and side context while expanding the center timeline.
- Play starts audible preview state and Stop All Audio clears playback.

## Coverage

- `docs_build/dev/reports/playwright_v8_coverage_report.txt` was refreshed by the targeted Playwright runs.
- `docs_build/dev/reports/coverage_changed_js_guardrail.txt` was refreshed.
- Advisory warning remains for `toolbox/midi-studio-v2/js/MidiStudioV2App.js` function coverage below 50%; all reported lines executed in the targeted browser run.

## Explicit Non-Runs

- Full samples smoke was not run per request.
- Sample JSON was not modified.
