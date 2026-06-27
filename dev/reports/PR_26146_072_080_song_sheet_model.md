# PR_26146_072_080 Song Sheet Model

## Song Details
| Field | Ownership | Behavior |
| --- | --- | --- |
| Name | Song Setup | Editable canonical `music.songs[].name` |
| Classification | Song Setup | Editable human-typed `music.songs[].classification` |
| Classification help | Song Setup | `?` help icon with examples: Menu, Intro, Loop, Boss, Victory, Game Over, Ambient, Cutscene, Underwater, Flying, Ice, Lava, Space, Castle, Town, Dungeon, Forest, Night, Stealth, Puzzle, Chase |
| ID | Song Setup | Read-only generated `music.songs[].id` |
| Tags | None in Song Details | Not rendered as editable ownership |
| Usage | None in Song Details | Not rendered as editable ownership |

ID generation:
- `Main Theme` + `Loop` -> `mainTheme-Loop`
- `Forest Theme` + `Underwater` -> `forestTheme-Underwater`
- `Sky Battle` + `Flying` -> `skyBattle-Flying`

Duplicate generated IDs receive a numeric suffix to preserve manifest uniqueness.

## Section Model
The Song Sheet owns these named progression fields:
- Intro
- Verse
- Chorus
- Bridge
- Outro

Custom sections are added through `Add Custom Section`, which appends the next valid `CustomN:` label into the custom section editor. A custom section becomes populated only after it has progression text.

Each populated row emits one canonical line in `music.songs[].studioArrangement.songSheet.sections`, for example:
- `Intro: G C G D`
- `Verse: G Em C D`
- `Chorus: C G Am F`

Empty named or custom sections are omitted from Available Sections and omitted from the canonical section text.

## Apply Targets
Defaults:
- Chords/Pad: enabled
- Bass: enabled
- Drums: enabled when a drums lane/instrument exists
- Lead: disabled

Canonical field: `music.songs[].studioArrangement.songSheet.applyTargets`.

## Parse Flow
Parse Guided Song Sheet composes parser input from:
- populated sections
- Song Sequence order
- Apply Song Sheet To selections

Successful parse updates:
- `music.songs[].studioArrangement.songSheet.sections`
- `music.songs[].studioArrangement.songSheet.sequence`
- `music.songs[].studioArrangement.songSheet.applyTargets`
- `music.songs[].studioArrangement.sections`
- generated Octave Timeline lane text for selected apply targets
- diagnostics and JSON Details
