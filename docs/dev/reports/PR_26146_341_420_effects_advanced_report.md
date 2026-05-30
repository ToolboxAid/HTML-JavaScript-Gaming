# PR_26146_341-420 Effects And Advanced Report

## PROD Effects

The following effects are wired in the Instruments tab and persisted through the canonical instrument preview lane settings:

- Reverb
- Chorus
- Delay
- Filter
- Brightness/Tone

Each effect is a numeric 0..1 control owned by Instruments. Values are included in `previewLaneSettings.effects` and reflected in JSON Details.

## Fast JS Synth Influence

Fast JS Synth applies practical effect influence where supported by the existing browser synth:

- Brightness/Tone increases level and can brighten waveform choice.
- Filter dampens level and can soften waveform choice.
- Reverb, Delay, and Chorus influence duration/ambience-style scaling.
- Chorus can select a softer waveform where practical.

This keeps the effects meaningful without introducing a new synth architecture.

## SoundFont Preview Influence

SoundFont Preview receives the same canonical effect data path, but actual SoundFont playback is blocked with WARN until the repo has a verified SoundFont loader/assets/render bridge. The UI does not claim SoundFont effects are audible until that path exists.

## Advanced PROD Controls

The following useful advanced controls remain wired in Instruments:

- Velocity
- Duration
- Transpose
- Octave Range

These settings update canonical preview lane settings and influence Fast JS Synth playback/audition.

## Deep MIDI Controls

Deep MIDI controls were removed from the primary PROD UI instead of leaving unnecessary red controls:

- MIDI Channel
- GM Program
- Controller Values

No primary MIDI Studio workflow requires deep MIDI knowledge.

## Status

PASS for wired PROD effects and useful advanced controls. WARN for SoundFont-specific audible effect rendering because SoundFont Preview is unavailable in this repo.
