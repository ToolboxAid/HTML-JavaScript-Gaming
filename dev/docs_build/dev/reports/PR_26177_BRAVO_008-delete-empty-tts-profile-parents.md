# PR_26177_BRAVO_008-delete-empty-tts-profile-parents

## Branch Validation
- PASS: Initial branch was `bravo/26177-text-to-speech`.
- PASS: Work stayed on the active Bravo branch; main was not checked out.
- PASS: No `start_of_day` folders were modified.

## Scope Summary
- Added server-side cleanup for TTS parent profiles that have no child emotion settings.
- Empty TTS parent profiles are deleted instead of repaired with fallback child rows.
- Orphaned profile-emotion settings are pruned before empty-parent cleanup.
- TTS profile creates now require at least one child emotion setting.
- TTS profile updates that remove all child emotion settings delete the parent and return a 410 error.
- TTS UI save validation now blocks empty parent saves before an API write.
- Guest save redirect behavior to `account/sign-in.html` is preserved.

## Requirement Checklist
- PASS: Empty parent TTS Profile rows are removed from service/runtime display.
- PASS: Orphaned child emotion settings are removed.
- PASS: No fallback child emotion rows are created.
- PASS: Broken/empty profiles are deleted, not repaired.
- PASS: UI save validation prevents creating empty parent rows.
- PASS: Guest save redirect behavior is unchanged.
- PASS: Targeted unit/API and impacted Playwright specs were updated.
- PASS: No governance changes.
- PASS: No unrelated cleanup or repo-wide refactor.

## File Inventory
- `assets/toolbox/text-to-speech/js/index.js`
- `docs_build/database/seed/messages.json`
- `src/dev-runtime/messages/messages-postgres-service.mjs`
- `tests/dev-runtime/MessagesPublishValidation.test.mjs`
- `tests/playwright/tools/MessagesTool.spec.mjs`
- `tests/playwright/tools/TextToSpeechFunctional.spec.mjs`
- `docs_build/dev/reports/PR_26177_BRAVO_008-delete-empty-tts-profile-parents.md`
- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/codex_review.diff`

## DB/API Inventory
- `messages_tts_profiles`: profiles without child settings are deleted.
- `messages_tts_profile_emotion_settings`: orphaned rows are deleted before empty-parent evaluation.
- `messages_records`, `messages_segments`, `messages_event_actions`: stale rows referencing deleted empty parents are removed to avoid orphaned database references.
- `POST /api/messages/tts-profiles`: rejects empty parent saves.
- `PATCH /api/messages/tts-profiles/:key`: deletes the parent when the requested emotion settings become empty.

## Test Inventory
- Added/extended `Messages seed cleanup deletes retired parent TTS profiles and orphaned settings` to include empty parent cleanup and stale reference deletion.
- Added `Messages TTS profile saves reject empty parent profiles instead of creating fallback children`.
- Updated Text To Speech Playwright expectations to block empty UI saves and use API-created profiles with child settings for preview.
- Updated Messages Playwright profile setup to create profiles through the Local API with child settings supplied up front.

## Validation Lane Report
- PASS: `node --check assets/toolbox/text-to-speech/js/index.js`
- PASS: `node --check src/dev-runtime/messages/messages-postgres-service.mjs`
- PASS: `node --check tests/dev-runtime/MessagesPublishValidation.test.mjs`
- PASS: `node --check tests/playwright/tools/TextToSpeechFunctional.spec.mjs`
- PASS: `node --check tests/playwright/tools/MessagesTool.spec.mjs`
- PASS: `node --test tests/dev-runtime/MessagesPublishValidation.test.mjs` (8/8)
- PASS: `node --test --test-name-pattern "Messages Local API seeds" tests/dev-runtime/DbSeedIntegrity.test.mjs` (1/1)
- PASS: `node --test tests/tools/Text2SpeechShell.test.mjs` (6/6)
- BLOCKED: `npx playwright test tests/playwright/tools/TextToSpeechFunctional.spec.mjs tests/playwright/tools/MessagesTool.spec.mjs tests/playwright/tools/EventsTool.spec.mjs --project=playwright`
  - Browser launch failed before page code ran because Chromium is missing at `C:\Users\davidq\AppData\Local\ms-playwright\chromium-1217\chrome-win64\chrome.exe`.

## Manual Validation Notes
- Reviewed the TTS profile create/update/list paths for empty-parent persistence.
- Verified no local storage product-data path or fallback child creation was added.
- Playwright/manual browser validation remains blocked by the missing local Chromium install.

## Known Issues
- Playwright browser validation cannot complete in this environment until the matching Chromium browser is installed.

## Repo-Structured ZIP
- `tmp/PR_26177_BRAVO_008-delete-empty-tts-profile-parents_delta.zip`
