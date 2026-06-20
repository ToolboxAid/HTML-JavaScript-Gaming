# PR_26171_039 Old Feature Inventory Checklist

| Archived user-facing feature | Current parity result | Current implementation |
| --- | --- | --- |
| Browser speech synthesis tool page | PASS | Active Theme V2 page at `toolbox/text-to-speech/index.html`. |
| Import JSON | PASS | `data-tts-import-json` file input workflow validates root-array named sentence payloads. |
| Copy JSON | PASS | `data-tts-copy-json` writes the current queue JSON to Clipboard API. |
| Export JSON | PASS | `data-tts-export-json` downloads `text-to-speech-v2.json`. |
| Project Workspace return launch | PASS | Workspace launch hides standalone JSON actions and shows Return to Project Workspace. |
| Workspace session payload loading | PASS | Loads `workspace.tools.text2speech-V2` session payloads when launched from Project Workspace. |
| URL sample JSON loading | PASS | Supports `samplePresetPath` URL JSON payload source. |
| Name field | PASS | `data-tts-name-input`. |
| Add named sentence | PASS | `data-tts-add-item`. |
| Duplicate named sentence | PASS | `data-tts-duplicate-item`. |
| Delete named sentence | PASS | `data-tts-delete-item`. |
| Editable text to speak | PASS | `data-tts-text-input`. |
| Gender helper filter | PASS | `data-tts-gender-filter`; helper filter only, no voice transformation. |
| Language filter | PASS | `data-tts-language-select` populated from matching browser voices. |
| Browser voice selection | PASS | `data-tts-voice-select`. |
| Voice details | PASS | `data-tts-voice-details`. |
| Voice age shaping | PASS | `data-tts-age-filter` applies rate/pitch shaping. |
| Character preset shaping | PASS | `data-tts-character-preset` applies preset defaults. |
| SSML-like preset shaping | PASS | `data-tts-ssml-preset` applies rate/pitch/volume shaping without SSML provider output. |
| Volume slider and value | PASS | `data-tts-volume` / `data-tts-volume-value`. |
| Rate slider and value | PASS | `data-tts-rate` / `data-tts-rate-value`. |
| Pitch slider and value | PASS | `data-tts-pitch` / `data-tts-pitch-value`. |
| Speak playback | PASS | Calls `TextToSpeechEngine.speak()` and Web Speech API `speechSynthesis.speak`. |
| Pause playback | PASS | Calls `TextToSpeechEngine.pause()` when browser support exists. |
| Resume playback | PASS | Calls `TextToSpeechEngine.resume()` when browser support exists. |
| Stop playback | PASS | Calls `TextToSpeechEngine.stop()` and Web Speech API `speechSynthesis.cancel`. |
| Named sentence queue | PASS | `data-tts-queue-list`. |
| Output summary | PASS | `data-tts-output-summary` renders JSON array. |
| Status log and Clear | PASS | `data-tts-status-log` and `data-tts-clear-status`. |
| Unavailable SpeechSynthesis error | PASS | Visible status and engine status show Web Speech API support requirement. |
