# PR_26146_005-midi-studio-v2-midi-source-inspection Validation

## Scope

- Continued from PR_26146_004 rendered-preview foundation.
- Added explicit MIDI source inspection for selected `sourceMidi` paths.
- Added a shared `src/engine/audio` Standard MIDI File metadata parser for header and track chunk validation.
- Added MIDI Studio V2 source-inspection UI and status handling without claiming synthesized live playback.
- Preserved rendered OGG/MP3/WAV browser preview behavior.
- Tightened MIDI Studio V2 Status Clear horizontal padding through an external CSS override.

## MIDI Source Contract

- `.mid` remains instruction data, not playable browser audio.
- Source inspection loads the selected song's `sourceMidi` only when the user requests inspection.
- Parsed metadata displays format, track count, ticks-per-quarter-note, parsed track chunks, and validation status.
- Missing, failed-load, or malformed `.mid` sources clear stale inspection metadata and log actionable `FAIL` status.
- Live MIDI synthesis remains `NOT IMPLEMENTED`; no MIDI input, recording, DAW, piano-roll, hidden fallback MIDI, or default songs were added.

## Lanes

- runtime/tool: MIDI Studio V2 source inspection UI, failure states, rendered preview preservation, and status layout.
- engine/shared audio: small Standard MIDI File metadata parser syntax and exercised browser coverage through MIDI Studio V2.
- integration: skipped because Workspace Manager V2 registration and handoff files were not touched.
- samples: SKIP because sample JSON alignment and sample launch validation are out of scope.

## Validation

- PASS: `node --check src/engine/audio/MidiSourceMetadataParser.js`
- PASS: `node --check tools/midi-studio-v2/js/services/MidiSourceInspectionService.js`
- PASS: `node --check tools/midi-studio-v2/js/controls/MidiSourceDetailsControl.js`
- PASS: `node --check tools/midi-studio-v2/js/MidiStudioV2App.js`
- PASS: `node --check tools/midi-studio-v2/js/bootstrap.js`
- PASS: `node --check tests/playwright/tools/MidiStudioV2.spec.mjs`
- PASS: MIDI Studio V2 HTML inline scan found no inline `<script>`, `<style>`, or inline event handlers.
- PASS: `npx.cmd playwright test tests/playwright/tools/MidiStudioV2.spec.mjs --project=playwright --workers=1 --reporter=line`
- PASS: `git diff --check`

## Playwright Coverage

- PASS: valid `.mid` source metadata display.
- PASS: missing `.mid` source actionable failure without stale source details.
- PASS: invalid `.mid` source actionable failure without partial metadata render.
- PASS: rendered preview still uses rendered OGG path and does not use `.mid` playback.
- PASS: Status Clear button carries MIDI Studio padding override and computes zero left/right padding.
- PASS: invalid payload rejection before render remains covered.

## Explicit Skips

- SKIP: Workspace Manager V2 registration/handoff test because Workspace Manager files were not touched.
- SKIP: full samples smoke test because samples are out of scope for this tool-focused PR.
