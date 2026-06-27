# PR_26146_281_340 Red Controls Resolution

Status: PASS

Resolved Red Controls:
- `#renderedExportTargetTypeSelect`
  - Before: red/unwired future rendered audio renderer control.
  - After: wired Export workflow state for selecting WAV, MP3, or OGG target format.
- `#renderedExportSaveButton`
  - Before: red/unwired future rendered audio renderer control.
  - After: wired Export action that downloads the selected declared rendered target when the file exists.

Honest Failure Handling:
- Missing selected song reports FAIL.
- Missing rendered target path reports FAIL.
- Unavailable target file reports FAIL with fetch status/detail.
- Successful declared target fetch reports PASS and triggers the browser download path.
- Save actions no longer report "not implemented" for the wired declared-target workflow.
- Save actions do not claim file creation when the target is missing or unavailable.

Controls Kept Red/Unwired As True Future:
- SoundFont selection.
- Render quality.
- Sample rate.
- Normalize volume.
- Export stems.
- Loop export.
- MIDI device input, recording, and advanced MIDI-to-canonical conversion.
- Sequence drag/drop.
- Editing history/snapshots/revision/autosave.
- Runtime Game Usage trigger sync.
- Advanced instrument effects.
- Workspace manifest proxy actions.

Validation:
- Targeted Playwright verifies Save OGG is not red/unwired.
- Targeted Playwright verifies SoundFont remains red/unwired.
- Targeted Playwright verifies Save OGG success via declared rendered target fetch.
- Targeted Playwright verifies missing WAV target failure without false success.

