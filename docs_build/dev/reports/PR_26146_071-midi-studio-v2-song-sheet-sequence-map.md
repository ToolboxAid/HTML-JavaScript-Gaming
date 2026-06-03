# PR_26146_071 MIDI Studio V2 Song Sheet Sequence Map

## Visible Workflow

| UI Control | Purpose | Canonical model |
| --- | --- | --- |
| Intro | Populated Intro chord/progression text | `music.songs[].studioArrangement.songSheet.sections` |
| Verse | Populated Verse chord/progression text | `music.songs[].studioArrangement.songSheet.sections` |
| Chorus | Populated Chorus chord/progression text | `music.songs[].studioArrangement.songSheet.sections` |
| Bridge | Populated Bridge chord/progression text | `music.songs[].studioArrangement.songSheet.sections` |
| Outro | Populated Outro chord/progression text | `music.songs[].studioArrangement.songSheet.sections` |
| Custom sections | Additional `Name: chords` section rows | `music.songs[].studioArrangement.songSheet.sections` |
| Available Sections | Derived list of populated sections only | Derived from section inputs |
| Song Sequence | Ordered list of musical section labels | `music.songs[].studioArrangement.songSheet.sequence` |
| Add | Appends selected available section to sequence | Updates `songSheet.sequence` |
| Move Up | Moves selected sequence item earlier | Updates `songSheet.sequence` |
| Move Down | Moves selected sequence item later | Updates `songSheet.sequence` |
| Remove | Removes selected sequence item | Updates `songSheet.sequence` |
| Drag/drop sequence | Future placeholder | Red/unwired, no data mutation |
| Apply Chords/Pad | Applies Song Sheet chords and pad generation | `songSheet.applyTargets.chordsPad` |
| Apply Bass | Applies generated bass from Song Sheet chords | `songSheet.applyTargets.bass` |
| Apply Drums | Applies generated drums when enabled | `songSheet.applyTargets.drums` |
| Apply Lead | Applies generated lead only when enabled | `songSheet.applyTargets.lead` |

## Canonical Flow

1. The Song Sheet control reads populated named/custom section inputs.
2. Empty sections are omitted from Available Sections and are not emitted to canonical `songSheet.sections`.
3. The Song Sequence list writes a comma-separated canonical `songSheet.sequence`.
4. Parse Guided Song Sheet emits parser text using populated section definitions plus sequence order.
5. `SongSheetParser` expands reusable definitions by sequence and skips empty musical sections.
6. `MidiStudioV2App.applySongSheetToGrid` updates section colors and only the selected apply targets.
7. The canonical arrangement refreshes Octave Timeline, diagnostics, and JSON Details.

## Loop Semantics

The separate Song Sheet Loop sections field was removed. Looping is controlled by playback loop behavior and selected playback regions, not by a Song Sheet loop text field.

## Defaults

- Chords/Pad: enabled.
- Bass: enabled.
- Drums: enabled when a drums lane/instrument exists.
- Lead: disabled.

## UAT Notes

PASS - Empty Bridge input is omitted from Available Sections.

PASS - Repeated Verse and Chorus sequence entries share Octave Timeline section colors.

PASS - Lead remains excluded when the Lead target is disabled, while selected Chords/Pad, Bass, and Drums targets are applied.
