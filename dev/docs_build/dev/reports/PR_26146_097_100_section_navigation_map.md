# PR_26146_097-100 Section Navigation Map

## Sequence To Timeline
- `SongSheetControl` emits selected sequence detail from `songSheetSequenceList`.
- `MidiStudioV2App.handleSongSheetSequenceSelection` receives the selected label and sequence index.
- `InstrumentGridControl.selectSequenceSection` resolves the matching generated section by sequence occurrence when possible.
- The Octave Timeline playhead and selected section are moved to the section start.
- The timeline canvas re-renders with the selected section color and stronger selected-region contrast.

## Timeline To Sequence
- Timeline section-header clicks continue to emit `select-section` transport actions.
- `MidiStudioV2App` calls `SongSheetControl.selectSequenceItem(label, sequenceIndex)` for timeline-header selections.
- `SongSheetControl` selects the matching sequence item, updates selected datasets, and reapplies section colors.

## Visual Synchronization
- Song Sequence options use populated section colors.
- The Song Sequence select receives a visible color stripe from the selected section color.
- Timeline section regions, selected section region, and active playback section region use stronger alpha/stroke values.
- The timeline canvas now exposes `data-active-playback-section-visible` for Playwright and diagnostics.
- Frozen Bar/Beat behavior remains owned by the canvas renderer and is preserved.

## Sequence Summary
- `songSheetSequenceSummary` displays:
  - section count
  - total bar/chord count from selected sequence sections
  - estimated duration from tempo and bar count
- The output also exposes data attributes for section count, bar count, and duration seconds.

## Generation Summary
- Song Sheet generation summary now includes:
  - Generated bars
  - Generated notes
  - Generated instruments
- The existing generated arrangement still updates the canonical song model, diagnostics, JSON details, and Octave Timeline through the prior generation path.

## Verification
- Playwright adds Intro, Verse, Chorus to Song Sequence, verifies `3 sections` and `14 bars`, parses the arrangement, verifies generated bars/notes/instruments, selects Verse from the sequence and checks timeline selection, then clicks the Chorus timeline header and checks the Song Sequence selection updates to Chorus.
