# PR_26146_093-096 Arrangement Visibility Map

## Generated And Manual Indicators

MIDI Studio now exposes generated/manual ownership in three places:

- Instrument list rows show `Generated X / Manual Y` per lane.
- Timeline quick instrument rows show the same per-lane counts.
- Canvas timeline notes use generated/manual source colors and source stripes.

## Data Hooks

- Per-lane count badge: `data-arrangement-source-counts="<lane>"`
- Generated lane count: `data-generated-count`
- Manual lane count: `data-manual-count`
- Total lane event count: `data-total-count`
- Canvas generated count: `data-generated-note-count`
- Canvas manual count: `data-manual-note-count`
- Canvas snapshot count object: `timelineCanvasState().sourceCounts`

## Ownership

- Source of truth remains the normalized canonical song arrangement.
- Counts derive from `currentResult.timeline`.
- Manual source state is still created by editable note cells and timeline edits.
- Generated source state remains created by Song Sheet generation/regeneration and generated lane helpers.

## Preservation

- Regeneration workflow remains in Song Setup.
- Safe regeneration warning workflow remains unchanged.
- Manual lane preservation is unchanged where supported.
- Canvas-backed Octave Timeline rendering is preserved.
