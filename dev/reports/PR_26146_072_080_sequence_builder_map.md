# PR_26146_072_080 Sequence Builder Map

## Available Sections
Source: populated Song Sheet section fields only.

| UI evidence | Canonical source | Rule |
| --- | --- | --- |
| Available Sections option label | populated `songSheet.sections` row | Shows section name plus bar/chord count |
| `data-song-sheet-section-color-index` | derived from sequence/available section label order | Shared color identity |
| `data-song-sheet-section-bar-count` | progression chord token count | One chord token equals one bar in this guided model |
| `data-song-sheet-section-chord-count` | progression chord token count | Empty sections do not render |

Validated example:
- Intro: 4 bars / 4 chords
- Verse: 4 bars / 4 chords
- Chorus: 4 bars / 4 chords
- Custom1: 2 bars / 2 chords
- Bridge: omitted while empty

## Song Sequence Actions
| Action | Behavior | Canonical model |
| --- | --- | --- |
| Add | Appends selected Available Section label | `songSheet.sequence` |
| Duplicate | Duplicates selected sequence item after itself | `songSheet.sequence` |
| Move Up | Moves selected item earlier | `songSheet.sequence` |
| Move Down | Moves selected item later | `songSheet.sequence` |
| Remove | Removes selected item | `songSheet.sequence` |
| Drag/drop sequence | Visible future control, red/unwired | No mutation |

Validated sequence:
`Intro, Verse, Chorus, Custom1, Outro`

Canonical build order after parse:
`music.songs[].studioArrangement.sections = "Intro:4, Verse:4, Chorus:4, Custom1:2, Outro:1"`

## Color Synchronization
| Surface | Color source | Validation |
| --- | --- | --- |
| Available Sections | section label color index | PASS |
| Song Sequence list | section label color index | PASS |
| Octave Timeline canvas bars | parsed canonical section order | PASS |
| Section shortcut buttons | matching parsed section label | PASS |
| Bar header | current section from timeline reference cell | PASS |

Repeated section labels reuse the same color index. Missing section buttons remain disabled and red/unwired with an Incomplete tooltip.
