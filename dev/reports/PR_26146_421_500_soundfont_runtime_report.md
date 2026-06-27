# PR_26146_421-500 SoundFont Runtime Report

Task: PR_26146_421-500-midi-studio-v2-real-soundfont-and-release-closeout

## Result

PASS: MIDI Studio V2 now has a working SoundFont Preview path backed by a verified embedded General MIDI SoundFont bank. Fast JS Synth remains available as the fallback preview engine.

## Runtime Implementation

- Added `SoundFontPreviewEngine`.
- Added default SoundFont asset configuration:
  - `midi-studio-embedded-general-midi`
  - Label: `MIDI Studio Embedded GM SoundFont`
  - Format: `embedded-web-audio-soundfont`
- Added SoundFont asset population in the Export-owned SoundFont Asset selector.
- Added asset validation for missing or empty SoundFont banks.
- Added playback status reporting for loaded, unavailable, and failed states.
- Routed SoundFont playback through the same canonical grid and lane settings as Fast JS Synth.

## Supported SoundFont Workflows

- Play
- Play Section
- Play Sequence
- Loop
- Stop
- Canvas note audition
- Instrument audition keyboard

## Instrument And Effects Mapping

SoundFont Preview maps existing instrument selections into embedded SoundFont roles:

- Lead
- Bass
- Pad
- Piano
- Percussion

The SoundFont path applies practical support for:

- Reverb
- Chorus
- Delay
- Filter
- Brightness/Tone
- Volume
- Pan data path
- Transpose
- Octave range data path
- Velocity
- Duration

## Validation

- PASS targeted Playwright:
  - `npx playwright test tests/playwright/tools/MidiStudioV2.spec.mjs --grep "PR341-420|PR421-500" --project=playwright`
  - Result: 2 passed.
- PASS changed-file syntax checks.

## Remaining Honest Limits

MP3 and OGG encoding are not available in this browser build. The UI marks those selections as encoder-unavailable and reports FAIL when clicked. WAV rendering is implemented.
