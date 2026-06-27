# PR_26174_BRAVO_010-separate-messages-and-tts-ownership

## Branch Validation
- PASS: Current branch is `team/BRAVO/messages`.
- PASS: Work continued on the stacked Bravo branch.
- PASS: No merge was performed.
- PASS: No return to `main` was performed.
- PASS: No push to `main` was performed.
- PASS: `start_of_day` folders were not modified.

## Scope Summary
- Separated visible ownership between Message Studio and Text To Speech.
- Message Studio now owns Messages and ordered sentence rows only.
- Text To Speech now owns TTS Profile rows and child emotion audio settings.
- Message Studio playback resolves through TTS Profile and sentence emotion settings.

## Requirement Checklist
- PASS: Messages no longer shows Reusable Assets / Emotion Profiles sections.
- PASS: Messages no longer shows Voice Profiles sections.
- PASS: Messages parent table columns are Message, TTS Profile, Updated, Actions.
- PASS: Messages parent row Actions include Play at the end.
- PASS: Messages child table is sentences with Order, Text, Emotion, Actions.
- PASS: Messages references TTS Profile by key/name.
- PASS: Sentences reference Emotion by key/name from the selected TTS Profile option contract.
- PASS: Messages does not expose pitch, rate, volume, voice, or provider authoring controls.
- PASS: Text To Speech parent table columns are Profile, Gender, Voice, Language, Age Filter, Emotion Count, Status, Actions.
- PASS: Text To Speech child emotion table columns are Emotion, Pitch, Rate, Volume, Actions.
- PASS: Pitch, Rate, and Volume editors are range sliders.
- PASS: Emotion editor remains a dropdown.
- PASS: Browser Speech runtime remains connected through TTS Profile plus Emotion.
- PASS: Theme V2/external JavaScript pattern preserved.
- PASS: No inline styles, style blocks, inline handlers, or inline script blocks were added.
- PASS: No browser-owned authoritative product data or browser-generated authoritative database keys were added.
- PASS: Creator-safe failure text is preserved.

## Validation Lane Report
- PASS: `node --check src\dev-runtime\messages\messages-postgres-service.mjs`
- PASS: `node --check toolbox\messages\messages.js`
- PASS: `node --check toolbox\text-to-speech\text2speech.js`
- PASS: `node --check tests\playwright\tools\MessagesTool.spec.mjs`
- PASS: `node --check tests\playwright\tools\TextToSpeechFunctional.spec.mjs`
- PASS: `node --check tests\tools\Text2SpeechShell.test.mjs`
- PASS: `node --test tests\tools\Text2SpeechShell.test.mjs`
- PASS: `node --test tests\dev-runtime\MessagesPublishValidation.test.mjs`
- PASS: HTML inline/style/script guard on `toolbox/messages/index.html` and `toolbox/text-to-speech/index.html`
- PASS: Ownership guard for `imageDataUrl`, `localStorage`, and `sessionStorage`
- PASS: `git diff --check` for PR_010 touched files, with line-ending warnings only
- BLOCKED: `npx playwright test tests/playwright/tools/MessagesTool.spec.mjs tests/playwright/tools/TextToSpeechFunctional.spec.mjs --project=playwright`
  - Blocker: Playwright Chromium executable is not installed in the local `ms-playwright` cache.
- BLOCKED: `npm run test:workspace-v2`
  - Blocker: Same missing Playwright Chromium executable.

## Manual Validation Notes
- Reviewed Message Studio HTML/JS to confirm old profile cards are no longer rendered.
- Reviewed Text To Speech HTML/JS to confirm profile parent columns and slider-based emotion child rows.
- Reviewed Messages playback path: Message -> TTS Profile -> Sentence -> Emotion setting -> Browser Speech API.
- Browser visual validation still needs a local Playwright browser install before the Playwright lane can launch.

## Reports And Package
- Shared diff: `docs_build/dev/reports/codex_review.diff`
- Changed files: `docs_build/dev/reports/codex_changed_files.txt`
- PR report: `docs_build/dev/reports/PR_26174_BRAVO_010-separate-messages-and-tts-ownership.md`
- Delta ZIP: `tmp/PR_26174_BRAVO_010-separate-messages-and-tts-ownership_delta.zip`
