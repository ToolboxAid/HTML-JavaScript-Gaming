# PR_26146_141-160 Unwired Audit

## Rule

Anything not 100% complete must render red/unwired with tooltip/status.

## Verified Red/Unwired Controls

PASS: Playwright verifies every visible unwired control has:

- `midi-studio-v2__unwired-control`
- `data-midi-studio-unwired="not-implemented"`
- title/help text

## Current UNWIRED Controls

- Drag/drop sequence
- Sync Usage To Game Triggers
- Undo
- Redo
- Snapshots
- Revision History
- Revert To Saved
- Autosave
- Enable MIDI Input
- MIDI device selection
- Record MIDI
- Advanced MIDI-to-Canonical Conversion
- SoundFont
- Render Quality
- Sample Rate
- Normalize Volume
- Export Stems
- Loop Export
- Rendered Save WAV/MP3/OGG

## Current WORKING Controls

Working controls no longer render red in the visible control audit.

## Current BROKEN Controls

BROKEN fixed: stale JSON Details after selecting a song following local MIDI import.

## Current DUPLICATE Controls

PASS: No duplicate editable ownership found in the visible control scan.

