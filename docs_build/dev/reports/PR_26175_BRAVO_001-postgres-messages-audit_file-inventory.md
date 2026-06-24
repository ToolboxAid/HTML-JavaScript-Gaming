# PR_26175_BRAVO_001-postgres-messages-audit File Inventory

## UI And Browser Integration
| File | Role | Audit Status |
| --- | --- | --- |
| `toolbox/messages/index.html` | Primary Message Studio screen with Messages table, Reference Usage, Speech Preview, Publish Validation, and Persistence panels. | Implemented |
| `toolbox/messages/messages.js` | Message Studio controller for message/message part CRUD, TTS profile/emotion sync, validation, playback, usage display, delete guards, and archive/restore. | Implemented with event-action reference gaps |
| `toolbox/messages/messages-api-client.js` | Safe API client for Messages categories, emotion profiles, TTS profiles, messages, segments, and publish validation. | Implemented except emotion/TTS profile delete clients |
| `toolbox/text-to-speech/index.html` | Text To Speech UI shell that hosts TTS Profiles and nested TTS Profile Emotions. | Implemented |
| `assets/toolbox/text-to-speech/js/index.js` | TTS profile and emotion browser controller with add/edit/delete, validation, speech preview, and usage protection based on stored usage counts. | Implemented with browser-local persistence |
| `assets/js/shared/tts-profile-store.js` | Shared localStorage-backed TTS profile store and Messages option mapper. | Implemented for browser-local profile sharing |
| `toolbox/events/index.html` | Events UI shell with Message Event Actions table. | Implemented for create/edit only |
| `assets/toolbox/events/js/index.js` | Events controller for create/edit validation of Message Event Actions that reference Messages. | Partially Implemented: no delete/archive UI |

## Server, API, And Persistence
| File | Role | Audit Status |
| --- | --- | --- |
| `src/dev-runtime/messages/messages-postgres-service.mjs` | Runtime Postgres Messages service, schema initializer, seed owner, API contract handler, publish validation, and CRUD service. | Implemented with docs-artifact drift |
| `src/dev-runtime/server/local-api-router.mjs` | Local API runtime that instantiates `createMessagesPostgresService()`. | Implemented |
| `docs_build/database/ddl/messages.sql` | Grouped Messages DDL artifact. | Partially Implemented: stale versus runtime `voiceProfileKey` and `messages_event_actions` |
| `docs_build/database/dml/messages.sql` | Server-seed-owned DML placeholder that intentionally avoids direct INSERTs. | Implemented as placeholder |
| `docs_build/database/seed/messages.json` | Messages seed inventory. | Partially Implemented: seed names are stale versus runtime/test seeds |

## Tests And Evidence
| File | Role | Audit Status |
| --- | --- | --- |
| `tests/dev-runtime/MessagesPublishValidation.test.mjs` | Validates publish-ready and invalid Messages/TTS/event-action configurations. | PASS |
| `tests/dev-runtime/DbSeedIntegrity.test.mjs` | Validates Messages Local API seeds through the Postgres service and response shape. | PASS targeted lane |
| `tests/tools/MessagesPlaybackSource.test.mjs` | Static Messages playback/source contract tests for TTS profile integration and runtime ownership. | PASS |
| `tests/tools/Text2SpeechShell.test.mjs` | TTS shell/unit contract tests including saved profile export for Messages. | PASS |
| `tests/playwright/tools/MessagesTool.spec.mjs` | Browser coverage for Message Studio table structure, validation, publish flow, delete guard, and TTS integration. | BLOCKED by stale import to missing `toolbox/text-to-speech/tts-profile-store.js` |
| `tests/playwright/tools/TextToSpeechFunctional.spec.mjs` | Browser coverage for TTS profile/emotion table flows and speech behavior. | BLOCKED by missing browser executable in local environment |
| `tests/playwright/tools/EventsTool.spec.mjs` | Browser coverage for Message Event Actions create/edit validation. | BLOCKED by missing browser executable in local environment |
| `tests/helpers/messagesPostgresClientStub.mjs` | In-memory Postgres client stub used by Messages runtime and Playwright tests. | Implemented |

## Historical And Governance References
| Path | Role | Audit Status |
| --- | --- | --- |
| `docs_build/pr/BUILD_PR_26171_002-messages-tool-foundation.md` | Historical Messages SQLite foundation BUILD. | Historical only |
| `docs_build/pr/BUILD_PR_26171_004-messages-emotion-segments.md` | Historical Message segments SQLite BUILD. | Historical only |
| `docs_build/pr/BUILD_PR_26171_006-message-emotion-profile-management.md` | Historical Emotion Profile SQLite BUILD. | Historical only |
| `docs_build/pr/BUILD_PR_26171_008-message-tts-profile-foundation.md` | Historical TTS profile SQLite BUILD. | Historical only |
| `docs_build/dev/reports/PR_26171_GAMMA_024-local-api-sqlite-reference-cleanup.md` | Prior cleanup report confirming Messages Local API SQLite references were removed. | Supporting evidence |
| `docs_build/dev/reports/PR_26171_GAMMA_025-final-sqlite-runtime-inventory.md` | Prior SQLite runtime inventory. | Supporting evidence |
