# PR_26174_BRAVO_004-voice-profiles-table

## Scope
- Added a Voice Profiles reusable-asset table to Message Studio.
- Seeded the required starter voice examples: Narrator, Hero, Merchant, Robot, Monster.
- Added server/API-owned `voiceProfileKey` references on Messages and Message Parts.
- Replaced visible Voice placeholders with profile selects while keeping playback/TTS runtime out of scope.

## Branch Validation
| Check | Result | Notes |
| --- | --- | --- |
| Bravo branch retained | PASS | Current branch is `team/BRAVO/messages`. |
| Did not return to main | PASS | PR_004 was built as a stacked delta on the Bravo branch. |
| Did not merge or push main | PASS | No merge or push commands were run. |

## Requirement Checklist
| Requirement | Result | Evidence |
| --- | --- | --- |
| Add Voice Profiles as reusable assets | PASS | `toolbox/messages/index.html` adds the Voice Profiles table; `toolbox/messages/messages.js` creates/updates profiles through the Local API. |
| Table columns: Voice, Provider, Voice Name, Language, Updated, Actions | PASS | Voice Profiles table headers match the required column list. |
| Starter examples: Narrator, Hero, Merchant, Robot, Monster | PASS | `SEED_TTS_PROFILES` now includes all five required starter voice profiles. |
| Messages reference Voice Profiles | PASS | Message rows now require and return `voiceProfileKey` / `voiceProfileName`. |
| Message Parts reference Voice Profiles | PASS | Message Part rows now require and return `voiceProfileKey` / `voiceProfileName`. |
| No browser-owned authoritative product data | PASS | Voice profiles and references are created through the Local API; keys remain server/API owned. |
| No browser-generated authoritative database keys | PASS | The service continues to generate ULID-style keys server-side. |
| No TTS implementation in this PR | PASS | No playback buttons, Browser Speech runtime, or provider runtime behavior was added. |
| Theme V2 and reusable table patterns | PASS | Uses `card`, `surface-header`, `table-wrapper`, `data-table`, `action-group`, and `btn`. |
| No inline styles, style blocks, inline handlers, or inline script blocks | PASS | Static scan found no disallowed inline HTML patterns in `toolbox/messages/index.html`. |
| Creator-safe empty/error states | PASS | UI failure messages remain generic and do not expose server details. |
| Use Local API / Local DB wording | PASS | The Messages page persistence label now uses Local DB wording. |
| Delete blocked when referenced | PASS | No new direct delete path was introduced for voice profiles; existing message delete guard remains intact. |

## Validation Lane Report
| Lane | Result | Command / Evidence |
| --- | --- | --- |
| Syntax | PASS | `node --check toolbox/messages/messages.js; node --check src/dev-runtime/messages/messages-postgres-service.mjs; node --check tests/playwright/tools/MessagesTool.spec.mjs; node --check tests/dev-runtime/DbSeedIntegrity.test.mjs` |
| Inline HTML guard | PASS | `rg -n --pcre2 '<style|style=| on[a-z]+\\s*=|<script(?![^>]*\\bsrc=)' toolbox/messages/index.html` returned no matches. |
| Local API contract | PASS | Inline Node probe verified starter voice profiles, required voice references, response voice names, and default backfill for legacy rows. |
| Messages Local API seed subtest | PASS | `node --test --test-name-pattern "Messages Local API seeds" tests/dev-runtime/DbSeedIntegrity.test.mjs` |
| Diff hygiene | PASS | `git diff --check -- src/dev-runtime/messages/messages-postgres-service.mjs tests/dev-runtime/DbSeedIntegrity.test.mjs tests/playwright/tools/MessagesTool.spec.mjs toolbox/messages/index.html toolbox/messages/messages.js` reported line-ending warnings only. |
| Targeted Playwright | BLOCKED | `npx playwright test tests/playwright/tools/MessagesTool.spec.mjs --grep "Message Studio uses the approved table-first Messages structure" --project=playwright` failed because Chromium executable `chromium-1217` is not installed. |
| Fallback validation | BLOCKED | `npm run test:workspace-v2` failed for the same missing Playwright Chromium executable. |

## Manual Validation Notes
- Browser validation could not complete because this workstation is missing the Playwright Chromium executable.
- The full `DbSeedIntegrity.test.mjs` file still has unrelated Local DB snapshot failures, but its Messages Local API subtest passes after the voice-profile changes.
- Generated fallback lane side reports were restored; only PR_004-required report files remain in the PR delta.

## Reports And Package
| Artifact | Path |
| --- | --- |
| Review diff | `docs_build/dev/reports/codex_review.diff` |
| Changed files | `docs_build/dev/reports/codex_changed_files.txt` |
| PR report | `docs_build/dev/reports/PR_26174_BRAVO_004-voice-profiles-table.md` |
| Delta ZIP | `tmp/PR_26174_BRAVO_004-voice-profiles-table_delta.zip` |
