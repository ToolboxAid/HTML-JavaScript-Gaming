# PR_26146_057 MIDI Studio V2 SSoT Control Map

Status: PASS

## Tabs

- Song Setup
- Octave Timeline
- Instruments
- Auto-Create Parts
- MIDI Import
- Diagnostics
- Export

## Editable Ownership

| Value | Owning tab/control | Other locations |
| --- | --- | --- |
| Song Name | Song Setup, Song Details | Derived display only |
| Song Id | Song Setup, Song Details | Derived display only |
| Tempo/BPM | Song Setup, Song Details dropdown/input group | Derived display only |
| Key | Song Setup, Key dropdown | Derived display only |
| Style | Song Setup, Style dropdown | Derived display only |
| Notes | Song Setup, Song Details | Derived display only |
| Song Sheet | Song Setup, Song Sheet bucket | No duplicate editable Song Sheet Summary |
| GM Type | Instruments, instrument row Type dropdown | No duplicate editable control |
| GM Instrument/Patch | Instruments, instrument row Instrument dropdown | No duplicate editable control |
| Volume | Instruments, instrument row Volume slider | No duplicate editable control |
| Pan/Balance | Instruments, instrument row Pan slider | No duplicate editable control |
| Mute/Solo/Show/Hide | Instrument performance row state, not duplicated elsewhere | Timeline playback reads canonical lane settings |
| Notes | Octave Timeline canvas | Playback reads canonical song model |
| MIDI source/import/inspect | MIDI Import | Song Setup shows no duplicate source/import controls |
| Export Type | Export, Output Type dropdown | Removed from NAV |
| Save/Export | Export, Save/Export button | Removed from NAV |

## Export

- Export Type options: WAV, MP3, OGG.
- Save/Export action stays red/unwired because rendered audio export is not implemented.
- Rendered target paths/status moved to Export.
- Future Export settings are red unwired placeholders:
  - SoundFont
  - Render Quality
  - Sample Rate
  - Normalize Volume
  - Export Stems
  - Loop Export

## Future Placeholders

Future Instruments placeholders are centralized through `FutureControlsControl` and shared `setUnwiredControlState`:

- Effects
- Reverb
- Chorus
- Delay
- Filter
- Brightness/Tone
- Octave Range
- Transpose
- Velocity
- Duration
- Instrument Settings

Future MIDI Input placeholders are in MIDI Import, disabled, and red/unwired:

- Enable MIDI Input
- Select MIDI Device
- Record MIDI

## Diagnostics

Diagnostics owns derived/read-only data:

- JSON Details
- Timeline Diagnostics
- Audio Diagnostics
- Rendered Preview diagnostics
- Game Music Director derived/debug metadata
- Status/log output

Diagnostic action buttons such as Copy JSON and Clear remain actions, not editable duplicated model fields.
