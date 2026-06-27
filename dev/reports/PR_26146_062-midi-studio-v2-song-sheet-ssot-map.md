# PR_26146_062 MIDI Studio V2 Song Sheet SSoT Map

## Editable Owners

| Value | Owning tab/bucket | Editable control | Canonical path |
| --- | --- | --- | --- |
| Tempo/BPM | Song Setup > Song Details | `#songSheetTempoInput` | `studioArrangement.tempo` |
| Key | Song Setup > Song Details | `#songSheetKeyInput` | `studioArrangement.key` |
| Style | Song Setup > Song Details | `#songSheetStyleInput` | `studioArrangement.style` |
| Song Sheet sections | Song Setup > Song Sheet | `#songSheetSectionsInput` | `studioArrangement.songSheet.sections` |
| Song Sheet loop sections | Song Setup > Song Sheet | `#songSheetLoopSectionsInput` | `studioArrangement.songSheet.loopSections` |

## Derived Read-Only Values

| Value | Display location | Source |
| --- | --- | --- |
| Bars | Song Setup > Song Sheet summary | Parsed Song Sheet sections |
| Chord count | Song Setup > Song Sheet summary | Parsed Song Sheet sections |
| Estimated duration | Song Setup > Song Sheet summary | Parsed bars and Song Details tempo |
| Warnings | Song Setup > Song Sheet summary | Song Sheet parser diagnostics |
| Grid sections | Auto-Create Parts read-only mirror | `studioArrangement.sections`, refreshed from Song Sheet parse |
| JSON Details | Diagnostics read-only display | Selected canonical song model |

## Refresh Flow

1. Editing Sections or Loop sections writes to `studioArrangement.songSheet`.
2. The Song Sheet parser composes source text from Song Details metadata plus Song Sheet structure fields.
3. Parsed sections refresh computed Bars, Chord count, Estimated duration, Loop sections, and Warnings.
4. Parsed playable sections rebuild the Octave Timeline arrangement and generated lane data.
5. The selected song JSON Details and diagnostics are refreshed from the canonical song model.

## Non-Owners

- Song Sheet does not own editable Tempo, Key, or Style.
- Song Details does not own editable Song Sheet structure.
- Auto-Create Parts does not own editable Song Sheet sections; its grid sections field is read-only.
- Instruments, MIDI Import, Diagnostics, and Export do not own editable Song Sheet structure values.
