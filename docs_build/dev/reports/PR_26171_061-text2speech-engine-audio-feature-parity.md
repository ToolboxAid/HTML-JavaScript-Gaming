# PR_26171_061 Text To Speech Engine Audio Feature Parity

## Summary

Restored active Text To Speech feature parity from the archived `old_text2speech-V2` functionality sample while keeping active implementation in `toolbox/text-to-speech/` and reusable engine behavior in `src/engine/audio/`.

## Changed Scope

- Rebuilt reusable Text To Speech voice filtering, preset shaping, and queue-item helpers in `src/engine/audio/TextToSpeechEngine.js`.
- Expanded `toolbox/text-to-speech/index.html` with Theme V2 controls for the old V2 feature set.
- Rebuilt `toolbox/text-to-speech/text2speech.js` so the active tool consumes the engine audio module.
- Expanded targeted browser validation in `tests/playwright/tools/TextToSpeechFunctional.spec.mjs`.
- Updated Playwright V8 coverage artifacts for changed runtime JavaScript.

## Requirement Checklist

- PASS: Used `archive/v1-v2/tools/old_text2speech-V2/` as the required functionality sample.
- PASS: Reusable TTS behavior lives in `src/engine/audio/`.
- PASS: `toolbox/text-to-speech/` consumes `src/engine/audio/TextToSpeechEngine.js`.
- PASS: Restored old controls/options/features in the active tool.
- PASS: Browser SpeechSynthesis provider remains implemented.
- PASS: Planned provider adapters do not block browser preview behavior.
- PASS: No `tools/text2speech/` path was created.
- PASS: No database files were changed.
- PASS: Theme V2 remains the styling source.
- PASS: HTML uses external JavaScript only.
- PASS: No inline script, style, or event handler was added.

## Restored Feature Set

- Import JSON.
- Copy JSON.
- Export JSON.
- Project Workspace return action during workspace launch.
- Gender helper filter.
- Language filter.
- Browser voice selection.
- Voice details.
- Voice age shaping.
- Character presets.
- SSML-like presets.
- Volume, rate, and pitch sliders with visible values.
- Named sentence Name field.
- Add, Duplicate, and Delete named sentence actions.
- Text To Speak editor.
- Speak, Pause, Resume, and Stop playback actions.
- Named Sentences queue.
- Output Summary JSON.
- Clearable Status log.
- URL JSON preset loading through `samplePresetPath`.
- Project Workspace toolState loading and dirty-state writeback.

## Validation Summary

- PASS: `node --check src\engine\audio\TextToSpeechEngine.js`
- PASS: `node --check toolbox\text-to-speech\text2speech.js`
- PASS: `node --test tests\tools\Text2SpeechShell.test.mjs`
- PASS: `npx playwright test tests/playwright/tools/TextToSpeechFunctional.spec.mjs`
- PASS: `npm run test:workspace-v2`
  - Note: command name is legacy; user-facing language is Project Workspace.
- PASS: `git diff --check`
- PASS: changed runtime JS coverage collected for `src/engine/audio/TextToSpeechEngine.js`.
- PASS: changed runtime JS coverage collected for `toolbox/text-to-speech/text2speech.js`.

## Out Of Scope

- No database changes.
- No external paid provider implementation.
- No generated audio file export provider.
- No new `tools/text2speech/` path.
- No archived tool activation.
