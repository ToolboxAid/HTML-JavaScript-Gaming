# PR_26146_081_084 Section Visibility Map

## Color Authority

- The normalized Octave Timeline section model remains the authority for musical section colors.
- Repeated section labels share the same `colorIndex`.
- Available Sections and Song Sequence options use the same section color helpers as the Octave Timeline.

## Timeline Header

- Canvas dataset exposes `data-section-header-labels` as the ordered section labels.
- Canvas snapshot exposes `sectionHeaderLabels`, `sections`, and `playbackSection`.
- Section names are drawn directly in the top timeline header row and in the frozen header.
- Current playback/playhead section exposes:
  - `data-playback-section`
  - `data-playback-section-color`
  - `data-playback-section-index`

## Click Mapping

- `OctaveTimelineCanvasRenderer.sectionHeaderFromPoint()` maps header clicks to the section at the clicked step.
- `InstrumentGridControl.selectTimelineHeaderSection()` moves the playhead to the clicked section, highlights that section, and emits a `select-section` transport event.
- `MidiStudioV2App.handleInstrumentGridTransport()` maps timeline header selection back to `SongSheetControl.selectSequenceItem()`.
- Duplicate labels use the clicked timeline section index so the corresponding Song Sequence item is selected.

## Preserved Surfaces

- Frozen Bar/Beat visibility remains canvas-backed.
- Piano audition and note-cell editing remain canvas-backed.
- Section preset buttons retain the same section colors and unavailable red/unwired state.
- Play/Stop controls remain owned by the playback workflow and were covered by the targeted MIDI Studio group.
