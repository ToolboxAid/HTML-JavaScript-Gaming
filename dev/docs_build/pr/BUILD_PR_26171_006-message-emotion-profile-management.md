# BUILD PR_26171_006-message-emotion-profile-management

## Branch Name

`pr/PR_26171_006-message-emotion-profile-management`

## Purpose

Strengthen Messages Emotion Profile management by making profile usage visible and preventing accidental deactivation of profiles that are currently referenced by messages or message segments.

## Exact Scope

- Extend the Messages Local API emotion profile payloads with computed usage diagnostics:
  - `messageUsageCount`
  - `segmentUsageCount`
  - `usageCount`
  - `references`
- Count references from `messages_records.emotionProfileKey` and `messages_segments.emotionProfileKey`.
- Preserve add, edit, and Active/Inactive behavior for unreferenced emotion profiles.
- Block attempts to deactivate an emotion profile when it is referenced by any message or segment.
- Display usage counts in the Emotion Profiles table.
- Display visible actionable diagnostics when profile deactivation is blocked.
- Add targeted test coverage for profile usage counts and referenced-profile deactivation blocking.

## Out Of Scope

- Delete endpoints.
- Text To Speech profiles.
- Speech preview.
- Voice provider adapters.
- Runtime playback contracts.
- Audio generation or playback.
- Schema changes unless required for computed usage diagnostics.
- Changes to Messages, Categories, or Segments behavior beyond profile reference diagnostics.

## Files Likely Affected

- `src/dev-runtime/messages/messages-sqlite-service.mjs`
- `toolbox/messages/messages.js`
- `toolbox/messages/index.html`
- `tests/playwright/tools/MessagesTool.spec.mjs`
- `docs_build/dev/reports/*`

## API/DB Rules

- Browser must keep using the Messages Local API.
- Browser must not read or write SQLite directly.
- No delete endpoint may be introduced.
- Usage diagnostics are computed from existing Messages SQLite tables.
- No browser-owned product data or local storage source of truth.
- Server/API retains authoritative key and audit ownership.

## Theme V2 Rules

- Use existing Theme V2 classes only.
- Do not add page-local CSS, tool-local CSS, inline styles, `<style>` blocks, inline scripts, or inline event handlers.
- Keep event wiring in external JavaScript.

## Validation

- Verify branch starts from clean `main`.
- Run `node --check` on touched JavaScript files.
- Run targeted Messages Local API validation for usage counts and deactivate blocking.
- Run `npx playwright test tests/playwright/tools/MessagesTool.spec.mjs --project=playwright --workers=1 --reporter=list`.
- Run `npm run test:workspace-v2`.
- Run `git diff --check`.

## Manual Test Notes

- Create a message using an active emotion profile.
- Confirm the profile row shows a nonzero usage count.
- Attempt to disable the referenced profile.
- Confirm the save is blocked with a visible actionable message.
- Confirm an unreferenced profile can still be disabled.

## Required Reports

- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/PR_26171_006-message-emotion-profile-management.md`
- `docs_build/dev/reports/PR_26171_006-message-emotion-profile-management-validation.txt`
- `docs_build/dev/reports/PR_26171_006-message-emotion-profile-management-manual-validation.md`
- `tmp/PR_26171_006-message-emotion-profile-management_delta.zip`
