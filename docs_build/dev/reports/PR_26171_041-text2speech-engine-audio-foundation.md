# PR_26171_041 Text To Speech Engine Audio Foundation

## Purpose
- Rebuilt the Text To Speech foundation so reusable speech behavior lives under `src/engine/audio/`.
- Kept `toolbox/text-to-speech/` focused on Creator-facing UI orchestration.
- Preserved the old Text To Speech V2 feature surface from `archive/v1-v2/tools/old_text2speech-V2`.

## Implementation
- Extended `src/engine/audio/TextToSpeechEngine.js` with reusable helpers for:
  - queue item creation
  - payload validation and normalization
  - browser speak request creation
  - preset delivery resolution
  - voice gender inference
  - language option extraction
  - voice filtering
- Kept `TextToSpeechEngine` as the Web Speech API wrapper for speak, stop, pause, resume, queued item tracking, voice lookup, and unavailable-engine errors.
- Updated `toolbox/text-to-speech/text2speech.js` to consume engine-owned helpers instead of owning reusable speech behavior locally.
- Added targeted engine/audio unit validation for the reusable engine and defaults baseline.

## Scope Notes
- No fake generation was added.
- No external paid provider integration was added.
- No database tables were added.
- No inline scripts, style blocks, inline styles, inline event handlers, page-local CSS, or tool-local CSS were added.
- The incorrect `tools/text2speech/` path remains absent.
