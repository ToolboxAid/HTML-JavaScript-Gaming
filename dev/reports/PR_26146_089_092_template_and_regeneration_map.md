# PR_26146_089-092 Template and Regeneration Map

## Section Templates
- Built-in templates are defined in `SongSheetControl` for Intro, Verse, Chorus, Bridge, and Outro.
- Template application writes starting chord progressions into the selected first-class section editor only.
- Section fields remain editable after template application.
- Custom sections are preserved because template application does not rewrite the custom section textarea.
- Populated section rules remain unchanged: empty named/custom sections are omitted from Available Sections and from generated sequence input.

## Template Defaults
- Intro: `C F G C`
- Verse: `C Am F G`
- Chorus: `F G C C`
- Bridge: `Dm G Em Am`
- Outro: `F G C`

## Safe Regeneration
- Regenerate Arrangement now performs a preflight before rebuilding generated target lanes.
- The preflight counts generated and manual events in currently selected generated target lanes.
- If manual target-lane notes are found, the first click does not overwrite the grid.
- The Regenerate button switches to confirmation state through `data-regeneration-pending="true"` and `Confirm Regenerate Arrangement`.
- A second click with the same Song Sheet source and target selection confirms regeneration.
- Any Song Sheet field, sequence, template, parse, or target change clears pending confirmation.

## Summary Fields
- Song Sheet summary now includes:
  - Generated notes before regeneration
  - Manual notes before regeneration
  - Regeneration protection
- Confirmed regeneration keeps those counts visible in the summary after the arrangement is rebuilt.

## Canonical Sync
- Parse and confirmed regenerate continue to update:
  - `music.songs[].studioArrangement.songSheet.sections`
  - `music.songs[].studioArrangement.songSheet.sequence`
  - `music.songs[].studioArrangement.songSheet.applyTargets`
  - generated lanes in `music.songs[].studioArrangement.lanes`
  - Octave Timeline and JSON Details through existing normalization.
