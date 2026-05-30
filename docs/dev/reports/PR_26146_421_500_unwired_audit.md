# PR_26146_421-500 Unwired Audit

## PROD Controls

PASS: Required PROD SoundFont controls are wired:

- Preview Engine
- SoundFont Asset
- Play
- Play Section
- Play Sequence
- Loop
- Stop
- Canvas note audition
- Instrument audition keyboard
- Save WAV

## Honest Unavailable Controls

MP3 and OGG rendered export controls remain visible because they are required output formats, but browser encoding is not available in this build.

When selected:

- Save MP3 is marked `encoder-unavailable`.
- Save OGG is marked `encoder-unavailable`.
- Clicking either action reports FAIL and states that no file was created.

## Future Controls

Existing future-only controls outside this lane remain red/unwired where appropriate, including render quality/sample-rate/normalize/stems/loop export style controls and non-PROD future workflow controls.

## Status

PASS for PROD SoundFont playback and WAV rendering. WARN for MP3/OGG encoder dependency, with no false success.
