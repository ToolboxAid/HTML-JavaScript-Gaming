# PR_26146_054 MIDI Studio V2 Tab Bucket Map

## Tab Order

1. Song Setup
2. Octave Timeline
3. Instruments
4. Auto-Create Parts
5. MIDI Import
6. Diagnostics

## Song Setup

- Songs list: `songListContent`
- Song Details: `songDetailsContent`
  - Name
  - Id
  - Tempo/BPM
  - Key
  - Style
  - Tags
  - Usage
  - Notes
- Song Sheet: `songSheetContent`
  - Intro/Loop chord progression
  - Parse action
  - Song Sheet status and summary
- Sections / Loop: `songSectionsLoopContent`
  - Section labels
  - Loop enabled/start/end song-level setup fields

## Octave Timeline

- Canvas/grid editing surface: `instrumentGridOutput`
- Timeline zoom controls and title
- Grid-owned playback controls: `transportContent`
- Loop playback toggle: `loopToggle`
- Selected timeline/note context: `timelineSelectionContent`

## Instruments

- Instrument rows and management: `instrumentListContent`
- GM Type dropdowns
- GM Instrument/Patch dropdowns
- Add instrument
- Delete instrument
- Visibility, mute, solo, volume, and pan controls

## Auto-Create Parts

- Helper-only grid controls:
  - `instrumentGridSectionsInput`
  - `instrumentGridBeatsInput`
  - `instrumentGridSubdivisionInput`
  - `instrumentGridLaneTypeSelect`
- Advanced lane source text
- Generate Bass From Chords
- Generate Pad From Chords
- Generate Arpeggio From Chords
- Generate Basic Drums
- Normalize Grid

## MIDI Import

- MIDI source path/file picker: `songSourceField`, `midiFileInput`
- Import inspection instrument set: `instrumentSetField`
- Import MIDI Source
- Inspect MIDI Source
- MIDI import status/details: `midiSourceDetails`

## Diagnostics

- JSON Details: `inspectorContent`
- Timeline Diagnostics: `instrumentGridSummaryContent`
- Audio Diagnostics: `audioDiagnosticsContent`
- Rendered Preview diagnostics: `playbackContent`
- Rendered Export Targets diagnostics: `renderedTargetsContent`
- Game Music Director derived/debug metadata: `directorContent`
- Status/log output: `statusLogContent`
- Diagnostic actions:
  - Copy JSON
  - Clear status
