# PR_26171_004-messages-emotion-segments

## Summary

Added ordered Message Segments to the existing Messages tool foundation.

This PR adds:
- Server-owned SQLite `messages_segments` persistence under the grouped `messages` ownership area.
- Local API contracts under `/api/messages/segments` for list, get, create, and update.
- Theme V2 segment editor UI for add, edit, reorder, save, reload, and Active/Inactive disable.
- Targeted Playwright coverage for segment validation, UI behavior, Local API persistence, and SQLite restart persistence.

No delete behavior, Text To Speech, audio playback, voice selection, AI voices, dialog trees, or localization behavior was added.

## Branch Validation

PASS - Current branch is `main`.

Evidence:
- `git branch --show-current` -> `main`
- `git rev-list --left-right --count main...origin/main` -> `0 0`

## Requirement Checklist

PASS - Added Message Segments persistence under grouped ownership area `messages`.

Evidence:
- `src/dev-runtime/messages/messages-sqlite-service.mjs` creates `messages_segments`.
- `docs_build/database/ddl/messages.sql` documents `messages_segments`.
- `docs_build/database/dml/messages.sql` and `docs_build/database/seed/messages.json` include `messages_segments`.

PASS - Added Local API contracts for list, get, create, and update message segments.

Evidence:
- `GET /api/messages/segments`
- `GET /api/messages/segments/:key`
- `POST /api/messages/segments`
- `POST /api/messages/segments/:key`

PASS - No delete behavior added.

Evidence:
- No segment delete service method exists.
- Playwright validated `DELETE /api/messages/segments/:key` returns `404`.

PASS - Theme V2 segment editor UI added.

Evidence:
- `toolbox/messages/index.html` includes Message Segments editor controls using existing Theme V2 classes.
- `toolbox/messages/messages.js` wires add, edit, reorder, save, reload, and Active/Inactive status actions externally.
- No page-local CSS, tool-local CSS, inline CSS, inline event handlers, or inline script blocks were added.

PASS - Segment validation implemented.

Evidence:
- UI blocks save when Segment Text is missing.
- UI blocks save when Emotion Profile is missing.
- UI blocks save when Display Order is missing.
- Direct Local API probe validates missing segment text, missing emotion profile, and missing display order return actionable `400` responses.

PASS - Local API persistence works.

Evidence:
- Direct probe created, updated, listed, and fetched a segment through `/api/messages/segments`.
- Playwright created, edited, reordered, disabled, and reloaded segments through the browser UI.

PASS - SQLite persistence works.

Evidence:
- Direct probe restarted the Local API against the same SQLite file and re-read the updated segment.
- Playwright restarted the Local API against the same SQLite file and re-read the disabled segment.

PASS - Browser does not generate authoritative keys.

Evidence:
- Segment create payloads do not include keys.
- `MessagesSqliteService` generates segment keys server-side with ULIDs.

PASS - Out-of-scope features were not implemented.

Evidence:
- No Text To Speech, audio playback, voice selection, AI voices, dialog trees, localization, translation, or delete endpoint behavior was added.

## Validation Lane

Impacted lane:
- Messages Local API + SQLite persistence + Theme V2 Messages UI.

Commands and results:
- `node --check src/dev-runtime/messages/messages-sqlite-service.mjs`: PASS
- `node --check toolbox/messages/messages-api-client.js`: PASS
- `node --check toolbox/messages/messages.js`: PASS
- `node --check tests/playwright/tools/MessagesTool.spec.mjs`: PASS
- `git diff --check -- <PR_26171_004 changed files>`: PASS
- HTML inline style/event scan for `toolbox/messages/index.html`: PASS
- Inline script guard for `toolbox/messages/index.html`: PASS
- Direct Local API / SQLite segment probe: PASS
- `npx playwright test tests/playwright/tools/MessagesTool.spec.mjs --project=playwright --workers=1 --reporter=list`: PASS, 1 passed

Requested legacy lane:
- `npm run test:workspace-v2`: FAIL
- Rerun with Local API runtime at `127.0.0.1:5501`: FAIL, 3 passed and 2 failed.

Workspace lane blocker details:
- `RootToolsFutureState.spec.mjs` expects `Tool Count: 13/42`; current runtime returns `Tool Count: 14/43`.
- `RootToolsFutureState.spec.mjs` expects alphabetical order `Game Hub` before `Game Journey`; current page renders `Game Journey` before `Game Hub`.

Assessment:
- These two remaining workspace-lane failures are outside the Messages segment scope.
- They were not fixed in this PR to preserve one-purpose scope.

Skipped lanes:
- Full samples validation skipped because no sample JSON or sample runtime behavior changed.
- Full suite skipped because the requested workspace lane and targeted Messages validation were run.

## Playwright Result

PASS - `tests/playwright/tools/MessagesTool.spec.mjs`

Covered:
- Messages page loads.
- Categories load.
- Emotion Profiles load.
- Segment required validation displays visibly.
- Create segment works.
- Edit segment works.
- Reorder segment works.
- Disable segment works with Active/Inactive.
- Reload segment works from Local API.
- Local API persistence works.
- SQLite persistence works after server restart.
- No segment delete endpoint exists.
- Theme V2 rendering remains functional.

FAIL - `npm run test:workspace-v2`

Covered by command:
- Legacy workspace-contract lane.

Failure scope:
- Out-of-scope Toolbox count and Game Hub/Game Journey ordering expectations.

## Manual Validation Notes

See:
- `docs_build/dev/reports/PR_26171_004-messages-emotion-segments-manual-validation.md`

## Validation Report

See:
- `docs_build/dev/reports/PR_26171_004-messages-emotion-segments-validation.txt`

## Artifact

Required ZIP:
- `tmp/PR_26171_004-messages-emotion-segments_delta.zip`

ZIP validation:
- PASS - Repo-structured ZIP created under `tmp/`.
- PASS - Python `zipfile.testzip()` returned no bad entries.
- PASS - ZIP contains 46 repo-relative entries.
