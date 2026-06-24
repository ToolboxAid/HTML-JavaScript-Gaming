# PR_26174_BRAVO_007-tts-provider-framework

## Scope
- Added an approved TTS provider framework.
- Providers: Browser Speech API, ElevenLabs, OpenAI, Azure, Polly.
- Kept Browser Speech API as the only active runtime provider.
- Added explicit provider validation and Creator-safe runtime failure behavior for unavailable providers.

## Branch Validation
| Check | Result | Notes |
| --- | --- | --- |
| Bravo branch retained | PASS | Current branch is `team/BRAVO/messages`. |
| Did not return to main | PASS | PR_007 was built as a stacked delta on the Bravo branch. |
| Did not merge or push main | PASS | No merge or push commands were run. |

## Requirement Checklist
| Requirement | Result | Evidence |
| --- | --- | --- |
| Add provider abstraction | PASS | `toolbox/messages/messages.js` defines `TTS_PROVIDER_REGISTRY`; service validates approved provider keys. |
| Providers include Browser Speech API, ElevenLabs, OpenAI, Azure, Polly | PASS | Provider registry and Voice Profile select expose all five providers. |
| Browser Speech API remains only active runtime provider | PASS | Runtime gate allows only `browser-speech`; vendor providers remain inactive placeholders. |
| No silent provider fallback | PASS | Unknown, inactive, or config-required providers fail instead of falling back. |
| Invalid/missing provider config Creator-safe errors | PASS | UI catches provider runtime failures with generic speech-preview messages; service rejects unsupported provider keys. |
| No vendor provider integration | PASS | No vendor network calls, credentials, SDKs, or provider runtime implementations were added. |
| No browser-owned authoritative product data | PASS | Provider choices are saved through Local API voice profiles only. |
| Theme V2 / no inline HTML violations | PASS | This PR does not add page-local CSS or inline HTML handlers/styles/scripts. |

## Validation Lane Report
| Lane | Result | Command / Evidence |
| --- | --- | --- |
| Syntax | PASS | `node --check toolbox/messages/messages.js; node --check src/dev-runtime/messages/messages-postgres-service.mjs; node --check tests/playwright/tools/MessagesTool.spec.mjs` |
| Inline HTML guard | PASS | `rg -n --pcre2 '<style|style=| on[a-z]+\\s*=|<script(?![^>]*\\bsrc=)' toolbox/messages/index.html` returned no matches. |
| Provider contract | PASS | Inline Node probe verified approved provider persistence and unsupported provider rejection. |
| Diff hygiene | PASS | `git diff --check -- src/dev-runtime/messages/messages-postgres-service.mjs toolbox/messages/messages.js tests/playwright/tools/MessagesTool.spec.mjs` reported line-ending warnings only. |
| Targeted Playwright | BLOCKED | `npx playwright test tests/playwright/tools/MessagesTool.spec.mjs --grep "Message Studio uses the approved table-first Messages structure" --project=playwright` failed because Chromium executable `chromium-1217` is not installed. |
| Fallback validation | BLOCKED | `npm run test:workspace-v2` failed for the same missing Playwright Chromium executable. |

## Manual Validation Notes
- Browser validation could not complete because this workstation is missing the Playwright Chromium executable.
- Focused spec now asserts the approved provider options and Browser Speech API provider label.
- Generated fallback lane side reports were restored; only PR_007-required report files remain in the PR delta.

## Reports And Package
| Artifact | Path |
| --- | --- |
| Review diff | `docs_build/dev/reports/codex_review.diff` |
| Changed files | `docs_build/dev/reports/codex_changed_files.txt` |
| PR report | `docs_build/dev/reports/PR_26174_BRAVO_007-tts-provider-framework.md` |
| Delta ZIP | `tmp/PR_26174_BRAVO_007-tts-provider-framework_delta.zip` |
