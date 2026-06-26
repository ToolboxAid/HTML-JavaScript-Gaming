# PR_26177_BRAVO_006-delete-broken-tts-seed-profiles

## Branch Validation
- PASS: Initial branch was `bravo/26177-text-to-speech`.
- PASS: Work stayed on the active Bravo branch; main was not checked out.
- PASS: No `start_of_day` folders were modified.

## Scope Summary
- Deleted the broken Text To Speech seed profile set from the server/runtime seed path.
- Removed the broken `Neutral` emotion seed and removed hidden default Neutral/profile creation in the TTS runtime helpers.
- Preserved guest browsing and guest save redirect behavior to `account/sign-in.html`.
- Updated targeted TTS, Messages API, seed integrity, and impacted Playwright specs to expect explicit working test profiles instead of broken seed records.

## Removed Invalid Profiles / Emotions
- `Default Balanced Profile`: removed from server-side TTS seed inventory and browser runtime default profile helper output.
- `Hero`: remains absent from the TTS seed/runtime profile set and is asserted absent in TTS Playwright coverage.
- `Merchant`: remains absent from the TTS seed/runtime profile set and is asserted absent in TTS Playwright coverage.
- `Neutral`: removed from the Messages emotion seed inventory and from TTS Profile emotion editor defaults/options. Existing `Neutral` voice gender terminology remains because it is a voice filter, not an Emotion Profile record.
- `Robot`: remains absent from the TTS seed/runtime emotion set and is asserted absent in seed/UI coverage.

## File Inventory
- `assets/toolbox/text-to-speech/js/index.js`
- `docs_build/database/seed/messages.json`
- `src/dev-runtime/messages/messages-postgres-service.mjs`
- `tests/dev-runtime/DbSeedIntegrity.test.mjs`
- `tests/dev-runtime/MessagesPublishValidation.test.mjs`
- `tests/playwright/tools/EventsTool.spec.mjs`
- `tests/playwright/tools/MessagesTool.spec.mjs`
- `tests/playwright/tools/TextToSpeechFunctional.spec.mjs`
- `tests/tools/Text2SpeechShell.test.mjs`
- `docs_build/dev/reports/PR_26177_BRAVO_006-delete-broken-tts-seed-profiles.md`
- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/codex_review.diff`

## Guest Save Routing Checklist
- PASS: TTS save/create/update/delete still require authenticated write checks.
- PASS: Unauthenticated TTS profile save continues to route to `account/sign-in.html`.
- PASS: Guest browsing remains allowed because profile reads still load without sign-in.
- PASS: No local storage product-data fallback was added.

## Validation Lane Report
- PASS: `node --check assets/toolbox/text-to-speech/js/index.js`
- PASS: `node --check src/dev-runtime/messages/messages-postgres-service.mjs`
- PASS: `node --check tests/playwright/tools/TextToSpeechFunctional.spec.mjs`
- PASS: `node --check tests/playwright/tools/MessagesTool.spec.mjs`
- PASS: `node --check tests/playwright/tools/EventsTool.spec.mjs`
- PASS: `node --test tests/tools/Text2SpeechShell.test.mjs` (6/6)
- PASS: `node --test tests/dev-runtime/MessagesPublishValidation.test.mjs` (6/6)
- PASS: `node --test --test-name-pattern "Messages Local API seeds" tests/dev-runtime/DbSeedIntegrity.test.mjs` (1/1)
- BLOCKED: `npx playwright test tests/playwright/tools/TextToSpeechFunctional.spec.mjs tests/playwright/tools/MessagesTool.spec.mjs tests/playwright/tools/EventsTool.spec.mjs --project=playwright`
  - Browser launch failed before page code ran because Chromium is missing at `C:\Users\davidq\AppData\Local\ms-playwright\chromium-1217\chrome-win64\chrome.exe`.

## Manual Validation Notes
- Reviewed seed/runtime references for `Default Balanced Profile`, `Hero`, `Merchant`, `Neutral`, and `Robot`.
- Remaining `Neutral` source references are limited to voice gender/filter terminology, negative absence assertions, or descriptive prose for the `Calm` seed.
- Playwright manual UI validation was not possible in this environment because the local Playwright Chromium binary is missing.

## Known Issues
- Playwright browser validation remains blocked until the local Chromium browser is installed for this Playwright version.

## Repo-Structured ZIP
- `tmp/PR_26177_BRAVO_006-delete-broken-tts-seed-profiles_delta.zip`
