# PR_26171_002-messages-tool-foundation

## Summary

Created the foundational Messages tool for game dialog, narration, quest text, tutorials, notifications, and future Text To Speech integration.

This PR adds:
- Theme V2 Messages tool UI.
- Server-owned Local API contracts under `/api/messages/*`.
- Server-side SQLite persistence for Messages.
- Server/API-generated ULID keys and audit fields.
- Seeded categories and emotion profiles.
- Toolbox registry entry under the Design Game Journey bucket.
- Targeted Playwright and Local API persistence validation.

## Branch Validation

PASS - Current branch is `main`.

Evidence:
- `git branch --show-current` -> `main`
- `git rev-list --left-right --count main...origin/main` -> `0 0`

## Requirement Checklist

PASS - Tool Name: Messages.

Evidence:
- Added `toolbox/messages/index.html`.
- Page title and H1 are `Messages`.

PASS - Tool purpose implemented.

Evidence:
- UI supports creating, organizing, and managing game text and speech-content configuration records.

PASS - Message record supports required fields.

Evidence:
- `messages_records` stores Message Name, Category, Emotion Profile, Message Text, Notes, and Active/Inactive.
- Browser editor exposes all required fields.

PASS - Category management implemented.

Evidence:
- Seed categories: Dialog, Narration, Quest, Tutorial, Combat, System, Achievement, Notification.
- UI and API support add, rename, and disable.
- No delete endpoint exists.

PASS - Emotion Profile management implemented.

Evidence:
- Seed profiles: Calm, Urgent, Whisper, Angry, Excited, Sad, Mysterious.
- UI and API support add, edit, and disable.
- No delete endpoint exists.

PASS - Emotion Profile fields implemented.

Evidence:
- Name, Description, Volume, Pitch, Rate, PauseBeforeMs, PauseAfterMs, and Active/Inactive exist in SQLite schema, API payloads, and UI form.
- These fields are configuration only.

PASS - Message Editor implemented.

Evidence:
- Name, Category, Emotion Profile, Message Text, and Notes are editable.
- Message Text is a multiline `<textarea>`.
- Service stores `messageText` exactly as received.
- No parsing, conversion, markup, or tags were added.

PASS - Future segmented message support is not blocked.

Evidence:
- Messages store one exact text field now.
- Category and Emotion Profile are normalized references.
- No parser or markup format was introduced.

PASS - Database ownership area created.

Evidence:
- Added `docs_build/database/ddl/messages.sql`.
- Added `docs_build/database/dml/messages.sql`.
- Added `docs_build/database/seed/messages.json`.
- Added Messages to `docs_build/database/dml/DML_INDEX.md`.

PASS - Platform audit fields implemented.

Evidence:
- SQLite records include `key`, `createdAt`, `updatedAt`, `createdBy`, and `updatedBy`.
- API probe validated message key, createdBy, and updatedBy are ULID-style values.

PASS - Browser does not generate authoritative keys.

Evidence:
- Browser payloads do not include keys.
- `MessagesSqliteService` generates record keys server-side.

PASS - Local API contracts implemented.

Evidence:
- Messages: List, Get, Create, Update.
- Emotion Profiles: List, Get, Create, Update.
- Categories: List, Create, Update.
- No delete routes were added.

PASS - Theme V2 compliance.

Evidence:
- Messages page uses existing Theme V2 classes.
- No tool-local CSS or page-local CSS added.
- No inline styles, `<style>` blocks, inline event handlers, or inline script blocks.

PASS - Save validation implemented.

Evidence:
- Browser validation blocks save when Message Name, Category, Emotion Profile, or Message Text is missing.
- Validation errors render visibly in `data-messages-validation-errors`.

PASS - Out-of-scope features not implemented.

Evidence:
- No Text To Speech, audio playback, voice selection, AI voices, speech preview, dialog trees, quest integration, event integration, localization, or translation behavior added.

PASS - Platform rules followed.

Evidence:
- Current branch is `main`.
- Browser uses Local API only.
- SQLite persistence is server-side.
- No browser-owned product data or local storage source of truth.
- No mock database behavior added.
- Failures show visible messages.

## Validation Lane

Impacted lane:
- Local API + SQLite persistence + Theme V2 Messages UI.

Commands and results:
- `node --check` for touched JavaScript files: PASS.
- HTML inline-style/script guard: PASS.
- Direct Local API / SQLite probe: PASS.
- Toolbox registry validation: PASS.
- `npx playwright test tests/playwright/tools/MessagesTool.spec.mjs --project=playwright --workers=1 --reporter=list`: PASS, 1 passed.
- `git diff --check -- <PR_26171_002 changed files>`: PASS.

Skipped lanes:
- Full samples validation skipped because no sample JSON or sample runtime behavior changed.
- Full suite skipped because targeted Messages/API/UI validation covered this PR's behavior.

## Playwright Result

PASS - `tests/playwright/tools/MessagesTool.spec.mjs`

Covered:
- Messages page loads.
- Seed Categories load.
- Seed Emotion Profiles load.
- Category add, rename, disable.
- Emotion Profile add, edit, disable.
- Validation displays correctly.
- Create Message works.
- Update Message works.
- Local API persistence works.
- SQLite persistence works after server restart.
- Theme V2 rendering remains functional.

## Manual Validation Notes

See:
- `docs_build/dev/reports/PR_26171_002-messages-manual-validation.md`

## Artifact

Required ZIP:
- `tmp/PR_26171_002-messages-tool-foundation_delta.zip`

## Worktree Note

`docs_build/dev/PROJECT_MULTI_PC.txt` is an unrelated untracked file present before this PR work. It was not modified and is excluded from this PR's artifacts.
