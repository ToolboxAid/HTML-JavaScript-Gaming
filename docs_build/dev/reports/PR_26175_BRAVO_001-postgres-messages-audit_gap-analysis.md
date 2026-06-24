# PR_26175_BRAVO_001-postgres-messages-audit Gap Analysis

## Implemented
| Capability | Evidence |
| --- | --- |
| Message Studio table-first screen | `toolbox/messages/index.html` exposes Messages, Reference Usage, Publish Validation, Speech Preview, and Persistence panels. |
| Message create/edit/delete/archive | `toolbox/messages/messages.js` calls `createMessage`, `updateMessage`, `deleteMessage`, and archive/restore through `active` updates. |
| Message Part create/edit/delete/archive | `toolbox/messages/messages.js` calls segment create/update/delete and toggles segment `active`. |
| Messages API client | `toolbox/messages/messages-api-client.js` exposes Messages, segments, emotion profiles, TTS profiles, and publish validation endpoints. |
| Runtime Postgres service | `src/dev-runtime/messages/messages-postgres-service.mjs` imports `createPostgresConnectionClient` and reports `engine: "Postgres"`, `owner: "messages"`, `storage: "server-owned"`. |
| Runtime Postgres tables | Runtime service creates categories, emotion profiles, TTS profiles, messages, segments, and event actions tables. |
| Publish validation | Server validation checks Messages, Message Parts, Emotion Profiles, Voice Profiles, provider readiness, and Event Action message references. |
| TTS profile/emotion browser management | `assets/toolbox/text-to-speech/js/index.js` supports add/edit/delete for profiles and emotions and writes through `assets/js/shared/tts-profile-store.js`. |
| Messages integration with TTS profiles | Message Studio reads saved TTS profiles, maps active emotion settings, and creates missing API TTS/emotion profile records. |
| Message delete guard for child message parts | UI disables Delete for referenced messages; service returns 409 when a message has Message Parts. |

## Partially Implemented
| Capability | Gap | Impact |
| --- | --- | --- |
| Emotion Profile Management persistence | TTS tool persists profile/emotion authoring in browser localStorage first; Postgres records are created or updated only through Messages API sync. | A user can manage emotions for TTS locally, but there is no direct Postgres Emotion Profile management screen. |
| Emotion Profile CRUD in Messages API | List/get/create/update exist; delete does not. Deactivation is possible through update, with a referenced-profile guard, but no UI exposes it. | Reference-protected archive/deactivate behavior exists server-side only. |
| Message where-used | Message Studio usage counts and where-used list only include Message Parts. | Message Event Actions that reference a Message are invisible in the Message Studio Reference Usage panel. |
| Message delete protection | Service delete guard checks Message Parts but not `messages_event_actions`. | Actual Postgres FK constraints should block direct DB deletion, but the API does not give a friendly preflight error for event-action references. |
| Event Actions lifecycle | Events UI supports create/edit validation, but no delete/archive action. | Event Action records can accumulate without an author-facing lifecycle control. |
| Docs DDL artifact | `docs_build/database/ddl/messages.sql` lacks runtime `voiceProfileKey` columns and `messages_event_actions`. | Database docs are not a complete source of truth for current runtime schema. |
| Seed inventory | `docs_build/database/seed/messages.json` lists older TTS profile seed names that differ from runtime/test seeds. | Seed docs can mislead follow-up migrations or audits. |
| Browser validation lane | Relevant Playwright specs exist, but local validation was blocked by missing browser executables. The Messages spec also has a stale import. | UI behavior is covered in source/test intent but could not be fully revalidated in this environment. |

## Missing
| Capability | Evidence |
| --- | --- |
| Standalone Postgres Emotion Profiles UI | Message Studio explicitly does not render Emotion Profiles tables, and TTS profile/emotion UI is browser-local. |
| `deleteEmotionProfile` API/service/client route | No delete client, service method, or route was found for `messages_emotion_profiles`. |
| `deleteTtsProfile` API/service/client route | No delete client, service method, or route was found for `messages_tts_profiles`. |
| Versioned Messages migration runner | No `migrations` directory or migration runner path was found for Messages. Runtime schema is initialized inline. |
| Event Action where-used in Message Studio | Message usage and where-used read only `messages_segments`; `messages_event_actions` is not included. |
| Event Action delete/archive UI | Events controller exposes create/edit only. |

## Not Applicable
| Item | Reason |
| --- | --- |
| Active Messages SQLite runtime | Messages active runtime has been cut over to Postgres; remaining Messages SQLite references are historical docs only. |
| Browser-owned authoritative database writes | Browser pages call API/client contracts or localStorage for TTS profile sharing; authoritative Messages records are server-owned. |
