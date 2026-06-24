# PR_26175_BRAVO_001-postgres-messages-audit Report

## Executive Summary
This was an audit-only verification pass. No runtime code, schema, API, or UI changes were made.

| Area | Status | Finding |
| --- | --- | --- |
| Messages Creator Tool | Implemented | Message Studio supports message and message part create, edit, delete, archive/restore, API loading/saving, publish validation, and Postgres-backed service persistence. |
| Emotion Profile Management | Partially Implemented | Emotion profile CRUD exists in two places: TTS browser profile/emotion management is localStorage-backed, while the Messages API persists emotion profiles to Postgres with list/get/create/update only. A standalone Postgres emotion profile UI and delete flow are missing. |
| PostgreSQL Audit | Partially Implemented | Runtime Messages persistence is Postgres-backed. The docs DDL/seed artifacts exist, but they are stale versus the runtime service for voice profile references, event actions, and seed names. No migration-runner path was found. |
| Reference Protection Rules | Partially Implemented | Message part usage counts, where-used, and referenced-message delete prevention are implemented. Emotion profile usage exists server-side. Event Action references are validated for publish readiness but are not included in Message Studio where-used/delete protection. |

## Messages Creator Tool
| Requirement | Status | Evidence |
| --- | --- | --- |
| Locate all Messages UI screens | Implemented | Primary screen is `toolbox/messages/index.html`. Related integration screens are `toolbox/events/index.html` for Message Event Actions and `toolbox/text-to-speech/index.html` for TTS profile/emotion authoring used by Messages. |
| Create/Edit/Delete messages | Implemented | `toolbox/messages/messages.js` wires Add/Edit/Save/Delete/Archive actions and calls `createMessage`, `updateMessage`, and `deleteMessage` from `toolbox/messages/messages-api-client.js`. |
| Create/Edit/Delete message parts | Implemented | Message Parts are rendered as child rows with Add/Edit/Delete/Archive actions in `toolbox/messages/messages.js`; API calls target `/messages/segments`. |
| PostgreSQL persistence | Implemented | `src/dev-runtime/messages/messages-postgres-service.mjs` creates the Postgres service, reports `engine: "Postgres"`, and serves Messages data through `handleMessagesApiContract`. |
| API integration | Implemented | `toolbox/messages/messages-api-client.js` exposes `/messages/messages`, `/messages/segments`, `/messages/emotion-profiles`, `/messages/tts-profiles`, and `/messages/publish-validation` client calls. |
| Validation behavior | Implemented | Browser validation blocks missing Message, TTS Profile, Sentence text, Emotion, and invalid order. Server publish validation checks message, segment, emotion, voice, provider, and event-action references. |
| UI test evidence | Partially Implemented | Node tests passed. The existing Messages Playwright spec did not run because it imports `../../../toolbox/text-to-speech/tts-profile-store.js`, while the actual shared store lives at `assets/js/shared/tts-profile-store.js`. |

## Emotion Profile Management
| Requirement | Status | Evidence |
| --- | --- | --- |
| Locate functionality | Implemented | TTS profile/emotion authoring lives in `assets/toolbox/text-to-speech/js/index.js`; Messages API emotion profile integration lives in `toolbox/messages/messages.js` and `src/dev-runtime/messages/messages-postgres-service.mjs`. |
| Create/Edit/Delete in TTS tool | Implemented | TTS tool supports Add/Edit/Delete Profile and Add/Edit/Delete Emotion, with validation and usage-protection checks. Persistence is browser localStorage through `assets/js/shared/tts-profile-store.js`. |
| Create/Edit/Delete in Postgres Messages API | Partially Implemented | `listEmotionProfiles`, `getEmotionProfile`, `createEmotionProfile`, and `updateEmotionProfile` are implemented. No `deleteEmotionProfile` client, service method, or route was found. |
| PostgreSQL persistence | Partially Implemented | API-created emotion profiles persist to `messages_emotion_profiles`. TTS tool-authored profile/emotion records persist first to browser localStorage and are synced into Messages API profile records when Message Studio loads. |
| Messages integration | Implemented | `activeTextToSpeechProfilesForMessages()` reads saved TTS profiles, maps active emotions, and calls `createTtsProfile`/`createEmotionProfile` when API records are missing. |
| Reference diagnostics | Partially Implemented | Server-side `emotionProfileUsage()` returns message/segment usage counts and references. No standalone Emotion Profiles UI was found that renders these references or exposes deactivation/archive controls. |

