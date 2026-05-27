# PR_26146_025 MIDI Studio V2 Timeline Instrument Rows And Songs Validation

Status: PASS

## Scope
- Continued from PR_26146_024.
- Removed the duplicate left Instruments column from the Studio workflow.
- Moved preview instrument, mute, solo, volume slider toggle, and pan slider toggle controls into the editable timeline row headers.
- Kept row identity instrument-first by making the selected preview instrument dropdown the visible row label; lane role text is secondary metadata.
- Updated the UAT manifest to contain three populated studio arrangements:
  - Camptown Races UAT Reel
  - Frog Hop Nursery Rhyme UAT
  - Coal Mine Descent, using the former `quiet-village-pad` selection slot for regression coverage
- Changed timing preview advancement from a fixed fast interval to tempo/subdivision-derived bar/beat/note column stepping.

## Validation Commands
- PASS: `node --check tools/midi-studio-v2/js/controls/InstrumentGridControl.js`
- PASS: `node --check tools/midi-studio-v2/js/MidiStudioV2App.js`
- PASS: `node --check tools/midi-studio-v2/js/bootstrap.js`
- PASS: `node --check tests/playwright/tools/MidiStudioV2.spec.mjs`
- PASS: `node -e "JSON.parse(require('fs').readFileSync('tests/fixtures/midi-studio-v2/uat-midi-studio-v2.game.manifest.json','utf8')); console.log('json ok')"`
- PASS: `rg --pcre2 -n "<style|on(click|change|input|submit)=|<script(?![^>]*src)" tools/midi-studio-v2/index.html` returned no matches.
- PASS: `npx playwright test tests/playwright/tools/MidiStudioV2.spec.mjs -g "imports UAT|shows guided visible options|animates Preview Synth playhead|applies Preview Synth instruments|expands and restores" --reporter=list --workers=1`
- PASS: `git diff --check` exited 0; Git reported line-ending normalization warnings only.

## Playwright Coverage
- PASS: multiple manifest songs are listed.
- PASS: Song 2 loads the Frog Hop nursery-rhyme fixture and populates the visible timeline.
- PASS: Song 3 loads Coal Mine Descent through the former Quiet Village Pad selection slot.
- PASS: selected songs immediately populate timeline rows.
- PASS: instrument dropdowns are the visible row identity.
- PASS: the duplicate left Instruments column is absent.
- PASS: volume and pan icon buttons reveal their sliders.
- PASS: note-cell editing updates playback data.
- PASS: Play starts Preview Synth playback from visible timeline data.
- PASS: the playhead advances by musical columns instead of racing on a fixed 90ms interval.
- PASS: Stop All Audio clears Preview Synth playback state.

## Skips And Notes
- Full samples smoke test: SKIP per request.
- Sample JSON: SKIP; no sample JSON was modified.
- Workspace lane: SKIP; Workspace contract/runtime files were not touched.
- Whole-file historical MIDI Studio spec was attempted during troubleshooting and exceeded the command timeout; the final validation used the requested affected Playwright subset above.
