# PR_26174_BRAVO_012-tts-preview-action-cleanup

## Branch Validation
- PASS: Current branch is `team/BRAVO/messages`.
- PASS: Continued on the Bravo branch without returning to `main`.
- PASS: No merge was performed.
- PASS: No `start_of_day` folders were modified.

## Requirement Checklist
- PASS: Updated only the Text To Speech page, related external JS, targeted tests, and required reports.
- PASS: Removed creator-visible `TTS Profile / Emotion Settings` child-table text.
- PASS: Removed creator-visible `Emotion Settings` heading/text from the Text To Speech surface.
- PASS: Kept Text To Speech ownership of TTS profile parent rows and Emotion child rows.
- PASS: Kept Pitch, Rate, and Volume as child Emotion row sliders in edit mode.
- PASS: Child Emotion table columns remain `Emotion`, `Pitch`, `Rate`, `Volume`, `Actions`.
- PASS: Added a Play button under Actions for each child Emotion row.
- PASS: Emotion-row Play speaks the Local Preview `Text To Speak` text.
- PASS: Emotion-row Play applies that row's Pitch, Rate, and Volume values.
- PASS: Local Preview area remains `Speech Composition` and `Text To Speak`.
- PASS: No inline styles, inline scripts, inline handlers, or page-local CSS were added.
- PASS: The implementation uses external JavaScript and Theme V2 classes already present on the page.
- PASS: Browser Speech unavailable path shows a Creator-safe message and does not silently fallback.

## Validation Lane Report
- PASS: `node --check toolbox/text-to-speech/text2speech.js`
- PASS: `node --check tests/playwright/tools/TextToSpeechFunctional.spec.mjs`
- PASS: `rg -n --pcre2 "<style|style=| on[a-z]+\\s*=|<script(?![^>]*\\bsrc=)" toolbox/text-to-speech/index.html` returned no matches.
- PASS: `rg -n "TTS Profile / Emotion Settings|Emotion Settings|Emotion setting|Emotion Setting|Message Parts" toolbox/text-to-speech/index.html toolbox/text-to-speech/text2speech.js tests/playwright/tools/TextToSpeechFunctional.spec.mjs` found only negative Playwright assertions.
- PASS: `git diff --check -- toolbox/text-to-speech/index.html toolbox/text-to-speech/text2speech.js tests/playwright/tools/TextToSpeechFunctional.spec.mjs` completed with no whitespace errors. Git emitted existing CRLF normalization warnings.
- PASS: `node --test tests/tools/Text2SpeechShell.test.mjs`
- BLOCKED: `npx playwright test tests/playwright/tools/TextToSpeechFunctional.spec.mjs --project=playwright` could not launch because Chromium is missing at `C:\Users\davidq\AppData\Local\ms-playwright\chromium-1217\chrome-win64\chrome.exe`.
- BLOCKED: `npm run test:workspace-v2` reached the same missing Chromium blocker after its non-browser audits completed.

## Manual Validation Notes
- Reviewed `toolbox/text-to-speech/index.html` and confirmed Local Preview still shows `Speech Composition` and `Text To Speak`.
- Reviewed `toolbox/text-to-speech/text2speech.js` and confirmed the old child table heading/kicker nodes were removed.
- Reviewed the child Emotion row rendering and confirmed each row now includes Edit Emotion, Delete, and Play actions.
- Reviewed playback flow and confirmed row Play uses the selected profile, selected emotion row, Local Preview text, and row Pitch/Rate/Volume values.
- Reviewed unavailable browser speech flow and confirmed row Play writes the Creator-safe Web Speech API support message without fallback behavior.
- Browser click-through validation is pending a local Playwright Chromium install.

## Review Artifacts
- Review diff: `docs_build/dev/reports/codex_review.diff`
- Changed files: `docs_build/dev/reports/codex_changed_files.txt`
- Delta ZIP: `tmp/PR_26174_BRAVO_012-tts-preview-action-cleanup_delta.zip`
