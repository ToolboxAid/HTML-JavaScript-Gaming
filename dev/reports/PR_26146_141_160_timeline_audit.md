# PR_26146_141-160 Octave Timeline Audit

## Canvas

PASS: Octave Timeline remains canvas-backed.

PASS: Section labels render directly on the timeline header.

PASS: Section colors are present and synchronized from Song Sequence sections.

PASS: Clicking a timeline section header selects the matching Song Sequence item.

PASS: Canvas hover sets hover row/step state.

PASS: Canvas drag-paint and drag-erase update canonical lead lane notes.

PASS: Canvas click toggles a single note.

PASS: Piano-key audition from the canvas keyboard still reports status.

PASS: Frozen Bar/Beat header remains visible during scroll and records frozen header scroll state.

PASS: Play Section and Play Sequence set preview playback mode and active section metadata.

## Stale Render State

PASS: Timeline refresh after Parse, Regenerate, selected instrument changes, and JSON round trip is covered by the PR141-160 targeted Playwright workflow.

## Remaining UNWIRED

UNWIRED: Song Sequence drag/drop remains red/unwired with tooltip/status.

