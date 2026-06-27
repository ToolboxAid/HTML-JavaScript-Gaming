# PR_26174_BRAVO_014-message-play-button-regression-fix

## Branch Validation
- PASS: Current branch is `team/BRAVO/messages`.
- PASS: Continued on the Bravo branch without returning to `main`.
- PASS: No merge was performed.
- PASS: No `start_of_day` folders were modified.

## Requirement Checklist
- PASS: Parent table record remains Message.
- PASS: Child table record remains Sentence.
- PASS: Parent Message row Actions always render Play, Edit, Archive/Restore, and Delete.
- PASS: Parent Play remains visible after parent Archive/Restore state changes.
- PASS: Parent Play remains visible after child Sentence Delete state changes.
- PASS: Parent Play speaks ordered child Sentences.
- PASS: Child Sentence row Actions render Play, Edit, Archive/Restore, and Delete.
- PASS: Child Play speaks only that Sentence.
- PASS: Delete/Archive actions do not remove unrelated Play actions.
- PASS: Creator-facing UI continues to use Sentence/Sentences, not Message Parts.
- PASS: Messages owns what to speak; no TTS sliders or voice/provider ownership were moved into Messages.
- PASS: Playback continues to resolve through selected TTS Profile and selected Sentence Emotion.
- PASS: Existing Creator-safe guidance remains for missing profile, voice, emotion, sentence text, or Sentences.
- PASS: No silent fallback was added.
- PASS: No inline styles, inline scripts, inline handlers, or page-local CSS were added.

## Validation Lane Report
- PASS: `node --check toolbox/messages/messages.js`
- PASS: `node --check tests/playwright/tools/MessagesTool.spec.mjs`
- PASS: `rg --pcre2 -n "<style|style=| on[a-z]+\\s*=|<script(?![^>]*\\bsrc=)|Message Parts" toolbox/messages/index.html toolbox/messages/messages.js tests/playwright/tools/MessagesTool.spec.mjs` found only the negative Playwright assertion for `Message Parts`.
- PASS: `rg --pcre2 -n "localStorage|sessionStorage|imageDataUrl" toolbox/messages/index.html toolbox/messages/messages.js tests/playwright/tools/MessagesTool.spec.mjs` returned no matches.
- PASS: `git diff --check -- toolbox/messages/messages.js tests/playwright/tools/MessagesTool.spec.mjs` completed with no whitespace errors. Git emitted existing CRLF normalization warnings.
- BLOCKED: `npx playwright test tests/playwright/tools/MessagesTool.spec.mjs --project=playwright` could not launch because Chromium is missing at `C:\Users\davidq\AppData\Local\ms-playwright\chromium-1217\chrome-win64\chrome.exe`.
- BLOCKED: `npm run test:workspace-v2` reached the same missing Chromium blocker after its non-browser audits completed.

## Manual Validation Notes
- Reviewed parent Message row rendering and confirmed Play is rendered first in the Actions group, followed by Sentences, Edit, Archive/Restore, and Delete.
- Reviewed child Sentence row rendering and confirmed Play is rendered first in the Actions group, followed by Edit, Archive/Restore, and Delete.
- Reviewed Messages playback code and confirmed parent Play queues ordered Sentences while child Play queues one selected Sentence.
- Reviewed Playwright coverage additions for child Play one-row speech, parent Play ordered speech, parent Archive/Restore visibility, and child Delete/Archive visibility preservation.
- Browser click-through validation is pending a local Playwright Chromium install.

## Review Artifacts
- Review diff: `docs_build/dev/reports/codex_review.diff`
- Changed files: `docs_build/dev/reports/codex_changed_files.txt`
- Delta ZIP: `tmp/PR_26174_BRAVO_014-message-play-button-regression-fix_delta.zip`
