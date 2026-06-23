# PR_26174_BRAVO_021-wire-messages-to-tts-profile-contract

## Branch Validation
- PASS: Current branch is `team/BRAVO/messages`.
- PASS: Continued on the existing Bravo branch.
- PASS: Did not merge and did not return to `main`.

## Summary
- Wired `toolbox/messages/messages.js` directly to the Text To Speech profile contract exported by `toolbox/text-to-speech/text2speech.js`.
- Added a Messages-side adapter that maps TTS contract profile names/emotions to Local API server-owned profile and emotion keys.
- Filtered the Messages parent TTS Profile dropdown to the TTS contract profiles instead of raw Messages API profile rows.
- Filtered child Sentence Emotion dropdowns to the selected parent profile's contract emotions only.
- Guarded the Text To Speech page auto-start so importing the shared contract does not boot the TTS preview UI on the Messages page.

## Requirement Checklist
- PASS: Messages is wired to the same TTS Profile contract used by Text To Speech.
- PASS: Parent Message dropdown loads TTS Profile names from the TTS contract.
- PASS: Parent selected profile exposes Profile, Gender, Voice, Language, and Age Filter to Messages playback diagnostics.
- PASS: Child Sentence Emotion dropdown loads only emotions from the selected parent profile.
- PASS: `Man Profile 1` exposes `Neutral`, `Calm`, and `Urgent`.
- PASS: `Woman Profile 2` exposes only `Whisper` and `Robot`.
- PASS: Switching parent Profile refreshes child Sentence emotion options after save/reload.
- PASS: Parent Message Play remains routed through selected parent profile plus ordered Sentences.
- PASS: Child Sentence Play remains routed through selected parent profile plus selected Sentence Emotion.
- PASS: Messages runtime does not contain or show `Select an available browser voice before preview.`
- PASS: Text To Speech preview validation was not changed; only the shared export/auto-start guard was adjusted.
- PASS: Messages does not add Emotion Profiles or Voice Profiles sections.
- PASS: No inline styles, inline scripts, inline handlers, or page-local CSS added.
- PASS: No browser-owned authoritative product data or browser-generated authoritative database keys added.

## Validation Lane Report
- PASS: `node tests/tools/Text2SpeechShell.test.mjs`
- PASS: `node tests/tools/MessagesPlaybackSource.test.mjs`
- PASS: `node --test-name-pattern "Messages Local API seeds" tests/dev-runtime/DbSeedIntegrity.test.mjs`
- PASS: `node tests/dev-runtime/MessagesPublishValidation.test.mjs`
- PASS: Contract/API runtime inspection confirmed matching profile emotion sets:
  - `Default Balanced Profile`: `Calm`, `Urgent`
  - `Man Profile 1`: `Neutral`, `Calm`, `Urgent`
  - `Woman Profile 2`: `Whisper`, `Robot`
- FAIL/BLOCKED: `npx playwright test tests/playwright/tools/MessagesTool.spec.mjs --project=playwright`
  - Blocked before assertions: missing local Chromium executable at `C:\Users\davidq\AppData\Local\ms-playwright\chromium-1217\chrome-win64\chrome.exe`.
- PASS: `npm run test:playwright:static`

## Manual Validation Notes
- Browser UI validation could not complete because the local Playwright Chromium executable is missing.
- Static and Node validations passed for the PR-specific wiring.
- Code inspection confirms Messages imports the TTS contract and no longer assigns raw `voicePayload.ttsProfiles` directly into UI profile state.
- Code inspection confirms Messages playback runtime still has no preview voice validation text.

## Changed Files
- `src/dev-runtime/messages/messages-postgres-service.mjs`
- `toolbox/messages/messages.js`
- `toolbox/text-to-speech/text2speech.js`
- `tests/dev-runtime/DbSeedIntegrity.test.mjs`
- `tests/dev-runtime/MessagesPublishValidation.test.mjs`
- `tests/playwright/tools/EventsTool.spec.mjs`
- `tests/playwright/tools/MessagesTool.spec.mjs`
- `tests/tools/MessagesPlaybackSource.test.mjs`
- `tests/tools/Text2SpeechShell.test.mjs`
- `docs_build/dev/reports/PR_26174_BRAVO_021-wire-messages-to-tts-profile-contract.md`
- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/codex_review.diff`

## ZIP
- `tmp/PR_26174_BRAVO_021-wire-messages-to-tts-profile-contract_delta.zip`
