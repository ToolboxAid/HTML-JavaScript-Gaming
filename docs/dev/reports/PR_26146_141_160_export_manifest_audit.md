# PR_26146_141-160 Export and Manifest Audit

## Export Tab

PASS: Export tab owns rendered Save WAV, Save MP3, and Save OGG controls.

PASS: Output type selection updates Save button wording.

PASS: Export readiness summarizes selected song, classification, generated ID, sequence, sections, instruments, notes, and output status.

PASS: Export JSON is separate from rendered audio Save actions.

PASS: Export JSON writes a toolState preview to JSON Details and status.

WARN: Rendered audio Save WAV/MP3/OGG remains red/unwired because no real renderer exists.

PASS: Rendered audio save action does not falsely claim file creation.

## Manifest Readiness

PASS: Manifest readiness reports Game Usage assignments by usage label.

PASS: Missing/partial assignment state remains readiness WARN rather than hard FAIL unless required data is missing.

PASS: Diagnostics mirrors Manifest Readiness read-only.

## Future Rendering Controls

UNWIRED: SoundFont, render quality, sample rate, Normalize Volume, Export Stems, and Loop Export remain red/unwired with tooltips.

