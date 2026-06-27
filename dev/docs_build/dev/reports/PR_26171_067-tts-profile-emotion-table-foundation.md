# PR_26171_067 TTS Profile Emotion Table Foundation

## Summary

TTS Studio now presents a parent TTS Profiles table with an expandable child Emotion Settings table. The active tool remains `toolbox/text-to-speech/`, uses Theme V2, and keeps all JavaScript external.

## Scope

- Updated `toolbox/text-to-speech/index.html` to expose the requested parent and child table surfaces.
- Updated `toolbox/text-to-speech/text2speech.js` to seed reusable profiles, render child emotion settings, support inline add/edit rows, and block delete actions when profile or emotion usage is marked by Message Studio data.
- Added a TTS profile contract helper that returns Message Studio compatible options without moving ownership into Message Studio.
- Updated targeted TTS browser and unit validation.

## Requirement Evidence

- PASS: Active path remains `toolbox/text-to-speech/`.
- PASS: Parent table is TTS Profiles.
- PASS: Clicking a profile row opens the child Emotion Settings subtable.
- PASS: Parent rows include `Man Profile 1` and `Woman Profile 2`.
- PASS: Parent columns are Profile Name, Voice, Language, Gender, Age, Emotion Count, Status, Actions.
- PASS: Child columns are Emotion, Pitch, Rate, Volume, SSML-like Preset, Status, Actions.
- PASS: Add Profile opens an inline add row under the parent table.
- PASS: Edit Profile opens an inline edit row.
- PASS: Add Emotion opens an inline add row in the child table.
- PASS: Edit Emotion opens an inline edit row.
- PASS: Delete profile is disabled when usage count indicates Message Studio data uses it.
- PASS: Delete emotion is disabled when usage count indicates Message Parts use it.
- PASS: Default balanced profile and default neutral emotion are provided.
- PASS: Message Studio compatible profile options are exported for a future API/data contract.
- PASS: Message Studio and TTS Studio remain separate tools.
- PASS: No database changes were made.
- PASS: Theme V2 only; no page-local CSS, tool-local CSS, inline styles, style blocks, or inline handlers.

## Validation

- PASS: `node --check toolbox\text-to-speech\text2speech.js`.
- PASS: `node --check tests\playwright\tools\TextToSpeechFunctional.spec.mjs`.
- PASS: `node --check tests\tools\Text2SpeechShell.test.mjs`.
- PASS: HTML inline style/script/event scan for `toolbox/text-to-speech/index.html`.
- PASS: `node --test tests/tools/Text2SpeechShell.test.mjs`.
- PASS: `npx playwright test tests/playwright/tools/TextToSpeechFunctional.spec.mjs --project=playwright --workers=1 --reporter=list`.
- PASS: `npx playwright test tests/playwright/tools/MessagesTool.spec.mjs --project=playwright --workers=1 --reporter=list`.
- PASS: `npm run test:workspace-v2` (legacy command name; user-facing language is Project Workspace).

## Out Of Scope

- No Message Studio merge.
- No new provider behavior.
- No generated audio export.
- No database schema, seed, or persistence change.
