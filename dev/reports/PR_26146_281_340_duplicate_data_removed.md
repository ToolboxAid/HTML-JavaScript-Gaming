# PR_26146_281_340 Duplicate Data Removed

Status: PASS

Removed Duplicate Display Data:
- Removed duplicate `Selected song` read-only rows from Export source details.
- Removed duplicate `Selected song` read-only rows from Diagnostics Export Readiness details.
- Removed duplicate `Selected song` read-only rows from Export Status details.
- `Song name` is now the single derived selected-song display in those Export/Diagnostics surfaces.

Duplicate Editable Ownership:
- PASS no new editable owner was introduced for canonical song data.
- PASS rendered output format selection is workflow state in Export, not a duplicate canonical field.
- PASS Save WAV/MP3/OGG is an Export-owned action, not a duplicate rendered target path editor.
- PASS rendered target paths remain editable only in the Export tab Output Targets section.
- PASS SoundFont/render options remain red/unwired future controls and do not claim editable PROD ownership.

Duplicate Red/Unwired Ownership Removed:
- Save WAV/MP3/OGG was previously classified as a future rendered audio renderer control.
- This PR reclassified it as a wired Export action for declared rendered asset downloads.
- Output Type was previously classified as part of the future rendered audio renderer.
- This PR reclassified it as wired Export workflow state.

Validation:
- Targeted Playwright verifies `#exportRenderSource [data-export-field='selected-song']` is absent.
- Targeted Playwright verifies `#exportRenderSource [data-export-field='song-name']` remains present.
- Targeted visible-control audit verifies no duplicate editable ownership in MIDI Studio V2.

