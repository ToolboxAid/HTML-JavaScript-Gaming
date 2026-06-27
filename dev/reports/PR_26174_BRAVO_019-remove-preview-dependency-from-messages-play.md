# PR_26174_BRAVO_019-remove-preview-dependency-from-messages-play

## Branch Validation
- PASS: Current branch is `team/BRAVO/messages`.
- PASS: Continued on the existing Bravo branch; no merge and no return to main.

## Purpose
- PASS: Scoped to removing preview-style dependency and wording from Messages playback.

## Requirement Checklist
- PASS: Parent Message row Actions include Play, Edit, Archive/Restore, and Delete.
- PASS: Child Sentence row Actions include Play, Edit, Archive/Restore, and Delete.
- PASS: Parent Play resolves Message -> selected TTS Profile -> ordered child Sentences -> speech queue.
- PASS: Child Play resolves Sentence -> parent Message -> selected TTS Profile -> single-sentence speech queue.
- PASS: Messages playback does not call Text To Speech Local Preview logic and does not read preview voice state.
- PASS: `toolbox/messages/messages.js` contains no `before preview`, no `available browser voice before preview`, and no exact preview voice error text.
- PASS: Messages runtime speech status wording now uses playback instead of preview.
- PASS: Playback diagnostics display Profile, Gender, Voice, Language, and Age Filter from the parent profile.
- PASS: If exact browser voice matching fails, Messages allows browser default speech while keeping selected profile values visible.
- PASS: Text To Speech preview strict validation was not changed.
- PASS: No inline styles, inline scripts, inline handlers, style blocks, or page-local CSS were added.
- PASS: No browser-owned authoritative product data or browser-generated authoritative database keys were added.

## Validation Lane Report
- PASS: `node --check toolbox/messages/messages.js`
- PASS: `node --check tests/playwright/tools/MessagesTool.spec.mjs`
- PASS: `node --check tests/tools/MessagesPlaybackSource.test.mjs`
- PASS: `node --test tests/tools/MessagesPlaybackSource.test.mjs`
- PASS: `rg --pcre2 -n "<style|style=| on[a-z]+\\s*=|<script(?![^>]*\\bsrc=)" toolbox/messages/index.html toolbox/messages/messages.js tests/playwright/tools/MessagesTool.spec.mjs tests/tools/MessagesPlaybackSource.test.mjs` returned no matches.
- PASS: `rg --pcre2 -n "localStorage|sessionStorage|imageDataUrl" toolbox/messages/index.html toolbox/messages/messages.js tests/playwright/tools/MessagesTool.spec.mjs tests/tools/MessagesPlaybackSource.test.mjs` returned no matches.
- PASS: `rg -n "before preview|available browser voice before preview|Select an available browser voice before preview" toolbox/messages/messages.js` returned no matches.
- PASS: `rg -n "Speech preview|speech preview|previewing|browser preview|speechPreview" toolbox/messages/messages.js` returned no matches.
- PASS: `git diff --check -- toolbox/messages/messages.js tests/playwright/tools/MessagesTool.spec.mjs tests/tools/MessagesPlaybackSource.test.mjs`
- BLOCKED: `npx playwright test tests/playwright/tools/MessagesTool.spec.mjs --project=playwright` could not launch because Chromium is missing at `C:\Users\davidq\AppData\Local\ms-playwright\chromium-1217\chrome-win64\chrome.exe`.
- BLOCKED: Fallback `npm run test:workspace-v2` reached the same missing Chromium blocker after completing static/preflight report generation.

## Manual Validation Notes
- Reviewed `browserVoiceForProfile`: it returns a matched browser voice when available, otherwise `null` so Browser Speech can use its default voice.
- Reviewed `speechItemFromSegment`: child Sentence Play still inherits the selected parent Message TTS Profile.
- Reviewed runtime copy: Messages playback no longer presents preview-status wording from `messages.js`.
- Added a Node static test to block the preview voice error text from returning to `toolbox/messages/messages.js`.
- Browser-backed manual execution was not possible in this environment because the required Playwright Chromium binary is not installed.

## Changed Files
- docs_build/dev/reports/PR_26174_BRAVO_019-remove-preview-dependency-from-messages-play.md
- docs_build/dev/reports/codex_review.diff
- docs_build/dev/reports/codex_changed_files.txt
- tests/playwright/tools/MessagesTool.spec.mjs
- tests/tools/MessagesPlaybackSource.test.mjs
- toolbox/messages/messages.js

## Artifact
- tmp/PR_26174_BRAVO_019-remove-preview-dependency-from-messages-play_delta.zip
