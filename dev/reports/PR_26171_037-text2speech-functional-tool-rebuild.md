# PR_26171_037 Text To Speech Functional Tool Rebuild

## Purpose
- Rebuilt Text To Speech as a functional browser TTS tool in the active path `toolbox/text-to-speech/`.
- Used `archive/v1-v2/tools/old_text2speech-V2` as behavior reference material only.
- Kept browser Web Speech API as the local functional engine for this PR.

## Implementation
- Replaced the placeholder-only Text To Speech page with a Theme V2 / Tool Template V2 aligned workspace surface.
- Added creator text entry, browser voice selection, rate, pitch, and volume controls with visible values.
- Wired Speak and Stop actions through the existing `TextToSpeechEngine` Web Speech API wrapper.
- Added visible actionable unavailable-engine messaging when `speechSynthesis` is not present.
- Removed provider-not-implemented blocking behavior from the browser preview path.
- Kept future paid provider adapters as planning metadata only.
- Updated current toolbox registration and shared navigation labels from `Voice Output` to `Text To Speech`.
- Confirmed `tools/text2speech/` does not exist.

## Scope Notes
- No archived implementation was copied directly.
- No fake generation was added.
- No database tables were added.
- No external paid provider integration was added.
- JavaScript remains external with no inline script blocks, style blocks, inline styles, or inline event handlers.
