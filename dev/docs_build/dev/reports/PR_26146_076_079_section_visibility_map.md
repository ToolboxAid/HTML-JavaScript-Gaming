# PR_26146_076_079 Section Visibility Map

## Source Of Truth
Musical section definitions live in `music.songs[].studioArrangement.songSheet.sections`.
Playback/build order lives in `music.songs[].studioArrangement.songSheet.sequence`.

## Populated Section Behavior
Only sections with user-entered progression content appear in Available Sections. Empty built-in sections, such as an empty Bridge, do not appear until populated.

| Surface | Section behavior | Validation |
| --- | --- | --- |
| Built-in inputs | Intro, Verse, Chorus, Bridge, Outro remain editable | PASS |
| Custom sections | Existing custom sections remain supported | PASS |
| Available Sections | Populated sections only | PASS |
| Song Sequence | Ordered playback/build sequence | PASS |
| Parse Guided Song Sheet | Writes canonical arrangement from sequence order | PASS |
| Octave Timeline bars | Follow parsed musical sequence and color index | PASS |
| Octave Timeline bar headers | Show section label at section starts and expose `data-section-header-labels` | PASS |
| Section buttons | Existing sections use matching colors; missing sections are disabled/red/unwired | PASS |

## Validated Sequence
The PR076-079 targeted test validated:

| Order | Section | Expected state |
| --- | --- | --- |
| 1 | Intro | Populated and color-coded |
| 2 | Verse | Populated and color-coded |
| 3 | Chorus | Populated and color-coded |
| 4 | Verse | Reuses Verse color |
| 5 | Outro | Populated and color-coded |

Bridge remained empty and did not appear in Available Sections. Boss/Victory remained missing musical sections and rendered disabled/red/unwired.

