# PR_26146_072_080 Control Ownership Matrix

| Control | Owner | Canonical field | Status |
| --- | --- | --- | --- |
| Name | Song Setup | `music.songs[].name` | Wired |
| Classification | Song Setup | `music.songs[].classification` | Wired |
| Generated ID | Song Setup | `music.songs[].id` | Wired read-only |
| Tags | None in Song Details | Preserved payload data only | No editable ownership |
| Usage | None in Song Details | Preserved director data only | No editable ownership |
| Tempo/BPM | Song Setup | `studioArrangement.tempo` | Wired |
| Key | Song Setup | `studioArrangement.key` | Wired |
| Style | Song Setup | `studioArrangement.style` | Wired |
| Notes | Song Setup | `music.songs[].director.notes` | Wired |
| Intro/Verse/Chorus/Bridge/Outro | Song Setup | `studioArrangement.songSheet.sections` | Wired |
| Add Custom Section | Song Setup | `studioArrangement.songSheet.sections` | Wired |
| Custom sections text | Song Setup | `studioArrangement.songSheet.sections` | Wired |
| Available Sections | Song Setup | Derived from populated sections | Wired read-only |
| Song Sequence | Song Setup | `studioArrangement.songSheet.sequence` | Wired |
| Add/Duplicate/Move Up/Move Down/Remove sequence | Song Setup | `studioArrangement.songSheet.sequence` | Wired |
| Drag/drop sequence | Song Setup | Future sequence gesture | Red/unwired |
| Apply Chords/Pad | Song Setup | `songSheet.applyTargets.chordsPad` | Wired |
| Apply Bass | Song Setup | `songSheet.applyTargets.bass` | Wired |
| Apply Drums | Song Setup | `songSheet.applyTargets.drums` | Wired |
| Apply Lead | Song Setup | `songSheet.applyTargets.lead` | Wired, default off |
| Parse Guided Song Sheet | Song Setup | `studioArrangement` | Wired |
| Octave Timeline canvas | Octave Timeline | `studioArrangement.lanes` | Wired |
| Section buttons | Octave Timeline | parsed section labels | Wired when section exists |
| Missing section buttons | Octave Timeline | no canonical section | Red/unwired incomplete |
| Timeline quick instrument select | Octave Timeline | `selectedInstrumentId` | Wired |
| Mute/Solo/Show quick controls | Octave Timeline | `previewLaneSettings` | Wired |
| GM Type, GM Instrument, display name | Instruments | `previewLaneSettings` | Wired |
| Volume, Pan/Balance, Octave Range, Transpose | Instruments | `previewLaneSettings` | Wired |
| Effects and advanced MIDI controls | Instruments | Future settings | Red/unwired |
| Audition keyboard | Instruments | Preview Synth from selected instrument settings | Wired |
| Import JSON Manifest | Global NAV | active manifest/toolState payload | Wired |
| Manifest MIDI import/inspect | MIDI Import | `studioArrangement` import normalization | Wired |
| Export target paths | Export | `music.songs[].rendered` | Wired |
| Save WAV/MP3/OGG | Export | Future rendered-audio renderer | Red/unwired |
| SoundFont/render pipeline controls | Export | Future renderer settings | Red/unwired |
| Undo/Redo/Snapshots/Revision History/Revert To Saved/Autosave | Song Setup | Future history state | Red/unwired |
| Warnings accordion | Right column | Song Sheet diagnostics | Wired read-only |
| JSON Details | Diagnostics | selected canonical song/toolState | Wired read-only |

No duplicate editable owners were added for song metadata, section sequence, instruments, export targets, or warnings.
