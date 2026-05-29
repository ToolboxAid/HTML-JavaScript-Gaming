# PR_26146_076_079 Unwired Control Audit

## Rule
Visible MIDI Studio V2 controls, actions, fields, labels, tab content, and workflows that are not fully implemented must render red/unwired with tooltip/status text.

## Audited Unwired Controls
| Control | Location | Status |
| --- | --- | --- |
| Output Type dropdown | Export | Red/unwired, renderer not implemented |
| Save WAV/MP3/OGG button | Export | Red/unwired, renderer not implemented |
| SoundFont | Export Future Rendering Options | Red/unwired |
| Render Quality | Export Future Rendering Options | Red/unwired |
| Sample Rate | Export Future Rendering Options | Red/unwired |
| Normalize Volume | Export Future Rendering Options | Red/unwired |
| Export Stems | Export Future Rendering Options | Red/unwired |
| Loop Export | Export Future Rendering Options | Red/unwired |
| Drag/drop sequence | Song Setup Song Sequence | Red/unwired |
| Missing section buttons | Octave Timeline section shortcuts | Disabled/red/unwired with `Incomplete:` tooltip |
| Editing History placeholders | Song Setup | Red/unwired |
| Future MIDI Input placeholders | MIDI Import | Red/unwired |
| Workspace proxy manifest actions | Workspace NAV | Red/unwired when workspace proxy owns the action |

## Implemented Controls Kept Normal
| Control | Location | Status |
| --- | --- | --- |
| Play | Global NAV | Wired unless selected song lacks studio arrangement/rendered target |
| Stop | Global NAV | Wired |
| Stop All Audio | Global NAV | Wired |
| Parse Guided Song Sheet | Song Setup | Wired |
| Available Sections / Song Sequence actions | Song Setup | Wired except drag/drop |
| Instrument GM Type / Instrument / Volume / Pan / Octave Range / Transpose | Instruments | Wired |
| Octave Timeline canvas editing | Octave Timeline | Wired |

Targeted Playwright verified red/unwired state for future render controls, missing section controls, and drag/drop sequence.

