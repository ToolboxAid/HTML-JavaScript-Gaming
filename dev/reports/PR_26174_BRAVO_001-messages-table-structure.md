# PR_26174_BRAVO_001-messages-table-structure

## Summary

Converted Message Studio to the approved table-first Messages surface with server-owned persistence, inline row editing, and guarded message deletion. The visible table now uses Theme V2 table classes and exposes Message, Text, Tags, Emotion, Voice, Updated, and Actions columns.

## Branch Validation

| Check | Result | Notes |
| --- | --- | --- |
| Current branch is main | PASS | `git branch --show-current` returned `main`. |

## Requirement Checklist

| Requirement | Result | Notes |
| --- | --- | --- |
| Convert existing Messages tool/page to approved GFS table-first layout | PASS | `toolbox/messages/index.html` and `toolbox/messages/messages.js` now render the Messages table as the primary center surface. |
| Columns: Message, Text, Tags, Emotion, Voice, Updated, Actions | PASS | Static table headers match the requested seven-column structure. |
| Add Message button above/near table | PASS | Added a Theme V2 button in the table surface header. |
| Row actions: Edit, Delete | PASS | Saved rows render Edit and Delete only. |
| Edit mode actions: Save, Cancel | PASS | Inline editor rows render Save and Cancel only. |
| Delete blocked/disabled when referenced | PASS | UI disables Delete when message parts reference the message; service delete path returns 409 for referenced rows. |
| Use Theme V2 and existing reusable table patterns | PASS | Reused `surface-header`, `action-group`, `table-wrapper`, and `data-table`; no page-local CSS added. |
| No inline styles, style blocks, inline handlers, or script blocks in HTML | PASS | Static PCRE check returned no matches for inline style/script/handler patterns. |
| No browser-owned authoritative product data | PASS | Messages, emotions, and reference counts load through the Local API; no localStorage/product-data fallback added. |
| No TTS implementation in this PR | PASS | Removed visible playback/TTS controls from Message Studio and did not add TTS behavior. Existing server TTS endpoints were not expanded. |
| No Emotion Profiles or Voice Profiles tools yet | PASS | Emotion/Voice remain visible reference columns/placeholders only; no profile management UI added. |
| Creator-safe empty/error states | PASS | Empty table and runtime failure messages avoid server diagnostics and stack details. |
| Required repo-structured ZIP under tmp/ | PASS | Prepared for `tmp/PR_26174_BRAVO_001-messages-table-structure_delta.zip`. |

## Validation Lane Report

| Lane | Result | Command / Notes |
| --- | --- | --- |
| Branch check | PASS | `git branch --show-current` -> `main`. |
| JS syntax | PASS | `node --check` on touched JS/MJS files. |
| Messages service contract | PASS | Inline Node check verified create, unreferenced delete, and referenced delete guard using `createMessagesPostgresClientStub`. |
| HTML restriction static check | PASS | `rg -n --pcre2 '<style|style=| on[a-z]+\s*=|<script(?![^>]*\bsrc=)' toolbox/messages/index.html` returned no matches. |
| Diff whitespace | PASS | `git diff --check -- <touched files>` passed with line-ending warnings only. |
| Dependency install for validation | PASS_WITH_NOTE | `npm ci` completed; npm reported one existing high-severity audit finding, not changed in this PR. |
| Targeted Playwright Messages spec | BLOCKED | `npx playwright test tests/playwright/tools/MessagesTool.spec.mjs` could not launch because Chromium was missing. `npx playwright install chromium` timed out twice (about 184s and 364s). A temporary system-Chrome config using `C:\Program Files\Google\Chrome\Application\chrome.exe` also timed out after about 184s, so browser assertions did not complete. |

## Manual Validation Notes

- Static source inspection confirms the Messages table headers are Message, Text, Tags, Emotion, Voice, Updated, Actions.
- Static source inspection confirms Add Message, Edit/Delete, Save/Cancel paths are present in the Messages controller.
- Static source inspection confirms old visible TTS Profile, Play Message, Stop Playback, and TTS selector hooks are absent from `toolbox/messages/index.html` and `toolbox/messages/messages.js`.
- Manual browser validation was not completed because the Playwright Chromium binary could not be installed and the fallback system-Chrome run timed out within the available command window.
- Unrelated pre-existing `.gitignore` modification was left untouched and excluded from this PR delta.

## Changed Files

- `src/dev-runtime/messages/messages-postgres-service.mjs`
- `tests/helpers/messagesPostgresClientStub.mjs`
- `tests/playwright/tools/MessagesTool.spec.mjs`
- `toolbox/messages/index.html`
- `toolbox/messages/messages-api-client.js`
- `toolbox/messages/messages.js`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/PR_26174_BRAVO_001-messages-table-structure.md`

## ZIP

- `tmp/PR_26174_BRAVO_001-messages-table-structure_delta.zip`
