# PR_26146_053 MIDI Studio V2 Tab Bucket Map

## Inventory Source

Requested source: uploaded `Tabs.txt`.

Resolution: `Tabs.txt` was not present in the repository, Downloads, or temp upload locations. This map uses the current `toolbox/midi-studio-v2/index.html` DOM inventory after PR053 edits.

## Tab Order

1. Song Setup
2. Octave Timeline
3. Instruments
4. Auto-Create Parts
5. MIDI Import
6. Diagnostics

## Song Setup

- Songs: `songListContent`
- Song Details: `songDetailsContent`
  - Editable Name
  - Editable Id
  - Editable Tempo/BPM
  - Editable Key dropdown
  - Editable Style dropdown
  - Editable Tags
  - Editable Usage when present
  - Editable Notes when present
- Song Sheet: `songSheetContent`
  - Intro chord progression
  - Loop chord progression
  - Parse Guided Song Sheet
  - Song Sheet summary/status inside the same bucket
- Sections / Loop: `songSectionsLoopContent`
  - Sections
  - Loop enabled
  - Loop start
  - Loop end
- Status: `statusLogContent`

## Octave Timeline

- Songs: `songListContent`
- Canvas/grid editor and playback editing surface: `instrumentGridOutput`, timeline title, zoom controls, and transport controls scoped to the timeline.
- Selection inspector: `timelineSelectionContent`
- Status: `statusLogContent`

## Instruments

- Instrument row management and GM type/instrument controls: `instrumentListContent`
- Selection inspector: `timelineSelectionContent`

## Auto-Create Parts

- Generation and normalization helpers:
  - Grid settings
  - Advanced lane source text
  - Generate Bass/Pad/Arpeggio/Drums
  - Normalize Grid
  - Section preview controls

## MIDI Import

- Songs: `songListContent`
- MIDI source/import/inspect controls: `midiImportContent`

## Diagnostics

- Rendered Preview: `playbackContent`
- Game Music Director diagnostic metadata: `directorContent`
- Rendered Export Targets: `renderedTargetsContent`
- JSON Details: `inspectorContent`
- Timeline Diagnostics: `instrumentGridSummaryContent`
- Audio Diagnostics: `audioDiagnosticsContent`
- Status: `statusLogContent`
