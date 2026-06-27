# PR_26174_BRAVO_020-messages-load-tts-profile-emotions

## Branch Validation
- PASS: Current branch is `team/BRAVO/messages`.
- PASS: Continued on the existing Bravo branch.
- PASS: Did not merge and did not return to `main`.

## Summary
- Added a Text To Speech-owned Message Studio profile export with profile-specific emotions.
- Updated the Messages Local API TTS profile seed/response mapping to use the Text To Speech profile contract while preserving server-owned database keys.
- Updated Messages sentence Emotion dropdowns to show only emotions available on the selected parent Message TTS Profile.
- Added/updated tests for TTS-owned profile names, filtered child emotion options, parent profile switching, and Messages playback through selected profile/emotion references.

## Requirement Checklist
- PASS: `/toolbox/messages/index.html` continues to load Messages through external JS; TTS profile names are now supplied by the Text To Speech-owned profile contract through the Local API.
- PASS: Messages parent TTS Profile dropdown shows available TTS Profiles: `Default Balanced Profile`, `Man Profile 1`, and `Woman Profile 2`.
- PASS: Child Sentence Emotion dropdown is filtered by the selected parent TTS Profile.
- PASS: `Man Profile 1` exposes only `Calm` and `Urgent`.
- PASS: `Woman Profile 2` exposes only `Whisper` and `Robot`.
- PASS: Switching parent profile updates available child Sentence emotions.
- PASS: Messages does not duplicate TTS profile/emotion ownership; Text To Speech owns profile, voice, language, gender, age filter, pitch, rate, and volume.
- PASS: Messages still owns what to speak.
- PASS: Messages playback resolves Message/Sentence to selected parent TTS Profile and selected Sentence Emotion.
- PASS: Messages runtime still contains no `Select an available browser voice before preview` error text.
- PASS: No inline styles, inline scripts, inline handlers, or page-local CSS added.
- PASS: No browser-owned authoritative product data or browser-generated authoritative database keys added.
- PASS: Creator-safe failure text retained.

## Validation Lane Report
- PASS: `node tests/tools/Text2SpeechShell.test.mjs`
- PASS: `node tests/tools/MessagesPlaybackSource.test.mjs`
- PASS: `node --test-name-pattern "Messages Local API seeds" tests/dev-runtime/DbSeedIntegrity.test.mjs`
- PASS: `node tests/dev-runtime/MessagesPublishValidation.test.mjs`
- PASS: Service inspection confirmed profile/emotion response shape:
  - `Default Balanced Profile`: `Calm`, `Urgent`
  - `Man Profile 1`: `Calm`, `Urgent`
  - `Woman Profile 2`: `Whisper`, `Robot`
- FAIL/BLOCKED: `npx playwright test tests/playwright/tools/MessagesTool.spec.mjs --project=chromium`
  - Repo Playwright config has projects `ui` and `playwright`; no `chromium` project.
- FAIL/BLOCKED: `npx playwright test tests/playwright/tools/MessagesTool.spec.mjs --project=playwright`
  - Blocked before assertions: missing local Chromium executable at `C:\Users\davidq\AppData\Local\ms-playwright\chromium-1217\chrome-win64\chrome.exe`.
- FAIL/BLOCKED: `npm run test:workspace-v2`
  - Static setup ran, then blocked by the same missing Chromium executable.
- PASS: `npm run test:playwright:static`
- NOTE: Full `node tests/dev-runtime/DbSeedIntegrity.test.mjs` ran the Messages seed case successfully, then failed unrelated Local DB snapshot cases that are outside this PR scope. The scoped Messages seed case passed.

## Manual Validation Notes
- Browser UI validation could not complete because Playwright Chromium is not installed locally.
- Static and Node validations passed for the PR-specific behavior.
- Code inspection confirmed Messages uses external JS only and the child Emotion picker no longer falls back to global unrelated emotions.
- Runtime service inspection confirmed TTS profile names and filtered emotion sets are returned through the Local API.

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
- `docs_build/dev/reports/PR_26174_BRAVO_020-messages-load-tts-profile-emotions.md`
- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/codex_review.diff`

## ZIP
- `tmp/PR_26174_BRAVO_020-messages-load-tts-profile-emotions_delta.zip`
