# BUILD PR_26171_002-messages-tool-foundation

## Purpose

Create the foundational Messages tool for game dialog, narration, quest text, tutorials, notifications, and future Text To Speech integration.

## Scope

- Add a Theme V2 `Messages` first-class Toolbox tool.
- Add server-owned Local API contracts for messages, emotion profiles, and categories.
- Add server-side SQLite persistence for Messages only.
- Add grouped Messages database ownership documentation.
- Seed default message categories and emotion profiles through the server-side persistence layer.
- Register Messages in the Toolbox metadata under the Design Game Journey bucket.
- Validate create, update, required-field errors, Local API persistence, SQLite persistence, and Theme V2 rendering.

## Out Of Scope

- Text To Speech.
- Audio playback.
- Voice selection.
- AI voices.
- Speech preview.
- Dialog trees.
- Quest integration.
- Event integration.
- Localization.
- Translation.
- Browser-owned product data.
- Local storage source of truth.
- Mock database behavior.

## Validation

- Verify current branch is `main`.
- Run `node --check` on touched JavaScript files.
- Run targeted Local API and SQLite persistence validation.
- Run targeted Playwright validation for the Messages tool.
- Run `git diff --check`.

## Required Reports

- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/PR_26171_002-messages-tool-foundation.md`
- `docs_build/dev/reports/PR_26171_002-messages-validation.txt`
- `tmp/PR_26171_002-messages-tool-foundation_delta.zip`
