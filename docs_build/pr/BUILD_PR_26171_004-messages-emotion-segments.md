# BUILD PR_26171_004-messages-emotion-segments

## Purpose

Add ordered emotion-aware Message Segments to the existing Messages tool foundation.

## Scope

- Add Message Segments persistence under the grouped `messages` ownership area.
- Add server-owned Local API contracts for list, get, create, and update message segments.
- Add Theme V2 segment editor UI for add, edit, reorder, save, reload, and disable using Active/Inactive.
- Keep segment persistence server/API-owned with SQLite-generated authoritative keys and audit fields.
- Validate segment text, emotion profile, and display order as required fields.

## Out Of Scope

- Delete behavior.
- Text To Speech.
- Audio playback.
- Voice selection.
- AI voices.
- Dialog trees.
- Localization.
- Browser-owned product data.
- Local storage source of truth.

## Validation

- Verify current branch is `main`.
- Run `node --check` on touched JavaScript files.
- Run targeted Local API and SQLite persistence validation for message segments.
- Run `npm run test:workspace-v2`.
- Run targeted Playwright validation for the Messages tool.
- Run `git diff --check`.

## Required Reports

- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/PR_26171_004-messages-emotion-segments.md`
- `docs_build/dev/reports/PR_26171_004-messages-emotion-segments-validation.txt`
- `docs_build/dev/reports/PR_26171_004-messages-emotion-segments-manual-validation.md`
- `tmp/PR_26171_004-messages-emotion-segments_delta.zip`
