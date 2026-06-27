# PR_26146_072_075 Control Ownership Matrix

| Control | Owning tab | Editable/read-only | Canonical model field | Wired/unwired |
| --- | --- | --- | --- | --- |
| Song name | Song Setup | Editable | `music.songs[].name` | Wired |
| Classification | Song Setup | Editable | `music.songs[].classification` | Wired |
| Generated ID | Song Setup | Read-only | `music.songs[].id` from `camelCase(Name) + "-" + Classification` | Wired |
| Tempo/BPM | Song Setup | Editable | `music.songs[].studioArrangement.tempo` | Wired |
| Key | Song Setup | Editable | `music.songs[].studioArrangement.key` | Wired |
| Style | Song Setup | Editable | `music.songs[].studioArrangement.style` | Wired |
| Notes | Song Setup | Editable | `music.songs[].director.notes` | Wired |
| Named musical section inputs | Song Setup | Editable | `music.songs[].studioArrangement.songSheet.sections` | Wired |
| Custom musical sections | Song Setup | Editable | `music.songs[].studioArrangement.songSheet.sections` | Wired |
| Available Sections list | Song Setup | Read-only derived | Populated Song Sheet section inputs | Wired |
| Available Sections count | Song Setup | Read-only derived | Populated Song Sheet section inputs | Wired |
| Add to Sequence | Song Setup | Action | `music.songs[].studioArrangement.songSheet.sequence` | Wired |
| Song Sequence list | Song Setup | Editable order/list | `music.songs[].studioArrangement.songSheet.sequence` | Wired |
| Song Sequence count | Song Setup | Read-only derived | `music.songs[].studioArrangement.songSheet.sequence` | Wired |
| Duplicate sequence item | Song Setup | Action | `music.songs[].studioArrangement.songSheet.sequence` | Wired |
| Move sequence item up/down | Song Setup | Action | `music.songs[].studioArrangement.songSheet.sequence` | Wired |
| Remove sequence item | Song Setup | Action | `music.songs[].studioArrangement.songSheet.sequence` | Wired |
| Drag/drop sequence | Song Setup | Future action | Future sequence editing gesture | Unwired red |
| Apply Song Sheet To: Chords/Pad | Song Setup | Editable | `music.songs[].studioArrangement.songSheet.applyTargets.chordsPad` | Wired |
| Apply Song Sheet To: Bass | Song Setup | Editable | `music.songs[].studioArrangement.songSheet.applyTargets.bass` | Wired |
| Apply Song Sheet To: Drums | Song Setup | Editable | `music.songs[].studioArrangement.songSheet.applyTargets.drums` | Wired |
| Apply Song Sheet To: Lead | Song Setup | Editable | `music.songs[].studioArrangement.songSheet.applyTargets.lead` | Wired |
| Parse Guided Song Sheet | Song Setup | Action | `music.songs[].studioArrangement` | Wired |
| Octave Timeline canvas cells | Octave Timeline | Editable notes | `music.songs[].studioArrangement.lanes[selectedInstrumentId]` | Wired |
| Octave Timeline quick instrument select | Octave Timeline | Action/state | `tools.midi-studio-v2.selectedInstrumentId` | Wired |
| Octave Timeline Mute/Solo/Show | Octave Timeline | Quick performance state | `studioArrangement.previewLaneSettings.muted/soloed/visible` | Wired |
| Section select/play buttons | Octave Timeline | Playback workflow state | Canonical grid sections derived from Song Sheet sequence | Wired |
| Missing section buttons | Octave Timeline | Disabled placeholder | No canonical section exists | Unwired red/disabled |
| GM Type dropdown | Instruments | Editable | `studioArrangement.previewLaneSettings.instrumentTypes` | Wired |
| GM Instrument dropdown | Instruments | Editable | `studioArrangement.previewLaneSettings.instruments` | Wired |
| Instrument display name | Instruments | Editable | `studioArrangement.previewLaneSettings.displayNames` | Wired |
| Volume | Instruments | Editable | `studioArrangement.previewLaneSettings.volumes` | Wired |
| Pan/Balance | Instruments | Editable | `studioArrangement.previewLaneSettings.pans` | Wired |
| Octave Range | Instruments | Editable | `studioArrangement.previewLaneSettings.octaveRanges` | Wired |
| Transpose | Instruments | Editable | `studioArrangement.previewLaneSettings.transposes` | Wired |
| Velocity | Instruments | Editable | `studioArrangement.previewLaneSettings.velocities` | Wired |
| Duration | Instruments | Editable | `studioArrangement.previewLaneSettings.durations` | Wired |
| Effects controls | Instruments | Future placeholders | Future effects/settings | Unwired red |
| Advanced MIDI controls | Instruments | Future placeholders | Future advanced MIDI settings | Unwired red |
| Audition piano keyboard | Instruments | Action | Preview Synth from selected instrument settings | Wired |
| MIDI source/import/inspect | MIDI Import | Editable/action | MIDI source normalization into `studioArrangement` | Wired |
| Auto-create helpers | Auto-Create Parts | Action/helper fields | `studioArrangement.lanes` and helper-only generation settings | Wired |
| Export audio save controls | Export | Future action | Future rendered audio workflow | Unwired red |
| Diagnostics JSON/details | Diagnostics | Read-only derived | Current selected canonical song model and diagnostics | Wired |

No duplicate editable controls were added for song metadata, instrument settings, export settings, or sequence ownership.

