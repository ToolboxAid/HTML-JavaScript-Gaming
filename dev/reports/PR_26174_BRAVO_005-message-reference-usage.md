# PR_26174_BRAVO_005-message-reference-usage

## Scope
- Added selected-message usage count display.
- Added a Reference Usage viewer that lists Message Part references for the selected Message.
- Added Archive/Restore actions for messages so referenced records can be archived instead of deleted.
- Kept delete blocked while a message has Message Part references.

## Branch Validation
| Check | Result | Notes |
| --- | --- | --- |
| Bravo branch retained | PASS | Current branch is `team/BRAVO/messages`. |
| Did not return to main | PASS | PR_005 was built as a stacked delta on the Bravo branch. |
| Did not merge or push main | PASS | No merge or push commands were run. |

## Requirement Checklist
| Requirement | Result | Evidence |
| --- | --- | --- |
| Add usage count display | PASS | Inspector now shows `data-messages-usage-count` for the selected Message. |
| Add reference viewer | PASS | Inspector now renders `data-messages-reference-list` with Message Part references and previews. |
| Block delete when referenced | PASS | Referenced message delete remains disabled in the UI and rejected by the Local API. |
| Prefer archive when referenced | PASS | Referenced messages expose an Archive action while Delete remains blocked. |
| No direct deletion if in use | PASS | Service contract verified delete rejection before and after archiving while a Message Part reference exists. |
| Theme V2 only | PASS | Added the viewer through existing `vertical-accordion` / `accordion-body` / `content-stack` patterns. |
| No inline styles, style blocks, inline handlers, or inline script blocks | PASS | Static scan found no disallowed inline HTML patterns in `toolbox/messages/index.html`. |
| No browser-owned authoritative product data | PASS | Archive/restore uses the Local API update path; no browser-owned product data was introduced. |
| Creator-safe errors | PASS | Archive failure text is generic and does not expose server details. |
| No TTS implementation | PASS | No playback/runtime/provider behavior was added. |

## Validation Lane Report
| Lane | Result | Command / Evidence |
| --- | --- | --- |
| Syntax | PASS | `node --check toolbox/messages/messages.js; node --check tests/playwright/tools/MessagesTool.spec.mjs` |
| Inline HTML guard | PASS | `rg -n --pcre2 '<style|style=| on[a-z]+\\s*=|<script(?![^>]*\\bsrc=)' toolbox/messages/index.html` returned no matches. |
| Reference usage contract | PASS | Inline Node probe verified referenced delete rejection, archive success, continued delete block while referenced, and delete success after reference removal. |
| Diff hygiene | PASS | `git diff --check -- toolbox/messages/index.html toolbox/messages/messages.js tests/playwright/tools/MessagesTool.spec.mjs` reported line-ending warnings only. |
| Targeted Playwright | BLOCKED | `npx playwright test tests/playwright/tools/MessagesTool.spec.mjs --grep "Message Studio disables Delete when a message is referenced" --project=playwright` failed because Chromium executable `chromium-1217` is not installed. |
| Fallback validation | BLOCKED | `npm run test:workspace-v2` failed for the same missing Playwright Chromium executable. |

## Manual Validation Notes
- Browser validation could not complete because this workstation is missing the Playwright Chromium executable.
- Static DOM checks and a Local API service contract probe covered the impacted reference/delete/archive behavior.
- Generated fallback lane side reports were restored; only PR_005-required report files remain in the PR delta.

## Reports And Package
| Artifact | Path |
| --- | --- |
| Review diff | `docs_build/dev/reports/codex_review.diff` |
| Changed files | `docs_build/dev/reports/codex_changed_files.txt` |
| PR report | `docs_build/dev/reports/PR_26174_BRAVO_005-message-reference-usage.md` |
| Delta ZIP | `tmp/PR_26174_BRAVO_005-message-reference-usage_delta.zip` |
