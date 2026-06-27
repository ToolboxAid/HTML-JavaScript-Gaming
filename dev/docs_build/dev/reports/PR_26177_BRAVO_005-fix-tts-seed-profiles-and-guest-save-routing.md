# PR_26177_BRAVO_005 Fix TTS Seed Profiles And Guest Save Routing

## Branch Validation

| Check | Result | Notes |
| --- | --- | --- |
| Active branch | PASS | `bravo/26177-text-to-speech` |
| Did not switch to main | PASS | Work stayed on the active Bravo branch. |
| Scope | PASS | Changed only Team Bravo Text To Speech seed/profile usability, guest write routing, and targeted impacted tests. |
| No governance changes | PASS | No governance files were edited. |
| No `start_of_day` changes | PASS | `git status --short -- docs_build/dev/start_of_day start_of_day` returned no changed files. |

## Removed Invalid Profiles/Emotions

| Record | Result | Notes |
| --- | --- | --- |
| `Default Balanced Profile` | KEPT | Default-safe browser profile using `Default browser voice`, `en-US`, and Neutral/Calm/Urgent emotion settings. |
| `Hero` | NOT PRESENT | No active runtime/static TTS seed row was present. No browser-owned cleanup was added. |
| `Merchant` | NOT PRESENT | No active runtime/static TTS seed row was present. No browser-owned cleanup was added. |
| `Neutral` | KEPT | Safe default emotion setting. |
| `Robot` | REMOVED | Removed from runtime Emotion Profile seed, TTS profile emotion settings, and TTS emotion authoring options because it was sample/stylized seed data rather than default-safe TTS data. |
| `Man Profile 1` | REMOVED | Removed unsupported starter profile seed; it did not persist a real gender/voice-filter distinction from Default Balanced. |
| `Woman Profile 2` | REMOVED | Removed unsupported starter profile seed and its Robot setting. |
| `Browser Speech Default` / `Narration Preview` | REMOVED | Removed stale static seed inventory names and aligned static seed inventory to the runtime `Default Balanced Profile`. |

## Guest Save Routing Checklist

| Requirement | Result | Notes |
| --- | --- | --- |
| Guest browsing allowed | PASS | GET/list routes for TTS profiles/emotions remain open. |
| Guest saving blocked in UI | PASS | TTS Profile save/delete and Emotion setting save/delete now check the current session before mutating state. |
| Guest write routes to sign-in | PASS | Unauthenticated TTS write actions redirect to `account/sign-in.html`. |
| Guest saving blocked in API | PASS | Local API rejects unauthenticated POST writes to `tts-profiles` and `emotion-profiles`. |
| No localStorage/product-data fallback | PASS | Text To Speech still uses Local API profile contracts; no browser-owned product data was added. |
| No silent fallback profiles | PASS | Runtime and helper seeds now expose only the explicit safe default profile. |

## Validation Lane Report

| Command | Result | Notes |
| --- | --- | --- |
| `node --check assets/toolbox/text-to-speech/js/index.js` | PASS | Syntax check passed. |
| `node --check src/dev-runtime/messages/messages-postgres-service.mjs` | PASS | Syntax check passed. |
| `node --check src/dev-runtime/server/local-api-router.mjs` | PASS | Syntax check passed. |
| `node --check tests/playwright/tools/TextToSpeechFunctional.spec.mjs` | PASS | Syntax check passed. |
| `node --check tests/playwright/tools/MessagesTool.spec.mjs` | PASS | Syntax check passed after impacted seed-reference updates. |
| `node --check tests/playwright/tools/EventsTool.spec.mjs` | PASS | Syntax check passed. |
| `node --test tests/tools/Text2SpeechShell.test.mjs` | PASS | 6/6 tests passed. |
| `node --test tests/dev-runtime/MessagesPublishValidation.test.mjs` | PASS | 6/6 tests passed, including guest TTS write rejection. |
| `node --test --test-name-pattern "Messages Local API seeds" tests/dev-runtime/DbSeedIntegrity.test.mjs` | PASS | Targeted Messages seed-integrity case passed. |
| `node --test tests/dev-runtime/DbSeedIntegrity.test.mjs` | PARTIAL | Targeted Messages seed test passed; two unrelated Local DB snapshot tests still fail on `/api/local-db/snapshot`. |
| `npx playwright test tests/playwright/tools/TextToSpeechFunctional.spec.mjs tests/playwright/tools/MessagesTool.spec.mjs tests/playwright/tools/EventsTool.spec.mjs --project=playwright` | BLOCKED/FAIL | Browser launch failed before page runtime because Chromium is missing at `C:\Users\davidq\AppData\Local\ms-playwright\chromium-1217\chrome-win64\chrome.exe`. |
| `git diff --check` | PASS | No whitespace errors. Git warned touched files may be normalized from LF to CRLF when Git writes them. |

## Manual Validation Notes

- Source inspection confirmed `Default browser voice` remains accepted by the Text To Speech preview resolver when a playable browser voice exists.
- Source inspection confirmed TTS write actions call session verification before save/delete state mutation.
- Source inspection confirmed no browser-owned product data, local storage SSoT, governance edits, or `start_of_day` changes were introduced.
- Playwright browser validation could not complete locally because the configured Chromium binary is missing.

## Known Issues

- Local Playwright validation remains blocked until Chromium is installed for the configured Playwright version.
- The broader `DbSeedIntegrity.test.mjs` file still has unrelated Local DB snapshot failures outside the Messages/TTS seed case.

## Output Files

- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/PR_26177_BRAVO_005-fix-tts-seed-profiles-and-guest-save-routing.md`
- `tmp/PR_26177_BRAVO_005-fix-tts-seed-profiles-and-guest-save-routing_delta.zip`
