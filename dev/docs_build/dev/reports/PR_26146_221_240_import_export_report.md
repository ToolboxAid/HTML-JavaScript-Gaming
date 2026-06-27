# PR_26146_221_240 Import and Export Report

Status: PASS with rendered audio future controls red/unwired

Import JSON:
- PASS tool-only Import JSON loads canonical MIDI Studio toolState.
- PASS JSON manifest import is separate from local MIDI file inspection/import.
- PASS MIDI source inspection reports PASS/WARN/FAIL visibly.
- PASS incomplete MIDI-to-canonical conversion remains red/unwired.

Export JSON:
- PASS Export JSON produces canonical toolState JSON.
- PASS exported JSON can be reimported and restores song metadata, sections, sequence, lanes, instruments, usage, and settings.
- PASS JSON Details matches the canonical model after parse/regenerate and reimport.

Rendered Audio Export:
- PASS Save WAV wording remains visible in Export.
- PASS Save MP3 wording remains visible in Export.
- PASS Save OGG wording remains visible in Export.
- PASS rendered audio Save controls remain red/unwired because the renderer is not complete.
- PASS rendered audio Save actions do not falsely claim file creation.
- PASS SoundFont/render controls remain red/unwired.

Readiness:
- PASS Export readiness summarizes selected song, classification, generated ID, sequence, sections, instruments, notes, and output status.
- PASS Manifest readiness summarizes songs, classifications, game usage assignments, sections, sequence, instruments, notes, and export readiness.

