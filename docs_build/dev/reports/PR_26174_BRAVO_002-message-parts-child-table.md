# PR_26174_BRAVO_002-message-parts-child-table

## Summary

Added expandable Message Parts child rows under each parent Message row. The child surface uses the existing Theme V2 table pattern with Order, Text, Emotion, Voice, and Actions columns, and supports Add Part, Edit, Save, Cancel, and Delete through the Local API.

## Branch Validation

| Check | Result | Notes |
| --- | --- | --- |
| Current branch is Bravo work branch | PASS | `git branch --show-current` returned `team/BRAVO/messages`. |
| Did not return to main | PASS | All PR_002 work was performed on `team/BRAVO/messages`. |

## Requirement Checklist

| Requirement | Result | Notes |
| --- | --- | --- |
| Add expandable child rows to Messages | PASS | Parent rows expose a Parts action that expands a child host row. |
| Parent row remains Message | PASS | The parent table remains Message-first with PR_001 columns. |
| Child rows are Message Parts | PASS | Expanded host renders Message Part rows from `messages_segments`. |
| Child columns Order, Text, Emotion, Voice, Actions | PASS | Child table renders exactly those headers. |
| Support Add Part, Edit, Save, Cancel, Delete | PASS | Inline child table actions are wired through external JS and Local API calls. |
| Reuse approved table-child-surface pattern | PASS | Reused `content-stack`, `surface-header`, `table-wrapper`, and `data-table data-table--fixed`. |
| Do not implement TTS playback yet | PASS | Voice remains a visible placeholder; no playback controls or speech calls were added. |
| No browser-owned authoritative product data | PASS | Message Parts are read/written/deleted through the Local API service. |
| Server/API owns authoritative key generation | PASS | Segment create still uses server-generated ULID keys. |
| Creator-safe errors only | PASS | UI save/delete failures use Creator-safe copy without server details. |
| Delete blocked when records are referenced | PASS | Parent message delete remains disabled when child parts exist; segment delete has no downstream references in this PR. |

## Validation Lane Report

| Lane | Result | Command / Notes |
| --- | --- | --- |
| JS syntax | PASS | `node --check toolbox/messages/messages.js; node --check toolbox/messages/messages-api-client.js; node --check src/dev-runtime/messages/messages-postgres-service.mjs; node --check tests/playwright/tools/MessagesTool.spec.mjs`. |
| Message Parts Local API contract | PASS | Inline Node check verified part create, parent delete block while referenced, part update, part delete, and parent delete unblock. |
| HTML restriction static check | PASS | `rg -n --pcre2 '<style|style=| on[a-z]+\s*=|<script(?![^>]*\bsrc=)' toolbox/messages/index.html` returned no matches. |
| Diff whitespace | PASS | `git diff --check -- <PR_002 files>` passed with line-ending warnings only. |
| Targeted Playwright | BLOCKED | Browser execution remains blocked because Playwright Chromium is missing in this workspace. |
| Fallback `npm run test:workspace-v2` | BLOCKED | The fallback lane also invokes Playwright and failed at browser launch with missing Chromium. |

## Manual Validation Notes

- Static inspection confirms no inline styles, style blocks, inline handlers, or HTML script blocks were added.
- Static inspection confirms PR_002 did not add TTS playback or provider runtime behavior.
- The parent delete guard now updates naturally after child part deletion because reference counts are reloaded from the Local API.
- Browser validation could not complete in this environment due missing Playwright Chromium.

## Changed Files

- `src/dev-runtime/messages/messages-postgres-service.mjs`
- `tests/playwright/tools/MessagesTool.spec.mjs`
- `toolbox/messages/messages-api-client.js`
- `toolbox/messages/messages.js`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/PR_26174_BRAVO_002-message-parts-child-table.md`

## ZIP

- `tmp/PR_26174_BRAVO_002-message-parts-child-table_delta.zip`
