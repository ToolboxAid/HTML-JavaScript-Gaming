# PR_26146_061 MIDI Studio V2 Instrument SSoT Map

## Canonical Instrument Store

- Editable instrument configuration is owned by the selected song's `studioArrangement.previewLaneSettings`.
- `previewLaneSettings.instruments` is the canonical GM/Preview Synth instrument selection map.
- `studioArrangement.previewInstruments` is maintained as a compatibility mirror of `previewLaneSettings.instruments`, not a second editable owner.
- Active selection is shared through `InstrumentGridControl.selectedInstrumentId`; `selectedLane` remains an accessor for older internal call sites.

## Instruments Tab Ownership

| Bucket | Editable values | Canonical path |
| --- | --- | --- |
| Identity | Display name, GM Type, GM Instrument/Patch | `previewLaneSettings.displayNames`, `instrumentTypes`, `instruments` |
| Mix | Volume, Pan/Balance, Mute default, Solo default | `previewLaneSettings.volumes`, `pans`, `muted`, `soloed` |
| Playback | Octave range, Transpose, Velocity, Duration | `previewLaneSettings.octaveRanges`, `transposes`, `velocities`, `durations` |
| Effects | Reverb, Chorus, Delay, Filter, Brightness/Tone | Red/unwired placeholders only; no data mutation |
| Advanced | MIDI Channel, GM Program, Controller Values | Red/unwired placeholders only; no data mutation |

## Octave Timeline Ownership

- Octave Timeline owns canvas note editing and quick performance/edit controls only.
- Timeline quick controls may select the active instrument and toggle Mute, Solo, and Hide/Show.
- Timeline quick controls do not render GM Type, GM Instrument/Patch, display name, Volume, Pan, Octave range, Transpose, Velocity, Duration, Effects, or Advanced fields.
- Hidden/visible state remains part of `previewLaneSettings.visible` because it directly affects timeline rendering and playback filtering.

## Audition Keyboard

- The horizontal audition keyboard is rendered only inside the Instruments tab.
- It reads the current selected instrument from `selectedInstrumentId`.
- It reads octave limits from `previewLaneSettings.octaveRanges`, falling back to the selected GM family defaults.
- Key clicks audition through Preview Synth using the selected instrument mapping.

## Diagnostics And Export

- Diagnostics remains read-only/derived for instrument configuration.
- Export remains the owner of rendered output controls.
- No editable instrument configuration fields were added to Diagnostics, Export, Song Setup, MIDI Import, or Auto-Create Parts.
