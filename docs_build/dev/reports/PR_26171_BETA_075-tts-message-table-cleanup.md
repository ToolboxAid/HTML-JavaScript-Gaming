# PR_26171_BETA_075 TTS Message Table Cleanup

Team: BETA

## Summary

- Removed the duplicate center summary text `TTS Studio` from the Text To Speech summary row.
- Removed the stale Text To Speech left-column Voice Filters, Presets, Delivery, and Named Sentence controls.
- Removed the stale Text To Speech Queue and right-column Output Summary surfaces.
- Kept voice, language, gender, and age editing in the TTS Profile inline table row.
- Kept pitch, rate, volume, and preset editing in the Emotion Settings inline table row.
- Updated Text To Speech preview playback to speak the current text through the selected TTS Profile and selected/neutral Emotion Setting.
- Updated Message Studio Message Parts to show Text, Emotion, TTS Profile, Status, and Actions while preserving internal display order.
- Updated focused Playwright tests and workspace count/group expectations to match the current registered toolbox surface.

## Requirement Checklist

- PASS: Removed duplicate center-column `TTS Studio` summary text.
- PASS: Removed duplicate left-column items that belong to Profile or Emotion Settings rows.
- PASS: Delivery values are owned by Emotion Settings through Pitch, Rate, and Volume fields.
- PASS: Preset value is owned by Emotion Settings through the Preset field.
- PASS: Removed right-column Output Summary.
- PASS: Voice Filters are owned by the Profile row dropdowns.
- PASS: Removed Named Sentence and queue UI.
- PASS: Removed related dead HTML, JavaScript, and test code for the stale queue/output controls.
- PASS: Message Studio child table uses the approved visible Message Parts columns.
- PASS: Theme V2 only; no local CSS or inline handlers/styles were added.

## Validation

- PASS: `npx playwright test tests/playwright/tools/TextToSpeechFunctional.spec.mjs`
- PASS: `npx playwright test tests/playwright/tools/MessagesTool.spec.mjs --trace=off`
- PASS: `node --test tests/tools/Text2SpeechShell.test.mjs`
- PASS: `npm run test:workspace-v2`
- PASS: `git diff --check`

`npm run test:workspace-v2` is a legacy command name; the user-facing product language remains Project Workspace and Game Hub.

## Notes

- The Text To Speech page still supports local preview playback through the shared engine audio module.
- Message Part display order remains persisted internally and is managed with Move Up and Move Down actions rather than a visible Order column.
