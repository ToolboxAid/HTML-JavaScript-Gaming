# PR_26146_109-116 Control Ownership Matrix

| Surface | Editable Owner | Derived/Read-only | Red/Unwired |
| --- | --- | --- | --- |
| Song Details | Song Setup owns Name, Classification, loop timing, notes, Game Usage assignment | Generated ID, classification library summary, usage summary | Runtime Game Usage sync |
| Song Sheet | Song Setup owns section editors, custom sections, sequence, apply targets | Available Sections, section metrics, generation summary, warnings | Drag/drop sequencing |
| Octave Timeline | Octave Timeline owns canvas note editing, selection, timing preview controls | Section colors, section labels, Bar/Beat, playhead status | Missing quick section presets |
| Instruments | Instruments owns instrument settings, range, transpose, velocity, duration, volume, pan, duplication/order/delete workflows | Active playable range, preview mapping, generated/manual counts | Effects and advanced MIDI controls |
| Export | Export owns rendered target path fields and rendered save workflow status | Selected song, classification, generated ID, sequence/instrument/note summaries, manifest readiness | SoundFont/render pipeline and Save WAV/MP3/OGG renderer |
| Diagnostics | Diagnostics owns status-log actions only | Audio diagnostics, JSON Details, warning summaries | None newly added |

## PASS
- Derived fields remain display-only.
- New Playwright coverage audits editable canonical fields for duplicate owners across visible MIDI Studio tabs.
- Future/incomplete controls remain red/unwired with status tooltips.
