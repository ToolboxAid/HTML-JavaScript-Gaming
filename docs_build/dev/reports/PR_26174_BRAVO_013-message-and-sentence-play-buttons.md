# PR_26174_BRAVO_013-message-and-sentence-play-buttons

## Branch Validation
- PASS: Current branch is `team/BRAVO/messages`.
- PASS: Continued on the Bravo branch without returning to `main`.
- PASS: No merge was performed.
- PASS: No `start_of_day` folders were modified.

## Requirement Checklist
- PASS: Parent table record remains Message.
- PASS: Child table record remains Sentence.
- PASS: Parent Message rows have a Play button in Actions.
- PASS: Parent Play queues all child Sentences in display order.
- PASS: Child Sentence rows have a Play button in Actions.
- PASS: Child Play queues only the selected Sentence.
- PASS: Message playback resolves through Message, selected TTS Profile, ordered Sentences, Sentence Emotion, and TTS Profile emotion settings.
- PASS: Sentence playback resolves through Sentence, parent Message TTS Profile, Sentence Emotion, and TTS Profile emotion settings.
- PASS: Missing Sentences, TTS Profile, browser voice, or TTS Profile emotion settings produce Creator-safe guidance.
- PASS: Removed silent fallback from Message text when a Message has no Sentences.
- PASS: Removed fallback from Message-owned/global emotion profiles during playback; playback now requires the selected TTS Profile emotion setting.
- PASS: Messages does not gain voice, emotion slider, pitch, rate, or volume ownership.
- PASS: Messages owns what to speak and Text To Speech owns how to speak.
- PASS: Text To Speech Profile add/edit refreshes and displays available browser voices in the Voice dropdown.
- PASS: Voice selection is preserved through profile edit and used by Emotion-row Play.
- PASS: Emotion-row Play uses selected profile voice plus row Pitch, Rate, and Volume.
- PASS: Local Preview `Text To Speak` remains the preview text source.

## Validation Lane Report
- PASS: `node --check toolbox/messages/messages.js`
- PASS: `node --check toolbox/text-to-speech/text2speech.js`
- PASS: `node --check tests/playwright/tools/MessagesTool.spec.mjs`
- PASS: `node --check tests/playwright/tools/TextToSpeechFunctional.spec.mjs`
- PASS: `rg -n --pcre2 "<style|style=| on[a-z]+\\s*=|<script(?![^>]*\\bsrc=)" toolbox/messages/index.html toolbox/text-to-speech/index.html` returned no matches.
- PASS: `git diff --check -- toolbox/messages/messages.js toolbox/text-to-speech/text2speech.js tests/playwright/tools/MessagesTool.spec.mjs tests/playwright/tools/TextToSpeechFunctional.spec.mjs` completed with no whitespace errors. Git emitted existing CRLF normalization warnings.
- PASS: `node --test tests/tools/Text2SpeechShell.test.mjs`
- PASS: `rg --pcre2 -n "localStorage|sessionStorage|imageDataUrl|style=|<style| on[a-z]+=|<script(?![^>]*src=)" toolbox/messages toolbox/text-to-speech tests/playwright/tools/MessagesTool.spec.mjs tests/playwright/tools/TextToSpeechFunctional.spec.mjs` returned no matches.
- BLOCKED: `npx playwright test tests/playwright/tools/MessagesTool.spec.mjs tests/playwright/tools/TextToSpeechFunctional.spec.mjs --project=playwright` could not launch because Chromium is missing at `C:\Users\davidq\AppData\Local\ms-playwright\chromium-1217\chrome-win64\chrome.exe`.
- BLOCKED: `npm run test:workspace-v2` reached the same missing Chromium blocker after its non-browser audits completed.

## Manual Validation Notes
- Reviewed Messages playback code and confirmed parent Play blocks when no child Sentences exist.
- Reviewed Messages playback code and confirmed Sentence Play uses the parent Message TTS Profile, not Sentence-owned voice settings.
- Reviewed Messages playback code and confirmed browser voice lookup requires an available selected voice instead of silently using browser defaults.
- Reviewed Text To Speech profile editor code and confirmed add/edit refreshes browser voices before rendering the Voice dropdown.
- Reviewed Text To Speech Emotion-row Play and confirmed it sends selected voice, Local Preview text, and row Pitch/Rate/Volume to the speech engine.
- Browser click-through validation is pending a local Playwright Chromium install.

## Review Artifacts
- Review diff: `docs_build/dev/reports/codex_review.diff`
- Changed files: `docs_build/dev/reports/codex_changed_files.txt`
- Delta ZIP: `tmp/PR_26174_BRAVO_013-message-and-sentence-play-buttons_delta.zip`
