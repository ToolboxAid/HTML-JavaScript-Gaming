# PR_26146_341-420 Preview Engine Report

## Preview Engines

| Engine | Status | Notes |
| --- | --- | --- |
| Fast JS Synth | PASS | Working browser synth preview path. Uses sequence, notes, instruments, volume, pan, transpose, octave, velocity, duration, and practical effects. |
| SoundFont Preview | WARN | Selectable and statused, but unavailable until a verified SoundFont loader, asset set, and render bridge are present. |

## Control Flow

`PlaybackControl` owns the preview engine selector binding and exposes the selected engine to `MidiStudioV2App`.

`MidiStudioV2App` checks preview engine availability before:

- Song playback
- Section playback
- Sequence playback
- Loop playback
- Canvas note audition
- Instrument audition

`ExportPanelControl` renders the preview engine readiness as derived Export/Manifest readiness data.

## Playback State

Fast JS Synth preserves the existing playback state behavior:

- Playing
- Looping
- Stopped
- Completed
- Failed

SoundFont Preview unavailable state does not start playback, does not leave controls stuck disabled, and logs actionable WARN status.

## UAT Notes

Play/Stop and loop UAT should use Fast JS Synth for audible playback in this repo. SoundFont Preview UAT should verify the unavailable WARN path until assets/loader/render bridge are added.
