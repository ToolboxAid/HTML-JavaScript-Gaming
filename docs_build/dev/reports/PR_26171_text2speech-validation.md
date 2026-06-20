# Text To Speech Validation Report

## Commands
- PASS: `node --test tests/tools/Text2SpeechShell.test.mjs`
- PASS: targeted static validation for `toolbox/text-to-speech/index.html`
- FAIL: `npm run test:workspace-v2`

`npm run test:workspace-v2` is a legacy command name. The user-facing product language is Project Workspace.

## Workspace Lane Failure
- The command ran `tests/playwright/tools/RootToolsFutureState.spec.mjs`.
- 3 tests passed and 2 tests failed.
- Failure 1: `root tools surface links current tool pages without old_* routes` expected the default tool labels without `Message Studio`; the page currently includes `Message Studio`.
- Failure 2: `common header renders primary navigation order across active pages` found a generic `Studio` body-text match after stripping `GameFoundryStudio` / `Game Foundry Studio`.
- Neither failure points to the corrected Text To Speech path, module wiring, or removed `tools/text2speech/` directory.

## Targeted assertions
- Model ownership boundary is Design for messages/profiles and Audio for generated voice assets.
- Preview/generate/export shell does not silently fall back.
- Future provider adapter list is planning-only for OpenAI, ElevenLabs, Azure, and local providers.
- Text To Speech page uses Theme V2 and ToolDisplayMode.
- Text To Speech page wires `toolbox/text-to-speech/text2speech.js`.
- Text To Speech page does not reference `tools/text2speech`.
- `tools/text2speech/` is absent.
