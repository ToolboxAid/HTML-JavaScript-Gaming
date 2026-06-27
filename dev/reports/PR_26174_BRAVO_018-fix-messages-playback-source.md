# PR_26174_BRAVO_018-fix-messages-playback-source

## Branch Validation
- PASS: Current branch is `team/BRAVO/messages`.
- PASS: Continued on the existing Bravo branch; no merge and no return to main.

## Purpose
- PASS: Scoped to fixing the Messages playback source so it no longer uses Text To Speech preview-style exact browser voice validation.

## Requirement Checklist
- PASS: Parent Message row Actions include Play, Edit, Archive/Restore, and Delete.
- PASS: Child Sentence row Actions include Play, Edit, Archive/Restore, and Delete.
- PASS: Parent Play resolves Message -> selected TTS Profile -> ordered child Sentences -> speech queue.
- PASS: Child Play resolves Sentence -> parent Message -> selected TTS Profile -> single-sentence speech queue.
- PASS: Messages playback no longer requires an exact browser voice match for the selected profile voice text.
- PASS: When a selected profile has Voice text but the browser cannot match it exactly, Messages allows Browser Speech to use its default voice.
- PASS: Diagnostics still display the selected profile values, including Profile, Gender, Voice, Language, and Age Filter.
- PASS: Messages runtime does not show `Select an available browser voice before preview.` and does not depend on Local Preview voice selection, preview voice dropdown, or preview voice state.
- PASS: No changes were made under `toolbox/text-to-speech/`.
- PASS: No inline styles, inline scripts, inline handlers, style blocks, or page-local CSS were added.
- PASS: No browser-owned authoritative product data or browser-generated authoritative database keys were added.

## Validation Lane Report
- PASS: `node --check toolbox/messages/messages.js`
- PASS: `node --check tests/playwright/tools/MessagesTool.spec.mjs`
- PASS: `rg --pcre2 -n "<style|style=| on[a-z]+\\s*=|<script(?![^>]*\\bsrc=)" toolbox/messages/index.html toolbox/messages/messages.js tests/playwright/tools/MessagesTool.spec.mjs` returned no matches.
- PASS: `rg --pcre2 -n "localStorage|sessionStorage|imageDataUrl" toolbox/messages/index.html toolbox/messages/messages.js tests/playwright/tools/MessagesTool.spec.mjs` returned no matches.
- PASS: `rg -n "Select an available browser voice before preview|Local Preview|Preview voice|data-tts-preview|data-tts-voice" toolbox/messages/index.html toolbox/messages/messages.js` returned no matches.
- PASS: `git diff --check -- toolbox/messages/messages.js tests/playwright/tools/MessagesTool.spec.mjs`
- BLOCKED: `npx playwright test tests/playwright/tools/MessagesTool.spec.mjs --project=playwright` could not launch because Chromium is missing at `C:\Users\davidq\AppData\Local\ms-playwright\chromium-1217\chrome-win64\chrome.exe`.
- BLOCKED: Fallback `npm run test:workspace-v2` reached the same missing Chromium blocker after completing static/preflight report generation.

## Manual Validation Notes
- Reviewed `browserVoiceForProfile`: it now returns an exact voice match when available and returns `null` when unavailable so Web Speech can use its browser default voice.
- Reviewed `assertSpeechItem`: Messages still requires selected parent TTS Profile voice text; it no longer requires that text to be installed as an exact local browser voice.
- Updated the Messages Playwright fixture to omit `Browser hero` from `speechSynthesis.getVoices()` while the selected Hero profile still has `voiceName: Browser hero`.
- Updated assertions so Child Play and Parent Play still speak with no matched browser voice while diagnostics continue to display `Voice: Browser hero`.
- Browser-backed manual execution was not possible in this environment because the required Playwright Chromium binary is not installed.

## Changed Files
- docs_build/dev/reports/PR_26174_BRAVO_018-fix-messages-playback-source.md
- docs_build/dev/reports/codex_review.diff
- docs_build/dev/reports/codex_changed_files.txt
- tests/playwright/tools/MessagesTool.spec.mjs
- toolbox/messages/messages.js

## Artifact
- tmp/PR_26174_BRAVO_018-fix-messages-playback-source_delta.zip
