# PR_26146_101-104 Instrument Preset Map

## Owner
The instrument preset library is owned by the Instruments tab and implemented in `InstrumentGridControl`.

## Controls
- `instrumentPresetSelect`: saved instrument presets.
- `saveInstrumentPresetButton`: saves the selected instrument lane settings.
- `loadInstrumentPresetButton`: loads the selected preset into the selected instrument lane.
- `duplicateInstrumentPresetButton`: duplicates the selected preset asset.
- `instrumentPresetSummary`: read-only count/status for the preset library.

## Captured Preset State
Presets snapshot the selected lane settings from `previewLaneState`, including:
- display name
- GM type and preview instrument
- mute/solo/visibility
- volume and pan
- octave range
- transpose, velocity, duration
- effects and advanced lane settings

## Canonical Sync
- Saving and duplicating presets are library operations and do not mutate canonical arrangement state.
- Loading a preset applies the preset to the selected lane and calls the existing lane-setting persistence path.
- The canonical `music.songs[].studioArrangement.previewLaneSettings` remains the SSoT after preset load.

## Playwright Verification
The targeted test saves the Lead preset, changes the Lead type, reloads the preset, verifies the Lead instrument value is restored, verifies the status log, duplicates the preset, and checks canonical `previewLaneSettings.instruments.lead`.
