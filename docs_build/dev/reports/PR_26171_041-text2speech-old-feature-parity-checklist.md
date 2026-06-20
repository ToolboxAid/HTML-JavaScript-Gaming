# PR_26171_041 Old TTS Feature Parity Checklist

| Old Text To Speech V2 feature | Result | Current ownership |
| --- | --- | --- |
| Language options | PASS | Defaults in `src/engine/audio/TextToSpeechDefaults.js`; UI select in toolbox. |
| Gender helper filter | PASS | Reusable voice filter helper in engine; UI select in toolbox. |
| Age filter | PASS | Defaults in engine defaults; UI select in toolbox. |
| Voice age presets | PASS | Delivery resolver in engine. |
| Character presets | PASS | Defaults and delivery resolver in engine. |
| SSML-like presets | PASS | Defaults and delivery resolver in engine. |
| Pitch | PASS | Engine request clamping and UI slider/value. |
| Rate | PASS | Engine request clamping and UI slider/value. |
| Volume | PASS | Engine request clamping and UI slider/value. |
| Voice selection | PASS | Engine voice options/lookup; UI select. |
| Queue | PASS | Engine queue item creation/validation; UI queue controls. |
| Output summary | PASS | UI renders engine-normalized payload JSON. |
| Status log | PASS | UI status log reflects engine/tool actions. |
| Speak | PASS | Engine `speak()` calls browser SpeechSynthesis. |
| Stop | PASS | Engine `stop()` calls browser cancel and clears queue. |
| Pause | PASS | Engine `pause()` uses browser support when available. |
| Resume | PASS | Engine `resume()` uses browser support when available. |
| Unavailable engine error | PASS | Engine and UI return visible actionable Web Speech API errors. |
| JSON import/copy/export | PASS | UI workflow uses engine payload validation/normalization. |
| No provider blocker | PASS | Browser Web Speech API is the implemented local engine. |
