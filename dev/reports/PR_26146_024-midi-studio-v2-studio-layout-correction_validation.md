# PR_26146_024 MIDI Studio V2 Studio Layout Correction Validation

## Result
- PASS: Expanded view keeps the shared header and MIDI Studio header visible.
- PASS: Expanded view keeps the top transport/action bar visible.
- PASS: Expanded view keeps the left Instruments column visible.
- PASS: Expanded view expands the center timeline/editor area while minimizing secondary diagnostics.
- PASS: The left column is now labeled `Instruments` and contains editable lane rows.
- PASS: Instrument rows include lane name, mute, solo, volume, pan, and preview instrument controls.
- PASS: Clicking an instrument row highlights the matching editable timeline row.
- PASS: The spreadsheet-style note editor is immediately visible without opening an accordion.
- PASS: Imported UAT song data populates visible note cells immediately after Import JSON Manifest.
- PASS: Editing a visible note cell updates the normalized playback data used by Play.
- PASS: Diagnostics and parser summaries are no longer dominant in the Studio tab.

## Scope
- Corrected MIDI Studio V2 expanded/fullscreen behavior so the header, top transport, and Instruments column remain visible.
- Replaced the static `Tracks` list with the authoritative editable `Instruments` lane list.
- Moved lane mute/solo/preview-instrument control ownership into the left Instruments column and added visible volume/pan controls.
- Simplified center timeline row headers so they map to lane names while avoiding duplicate lane-control surfaces.
- Converted the note grid into a visible center spreadsheet panel with explicit `Timeline`, `Edit Notes Here`, and `Instrument` labels.
- Added lane-row selection highlighting across the corresponding spreadsheet timeline row.
- Added note-cell edit synchronization so visible spreadsheet edits update playback data before Play.
- Reduced Studio-tab diagnostics by moving parser summary and audio diagnostics to Diagnostics-only surfaces.

## Lanes
- recovery/UAT: executed because this PR corrects MIDI Studio V2 UAT layout/workflow confusion from PR_26146_023.
- tools: executed through targeted MIDI Studio V2 syntax and Playwright checks.
- runtime: executed through targeted Playwright because browser UI, expanded mode, timeline editing, and Preview Synth playback data changed.
- integration: skipped because Workspace Manager registration/handoff was not changed.
- engine: skipped because no `src/engine` runtime files changed.
- samples: skipped because no sample JSON was modified and full samples smoke was explicitly out of scope.

## Validation Commands
- PASS: `node --check toolbox/midi-studio-v2/js/MidiStudioV2App.js`
- PASS: `node --check toolbox/midi-studio-v2/js/bootstrap.js`
- PASS: `node --check toolbox/midi-studio-v2/js/controls/InstrumentGridControl.js`
- PASS: `node --check toolbox/midi-studio-v2/js/controls/ToolShellControl.js`
- PASS: `node --check tests/playwright/tools/MidiStudioV2.spec.mjs`
- PASS: HTML external-only guard for `toolbox/midi-studio-v2/index.html`; no inline `<script>`, `<style>`, or inline event handlers found.
- PASS: `rg -n "track-list|Load Example|Use Example|imageDataUrl" toolbox/midi-studio-v2 tests/fixtures/midi-studio-v2 tests/playwright/tools/MidiStudioV2.spec.mjs` returned no matches.
- PASS: `$env:PLAYWRIGHT_BROWSERS_PATH='0'; npx.cmd playwright test tests/playwright/tools/MidiStudioV2.spec.mjs --project=playwright --grep "imports UAT manifest and plays|expands and restores" --timeout=90000 --reporter=list`
  - Result: 2 passed.
  - Proved fullscreen/expanded view keeps header, transport, and left Instruments column visible.
  - Proved the center timeline expands while secondary diagnostics are minimized.
  - Proved spreadsheet note editor is visible without an accordion.
  - Proved instrument rows correspond to editable timeline rows and row click highlights the matching lane.
  - Proved imported UAT song populates visible note cells.
  - Proved editing a visible note cell updates playback data used by Play.
  - Proved diagnostics no longer dominate the Studio tab.
- PASS: `git diff --check`
  - Note: Git reported LF-to-CRLF normalization warnings for touched files; no whitespace errors were reported.

## Coverage Reports
- Updated `docs_build/dev/reports/playwright_v8_coverage_report.txt`.
- Updated `docs_build/dev/reports/coverage_changed_js_guardrail.txt`.
- Guardrail status: advisory PASS, no changed runtime JS coverage warnings.

## Warnings
- WARN: An exploratory broader MIDI Studio V2 subset timed out and was not used as the validation gate. The requested PR_024 targeted behaviors passed in the focused 2-test lane above.

## Manual UAT Steps
1. Open `toolbox/midi-studio-v2/index.html`.
2. Click `Import JSON Manifest`.
3. Choose `tests/fixtures/midi-studio-v2/uat-midi-studio-v2.game.manifest.json`.
4. Confirm `Camptown Races UAT Reel` populates the visible center spreadsheet cells.
5. Confirm the left column is labeled `Instruments` and contains Lead, Bass, Pad/Chords, Pad Layer, and Drums controls.
6. Click the Lead row and confirm the Lead timeline row highlights.
7. Edit the first Lead note cell and click `Play`; expected result is audible preview state using the edited playback data.
8. Click `Enter Expanded View`; expected result is header, top transport, left Instruments column, center timeline, and status remain visible while secondary diagnostics are minimized.
9. Click `Exit Expanded View`; expected result is the normal Studio layout restored.

## Skips
- Full samples smoke test: SKIPPED per PR instructions.
- Workspace lane: SKIPPED because Workspace contract/runtime files were not touched.
- Sample JSON modification: SKIPPED per repo and PR instructions.

## Artifacts
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- `docs_build/dev/reports/coverage_changed_js_guardrail.txt`
- `docs_build/dev/codex_commands.md`
- `docs_build/dev/commit_comment.txt`
- Repo-structured delta ZIP: `tmp/PR_26146_024-midi-studio-v2-studio-layout-correction_delta.zip`
