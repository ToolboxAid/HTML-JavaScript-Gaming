# PR_26171_014-message-studio-table-governance

## Branch Validation

PASS - Work was executed from `main` with `git status --short --branch` reporting `## main...origin/main` before edits.

## Requirement Checklist

- PASS - Project instructions now define `DATABASE DIRECTION`, state SQLite is deprecated, Postgres is authoritative, and require Local API -> Postgres for new database work.
- PASS - Browser Message Studio category imports, state, API usage, and rendering were removed from `toolbox/messages/`.
- PASS - Message rows render as a Summary Table with Name, Primary Emotion, Segments, Tags, Status, and Actions.
- PASS - Add Message Row opens an inline editable row inside the table.
- PASS - Message row actions are Edit and Disable; no delete UI is present.
- PASS - Emotion Profiles render as table governance with Name, Volume, Pitch, Rate, Status, and Actions.
- PASS - Add Profile opens an inline emotion profile row; actions are Edit and Disable.
- PASS - TTS Profiles render as table governance with Name, Provider, Voice, Language, Status, and Actions.
- PASS - Add Profile opens an inline TTS profile row; actions are Edit and Disable.
- PASS - Message Segments render nested under the selected message row with Order, Emotion, Text, Status, and Actions.
- PASS - Segment actions are Edit, Move Up, Move Down, and Disable; no delete UI is present.
- PASS - Speech Preview remains display-only with no playback controls, provider calls, or browser speech synthesis calls.
- PASS - Legacy SQLite category storage remains only inside the existing dev adapter as technical debt compatibility for the old schema.

## Impacted Lane

Message Studio Theme V2 tool, browser API client, existing dev-runtime messages adapter compatibility, and targeted Playwright coverage.

## Skipped Lanes

Samples smoke, unrelated toolbox pages, provider/runtime speech playback, audio generation, and repo-wide refactors were skipped as out of scope.

## Validation

- PASS - `node --check toolbox/messages/messages.js`
- PASS - `node --check toolbox/messages/messages-api-client.js`
- PASS - `node --check src/dev-runtime/messages/messages-sqlite-service.mjs`
- PASS - `node --check tests/playwright/tools/MessagesTool.spec.mjs`
- PASS - `rg -n "category|Category" toolbox/messages` returned no browser-surface matches.
- PASS - `rg -n "speechSynthesis|SpeechSynthesis|speak\\(|Preview Message|Preview Segments|Stop Preview" toolbox/messages` returned no matches.
- PASS - `rg -n "Delete" toolbox/messages tests/playwright/tools/MessagesTool.spec.mjs` returned no matches.
- PASS - `npx playwright test tests/playwright/tools/MessagesTool.spec.mjs --workers=1 --reporter=list`
- PASS - `git diff --check`

## Manual Notes

Reviewed the updated Message Studio route structure and confirmed the visible workflow is table-driven. The Speech Preview accordion now displays only status text. No full samples validation was run.
