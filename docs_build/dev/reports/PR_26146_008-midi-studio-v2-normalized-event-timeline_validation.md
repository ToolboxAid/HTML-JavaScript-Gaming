# PR_26146_008-midi-studio-v2-normalized-event-timeline Validation

## Scope

- Continued from PR_26146_007.
- Extended shared MIDI parsing under `src/engine/audio/MidiSourceMetadataParser.js`.
- Added normalized note pairing, channel summaries, program-change summaries, measure/bar timing, track activity summaries, warning summaries, and loop-safe duration output.
- Extended MIDI Studio V2 source details to display the new shared parser metadata.
- Preserved rendered OGG/MP3/WAV preview behavior and existing header-action layout behavior.
- Did not add live synthesis, DAW editing, piano-roll editing, MIDI input, or MIDI recording.

## Shared Parser Behavior

- Generates normalized note-on/note-off pairs.
- Tracks channel event totals and normalized note counts.
- Extracts program changes as instrument/program summary data.
- Keeps tempo and time signature timelines from the shared parser.
- Estimates bars/measures from ticks-per-quarter-note and time signature metadata.
- Uses the same parsed max tick for loop-safe duration output.
- Emits visible warnings for malformed note pairs, skipped system/SysEx events, and empty tracks.
- Rejects corrupt MIDI before rendering partial metadata.

## Validation

- PASS: `node --check src/engine/audio/MidiSourceMetadataParser.js`
- PASS: `node --check tools/midi-studio-v2/js/controls/MidiSourceDetailsControl.js`
- PASS: `node --check tests/playwright/tools/MidiStudioV2.spec.mjs`
- PASS: MIDI Studio V2 HTML inline scan found no inline `<script>`, `<style>`, or inline event handlers.
- PASS: `npx.cmd playwright test tests/playwright/tools/MidiStudioV2.spec.mjs --project=playwright --workers=1 --reporter=line`
- PASS: `git diff --check`

## Playwright Coverage

- PASS: normalized event timeline generation displays normalized note count.
- PASS: program-change extraction displays instrument/program summary.
- PASS: channel summary displays channel note and event totals.
- PASS: malformed note pair warnings are visible.
- PASS: unsupported system/SysEx event warning is visible.
- PASS: empty track warning is visible.
- PASS: corrupt MIDI rejects before partial metadata render.
- PASS: existing rendered preview behavior still uses rendered OGG.
- PASS: existing header-action layout behavior still passes.

## Coverage Artifacts

- Updated `docs_build/dev/reports/playwright_v8_coverage_report.txt`.
- Updated `docs_build/dev/reports/coverage_changed_js_guardrail.txt`.

## Explicit Skips

- SKIP: Workspace Manager V2 registration/handoff test because Workspace Manager files were not touched.
- SKIP: full samples smoke test because sample JSON alignment is out of scope.
