# PR_26177_BRAVO_001 Audit: Text To Speech Profiles And Emotions

## Scope

Audit-only review of Team Bravo Text To Speech, including TTS Profiles, Emotion Profiles, Messages integration, DB/API contracts, existing tests, Playwright coverage, and remaining production-readiness gaps.

No implementation changes were made.

Repo-structured ZIP path: `tmp/PR_26177_BRAVO_001-audit-text-to-speech-profiles-emotions_delta.zip`

## Branch Validation

| Check | Result | Evidence |
| --- | --- | --- |
| Current branch must be `main` | PASS | `git branch --show-current` returned `main`. |
| Hard stop if branch is not `main` | PASS | Branch was validated before report edits. |

## Audit Checklist

| Area | Status | Notes |
| --- | --- | --- |
| 1. Text To Speech creator page/workflow | PASS | `toolbox/text-to-speech/index.html` uses Theme V2 shell, external assets, TTS Profiles table, per-profile Emotion rows, and Local Preview playback. |
| 2. TTS Profile management | PARTIAL | Browser UI supports add/edit/delete and persistence, but source of truth is browser storage and reference blocking is based on stored counters rather than live Messages usage. |
| 3. Emotion Profile management | PARTIAL | Text To Speech has per-profile Emotion rows with pitch/rate/volume, but Local API/DB has global `messages_emotion_profiles` and no TTS Profile to Emotion settings join table. |
| 4. Messages integration with TTS Profiles and Emotion Profiles | PARTIAL | Messages loads saved active TTS Profiles, syncs names to Local API rows, filters sentence emotions by selected TTS Profile, and plays through browser speech. The sync is opportunistic and browser-storage-driven. |
| 5. DB tables/migrations/seeds | PARTIAL | Runtime service DDL contains TTS profile references, but static `docs_build/database/ddl/messages.sql` is stale and lacks `voiceProfileKey` columns/indexes and `messages_event_actions`. |
| 6. Local API/service contracts | PARTIAL | Local API exposes list/create/update for TTS and Emotion Profiles plus Messages/Sentences. TTS Profile usage/reference counts and deactivation protection are missing. |
| 7. Reference protection/delete blocking | PARTIAL | Message delete is blocked when sentences exist; Emotion deactivation is blocked when referenced. TTS Profile deactivation is not blocked server-side, and Text To Speech delete blocking depends on stale/local counters. |
| 8. Usage counts/used-by visibility | PARTIAL | Messages shows selected message sentence usage and reference list. Emotion Profile API exposes usage/references. TTS Profile API does not expose usage/references, and Text To Speech has no live used-by view. |
| 9. Preview playback | PASS | Text To Speech preview uses Web Speech API through `TextToSpeechEngine`; Messages playback uses selected parent TTS Profile and sentence Emotion settings. |
| 10. Validation and error handling | PARTIAL | Required-field and uniqueness checks exist in UI/service, plus publish validation. Gaps remain around inactive profile publish checks, TTS Profile reference protection, and creator-facing API terminology. |
| 11. Theme V2 compliance | PASS | Target HTML uses `base href="/"`, Theme V2 CSS, partials, `tool-workspace`, `tool-column`, data-tool-display-mode, and no inline style/script handlers in inspected pages. |
| 12. Existing unit/API tests | PASS | Targeted Node tests pass: 10 tests across Text To Speech shell/store, Messages playback source checks, and Messages publish validation. |
| 13. Existing Playwright coverage | FAIL | Coverage files exist, but impacted Playwright lane is not currently runnable: Messages spec imports a removed store path, and standalone Text To Speech spec cannot launch because Chromium is not installed. |
| 14. Remaining production-readiness gaps | PASS | Exact implementation PR recommendations are listed below. |

## File Inventory

| Surface | Files |
| --- | --- |
| Text To Speech page/workflow | `toolbox/text-to-speech/index.html`; `assets/toolbox/text-to-speech/js/index.js`; `assets/js/shared/tts-profile-store.js`; `src/engine/audio/TextToSpeechEngine.js`; `src/engine/audio/TextToSpeechDefaults.js`; `src/shared/contracts/tools/textToSpeechContract.js` |
| Messages integration | `toolbox/messages/index.html`; `toolbox/messages/messages.js`; `toolbox/messages/messages-api-client.js`; `toolbox/messages/message-tts-service-registry.js`; `src/api/server-api-client.js` |
| Local API/service | `src/dev-runtime/messages/messages-postgres-service.mjs`; `src/dev-runtime/server/local-api-router.mjs`; `src/dev-runtime/server/local-api-server.mjs` |
| DB contract/seed | `docs_build/database/ddl/messages.sql`; `docs_build/database/dml/messages.sql`; `docs_build/database/seed/messages.json` |
| Unit/API tests | `tests/tools/Text2SpeechShell.test.mjs`; `tests/tools/MessagesPlaybackSource.test.mjs`; `tests/dev-runtime/MessagesPublishValidation.test.mjs`; `tests/helpers/messagesPostgresClientStub.mjs` |
| Playwright tests | `tests/playwright/tools/TextToSpeechFunctional.spec.mjs`; `tests/playwright/tools/MessagesTool.spec.mjs`; `tests/playwright/tools/EventsTool.spec.mjs` |

