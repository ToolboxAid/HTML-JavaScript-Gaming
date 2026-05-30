# PR_26146_089-092 Instrument Workflow Audit

## Ownership
- Instrument lane data remains owned by `music.songs[].studioArrangement.lanes`.
- Preview instrument settings remain owned by `music.songs[].studioArrangement.previewLaneSettings`.
- No engine core ownership was changed.

## Duplication
- Duplicating the selected instrument still copies lane text and preview settings.
- The duplicate is inserted after the source lane and becomes the selected instrument.
- Workflow status is exposed on the instrument list, timeline quick list, and audition keyboard through `data-instrument-workflow-status`.

## Ordering
- Move Up and Move Down continue to reorder the canonical lane key order.
- The selected instrument remains selected after reordering.
- Selection evidence is exposed through `data-selected-instrument-id` on:
  - `#instrumentList`
  - `#timelineInstrumentQuickList`
  - `#instrumentAuditionKeyboard`
  - `#selectedInstrumentEditor`

## Audition
- Audition keyboard rendering is synchronized to the selected instrument ID.
- Audition controls preserve lane settings for volume, pan, transpose, velocity, and octave range.
- The targeted Playwright validation clicks an audition note after duplication and confirms the selected duplicate is used.

## Export Readiness
- Export tab now reports selected song, classification, generated ID, and WAV/MP3/OGG target readiness.
- Save WAV, Save MP3, and Save OGG remain owned by the Export tab.
- SoundFont and future render controls remain visible and red/unwired.
