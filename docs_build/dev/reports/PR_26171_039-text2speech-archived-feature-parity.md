# PR_26171_039 Text To Speech Archived Feature Parity

## Purpose
- Rebuilt the current `toolbox/text-to-speech/` implementation toward feature parity with `archive/v1-v2/tools/old_text2speech-V2`.
- Used the archived tool as a required feature sample only; no legacy architecture was copied.

## Implementation
- Added named sentence queue editing with Name, Add, Duplicate, Delete, selectable queue rows, and JSON output summary.
- Added JSON Import, Copy JSON, and Export JSON workflows for schema-shaped Text To Speech payload arrays.
- Restored old speech controls beyond PR_037: Gender helper filter, Language filter, Voice selection/details, Voice Age, Character Preset, SSML-like Preset, rate, pitch, volume, Speak, Pause, Resume, and Stop.
- Added URL JSON sample loading via `samplePresetPath` and Project Workspace session payload loading through the old workspace tool state key.
- Kept Web Speech API preview as the local functional engine and kept future paid providers as planning-only metadata.
- Preserved Theme V2, external JavaScript, and active path `toolbox/text-to-speech/`.

## Scope Notes
- No database tables were added.
- No external paid provider integration was added.
- No fake audio generation was added.
- No inline script blocks, style blocks, inline styles, or inline event handlers were added.
- Confirmed `tools/text2speech/` is absent.
