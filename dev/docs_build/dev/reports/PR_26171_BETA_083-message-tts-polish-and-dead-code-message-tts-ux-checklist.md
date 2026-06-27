# PR_26171_BETA_083 Message/TTS UX Checklist

## Message Studio
- PASS: Messages parent table label is creator-friendly.
- PASS: Message Parts child table uses Part Text, Emotion, TTS Profile, Status, and Actions.
- PASS: Play Part label remains clear.
- PASS: Play Message label remains clear.
- PASS: Stop control is labeled Stop Playback.
- PASS: Missing TTS Profile produces a visible actionable error.
- PASS: Missing Emotion Setting on the selected TTS Profile produces a visible actionable error.
- PASS: Duplicate TTS/Profile/Emotion controls were not left outside the tables.

## TTS Studio
- PASS: TTS Profile parent table uses creator-friendly Profile labeling.
- PASS: Age is clarified as Age Filter.
- PASS: Emotion Settings child table uses Delivery Preset labeling.
- PASS: Delivery settings live in Emotion Settings.
- PASS: Presets live in Emotion Settings.
- PASS: Voice Filters live only in profile controls.
- PASS: Duplicate summary/output panels were not introduced.

## Ownership
- PASS: Message Studio owns text, ordered message parts, Emotion selection, and TTS Profile selection.
- PASS: TTS Studio owns Voice, Language, Emotion Settings, Delivery, and Presets.
- PASS: src/engine/audio owns playback.
