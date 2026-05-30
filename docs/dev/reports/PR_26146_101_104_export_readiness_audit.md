# PR_26146_101-104 Export Readiness Audit

## Added Readiness Fields
Export readiness now shows:
- Song name
- Selected song
- Classification
- Generated ID
- Sequence summary
- Section summary
- Sequence length
- Note count
- Instrument count
- Target output formats
- Playable event count
- Runtime source

The same readiness details are also surfaced in Export status and rendered target diagnostics where applicable.

## Ownership Preservation
- Export tab remains the owner for rendered audio output workflow.
- Save WAV, Save MP3, and Save OGG remain visible through the existing output type selector and save button.
- SoundFont, render quality, sample rate, normalize volume, export stems, and loop export remain red/unwired future controls.

## Readiness Semantics
- Sequence summary is derived from `music.songs[].studioArrangement.songSheet.sequence`.
- Section summary is derived from populated `music.songs[].studioArrangement.songSheet.sections`.
- Note count is derived from the playable event summary.
- Instrument count is derived from `music.songs[].studioArrangement.lanes`.

## Playwright Verification
The targeted test parses a generated arrangement, opens Export, and verifies song name, classification, generated ID, sequence summary, section summary, instrument count, note count, WAV/MP3/OGG ownership, and SoundFont red/unwired state.
