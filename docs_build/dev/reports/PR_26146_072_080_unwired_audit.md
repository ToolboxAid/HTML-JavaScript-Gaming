# PR_26146_072_080 Unwired Audit

## Rule
Any visible feature that is not fully implemented must be red/unwired and expose a tooltip/status explaining the incomplete state.

Central implementation:
- `toolbox/midi-studio-v2/js/controls/UnwiredControlState.js`
- CSS marker: `.midi-studio-v2__unwired-control`
- Data marker: `data-midi-studio-unwired`

## Red/Unwired Controls Verified
| Control group | Examples | Status text |
| --- | --- | --- |
| Song Sequence future gesture | Drag/drop sequence | Not implemented |
| Missing section shortcuts | Boss, Victory, unavailable section buttons | Incomplete |
| Export renderer | Output Type, Save WAV/MP3/OGG | Not implemented |
| SoundFont/render pipeline | SoundFont, Render Quality, Sample Rate, Normalize Volume, Export Stems, Loop Export | Not implemented |
| Editing History | Undo, Redo, Snapshots, Revision History, Revert To Saved, Autosave | Not implemented |
| MIDI input future controls | Enable MIDI Input, Select MIDI Device, Record MIDI | Not implemented |
| Instrument future controls | Effects, Advanced MIDI settings | Not implemented |

## Wired Controls Verified Not Red/Unwired
| Control group | Examples |
| --- | --- |
| Song Details | Name, Classification, generated ID |
| Song Sheet | named sections, Add Custom Section, Available Sections, Song Sequence actions, Apply targets, Parse Guided Song Sheet |
| Octave Timeline | canvas editing, section buttons for existing sections, Play Section, Play Loop, Stop, quick instrument selection |
| Instruments | GM Type, GM Instrument, display name, volume, pan, octave range, transpose, audition keyboard |
| Export ownership | rendered target path inputs |
| Global NAV | Import JSON Manifest, Play, Stop, Stop All Audio, Save Project, Reset Song Edits |

## Tooltip/Status Evidence
- Future controls expose `title` text beginning with `Not implemented:`.
- Missing section controls expose `title` text beginning with `Incomplete:`.
- Export status reports that rendered audio export is not implemented while preserving Save WAV/MP3/OGG wording.

## Result
PASS: targeted Playwright found no visible unwired controls missing red styling, `data-midi-studio-unwired`, or explanatory tooltip/status text in the audited MIDI Studio V2 surfaces.
