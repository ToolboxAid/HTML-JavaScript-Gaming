# PR_26146_007-midi-studio-v2-shared-midi-parser-foundation Validation

## Scope

- Continued from PR_26146_006.
- Expanded the shared MIDI parser under `src/engine/audio/MidiSourceMetadataParser.js`.
- Kept MIDI parsing ownership in shared `src/` runtime capability instead of tool-local parsing.
- Extended MIDI Studio V2 source details to display estimated duration, tempo summary, time signature summary, and note/event counts.
- Preserved MIDI Studio V2 rendered OGG/MP3/WAV preview behavior, header-action layout behavior, source inspection flow, and manifest schema.
- Did not implement live synthesis, piano-roll editing, or DAW sequencing.

## Shared Parser Capability

- Parses Standard MIDI File header metadata.
- Parses declared track chunks.
- Walks track events with variable-length delta times and running-status handling.
- Extracts tempo meta events.
- Extracts time signature meta events.
- Counts note-on, note-off, MIDI channel, meta, and system events.
- Estimates duration from ticks-per-quarter-note and tempo events.
- Rejects corrupt or truncated MIDI visibly; no silent fallback parsing is used.

## Validation

- PASS: `node --check src/engine/audio/MidiSourceMetadataParser.js`
- PASS: `node --check tools/midi-studio-v2/js/controls/MidiSourceDetailsControl.js`
- PASS: `node --check tests/playwright/tools/MidiStudioV2.spec.mjs`
- PASS: `npx.cmd playwright test tests/playwright/tools/MidiStudioV2.spec.mjs --project=playwright --workers=1 --reporter=line`
- PASS: `git diff --check`

## Playwright Coverage

- PASS: valid MIDI metadata extraction displays format, tracks, TPQN, and parsed track chunks.
- PASS: tempo extraction displays `120 BPM at tick 0`.
- PASS: time signature extraction displays `4/4 at tick 0`.
- PASS: duration estimation displays `0.5 seconds`.
- PASS: note/event counts display note-on, note-off, MIDI, and meta event counts.
- PASS: corrupt MIDI rejects with actionable `FAIL` status.
- PASS: corrupt MIDI does not leave partial source metadata rendered.
- PASS: existing rendered preview behavior still uses rendered OGG.
- PASS: existing header-action layout behavior still passes.

## Explicit Skips

- SKIP: Workspace Manager V2 registration/handoff test because Workspace Manager files were not touched.
- SKIP: full samples smoke test because sample JSON alignment is out of scope.
