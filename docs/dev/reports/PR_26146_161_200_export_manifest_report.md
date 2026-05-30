# PR_26146_161_200 Export and Manifest Report

Status: PASS

Export:
- Export tab owns rendered output controls.
- Save WAV, Save MP3, and Save OGG wording remains.
- Rendered audio save remains red/unwired because no real renderer exists.
- SoundFont/render quality/sample rate controls remain red/unwired.
- Rendered export action does not falsely claim file creation.
- Export JSON remains distinct from rendered audio Save actions.

Export Readiness:
- Shows selected song, Classification, generated ID, sequence, sections, instruments, notes, and output status.
- Export readiness reflects the selected canonical song.

Manifest Readiness:
- Summarizes song count, classifications, game usage assignments, sections, sequence, instruments, notes, and export readiness.
- Missing assignments remain WARN unless required.
- Game Usage assignment is separate from Classification metadata.
