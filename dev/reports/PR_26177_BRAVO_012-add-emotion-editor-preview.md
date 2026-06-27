# PR_26177_BRAVO_012-add-emotion-editor-preview

## Branch Validation
- PASS: Work stayed on `bravo/26177-text-to-speech`.
- PASS: Main was not checked out.
- PASS: No `start_of_day` folders were modified.

## Scope Summary
- Added Emotion editor preview playback while an emotion row is open inline.
- Kept editor action order as `Play | Save | Cancel`.
- Preview reads current editor Pitch, Rate, Volume, and selected Emotion without saving.
- Preview continues to inherit the parent TTS Profile voice, language, gender, and age filter through the existing TTS V2 preview path.
- Save remains the only persistence path and still routes guests to `account/sign-in.html`.
- Cancel continues to discard unsaved editor changes by closing the inline editor and rerendering saved profile data.

## Requirement Checklist
- PASS: Edit mode displays `Play`, `Save`, and `Cancel`.
- PASS: Button order is `Play | Save | Cancel`.
- PASS: Play uses current editor values without saving.
- PASS: Play inherits parent TTS Profile voice, language, gender, and age filter.
- PASS: Play uses edited Pitch, Rate, Volume, and selected Emotion settings.
- PASS: Play does not modify the database.
- PASS: Save persists current values through the existing authenticated Local API flow.
- PASS: Guest Save redirect to `account/sign-in.html` is preserved.
- PASS: Cancel restores original saved values by discarding the unsaved editor row.
- PASS: Targeted tests were updated.
- PASS: No governance changes or unrelated cleanup.

## File Inventory
- `assets/toolbox/text-to-speech/js/index.js`
- `tests/playwright/tools/TextToSpeechFunctional.spec.mjs`
- `tests/tools/Text2SpeechShell.test.mjs`
- `docs_build/dev/reports/PR_26177_BRAVO_012-add-emotion-editor-preview.md`
- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/codex_review.diff`

## Test Inventory
- Updated the Text To Speech functional Playwright flow to assert editor button order, unsaved preview pitch/rate/volume, inherited parent voice/language, unchanged API values after Play, and Cancel restoration.
- Added a focused Node source-level test that verifies the editor Play action is ordered before Save/Cancel, reads `emotionValues(key)`, calls `speakEmotion(profile, emotion)`, and does not call save/auth write helpers.

## Validation Lane Report
- PASS: `node --check assets/toolbox/text-to-speech/js/index.js`
- PASS: `node --check tests/playwright/tools/TextToSpeechFunctional.spec.mjs`
- PASS: `node --check tests/tools/Text2SpeechShell.test.mjs`
- PASS: `node --test tests/tools/Text2SpeechShell.test.mjs` (7/7)
- PASS: `git diff --check -- .`
- BLOCKED: `npx playwright test tests/playwright/tools/TextToSpeechFunctional.spec.mjs --project=playwright`
  - Browser launch failed before page code ran because Chromium is missing at `C:\Users\davidq\AppData\Local\ms-playwright\chromium-1217\chrome-win64\chrome.exe`.

## Manual Validation Notes
- Reviewed the editor Play flow to confirm it does not call `requireAuthenticatedWrite`, `saveProfileEmotionSettings`, `createTtsProfile`, or `updateTtsProfile`.
- Reviewed that parent voice, language, gender, and age filter are still supplied by `speakEmotion(profile, emotion)`.
- Browser/manual UI validation remains blocked by the missing local Playwright Chromium install.

## Known Issues
- Playwright browser validation cannot complete in this environment until the matching Chromium browser is installed.

## Repo-Structured ZIP
- `tmp/PR_26177_BRAVO_012-add-emotion-editor-preview_delta.zip`