## DB/API Inventory

### Runtime Service Tables

`src/dev-runtime/messages/messages-postgres-service.mjs` creates or patches:

- `messages_categories`
- `messages_emotion_profiles`
- `messages_tts_profiles`
- `messages_records`
- `messages_segments`
- `messages_event_actions`
- `messages_records."voiceProfileKey"` references `messages_tts_profiles(key)`
- `messages_segments."voiceProfileKey"` references `messages_tts_profiles(key)`
- indexes for emotion, voice profile, message, event action, creator, and updater lookups

### Static DB Files

- `docs_build/database/ddl/messages.sql` includes categories, emotion profiles, TTS profiles, records, and segments.
- Static DDL currently omits `messages_records."voiceProfileKey"`, `messages_segments."voiceProfileKey"`, the voice-profile indexes on records/segments, and `messages_event_actions`.
- `docs_build/database/dml/messages.sql` intentionally has no direct inserts and delegates setup to server-side seed/API.
- `docs_build/database/seed/messages.json` seeds names for categories, emotion profiles, and TTS profiles. It explicitly says browser pages must not seed authoritative records.

### Local API Endpoints

Browser client `toolbox/messages/messages-api-client.js` wraps:

- `GET/POST /api/messages/emotion-profiles`
- `GET/POST /api/messages/emotion-profiles/:key`
- `GET/POST /api/messages/tts-profiles`
- `GET/POST /api/messages/tts-profiles/:key`
- `GET/POST /api/messages/messages`
- `GET/POST /api/messages/messages/:key`
- `POST /api/messages/messages/:key/delete`
- `GET/POST /api/messages/segments`
- `GET/POST /api/messages/segments/:key`
- `POST /api/messages/segments/:key/delete`
- `GET /api/messages/publish-validation`

### Contract Gaps

- `messages_tts_profiles` has no usage count or references projection.
- `messages_tts_profiles` update allows active TTS Profiles to be deactivated even when Messages or Sentences reference them.
- Local API uses user-facing "Voice profile" wording in errors and publish issues where creator-facing UI says "TTS Profile".
- DB/API does not model per-TTS-Profile Emotion Settings. The runtime maps every active global Emotion Profile into every TTS Profile unless the browser-local Text To Speech store overrides it.

## Test Inventory

### Validation Performed

| Command | Result |
| --- | --- |
| `node --check assets/toolbox/text-to-speech/js/index.js` | PASS |
| `node --check assets/js/shared/tts-profile-store.js` | PASS |
| `node --check toolbox/messages/messages.js` | PASS |
| `node --check toolbox/messages/messages-api-client.js` | PASS |
| `node --check toolbox/messages/message-tts-service-registry.js` | PASS |
| `node --check src/dev-runtime/messages/messages-postgres-service.mjs` | PASS |
| `node --test tests/tools/Text2SpeechShell.test.mjs tests/tools/MessagesPlaybackSource.test.mjs tests/dev-runtime/MessagesPublishValidation.test.mjs` | PASS, 10/10 tests |
| `rg -n "imageDataUrl" ...target files...` | PASS, no matches |
| `rg -n --pcre2 "<style|style=| on[a-z]+\\s*=|<script(?![^>]*\\bsrc=)" toolbox/text-to-speech/index.html toolbox/messages/index.html` | PASS, no matches |
| `npx playwright test tests/playwright/tools/TextToSpeechFunctional.spec.mjs tests/playwright/tools/MessagesTool.spec.mjs --project=playwright` | FAIL/BLOCKED, stale Messages spec import to `../../../toolbox/text-to-speech/tts-profile-store.js` |
| `npx playwright test tests/playwright/tools/TextToSpeechFunctional.spec.mjs --project=playwright` | FAIL/BLOCKED, Chromium executable missing at `C:\Users\davidq\AppData\Local\ms-playwright\chromium-1217\chrome-win64\chrome.exe` |

### Existing Test Coverage

- `tests/tools/Text2SpeechShell.test.mjs` covers message model ownership, browser preview request shaping, provider adapter status, saved profile store export to Messages, default profile names, emotion labels, and default usage counters.
- `tests/tools/MessagesPlaybackSource.test.mjs` statically guards against old preview wording, global emotion fallbacks, Text To Speech UI module imports, and stale profile builders.
- `tests/dev-runtime/MessagesPublishValidation.test.mjs` covers publish-ready messages and broken/missing TTS reference validation.
- `tests/playwright/tools/TextToSpeechFunctional.spec.mjs` is intended to cover TTS page load, profile/emotion workflow, preview playback, toolbox registration, and browser speech unavailable state.
- `tests/playwright/tools/MessagesTool.spec.mjs` is intended to cover Messages CRUD, profile filtering, playback through saved TTS Profiles, reference/delete blocking, and creator-safe load failures, but currently imports a removed file path.

