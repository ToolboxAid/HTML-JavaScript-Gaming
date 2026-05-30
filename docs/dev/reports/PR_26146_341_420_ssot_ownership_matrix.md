# PR_26146_341-420 SSoT Ownership Matrix

| Canonical Value Or Workflow | Editable Owner | Derived Readers |
| --- | --- | --- |
| Song name | Song Details | Song List, Export readiness, Diagnostics, JSON Details |
| Classification | Song Details | Generated ID, Export readiness, Manifest readiness, Diagnostics |
| Generated ID | Derived from song name and classification | Song Details display, Export readiness, Manifest readiness, JSON Details |
| Tempo, Key, Style, Notes | Song Details | Diagnostics, JSON Details, Export readiness |
| Song Sheet sections | Song Sheet | Available Sections, Sequence Builder, Timeline labels, JSON Details |
| Song Sequence | Song Sheet | Octave Timeline, Export readiness, Manifest readiness, JSON Details |
| Apply Song Sheet To | Song Sheet | Generation summary, Diagnostics, JSON Details |
| Timeline notes | Octave Timeline canvas | Diagnostics, Export readiness, JSON Details |
| Selected instrument | Instruments and Octave Timeline quick select sync to one selectedInstrumentId | Audition keyboard, Playback state, Diagnostics |
| Instrument GM type/patch | Instruments | Timeline lane labels, Export readiness, JSON Details |
| Instrument volume/pan | Instruments | Fast JS Synth, Export readiness, JSON Details |
| Instrument transpose/octave range | Instruments | Fast JS Synth, Audition keyboard, JSON Details |
| Instrument velocity/duration | Instruments | Fast JS Synth, JSON Details |
| Instrument effects | Instruments | Fast JS Synth, SoundFont status path, JSON Details |
| Timeline mute/solo/hide | Octave Timeline quick controls | Playback preparation, Diagnostics |
| Preview engine | Export audio/render settings | Playback controls, Export readiness, Diagnostics |
| SoundFont asset/status | Export audio/render settings | Playback gate, Export readiness, Diagnostics |
| Save WAV/MP3/OGG | Export | Export status, Diagnostics |
| JSON import/export | Tool shell / import-export ownership | Workspace handoff, Diagnostics |
| Diagnostics | Read-only derived except explicit Copy/Clear actions | None |

## Duplicate Ownership Result

No duplicate editable SoundFont, effects, advanced, instrument, or song setup controls were introduced. Deep MIDI controls were removed from primary PROD UI to avoid unnecessary duplicate or unwired ownership.
