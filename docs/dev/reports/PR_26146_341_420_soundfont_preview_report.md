# PR_26146_341-420 SoundFont Preview Report

## Ownership

SoundFont Preview settings live in the Export tab audio/render ownership area.

- `previewEngineSelect` owns preview engine selection.
- `futureSoundFontSelect` is now the SoundFont Asset selector, no longer a disabled future control.
- `soundFontPreviewStatus` is the live status surface.
- Export readiness and diagnostics consume this status as read-only derived data.

## Behavior

Fast JS Synth remains the working preview engine.

SoundFont Preview can be selected, but this build reports it as unavailable unless a verified SoundFont loader, asset set, and render bridge exist. The current repo does not provide that verified path, so SoundFont Preview reports:

- WARN when selected.
- Actionable message explaining that no SoundFont loader/assets are configured or no verified render bridge is present.
- No false claim that SoundFont playback is active.

## Playback Integration

The preview engine gate covers:

- Play song
- Play section
- Play sequence
- Loop
- Stop
- Canvas note audition
- Instrument audition keyboard

When SoundFont Preview is selected and unavailable, playback does not start and the status log explains the blocker. Fast JS Synth remains available for the same workflow.

## Export Integration

Export readiness now shows:

- Preview engine
- SoundFont preview status
- Render source
- Target output formats
- Existing rendered target download readiness

Save WAV, Save MP3, and Save OGG still use the existing rendered-target download workflow and do not claim to render new SoundFont audio.

## Status

WARN: SoundFont Preview is honestly surfaced but unavailable in this repo until the SoundFont loader/assets/render bridge are added.
