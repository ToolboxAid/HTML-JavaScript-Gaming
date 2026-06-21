# PR_26171_BETA_083 Dead-Code Cleanup Checklist

## Message Studio
- PASS: Removed duplicate preview TTS Profile control outside the table.
- PASS: Removed duplicate TTS service selector outside the table.
- PASS: Removed dead Test Speech button and selected-item helper text.
- PASS: Removed unused Message Studio speech-test state and render paths.
- PASS: Kept playback routed through selected message part, TTS Profile, and Emotion Setting.
- PASS: Kept Play Part, Play Message, and Stop Playback controls available.

## TTS Studio
- PASS: Kept Delivery in Emotion Settings.
- PASS: Kept Presets in Emotion Settings as Delivery Preset.
- PASS: Kept Voice Filters in profile controls.
- PASS: No duplicate summary or output panel was added.
- PASS: No separate Emotion Studio was added.

## Tests
- PASS: Removed dead Message speech-test selector expectations.
- PASS: Added absence checks for removed duplicate controls.
- PASS: Added actionable error coverage for missing TTS Profile.
- PASS: Added actionable error coverage for missing Emotion Setting on the selected profile.
