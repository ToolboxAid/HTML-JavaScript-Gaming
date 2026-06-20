# BUILD PR_26171_014-runtime-message-playback-foundation

## Branch Name

`pr/PR_26171_014-runtime-message-playback-foundation`

## Purpose

Add a read-only runtime playback payload contract for Messages so future games can request ordered message text and speech configuration without owning or duplicating Messages data.

## Exact Scope

- Add a read-only Local API contract for message playback payloads:
  - `GET /api/messages/playback/:messageKey`
- Playback payload includes:
  - message identity
  - active/inactive message status
  - ordered active segments
  - segment emotion profile settings
  - selected/default active TTS profile settings
  - diagnostics
- Payload must be read-only and must not mutate data.
- Missing message must return `404`.
- Inactive message must return visible/actionable diagnostics in payload.
- Messages with no active segments must fall back to full message text as one playback item with diagnostics.
- Add browser API client helper for the playback payload if needed by tests.
- Add targeted Local API and Playwright/API validation.

## Out Of Scope

- Game runtime integration.
- Actual audio playback.
- Speech preview UI changes beyond displaying payload diagnostics if needed.
- Voice provider network calls.
- Audio file persistence.
- Dialog trees, localization, or translation.
- New write endpoints.

## Files Likely Affected

- `src/dev-runtime/messages/messages-sqlite-service.mjs`
- `toolbox/messages/messages-api-client.js`
- `toolbox/messages/messages.js`
- `toolbox/messages/index.html`
- `tests/playwright/tools/MessagesTool.spec.mjs`
- `docs_build/dev/reports/*`

## API/DB Rules

- Contract is read-only.
- Browser and future runtime consumers must use API payloads, not direct DB reads.
- No mutation, no server-generated preview history, and no local storage.
- Playback payload must come from server-owned SQLite records.

## Theme V2 Rules

- If UI diagnostics are touched, use existing Theme V2 classes only.
- No page-local CSS, tool-local CSS, inline scripts, inline styles, `<style>` blocks, or inline event handlers.

## Validation

- Verify branch starts from clean `main`.
- Run `node --check` on touched JavaScript files.
- Run targeted Local API validation for playback payload ordering, fallback, inactive diagnostics, and missing message.
- Run targeted Messages Playwright validation if UI diagnostics change.
- Run `npm run test:workspace-v2`.
- Run `git diff --check`.

## Manual Test Notes

- Create a message with two active segments and confirm playback payload returns two ordered items.
- Disable one segment and confirm it is excluded.
- Use a message with no active segments and confirm fallback to full message text.
- Disable the message and confirm diagnostics.
- Request an unknown message and confirm `404`.

## Required Reports

- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/PR_26171_014-runtime-message-playback-foundation.md`
- `docs_build/dev/reports/PR_26171_014-runtime-message-playback-foundation-validation.txt`
- `docs_build/dev/reports/PR_26171_014-runtime-message-playback-foundation-manual-validation.md`
- `tmp/PR_26171_014-runtime-message-playback-foundation_delta.zip`
