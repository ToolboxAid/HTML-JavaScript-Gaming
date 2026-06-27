# PR_26146_072_075 Section Sequence Map

## Source Of Truth
The authoritative musical-section order is `music.songs[].studioArrangement.songSheet.sequence`.
Only populated named sections from `music.songs[].studioArrangement.songSheet.sections` appear in Available Sections.

## Valid Sections
For the targeted validation song:

| Section | Populated | Available Sections | Color owner |
| --- | --- | --- | --- |
| Intro | Yes | Yes | Song Sheet sequence index 0 |
| Verse | Yes | Yes | Song Sheet sequence index 1 |
| Chorus | Yes | Yes | Song Sheet sequence index 2 |
| Bridge | No | No | Not assigned until populated |
| Outro | Yes | Yes | Song Sheet sequence index 3 |

## Sequence Flow
The validated sequence after Parse Guided Song Sheet is:

| Order | Section | Color index |
| --- | --- | --- |
| 1 | Intro | 0 |
| 2 | Verse | 1 |
| 3 | Chorus | 2 |
| 4 | Verse | 1 |
| 5 | Chorus | 2 |
| 6 | Outro | 3 |

Repeated sequence items reuse the same section color as their section definition.

## Color Synchronization
Section colors are shared through the MIDI Studio V2 section color helpers:

| Surface | Color source | Validation |
| --- | --- | --- |
| Song Sequence items | Populated section label color index | PASS |
| Octave Timeline bars | Parsed canonical `studioArrangement.sections` generated from sequence | PASS |
| Playback section buttons | Matching section label in current result sections | PASS |
| Missing section buttons | No canonical section exists | PASS, disabled/unwired |

## Playback Synchronization
Playback order follows the parsed canonical arrangement generated from the Song Sheet sequence. Section playback buttons inherit the same section labels and colors used by the canvas timeline. Play and Stop remained functional in targeted validation.

