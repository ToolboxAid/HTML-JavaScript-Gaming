# PR_26174_BRAVO_006-browser-tts-runtime

## Scope
- Added Browser Speech API preview controls for the selected Message or Message Part.
- Implemented the runtime flow: Message -> Message Part -> Emotion Profile -> Voice Profile -> Browser Speech API.
- Added Stop Speech handling.
- Kept vendor provider integration out of scope.

## Branch Validation
| Check | Result | Notes |
| --- | --- | --- |
| Bravo branch retained | PASS | Current branch is `team/BRAVO/messages`. |
| Did not return to main | PASS | PR_006 was built as a stacked delta on the Bravo branch. |
| Did not merge or push main | PASS | No merge or push commands were run. |

## Requirement Checklist
| Requirement | Result | Evidence |
| --- | --- | --- |
| Implement Browser Speech API runtime | PASS | `toolbox/messages/messages.js` uses `window.speechSynthesis` and `SpeechSynthesisUtterance`. |
| Flow Message -> Message Part -> Emotion Profile -> Voice Profile -> Browser Speech API | PASS | Speech queue resolves selected part, or selected message parts in order, then applies emotion/voice profile settings to utterances. |
| Add test playback for selected message/part | PASS | Focused Playwright spec stubs `speechSynthesis` and asserts selected message and selected part utterance payloads. |
| No vendor provider integration yet | PASS | Runtime accepts only `browser-speech` provider and shows Creator-safe failure for any other provider. |
| No silent provider fallback | PASS | Missing Browser Speech API, missing profile, unavailable provider, or unavailable named voice fails with Creator-safe UI text. |
| Theme V2 only | PASS | Speech controls use existing `vertical-accordion`, `accordion-body`, `content-stack`, `action-group`, and `btn` classes. |
| No inline styles, style blocks, inline handlers, or inline script blocks | PASS | Static scan found no disallowed inline HTML patterns in `toolbox/messages/index.html`. |
| No browser-owned authoritative product data | PASS | Speech preview reads existing Local API-backed message/profile data and persists nothing. |
| Creator-safe runtime failure text | PASS | Speech failures use generic user-facing messages and do not expose browser exception details. |

## Validation Lane Report
| Lane | Result | Command / Evidence |
| --- | --- | --- |
| Syntax | PASS | `node --check toolbox/messages/messages.js; node --check tests/playwright/tools/MessagesTool.spec.mjs` |
| Inline HTML guard | PASS | `rg -n --pcre2 '<style|style=| on[a-z]+\\s*=|<script(?![^>]*\\bsrc=)' toolbox/messages/index.html` returned no matches. |
| Diff hygiene | PASS | `git diff --check -- toolbox/messages/index.html toolbox/messages/messages.js tests/playwright/tools/MessagesTool.spec.mjs` reported line-ending warnings only. |
| Targeted Playwright | BLOCKED | `npx playwright test tests/playwright/tools/MessagesTool.spec.mjs --grep "Message Studio uses the approved table-first Messages structure" --project=playwright` failed because Chromium executable `chromium-1217` is not installed. |
| Fallback validation | BLOCKED | `npm run test:workspace-v2` failed for the same missing Playwright Chromium executable. |

## Manual Validation Notes
- Browser validation could not complete because this workstation is missing the Playwright Chromium executable.
- Runtime behavior is covered in the focused Playwright spec with a deterministic `speechSynthesis` stub, ready to execute once Chromium is installed.
- Generated fallback lane side reports were restored; only PR_006-required report files remain in the PR delta.

## Reports And Package
| Artifact | Path |
| --- | --- |
| Review diff | `docs_build/dev/reports/codex_review.diff` |
| Changed files | `docs_build/dev/reports/codex_changed_files.txt` |
| PR report | `docs_build/dev/reports/PR_26174_BRAVO_006-browser-tts-runtime.md` |
| Delta ZIP | `tmp/PR_26174_BRAVO_006-browser-tts-runtime_delta.zip` |
