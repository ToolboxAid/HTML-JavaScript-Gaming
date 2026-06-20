# PR_26171_065 Message Studio Parent Child Table Foundation

## Summary

Message Studio now presents a parent Messages table with an expandable child Message Parts table. The active tool remains `toolbox/messages/`, uses Theme V2, and keeps all JavaScript external.

## Scope

- Updated `toolbox/messages/index.html` to expose the requested parent and child table columns.
- Updated `toolbox/messages/messages.js` to render Messages and Message Parts, support inline add/edit rows, and provide row-level Play Message and Play Part actions.
- Updated `toolbox/messages/message-tts-service-registry.js` so the default balanced playback option can use the first available browser voice through `TextToSpeechEngine`.
- Updated targeted Message Studio Playwright validation.

## Requirement Evidence

- PASS: Active path remains `toolbox/messages/`.
- PASS: Parent table is Messages.
- PASS: Child accordion/subtable is Message Parts.
- PASS: Parent Message Name cell owns the visible expand/collapse cue.
- PASS: One parent expands at a time through existing selected message state.
- PASS: Parent columns are Message Name, Type, Status, Parts, Default TTS Profile, Actions.
- PASS: Child columns are Order, Text, Emotion, TTS Profile, Status, Actions.
- PASS: Empty state references the requested example `Bat Encounter` without creating browser-owned product data.
- PASS: Add Message opens an inline add row under the parent table.
- PASS: Edit Message opens an inline edit row.
- PASS: Add Part opens an inline add row in the child table.
- PASS: Edit Part opens an inline edit row.
- PASS: Play Part exists and uses the existing audio engine when available.
- PASS: Play Message exists and queues active parts in order when the audio engine is available.
- PASS: Audio engine unavailable state shows a visible actionable error.
- PASS: TTS profile selection offers existing profiles and a default balanced option if profiles are unavailable.
- PASS: TTS profile authoring is not owned by Message Studio in this PR.
- PASS: No database schema or seed changes were made.
- PASS: No browser-owned product data was introduced as source of truth.
- PASS: Theme V2 only; no page-local CSS, tool-local CSS, inline styles, style blocks, or inline handlers.

## Validation

- PASS: `node --check toolbox\messages\messages.js`.
- PASS: `node --check toolbox\messages\message-tts-service-registry.js`.
- PASS: `node --check tests\playwright\tools\MessagesTool.spec.mjs`.
- PASS: HTML inline style/script/event scan for `toolbox/messages/index.html`.
- PASS: `npx playwright test tests/playwright/tools/MessagesTool.spec.mjs --project=playwright --workers=1 --reporter=list`.
- PASS: `npm run test:workspace-v2` (legacy command name; user-facing language is Project Workspace).

## Out Of Scope

- No TTS Studio implementation.
- No future provider behavior.
- No generated audio export.
- No new database persistence.
