# PR_26146_093-096 Playback Workflow Audit

## Section Preview

- Control: `#playSectionButton`
- Owner: Octave Timeline
- Behavior: plays the selected section range through Preview Synth and timing preview.
- Status text: `Playing section: <label>`
- Active section visibility: canvas `data-playback-section`, `data-playback-section-color`, and the section-highlight rendering.

## Sequence Preview

- Control: `#playSequenceButton`
- Owner: Octave Timeline
- Behavior: plays the full normalized Song Sequence range from step `0` to `totalSteps - 1`.
- Status text: `Playing sequence: Song Sequence`
- Canonical source: populated Song Sheet sections in sequence/build order.

## Loop Preview

- Control: `#playLoopButton`
- Owner: Octave Timeline
- Behavior: preserved existing loop preview behavior.
- Status text: `Playing loop: <start> to <end>`
- Loop state: continues to use selected loop bounds and wraps the timing playhead.

## Stop Workflow

- Control: `#stopTimingPreviewButton`
- Behavior: stops timing preview, clears Preview Synth active lanes, and reports stopped state.
- Status text: `Preview Synth timing preview stopped.`

## Global Play/Stop

- Global Play/Stop remains owned by the global nav playback controls.
- Targeted Playwright verifies Play disables while playing and Stop re-enables Play.

## Instrument Range And Audition

- Selected instrument editor shows `Playable range`.
- Audition keyboard exposes `data-playable-range`.
- Audition range summary exposes `data-audition-range-summary`.
- Changing octave range refreshes the selected instrument editor and keyboard note set.

## Export Workflow

- Export tab readiness now includes selected song, classification, generated ID, sequence length, note count, instrument count, and target output formats.
- SoundFont/render pipeline controls remain visible and red/unwired.
- Save WAV, Save MP3, and Save OGG ownership remains in Export.
