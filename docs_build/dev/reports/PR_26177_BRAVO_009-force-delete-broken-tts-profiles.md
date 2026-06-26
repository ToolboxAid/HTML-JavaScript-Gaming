# PR_26177_BRAVO_009-force-delete-broken-tts-profiles

## Branch Validation
- PASS: Initial branch was `bravo/26177-text-to-speech`.
- PASS: Work stayed on the active Bravo branch; main was not checked out.
- PASS: No `start_of_day` folders were modified.

## Scope Summary
- Strengthened server-side setup cleanup for hard-deleted broken TTS parent profiles.
- Added a setup/API validation guard that fails if any retired parent profile name survives cleanup.
- Forced API profile reads to rerun retired-name cleanup before returning TTS Profiles.
- Rejected creator/API saves that attempt to recreate retired TTS Profile names.
- Added a TTS page display guard so retired profile names are filtered from UI rendering if a bad payload ever reaches the browser.
- Preserved guest save redirect behavior to `account/sign-in.html`.

## Required Name Absence
- PASS: `Default Balanced Profile` is deleted from persisted TTS profiles and absent from API output after setup.
- PASS: `Hero` is deleted from persisted TTS profiles and absent from API output after setup.
- PASS: `Merchant` is deleted from persisted TTS profiles and absent from API output after setup.
- PASS: `Neutral` is deleted from persisted TTS profiles and absent from API output after setup.
- PASS: `Robot` is deleted from persisted TTS profiles and absent from API output after setup.

## Requirement Checklist
- PASS: Existing Local DB TTS profile records are deleted by exact retired name during Messages service setup/read cleanup.
- PASS: Child TTS profile emotion settings for those parent profiles are deleted.
- PASS: Message, sentence, and event-action references pointing at those parent profiles are deleted with the broken profile data.
- PASS: API list responses cannot return those names; cleanup reruns before list output and validation throws if any remain.
- PASS: TTS UI filters those names before rendering profile rows.
- PASS: Validation fails if a retired name remains after setup cleanup.
- PASS: Tests assert the names are absent from API output and TTS page rendering.
- PASS: No fallback profiles or placeholder child rows were added.
- PASS: Guest save redirect behavior is unchanged.
- PASS: No governance changes or unrelated cleanup.

## File Inventory
- `assets/toolbox/text-to-speech/js/index.js`
- `src/dev-runtime/messages/messages-postgres-service.mjs`
- `tests/dev-runtime/MessagesPublishValidation.test.mjs`
- `docs_build/dev/reports/PR_26177_BRAVO_009-force-delete-broken-tts-profiles.md`
- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/codex_review.diff`

## DB/API Inventory
- `messages_tts_profiles`: retired parent rows are force-deleted by name.
- `messages_tts_profile_emotion_settings`: child settings for retired parents and orphaned settings are deleted.
- `messages_records`, `messages_segments`, `messages_event_actions`: stale references to deleted retired profiles are deleted to avoid orphaned DB references.
- `GET /api/messages/tts-profiles`: reruns cleanup and validation before returning profile output.
- `POST/PATCH /api/messages/tts-profiles`: rejects retired profile names instead of recreating them.

## Test Inventory
- Updated `Messages seed cleanup deletes retired parent TTS profiles and orphaned settings` to assert each retired name is absent from persisted records and API output.
- Added `Messages seed setup fails if retired TTS profile validation still finds broken names`.
- Updated empty-save coverage to assert retired names cannot be recreated through `createTtsProfile`.
- Existing TTS Playwright spec contains page-rendering absence assertions for the retired names.

## Validation Lane Report
- PASS: Explicit search ran for `Default Balanced Profile|Hero|Merchant|Neutral|Robot`; remaining hits are cleanup constants, seed notes, negative assertions, and voice-gender terminology only.
- PASS: `node --check src/dev-runtime/messages/messages-postgres-service.mjs`
- PASS: `node --check assets/toolbox/text-to-speech/js/index.js`
- PASS: `node --check tests/dev-runtime/MessagesPublishValidation.test.mjs`
- PASS: `node --check tests/playwright/tools/TextToSpeechFunctional.spec.mjs`
- PASS: `node --test tests/dev-runtime/MessagesPublishValidation.test.mjs` (9/9)
- PASS: `node --test --test-name-pattern "Messages Local API seeds" tests/dev-runtime/DbSeedIntegrity.test.mjs` (1/1)
- PASS: `node --test tests/tools/Text2SpeechShell.test.mjs` (6/6)
- BLOCKED: `npx playwright test tests/playwright/tools/TextToSpeechFunctional.spec.mjs tests/playwright/tools/MessagesTool.spec.mjs tests/playwright/tools/EventsTool.spec.mjs --project=playwright`
  - Browser launch failed before page code ran because Chromium is missing at `C:\Users\davidq\AppData\Local\ms-playwright\chromium-1217\chrome-win64\chrome.exe`.

## Manual Validation Notes
- Reviewed server setup/read cleanup paths and TTS page profile loading.
- Confirmed no fallback profile or placeholder child-emotion creation was added.
- Browser/manual UI validation remains blocked by the missing local Playwright Chromium install.

## Known Issues
- Playwright browser validation cannot complete in this environment until the matching Chromium browser is installed.

## Repo-Structured ZIP
- `tmp/PR_26177_BRAVO_009-force-delete-broken-tts-profiles_delta.zip`
