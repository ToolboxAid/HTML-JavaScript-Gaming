# BUILD PR_26171_008-message-tts-profile-foundation

## Branch Name

`pr/PR_26171_008-message-tts-profile-foundation`

## Purpose

Add server-owned Text To Speech profile configuration for Messages so future speech preview and playback can choose reusable speech settings without generating audio yet.

## Exact Scope

- Add `messages_tts_profiles` persistence under the grouped `messages` ownership area.
- Add Local API contracts for TTS Profiles:
  - list
  - get
  - create
  - update
- Add server-seeded default TTS profiles:
  - Browser Speech Default
  - Narration Preview
- TTS profile fields:
  - Name
  - Description
  - Provider Key
  - Voice Name
  - Language
  - Volume
  - Pitch
  - Rate
  - Active / Inactive
- Add a Theme V2 TTS Profiles management section to the existing Messages tool.
- TTS profiles are configuration records only in this PR.

## Out Of Scope

- Speech preview.
- Speech synthesis.
- Audio playback.
- Audio file generation.
- Voice provider adapters beyond storing a provider key string.
- Runtime message playback.
- Dialog trees, localization, translation, or AI voices.
- Delete endpoints.

## Files Likely Affected

- `src/dev-runtime/messages/messages-sqlite-service.mjs`
- `toolbox/messages/messages-api-client.js`
- `toolbox/messages/messages.js`
- `toolbox/messages/index.html`
- `docs_build/database/ddl/messages.sql`
- `docs_build/database/dml/messages.sql`
- `docs_build/database/seed/messages.json`
- `tests/playwright/tools/MessagesTool.spec.mjs`
- `docs_build/dev/reports/*`

## API/DB Rules

- Browser must use Local API contracts only.
- Browser must not generate authoritative keys.
- SQLite service must generate keys and audit fields.
- No delete endpoints.
- TTS profiles must live under the `messages` ownership group.
- Missing required fields must fail visibly and actionably.

## Theme V2 Rules

- Use existing Theme V2 form, table, card, status, and action classes.
- Do not add new CSS unless documented as a reusable Theme V2 gap.
- No inline styles, `<style>` blocks, inline scripts, or inline event handlers.

## Validation

- Verify branch starts from clean `main`.
- Run `node --check` on touched JavaScript files.
- Run targeted Local API/SQLite validation for TTS profile seed, create, update, and restart persistence.
- Run targeted Messages Playwright validation.
- Run `npm run test:workspace-v2`.
- Run `git diff --check`.

## Manual Test Notes

- Confirm seeded TTS profiles appear in the Messages UI.
- Create a custom TTS profile.
- Edit its voice/configuration fields.
- Disable and re-enable the profile.
- Restart Local API against the same SQLite file and confirm persistence.
- Confirm no speech preview or audio playback occurs in this PR.

## Required Reports

- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/PR_26171_008-message-tts-profile-foundation.md`
- `docs_build/dev/reports/PR_26171_008-message-tts-profile-foundation-validation.txt`
- `docs_build/dev/reports/PR_26171_008-message-tts-profile-foundation-manual-validation.md`
- `tmp/PR_26171_008-message-tts-profile-foundation_delta.zip`
