# PR_26177_BRAVO_007-delete-broken-tts-profile-parents

## Branch Validation
- PASS: Initial branch was `bravo/26177-text-to-speech`.
- PASS: Work stayed on the active Bravo branch; main was not checked out.
- PASS: No `start_of_day` folders were modified.

## Scope Summary
- Added server-side cleanup for retired TTS parent profiles during Messages service readiness.
- Retired parent profile names: `Default Balanced Profile`, `Hero`, `Merchant`, `Neutral`, `Robot`.
- Cleanup deletes retired parent profile rows, profile emotion child settings, stale message/sentence/event-action references that point at those retired parents, and orphaned profile-emotion join rows.
- Updated the Messages seed documentation note and targeted service tests.

## Requirement Checklist
- PASS: Delete parent TTS Profile records for `Default Balanced Profile`, `Hero`, `Merchant`, `Neutral`, and `Robot`.
- PASS: Remove remaining database references to those retired profiles.
- PASS: Remove child emotion settings for retired parent profiles.
- PASS: Remove orphaned profile-emotion settings whose profile or emotion parent no longer exists.
- PASS: Prevent retired empty parent rows from appearing in TTS UI by deleting them through the API/service layer before profile reads.
- PASS: Seed documentation and targeted tests updated.
- PASS: Guest save redirect behavior preserved; no TTS write-auth changes were made.
- PASS: No governance changes.
- PASS: No unrelated cleanup or repo-wide refactor.

## File Inventory
- `docs_build/database/seed/messages.json`
- `src/dev-runtime/messages/messages-postgres-service.mjs`
- `tests/dev-runtime/MessagesPublishValidation.test.mjs`
- `docs_build/dev/reports/PR_26177_BRAVO_007-delete-broken-tts-profile-parents.md`
- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/codex_review.diff`

## DB/API Inventory
- `messages_tts_profiles`: retired profile parent rows are deleted by exact creator-facing name.
- `messages_tts_profile_emotion_settings`: child settings for retired profiles and orphaned join rows are deleted.
- `messages_records`: stale rows referencing retired TTS profiles are deleted to avoid orphaned profile references.
- `messages_segments`: stale rows referencing retired TTS profiles, plus child segments for deleted stale messages, are deleted.
- `messages_event_actions`: stale actions referencing deleted stale messages are deleted.
- Local API profile reads continue through `listTtsProfiles()` after `ensureReady()`.

## Test Inventory
- Added `Messages seed cleanup deletes retired parent TTS profiles and orphaned settings`.
- Existing `MessagesPublishValidation` coverage remains green for usage counts, delete blocking, profile-scoped emotions, and guest TTS write protection.
- Existing TTS helper tests remain green for no hidden default seed profile/emotion behavior.

## Validation Lane Report
- PASS: `node --check src/dev-runtime/messages/messages-postgres-service.mjs`
- PASS: `node --check tests/dev-runtime/MessagesPublishValidation.test.mjs`
- PASS: `node --test tests/dev-runtime/MessagesPublishValidation.test.mjs` (7/7)
- PASS: `node --test --test-name-pattern "Messages Local API seeds" tests/dev-runtime/DbSeedIntegrity.test.mjs` (1/1)
- PASS: `node --test tests/tools/Text2SpeechShell.test.mjs` (6/6)
- BLOCKED: `npx playwright test tests/playwright/tools/TextToSpeechFunctional.spec.mjs tests/playwright/tools/MessagesTool.spec.mjs tests/playwright/tools/EventsTool.spec.mjs --project=playwright`
  - Browser launch failed before page code ran because Chromium is missing at `C:\Users\davidq\AppData\Local\ms-playwright\chromium-1217\chrome-win64\chrome.exe`.

## Manual Validation Notes
- Reviewed remaining references for the retired profile names.
- Positive retired-name references are limited to the cleanup constant, seed note, and tests/assertions proving deletion or absence.
- Existing `Neutral` voice gender terminology remains because it is not a TTS Profile parent record.

## Known Issues
- Playwright browser validation remains blocked until the local Playwright Chromium browser is installed for this version.

## Repo-Structured ZIP
- `tmp/PR_26177_BRAVO_007-delete-broken-tts-profile-parents_delta.zip`
