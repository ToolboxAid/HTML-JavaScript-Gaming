# PR_26146_109-116 Playback Audit

## PASS
- Global Play uses the selected canonical song arrangement and re-enables controls when natural Preview Synth timing completes.
- Play Section now updates the main playback state to playing and completed.
- Play Loop now updates the main playback state to looping and Stop Timing Preview returns it to stopped.
- Play Sequence uses the normalized sequence order as timing preview/build order.
- Stop and Stop All Audio clear Preview Synth scheduled oscillators and reset UI state.
- The Octave Timeline playhead reveals the active playback step during timed previews while preserving frozen Bar/Beat rendering.

## WARN
- Preview Synth remains an approximate Web Audio audition path; SoundFont and rendered instrument playback are still red/unwired.
- Full MIDI Studio historical spec did not complete under the 904 second shell timeout, so this lane relies on the targeted PR105-108 plus PR109-116 Playwright validation.

## Verified By
- `npx playwright test tests/playwright/tools/MidiStudioV2.spec.mjs -g "PR105-108|PR109-116"`
