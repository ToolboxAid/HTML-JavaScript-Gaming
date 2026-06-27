# PR_26146_081_084 Generation Flow

## Source Inputs

- Section editors: `Intro`, `Verse`, `Chorus`, `Bridge`, `Outro`.
- Custom sections: `Label: chord progression` rows in the custom section editor.
- Available Sections: derived from populated sections only.
- Song Sequence: explicit playback/build order from the sequence list.
- Apply Song Sheet To: `Chords/Pad`, `Bass`, `Drums`, `Lead`.

## Flow

1. `SongSheetControl.availableSections()` reads populated named/custom section editors.
2. `SongSheetControl.refreshSectionBuilder()` updates hidden canonical section text, Available Sections, section metrics, and sequence state.
3. `SongSheetControl.composeGuidedSheet()` emits parser source with tempo/key/style, sequence order, and section bodies.
4. `SongSheetParser.parse()` returns ordered section occurrences, bars, chord count, duration, warnings, and timeline data.
5. `MidiStudioV2App.syncSelectedArrangementFromSongSheetResult()` updates canonical `music.songs[].studioArrangement.songSheet`.
6. `MidiStudioV2App.applySongSheetToGrid()` builds the editable arrangement from the parsed sequence order.
7. `InstrumentGridParser.generateLane()` fills selected generated targets and `normalizeInstrumentGrid()` updates the canonical lanes/sections and JSON Details.
8. `SongSheetControl.render()` receives the generation summary and shows sections used, bars generated, notes generated, and target lanes affected.

## Target Behavior

- `Chords/Pad` enabled updates `chords` and generated `pad`.
- `Bass` enabled generates bass from chords.
- `Drums` enabled generates the basic drum lane when selected by default or user choice.
- `Lead` remains disabled by default and is only generated when explicitly selected.
- Untargeted lanes are preserved when they already match bar count; otherwise they receive rests to keep the arrangement parseable.

## Summary Fields

- `Sections used`: sequence order used for the generated arrangement.
- `Bars generated`: total bars in the generated sequence.
- `Notes generated`: generated/affected event count across selected target lanes.
- `Target lanes affected`: human labels for selected Apply Song Sheet To targets.

## Verification

Playwright `PR081-084` verifies populated-section rules, sequence actions, canonical updates, JSON Details, generation summary, target lanes, and lead-disabled default behavior.
