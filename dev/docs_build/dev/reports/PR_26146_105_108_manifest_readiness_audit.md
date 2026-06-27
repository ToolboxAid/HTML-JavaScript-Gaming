# PR_26146_105-108 Manifest Readiness Audit

## Export Ownership
- Export tab remains the owner for export readiness and rendered output workflow.
- Save WAV, Save MP3, and Save OGG remain owned by the Export tab.
- SoundFont and rendering pipeline controls remain visible and red/unwired.

## Game Manifest Readiness Summary
The Export tab now shows:
- Song count
- Classification summary
- Section summary
- Sequence summary
- Instrument summary
- Export readiness

## Data Sources
- Song count comes from `music.songs[]`.
- Classification summary comes from `music.songs[].classification`.
- Section summary comes from populated `music.songs[].studioArrangement.songSheet.sections`.
- Sequence summary comes from `music.songs[].studioArrangement.songSheet.sequence`.
- Instrument summary comes from `music.songs[].studioArrangement.lanes`.
- Export readiness checks rendered WAV/MP3/OGG target declaration and selected-song note readiness.

## Validation
- Playwright verifies the manifest readiness block after Song Library duplicate/load operations increase canonical song count.
- Playwright verifies Classification summary, section summary, sequence summary, instrument summary, selected generated ID, export status song count, output format ownership, and Play/Stop behavior.
