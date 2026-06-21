# PR_26171_BETA_081 Manual Validation Notes

## Review
- Confirmed /api/messages/tts-profiles returns server-owned emotionSettings for playback.
- Confirmed Play Message queues each active Message Part through the TextToSpeechEngine-backed registry.
- Confirmed Play Part uses the selected part TTS Profile and matching Emotion Setting values.
- Confirmed Stop continues through the TextToSpeechEngine-backed registry stop path.
- Confirmed missing Emotion Settings produce a visible validation error instead of falling back silently.

## Manual Browser Coverage
- Covered by targeted Playwright validation for Message Studio playback, TTS profile emotion settings, Play Message, Play Part, and Stop.
