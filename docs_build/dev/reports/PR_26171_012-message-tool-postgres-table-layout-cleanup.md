# PR_26171_012-message-tool-postgres-table-layout-cleanup

## Branch Validation

- Current branch before implementation: `main`
- Required PR branch: `pr/26171-012-message-tool-postgres-table-layout-cleanup`
- Branch source: pulled latest `origin/main` before branch creation
- Clean repo before branch creation: PASS

## Summary

Message Studio now reflects the approved Postgres direction and creator-facing row workflow. The tool no longer exposes category management or category selection in the UI, Emotion Profiles and TTS Profiles are in the center work surface, and the message editor is organized around a Message Rows table with Add/Update/Disable row language.

## Requirement Checklist

| Requirement | Result | Evidence |
| --- | --- | --- |
| Update repo guidance to state SQLite is deprecated. | PASS | Added `POSTGRES DATABASE DIRECTION` to `docs_build/dev/PROJECT_INSTRUCTIONS.md`. |
| New database work must target Postgres / Local API direction. | PASS | Guidance now requires new persistence through Local API / Postgres direction only. |
| Do not add new SQLite services, DDL, seed, or runtime persistence. | PASS | No SQLite service, DDL, seed, or persistence file was added. Existing legacy SQLite service remains unchanged as technical debt. |
| Remove Category/category UI from the left column. | PASS | `toolbox/messages/index.html` no longer contains visible category controls or category tables. |
| Do not introduce category replacement. | PASS | No new classification form was introduced; left column documents Tags as the future direction only. |
| Move Emotion Profiles into center column. | PASS | Emotion Profiles form/table now render in the center work surface. |
| Move TTS Profiles into center column. | PASS | TTS Profiles form/table now render in the center work surface. |
| Keep Speech Preview display-only. | PASS | Speech Preview remains in the inspector and no provider/audio generation behavior was added. |
| Change Message Editor to table-driven workflow. | PASS | Message Rows table now appears before row detail editing. |
| Add new row/action at bottom of table. | PASS | Message Rows table includes `Add Message Row` below the table. |
| Avoid Save Message / New Message language. | PASS | Visible tool copy now uses `Add Message Row`, `Update Row`, and `Disable Row`. |
| Preferred visible label is Message Studio. | PASS | Page title/H1 and source-controlled Toolbox metadata now use `Message Studio`. |
| Do not rename routes/folders. | PASS | Existing `messages` route/folder/id remain unchanged. |

## Root Cause / Notes

The tool was still presenting the earlier Messages foundation UI: category management in the left rail, Emotion/TTS profile management outside the primary work surface, and form-first `Save Message` / `New Message` actions. The server-backed toolbox registry also retained the old `Messages` label because `messages` was not included in the source-controlled metadata sync allowlist.

This PR keeps the current legacy category key only as an internal compatibility value required by the existing API contract. The category UI is removed from the creator surface and the Postgres migration direction is documented.

## Impacted Lane

- Tool/UI lane: Message Studio Theme V2 surface
- Server metadata lane: Toolbox registry source-controlled metadata sync
- Documentation/governance lane: database direction guidance

## Skipped Lanes

- Samples: skipped, no sample runtime or sample JSON changed.
- Provider/audio generation: skipped, explicitly out of scope.
- Full samples smoke: skipped, out of scope.

## Playwright Result

- PASS: `npx playwright test tests/playwright/tools/MessagesTool.spec.mjs --project=playwright --workers=1 --reporter=list`
- WARN: `npm run test:workspace-v2` still fails on existing header ordering expectations where the UI renders `Game Journey` before `Game Hub`. The PR-caused Toolbox count expectation was updated from `13/42` to `14/43`.

## Manual Validation Notes

- Confirmed rendered `/tools/messages/index.html` title and H1 resolve to `Message Studio` after the server registry override.
- Confirmed visible category controls are absent from `toolbox/messages/index.html`.
- Confirmed no inline style blocks, inline scripts, or inline event handlers were added.
