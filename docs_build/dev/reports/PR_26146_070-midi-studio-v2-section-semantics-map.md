# PR_26146_070 MIDI Studio V2 Section Semantics Map

## Ownership Summary

| Concept | Owning UI | Canonical model field | Editable | Purpose |
| --- | --- | --- | --- | --- |
| Song Name | Song Setup > Song Details | `music.songs[].name` | Yes | Human song title. |
| Classification | Song Setup > Song Details | `music.songs[].classification` | Yes | Game usage classification such as Menu, Loop, Boss, Flying, or Puzzle. |
| Generated ID | Song Setup > Song Details | `music.songs[].id` | Read-only/generated | `camelCase(Name)-Classification`; not a musical section. |
| Tempo | Song Setup > Song Details | `studioArrangement.tempo` and selected song tempo metadata | Yes | Playback and derived duration. |
| Key | Song Setup > Song Details | `studioArrangement.key` and selected song key metadata | Yes | Song metadata. |
| Style | Song Setup > Song Details | `studioArrangement.style` and selected song style metadata | Yes | Song metadata. |
| Musical section definitions | Song Setup > Song Sheet | `studioArrangement.songSheet.sectionDefinitions` and `studioArrangement.songSheet.sections` | Yes through guided text | Reusable music structure definitions with chords/bars. |
| Sequence | Song Setup > Song Sheet | `studioArrangement.songSheet.sequence` | Yes | Ordered musical form, for example Intro, Verse, Chorus, Verse, Chorus, Bridge, Chorus, Outro. |
| Loop sections | Song Setup > Song Sheet | `studioArrangement.songSheet.loopSections` | Yes | Musical section labels used for loop playback. |
| Timeline section colors | Octave Timeline | Derived from `studioArrangement.songSheet.sequence` and expanded grid sections | Read-only display | Color bars by musical section occurrences; repeated labels share a color. |
| Section buttons | Octave Timeline | Derived from current musical section labels | Action when defined | Buttons operate only for musical sections present in the current song sheet. |
| Boss/Victory buttons | Octave Timeline | Derived from current musical section labels | Disabled/unwired unless defined | No longer assumed musical sections because Boss/Victory are game classifications by default. |

## Semantics

Game classification answers where or how the song is used in a game. Examples include Menu, Boss, Victory, Game Over, Flying, Ice, Dungeon, Puzzle, and Chase. Classification is stored on the selected song and contributes to generated ID text only.

Musical sections describe the structure of the song. Examples include Intro, Verse, Chorus, Pre-Chorus, Bridge, Outro, Solo, Break, A, B, and C. These sections own chords, bars, and timeline order.

The Song Sheet Sequence expands reusable musical section definitions into the actual arrangement. A section such as Verse or Chorus can appear multiple times in Sequence while retaining one reusable definition. Octave Timeline colors and section shortcut availability come from this expanded musical sequence, not from Classification.

## Parse Guided Song Sheet Flow

1. Song Setup owns editable Classification and generated ID display.
2. Song Sheet collects reusable musical section definitions and Sequence text.
3. Parse Guided Song Sheet builds canonical Song Sheet data from those musical sections.
4. The canonical arrangement refreshes derived bars, chord count, estimated duration, diagnostics, JSON Details, and Octave Timeline canvas data.
5. Octave Timeline renders bar colors from expanded musical section occurrences and disables or marks missing musical section controls as unavailable.

## UAT Notes

PASS - Classification and musical sections are separate concepts.

PASS - Boss and Victory remain valid Classification examples, but they are not active musical section buttons unless explicitly defined in the Song Sheet.

PASS - Repeated musical sections retain matching color identity across the Octave Timeline.
