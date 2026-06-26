# PR_26177_BRAVO_002 Complete Text To Speech Gap Fixes

## Branch Validation

| Check | Result | Notes |
| --- | --- | --- |
| Active branch | PASS | `bravo/26177-text-to-speech` |
| Did not switch to main | PASS | Work stayed on the active Bravo branch. |
| Scope | PASS | Text To Speech profiles, Emotion Profile settings, Messages integration, preview/usage/delete protection, tests, reports. |
| No `start_of_day` changes | PASS | `git status --short -- docs_build/dev/start_of_day start_of_day` returned no changed files. |

## Audit Checklist

| Area | Result | Notes |
| --- | --- | --- |
| TTS Profiles | PASS | Text To Speech now loads/saves/deletes TTS Profiles through Local API/database contracts, not browser-owned product storage. |
| Emotion Profiles | PASS | Added server-owned TTS Profile to Emotion Profile settings with pitch/rate/volume/preset, order, usage, and reference protection. |
| Messages integration | PASS | Messages consumes `listTtsProfiles()` directly and no longer syncs browser-saved profiles into the API. |
| Preview playback | PASS | Existing Web Speech preview remains in Text To Speech and Messages playback uses selected TTS Profile emotion settings. |
| Used-by / usage visibility | PASS | TTS Profiles and profile emotion settings expose message/sentence usage counts and references; Text To Speech shows Usage columns. |
| Delete protection | PASS | Referenced TTS Profiles, profile emotion settings, and Emotion Profiles are blocked server-side before destructive changes. |
| Targeted tests | PASS | Focused Node lane is green: 14/14 tests. |

## File Inventory

| File | Purpose |
| --- | --- |
| `src/dev-runtime/messages/messages-postgres-service.mjs` | Added profile emotion settings table/seed/API contract, usage counts, publish validation, delete/deactivate protection. |
| `toolbox/messages/messages-api-client.js` | Added TTS Profile and Emotion Profile delete actions. |
| `toolbox/messages/messages.js` | Removed browser profile-store sync; Messages now uses Local API TTS Profiles directly. |
| `assets/toolbox/text-to-speech/js/index.js` | Moved live TTS Profile workflow to Local API and surfaced usage counts. |
| `toolbox/text-to-speech/index.html` | Added TTS Profile Usage column. |
| `docs_build/database/ddl/messages.sql` | Aligned static Messages DDL with runtime TTS/Profile/Emotion/Event Action schema. |
| `tests/dev-runtime/MessagesPublishValidation.test.mjs` | Added API/service coverage for usage counts, profile-scoped emotion settings, and reference protection. |
| `tests/tools/MessagesPlaybackSource.test.mjs` | Updated source guards to require API-owned TTS Profile loading. |
| `tests/tools/Text2SpeechShell.test.mjs` | Removed saved-profile-store expectations and added Local API source guard. |
| `tests/playwright/tools/MessagesTool.spec.mjs` | Removed stale profile-store import/localStorage fixture; renamed coverage to Local API TTS Profiles. |

## DB/API Inventory

- Added runtime table: `messages_tts_profile_emotion_settings`.
- Added static DDL for `messages_tts_profile_emotion_settings`, `messages_records."voiceProfileKey"`, `messages_segments."voiceProfileKey"`, voice indexes, and `messages_event_actions`.
- Seeded explicit profile emotion settings:
  - Default Balanced Profile: Neutral, Calm, Urgent.
  - Man Profile 1: Neutral, Calm, Urgent.
  - Woman Profile 2: Whisper, Robot.
- Added TTS Profile usage/reference projection: `messageUsageCount`, `segmentUsageCount`, `usageCount`, `references`.
- Added profile emotion setting usage/reference projection.
- Added Local API delete actions:
  - `POST /api/messages/tts-profiles/:key/delete`
  - `POST /api/messages/emotion-profiles/:key/delete`
- Extended publish validation for inactive profiles and missing selected TTS Profile emotion settings.

## Test Inventory

| Command | Result |
| --- | --- |
| `node --check src/dev-runtime/messages/messages-postgres-service.mjs; node --check assets/toolbox/text-to-speech/js/index.js; node --check toolbox/messages/messages.js; node --check toolbox/messages/messages-api-client.js` | PASS |
| `node --test tests/tools/Text2SpeechShell.test.mjs tests/tools/MessagesPlaybackSource.test.mjs tests/dev-runtime/MessagesPublishValidation.test.mjs` | PASS, 14/14 |
| `npx playwright test tests/playwright/tools/MessagesTool.spec.mjs --project=playwright` | BLOCKED/FAIL, Chromium executable missing at `C:\Users\davidq\AppData\Local\ms-playwright\chromium-1217\chrome-win64\chrome.exe`. |
| `node --test ... tests/dev-runtime/DbSeedIntegrity.test.mjs` included during exploratory validation | PARTIAL, Messages seed test passed; two unrelated Local DB snapshot tests failed before this PR's assertions. |

## Playwright Impacted Assessment

Impacted specs:

- `tests/playwright/tools/MessagesTool.spec.mjs`
- `tests/playwright/tools/TextToSpeechFunctional.spec.mjs`
- `tests/playwright/tools/EventsTool.spec.mjs` indirectly uses Messages TTS/Emotion API rows.

Assessment:

- The stale `MessagesTool.spec.mjs` TTS profile-store import is fixed.
- Browser validation is still blocked locally by missing Chromium.
- Once Chromium is installed, rerun Messages, Text To Speech, and Events together because the workflow crosses Local API profile settings, message creation, sentence emotion filtering, and playback.

## Exact Remaining Implementation PR Recommendations

1. `PR_26177_BRAVO_003-playwright-browser-validation-closeout`
   - Install the configured Playwright Chromium browser or run in an environment with the browser available.
   - Rerun `MessagesTool.spec.mjs`, `TextToSpeechFunctional.spec.mjs`, and `EventsTool.spec.mjs`.
   - Apply only browser-lane fixes discovered by those specs.

2. `PR_26177_BRAVO_004-global-emotion-profile-authoring-if-needed`
   - Only if product wants creators to author the global Emotion Profile catalog outside TTS Profile settings.
   - Keep it API/database-owned and avoid browser-owned product data.

No additional Team Bravo TTS implementation gap is currently recommended from the focused API/service/UI/test pass.

## Manual Validation Notes

- Manual browser validation was not completed because Playwright Chromium is not installed locally.
- Source inspection confirmed Text To Speech and Messages no longer import the TTS profile browser store.
- Source inspection confirmed changed runtime/test files contain no `imageDataUrl` references.
- Source inspection confirmed no `start_of_day` files were modified.

## Known Issues

- Playwright browser execution is blocked by missing Chromium on this machine.
- External paid/provider TTS adapters remain planned and are outside this PR's browser preview/API profile scope.
- Dedicated global Emotion Profile authoring UI remains optional pending product decision; profile-scoped emotion settings are implemented.

## Output Files

- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/PR_26177_BRAVO_002-complete-text-to-speech-gap-fixes.md`
- `tmp/PR_26177_BRAVO_002-complete-text-to-speech-gap-fixes_delta.zip`
