# PR_26146_501_560 Import Export Report

## Import JSON

- PASS: tool-mode JSON manifest import loads the UAT manifest.
- PASS: edited canonical payload exports and reimports with song ID, volume, pan, transpose, and effects preserved.

## MIDI Import

- PASS: MIDI Import tab clearly separates JSON manifest import from local MIDI source import.
- PASS: initial source state now reports `INFO No MIDI source inspected yet.`
- PASS: valid local MIDI bytes report local MIDI notes can populate the canonical studio arrangement.
- FUTURE: advanced MIDI controller/event conversion remains future-only.

## Export JSON

- PASS: Export JSON reports `PASS Export JSON PASS`.
- PASS: exported JSON round-trips through Import JSON.

## Rendered Export

- PASS: Save WAV produces an `audio/wav` rendered output through the SoundFont pipeline.
- FUTURE: Save MP3 and Save OGG remain visible only as encoder-unavailable red/unwired outputs when selected.
- PASS: Export readiness does not claim MP3/OGG file creation.

## Readiness

- PASS: Export readiness summarizes selected song, sequence, notes, instruments, and SoundFont/WAV readiness.
- PASS: Manifest readiness treats unassigned Game Usage as optional rather than a normal-workflow WARN.
