# PR_26146_065 MIDI Studio V2 Control Ownership Matrix

Dynamic repeated controls are grouped by selector/pattern. "Workflow state" means implemented UI state that is not persisted as a song metadata field.

| Control | Owning tab | Editable/read-only | Canonical model field | Wired/unwired |
| --- | --- | --- | --- | --- |
| Import JSON Manifest | Global NAV | Action | Imported game manifest / `tools.midi-studio-v2` payload | Wired |
| Play | Global NAV | Action | Playback from selected canonical song/timeline data | Wired |
| Stop | Global NAV | Action | Playback state | Wired |
| Stop All Audio | Global NAV | Action | Preview/playback audio state | Wired |
| Save Project | Global NAV | Action | Serialized MIDI Studio tool state | Wired |
| Reset Song Edits | Global NAV | Action | Selected song reset baseline | Wired |
| Now Playing label | Global NAV | Read-only | Derived selected/playback status | Wired |
| Dirty state label | Global NAV | Read-only | Derived dirty state | Wired |
| Tab buttons | Tabs | Action/view state | Active tab view state | Wired |
| Accordion headers | Current tab/panel | Action/view state | Accordion view state | Wired |
| Songs list song buttons | Song Setup | Action | `tools.midi-studio-v2.activeSongId` | Wired |
| Add Song | Song Setup | Action | `music.songs[]`, `tools.midi-studio-v2.activeSongId` | Wired |
| Name | Song Setup | Editable | `music.songs[].name` | Wired |
| Id | Song Setup | Read-only derived | `music.songs[].id` derived from Name | Wired |
| Tempo/BPM | Song Setup | Editable | `music.songs[].studioArrangement.tempo` | Wired |
| Key | Song Setup | Editable | `music.songs[].studioArrangement.key` | Wired |
| Style | Song Setup | Editable | `music.songs[].studioArrangement.style` | Wired |
| Notes | Song Setup | Editable | `music.songs[].director.notes` | Wired |
| Song Sheet Sections | Song Setup | Editable | `music.songs[].studioArrangement.songSheet.sections` | Wired |
| Song Sheet Loop sections | Song Setup | Editable | `music.songs[].studioArrangement.songSheet.loopSections` | Wired |
| Parse Guided Song Sheet | Song Setup | Action | `music.songs[].studioArrangement` derived from Song Sheet | Wired |
| Song Sheet Sections summary | Song Setup | Read-only derived | Parsed `studioArrangement.songSheet.sections` | Wired |
| Song Sheet Bars | Song Setup | Read-only computed | Derived from parsed Song Sheet | Wired |
| Song Sheet Chord count | Song Setup | Read-only computed | Derived from parsed Song Sheet | Wired |
| Song Sheet Estimated duration | Song Setup | Read-only computed | Derived from tempo and parsed Song Sheet | Wired |
| Song Sheet Loop sections summary | Song Setup | Read-only derived | Parsed loop section labels | Wired |
| Song Sheet Warnings | Song Setup | Read-only diagnostics | Parser warning summary | Wired |
| Loop enabled | Song Setup | Editable | `music.songs[].loop.enabled` | Wired |
| Loop start | Song Setup | Editable | `music.songs[].loop.startSeconds` | Wired |
| Loop end | Song Setup | Editable | `music.songs[].loop.endSeconds` | Wired |
| Undo | Song Setup | Disabled/action placeholder | Future editing history | Unwired/red |
| Redo | Song Setup | Disabled/action placeholder | Future editing history | Unwired/red |
| Snapshots | Song Setup | Disabled/action placeholder | Future editing history | Unwired/red |
| Revision History | Song Setup | Disabled/action placeholder | Future editing history | Unwired/red |
| Revert To Saved | Song Setup | Disabled/action placeholder | Future editing history | Unwired/red |
| Autosave | Song Setup | Disabled/action placeholder | Future editing history | Unwired/red |
| Quick instrument row selection | Octave Timeline | Action | Shared selected instrument id | Wired |
| Quick Mute | Octave Timeline | Action | `music.songs[].studioArrangement.previewLaneSettings.muted` | Wired |
| Quick Solo | Octave Timeline | Action | `music.songs[].studioArrangement.previewLaneSettings.soloed` | Wired |
| Quick Hide/Show | Octave Timeline | Action | `music.songs[].studioArrangement.previewLaneSettings.visible` | Wired |
| Canvas note cells | Octave Timeline | Editable canvas surface | `music.songs[].studioArrangement.lanes` | Wired |
| Zoom Out | Octave Timeline | Action/view state | Octave timeline zoom state | Wired |
| Zoom In | Octave Timeline | Action/view state | Octave timeline zoom state | Wired |
| Loop playback toggle | Octave Timeline | Editable workflow state | Playback/timing preview loop state | Wired |
| Section preset buttons | Octave Timeline | Action/workflow state | Timing preview section state | Wired |
| Custom section select | Octave Timeline | Editable workflow state | Timing preview section state | Wired |
| Loop start select | Octave Timeline | Editable workflow state | Timing preview region state | Wired |
| Loop end select | Octave Timeline | Editable workflow state | Timing preview region state | Wired |
| Jump To Section | Octave Timeline | Action/workflow state | Timing preview section state | Wired |
| Play Section | Octave Timeline | Action/workflow state | Timing preview playback state | Wired |
| Play Loop | Octave Timeline | Action/workflow state | Timing preview playback state | Wired |
| Timing preview Stop | Octave Timeline | Action/workflow state | Timing preview playback state | Wired |
| Selected timeline details | Octave Timeline | Read-only derived | Selected instrument/cell state | Wired |
| Instrument row selection | Instruments | Action | Shared selected instrument id | Wired |
| Add instrument | Instruments | Action | `music.songs[].studioArrangement.lanes`, preview lane settings | Wired |
| Delete instrument | Instruments | Action | `music.songs[].studioArrangement.lanes`, preview lane settings | Wired |
| Collapse Instruments panel | Instruments | Action/view state | Accordion view state | Wired |
| Instrument display name | Instruments | Editable | `previewLaneSettings.displayNames` | Wired |
| GM Type | Instruments | Editable | `previewLaneSettings.instrumentTypes` | Wired |
| GM Instrument | Instruments | Editable | `previewLaneSettings.instruments` | Wired |
| Audible preview | Instruments | Read-only derived | Preview mapping derived from GM instrument | Wired |
| Volume | Instruments | Editable | `previewLaneSettings.volumes` | Wired |
| Pan/Balance | Instruments | Editable | `previewLaneSettings.pans` | Wired |
| Mute default | Instruments | Editable | `previewLaneSettings.muted` | Wired |
| Solo default | Instruments | Editable | `previewLaneSettings.soloed` | Wired |
| Octave range low/high | Instruments | Editable | `previewLaneSettings.octaveRanges` | Wired |
| Transpose | Instruments | Editable | `previewLaneSettings.transposes` | Wired |
| Velocity | Instruments | Editable | `previewLaneSettings.velocities` | Wired |
| Duration | Instruments | Editable | `previewLaneSettings.durations` | Wired |
| Audition keyboard keys | Instruments | Action | Preview Synth audition action | Wired |
| Reverb | Instruments | Disabled field | Future effect setting | Unwired/red |
| Chorus | Instruments | Disabled field | Future effect setting | Unwired/red |
| Delay | Instruments | Disabled field | Future effect setting | Unwired/red |
| Filter | Instruments | Disabled field | Future effect setting | Unwired/red |
| Brightness/Tone | Instruments | Disabled field | Future effect setting | Unwired/red |
| MIDI Channel | Instruments | Disabled field | Future advanced MIDI setting | Unwired/red |
| GM Program | Instruments | Disabled field | Future advanced MIDI setting | Unwired/red |
| Controller Values | Instruments | Disabled field | Future advanced MIDI setting | Unwired/red |
| Grid sections | Auto-Create Parts | Read-only derived | Derived from `studioArrangement.sections` | Wired |
| Beats/bar | Auto-Create Parts | Editable | `music.songs[].studioArrangement.beatsPerBar` | Wired |
| Subdivision | Auto-Create Parts | Editable | `music.songs[].studioArrangement.subdivision` | Wired |
| Instrument/lane type helper | Auto-Create Parts | Editable workflow state | Helper lane generation selection | Wired |
| Chords source text | Auto-Create Parts | Editable | `music.songs[].studioArrangement.lanes.chords` | Wired |
| Bass source text | Auto-Create Parts | Editable | `music.songs[].studioArrangement.lanes.bass` | Wired |
| Pad source text | Auto-Create Parts | Editable | `music.songs[].studioArrangement.lanes.pad` | Wired |
| Lead source text | Auto-Create Parts | Editable | `music.songs[].studioArrangement.lanes.lead` | Wired |
| Drums source text | Auto-Create Parts | Editable | `music.songs[].studioArrangement.lanes.drums` | Wired |
| Generate Bass From Chords | Auto-Create Parts | Action | `studioArrangement.lanes.bass` | Wired |
| Generate Pad From Chords | Auto-Create Parts | Action | `studioArrangement.lanes.pad` | Wired |
| Generate Arpeggio From Chords | Auto-Create Parts | Action | `studioArrangement.lanes.lead` | Wired |
| Generate Basic Drums | Auto-Create Parts | Action | `studioArrangement.lanes.drums` | Wired |
| Normalize Grid | Auto-Create Parts | Action | `music.songs[].studioArrangement` | Wired |
| MIDI source path | MIDI Import | Read-only | `music.songs[].sourceMidi` | Wired |
| Instrument set | MIDI Import | Read-only | `music.songs[].instrumentSet` | Wired |
| Import MIDI Source | MIDI Import | Action | Source MIDI normalization into `studioArrangement` | Wired |
| Inspect MIDI Source | MIDI Import | Action | MIDI source inspection diagnostics | Wired |
| MIDI source file picker | MIDI Import | Hidden file input | Import-selected MIDI file | Wired |
| MIDI source details | MIDI Import | Read-only derived | MIDI import metadata/status | Wired |
| Enable MIDI Input | MIDI Import | Disabled action placeholder | Future MIDI input | Unwired/red |
| Select MIDI Device | MIDI Import | Disabled select placeholder | Future MIDI input | Unwired/red |
| Record MIDI | MIDI Import | Disabled action placeholder | Future MIDI input | Unwired/red |
| Playback state | Diagnostics | Read-only derived | Preview/playback status | Wired |
| JSON Details | Diagnostics | Read-only derived | Serialized MIDI Studio payload | Wired |
| Copy JSON | Diagnostics | Action | Serialized MIDI Studio payload | Wired |
| Timeline Diagnostics | Diagnostics | Read-only derived | Current instrument grid summary | Wired |
| Audio Diagnostics | Diagnostics | Read-only derived | Preview/playback/audio capability status | Wired |
| Rendered Preview diagnostics | Diagnostics | Read-only derived | Current rendered preview state | Wired |
| Rendered Export Targets diagnostics | Diagnostics | Read-only derived | `music.songs[].rendered` display only | Wired |
| Game Music Director metadata | Diagnostics | Read-only derived | `music.songs[].director` display only | Wired |
| Status log | Diagnostics | Read-only | Tool status output | Wired |
| Clear status | Diagnostics | Action | Status log content | Wired |
| Output Type | Export | Disabled/unwired select | Future rendered audio renderer format | Unwired/red |
| Save WAV/MP3/OGG | Export | Unwired action | Future rendered audio renderer | Unwired/red |
| Render Source details | Export | Read-only derived | Selected song/event summary | Wired |
| WAV target path | Export | Editable | `music.songs[].rendered.wav` | Wired |
| MP3 target path | Export | Editable | `music.songs[].rendered.mp3` | Wired |
| OGG target path | Export | Editable | `music.songs[].rendered.ogg` | Wired |
| SoundFont | Export | Disabled select placeholder | Future render setting | Unwired/red |
| Render Quality | Export | Disabled select placeholder | Future render setting | Unwired/red |
| Sample Rate | Export | Disabled select placeholder | Future render setting | Unwired/red |
| Normalize Volume | Export | Disabled action placeholder | Future render setting | Unwired/red |
| Export Stems | Export | Disabled action placeholder | Future render setting | Unwired/red |
| Loop Export | Export | Disabled action placeholder | Future render setting | Unwired/red |
| Export Status | Export | Read-only derived | Render/export status messages | Wired |
| Export JSON | Export | Action | Serialized MIDI Studio tool state | Wired |
