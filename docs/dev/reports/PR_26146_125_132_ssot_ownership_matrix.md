# PR_26146_125-132 SSoT Ownership Matrix

| Canonical value | Editable owner | Other displays/actions |
| --- | --- | --- |
| Song name | Song Setup / Song Details | Export readiness, diagnostics, manifest readiness |
| Classification | Song Setup / Song Details | Classification help, export readiness, manifest summary |
| Generated ID | Derived from Name + Classification | Read-only Song Details, export readiness, diagnostics |
| Tempo | Song Setup / Song Sheet | Timeline and diagnostics read derived arrangement |
| Key | Song Setup / Song Sheet | Diagnostics and JSON Details |
| Style | Song Setup / Song Sheet | Diagnostics and JSON Details |
| Song Sheet sections | Song Setup / first-class section editors | Available Sections and timeline section labels are derived |
| Song Sequence | Song Setup / Song Sequence builder | Octave Timeline section header navigation mirrors selection |
| Apply Song Sheet To | Song Setup / Apply controls | Generation summary and diagnostics are derived |
| Lane note text | Auto-Create Parts lane source and Octave Timeline canvas editor | Timeline diagnostics, export note counts |
| Instrument GM Type/Patch | Instruments tab | Octave Timeline shows read-only lane summary |
| Instrument mix/range settings | Instruments tab | Audition keyboard and timeline playback use derived settings |
| Playback state | Global transport and Octave Timeline timing preview controls | Status labels and playhead are derived |
| Export targets | Export tab | Export readiness and diagnostics are derived |
| Manifest readiness | Derived from canonical payload | Diagnostics and Export tab summaries |

## Enforcement
- Duplicate visible editable owners are checked by `visibleMidiStudioControlOwnership`.
- Future or incomplete controls must carry red/unwired state and explanatory tooltip/status.
- Diagnostics are treated as read-only except explicit diagnostic actions.