## PostgreSQL Audit
| Requirement | Status | Evidence |
| --- | --- | --- |
| Search repository for SQLite usage | Implemented | Active Messages/TTS source has no `messages-sqlite-service`, `createMessagesSqliteService`, `GAMEFOUNDRY_MESSAGES_SQLITE_PATH`, `node:sqlite`, or `DatabaseSync` match. Remaining active `src` SQLite text is unrelated Game Journey legacy data-preservation logic. Historical BUILD/report docs still mention prior Messages SQLite work. |
| Search PostgreSQL usage related to Messages/TTS | Implemented | `src/dev-runtime/messages/messages-postgres-service.mjs` imports `createPostgresConnectionClient`, uses Postgres tables, and is instantiated by `src/dev-runtime/server/local-api-router.mjs`. Tests inject `createMessagesPostgresClientStub()`. |
| Identify migrations | Missing | No repo migration directory for Messages was found. Runtime schema initialization is inline in `MESSAGES_POSTGRES_SCHEMA_SQL`; docs DDL exists under `docs_build/database/ddl/messages.sql`. |
| Identify DDL | Partially Implemented | `docs_build/database/ddl/messages.sql` exists but lacks runtime `voiceProfileKey` fields and `messages_event_actions`, both present in the runtime service. |
| Identify DML/seed data | Partially Implemented | `docs_build/database/dml/messages.sql` intentionally has no INSERT statements. `docs_build/database/seed/messages.json` exists, but seed names differ from runtime seeds: docs list `Browser Speech Default` and `Narration Preview`, while runtime/tests use `Default Balanced Profile`, `Man Profile 1`, and `Woman Profile 2`. |
| Identify schema dependencies | Implemented | Runtime schema depends on `users`, `messages_categories`, `messages_emotion_profiles`, `messages_tts_profiles`, `messages_records`, `messages_segments`, and `messages_event_actions`. |

## Reference Protection Rules
| Rule | Status | Evidence |
| --- | --- | --- |
| Usage counts | Partially Implemented | Message Studio counts message references from message parts only. Server emotion profiles count message and segment references. Event Action references are not included in Message Studio usage counts. |
| Where Used | Partially Implemented | Message Studio Reference Usage lists child sentence references. Emotion profile references exist in the API response but no UI renders them. Event Action where-used for Messages is missing. |
| Prevent delete when referenced | Partially Implemented | Message delete is disabled in the UI and blocked by the service when a message has child message parts. Event Action references are not checked by the service delete guard before message delete. Postgres FK constraints should protect direct database deletes, but the API does not provide a friendly preflight for that reference type. |
| Archive behavior | Partially Implemented | Messages and message parts support archive/restore by toggling `active`. Emotion profiles can be deactivated through API update, and the service blocks deactivation when referenced, but no UI exposes this workflow. Event actions store `active` but the Events UI exposes edit only. |

## Validation Results
| Command | Result |
| --- | --- |
| `node tests/dev-runtime/MessagesPublishValidation.test.mjs` | PASS - 2 tests passed. |
| `node --test-name-pattern "Messages Local API seeds" tests/dev-runtime/DbSeedIntegrity.test.mjs` | PASS - 1 targeted test passed. |
| `node tests/tools/MessagesPlaybackSource.test.mjs` | PASS - 4 tests passed. |
| `node tests/tools/Text2SpeechShell.test.mjs` | PASS - 4 tests passed. |
| `npx playwright test tests/playwright/tools/MessagesTool.spec.mjs tests/playwright/tools/TextToSpeechFunctional.spec.mjs tests/playwright/tools/EventsTool.spec.mjs --workers=1` | FAIL/BLOCKED - Messages spec failed before launch because `tests/playwright/tools/MessagesTool.spec.mjs` imports missing `toolbox/text-to-speech/tts-profile-store.js`. |
| `npx playwright test tests/playwright/tools/TextToSpeechFunctional.spec.mjs tests/playwright/tools/EventsTool.spec.mjs --config=codex_playwright_system_chrome.config.cjs --workers=1` | FAIL/BLOCKED - System Chrome executable was not found at `C:\Program Files (x86)\Google\Chrome\Application\chrome.exe`. |

## Audit Conclusion
The Messages platform is operationally implemented for authored Messages and Message Parts with Postgres-backed Local API persistence and publish validation. Emotion Profile Management is split between browser-local TTS authoring and Postgres-backed Messages API records, which leaves a management and reference-protection gap. The largest persistence gap is not runtime Postgres support; it is drift between runtime schema/seed behavior and docs database artifacts.
