# PR_26146_068 MIDI Studio V2 Canvas Scroll/Header Notes

## Canvas Model

- PASS - The octave timeline remains canvas-backed.
- PASS - The canonical song model remains the source of truth for note editing and playback.
- PASS - No second timeline/song data model was introduced.

## Piano Key Audition

- Canvas piano-key hit testing maps pointer coordinates to the rendered row token.
- Clicking the piano axis calls the existing selected-instrument audition path.
- The selected cell is updated to the clicked row without opening a dialog.
- Audio-unavailable failures use the existing Preview Synth WARN path and do not block editing.

## Frozen Bar/Beat Header

- The existing DOM scroll container and top horizontal scroll proxy remain in place.
- The renderer receives synchronized scroll offsets from `InstrumentGridControl.timelineCanvasViewport()`.
- The canvas redraws a frozen Bar/Beat header overlay at the visible top of the canvas when vertically scrolled.
- Horizontal scroll is preserved; the header overlay draws the visible bar/beat range using the same scrollLeft as the canvas viewport.
- The top scrollbar proxy remains synchronized with the grid scrollLeft.

## Test Evidence

- PASS - Playwright verifies `data-frozen-header="true"` after vertical scroll.
- PASS - Playwright verifies frozen header scrollLeft and scrollTop match the canvas/grid viewport.
- PASS - Playwright verifies piano-key click produces an audible Preview Synth event when audio is available.
- PASS - Playwright verifies piano-key click logs WARN when Web Audio is unavailable and does not mutate the selected song lane data.
