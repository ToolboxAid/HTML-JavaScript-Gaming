# PR_26171_BETA_081-message-playback-through-tts-engine

## Team Ownership
- TEAM: BETA
- Ownership source: docs_build/dev/PROJECT_MULTI_PC.txt
- Scope confirmed: Audio, Messages, Text To Speech, and TTS are owned by Team BETA.

## Summary
- Added server-owned Emotion Settings to Messages TTS profile API responses without changing database schema.
- Updated Message Studio playback readiness to require a matching Emotion Setting on the selected TTS Profile.
- Wired Play Part and Play Message playback values through the existing TextToSpeechEngine registry path using selected TTS Profile language/voice and Emotion Setting pitch/rate/volume/preset.
- Kept Stop routed through the existing TextToSpeechEngine stop path.

## Scope Guard
- No database schema changes.
- No engine core changes.
- No silent playback fallback when a selected TTS Profile lacks the selected Emotion Setting.
- Theme V2 and external JS only.
