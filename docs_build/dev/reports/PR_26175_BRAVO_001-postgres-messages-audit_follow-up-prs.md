# PR_26175_BRAVO_001-postgres-messages-audit Follow-Up PRs

## Recommended Follow-Ups
| Priority | Follow-Up PR | Purpose | Scope Guard |
| --- | --- | --- | --- |
| 1 | BRAVO - Messages schema artifact alignment | Update `docs_build/database/ddl/messages.sql` and `docs_build/database/seed/messages.json` to match runtime `voiceProfileKey`, `messages_event_actions`, and current seed names. | Docs/database artifacts only unless a separate migration-runner PR is approved. |
| 2 | BRAVO - Message where-used event-action references | Include `messages_event_actions` in Message Studio usage counts, Reference Usage, and service delete preflight. | Reference diagnostics and friendly delete guard only; no schema change. |
| 3 | BRAVO - Postgres Emotion Profiles management UI | Add a server-backed Emotion Profiles management surface with list/create/edit/archive, usage counts, and where-used rendering. | Use existing `/messages/emotion-profiles` API; do not add delete until policy is approved. |
| 4 | BRAVO - TTS profile Postgres lifecycle policy | Decide whether `messages_tts_profiles` should be managed directly in Postgres, synced from TTS local profile store, or both. Add archive/reference behavior accordingly. | Policy and minimal vertical slice only. |
| 5 | BRAVO - Event Action lifecycle controls | Add archive/delete behavior or an explicit no-delete policy for Message Event Actions. | Events tool and service contract only; preserve publish validation. |
| 6 | BRAVO - Messages Playwright validation recovery | Fix stale `MessagesTool.spec.mjs` import from `toolbox/text-to-speech/tts-profile-store.js` to the active shared store path and re-run Messages/TTS/Events UI specs in an environment with a browser executable. | Test-only change. |
| 7 | BRAVO - Versioned Messages migration ownership | Add a migration-runner-owned Messages migration path if runtime inline schema initialization is no longer acceptable. | Migration framework and docs only; no UI changes. |

## Acceptance Notes For Follow-Ups
- Keep each PR single-purpose.
- Preserve Postgres as the authoritative Messages persistence target.
- Do not reintroduce SQLite runtime persistence.
- Keep browser pages on API/client contracts for authoritative records.
- Add targeted tests for each lifecycle or reference-protection behavior introduced.