## Playwright Impacted Assessment

Impacted specs:

- `tests/playwright/tools/TextToSpeechFunctional.spec.mjs`
- `tests/playwright/tools/MessagesTool.spec.mjs`
- `tests/playwright/tools/EventsTool.spec.mjs` indirectly reads Messages API TTS/Emotion profile rows.

Current assessment:

- Playwright coverage exists and is relevant.
- The impacted Messages spec must be repaired before it can run because it imports `../../../toolbox/text-to-speech/tts-profile-store.js`; the active store is `assets/js/shared/tts-profile-store.js`.
- The local machine also needs the configured Chromium browser installed before browser-backed validation can execute.
- Once unblocked, the impacted Playwright lane should be rerun with Text To Speech and Messages together because the critical workflow crosses localStorage, Local API sync, profile selection, emotion filtering, and playback.

## Exact Remaining Implementation PR Recommendations

1. `PR_26177_BRAVO_002-messages-ddl-runtime-contract-alignment`
   - Update `docs_build/database/ddl/messages.sql` to match runtime service DDL.
   - Include `voiceProfileKey` columns, voice-profile indexes, `messages_event_actions`, and any needed migration/backfill notes.
   - Add a test comparing static Messages DDL inventory to `MESSAGES_SCHEMA_SQL` coverage.

2. `PR_26177_BRAVO_003-tts-profile-usage-reference-protection`
   - Add TTS Profile usage counts and reference lists to Local API responses.
   - Block deactivation of referenced TTS Profiles the same way Emotion Profile deactivation is blocked.
   - Surface used-by visibility in Text To Speech for profiles referenced by Messages/Sentences.

3. `PR_26177_BRAVO_004-profile-scoped-emotion-settings-contract`
   - Add an explicit DB/API model for TTS Profile to Emotion settings.
   - Store pitch/rate/volume per TTS Profile emotion instead of depending on browser-local profile JSON.
   - Keep Messages sentence emotion dropdowns sourced from the selected TTS Profile only.

4. `PR_26177_BRAVO_005-server-owned-tts-profile-source-of-truth`
   - Move active TTS Profiles out of browser-local storage as the production source of truth.
   - Keep any local storage use limited to explicit drafts/cache if approved.
   - Do not introduce silent defaults; default profiles should be seeded server-side and visible.

5. `PR_26177_BRAVO_006-playwright-tts-messages-lane-repair`
   - Fix `tests/playwright/tools/MessagesTool.spec.mjs` to import `TEXT_TO_SPEECH_PROFILE_STORAGE_KEY` from `assets/js/shared/tts-profile-store.js`.
   - Ensure Playwright Chromium is installed or provide a zero-browser gate for import/static checks.
   - Rerun `TextToSpeechFunctional.spec.mjs` and `MessagesTool.spec.mjs` together.

6. `PR_26177_BRAVO_007-creator-facing-tts-terminology`
   - Normalize user-visible API and validation wording from "Voice Profile" to "TTS Profile".
   - Normalize "Message Part" wording to "Sentence" where surfaced in creator-facing Messages UI/errors.

7. `PR_26177_BRAVO_008-publish-validation-profile-active-state`
   - Extend publish validation to reject inactive Emotion Profiles and inactive TTS Profiles already referenced by saved Messages/Sentences.
   - Add tests for deactivation-after-save publish blocking.

## Manual Validation Notes

- Manual browser validation was not completed because Playwright browser validation is blocked by missing Chromium.
- Source inspection confirmed both target HTML pages use external Theme V2 assets and no inline style/script handlers.
- Source inspection confirmed Text To Speech local preview blocks empty text and missing selected browser voice.
- Source inspection confirmed Messages playback uses the parent Message TTS Profile for sentence playback and does not call Text To Speech Local Preview.
- Source inspection confirmed no `imageDataUrl` usage in the audited target files.

## Known Issues

- `tests/playwright/tools/MessagesTool.spec.mjs` imports a removed store path: `../../../toolbox/text-to-speech/tts-profile-store.js`.
- Playwright Chromium is not installed at the configured local path, so browser specs cannot launch.
- Static Messages DDL is behind runtime service DDL for `voiceProfileKey` and event action tables.
- TTS Profile usage counts and references are missing from the Local API.
- TTS Profile deactivation is not server-blocked when referenced.
- Text To Speech delete blocking relies on profile/emotion usage counters embedded in browser-local profile JSON.
- Local API still exposes "Voice profile" terminology in user-visible messages.
- Production TTS Profile source of truth is not yet server-owned.

## Output Files

- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/PR_26177_BRAVO_001-audit-text-to-speech-profiles-emotions.md`
- `tmp/PR_26177_BRAVO_001-audit-text-to-speech-profiles-emotions_delta.zip`
