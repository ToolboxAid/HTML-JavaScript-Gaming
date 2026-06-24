# PR_26174_BRAVO_017-message-play-profile-resolution

## Branch Validation
- PASS: Current branch is `team/BRAVO/messages`.
- PASS: Continued on the existing Bravo branch; no merge and no return to main.

## Purpose
- PASS: Scoped to Messages playback profile resolution and diagnostics.

## Requirement Checklist
- PASS: Parent Message Play still exists in the parent row Actions area.
- PASS: Child Sentence Play still exists in child row Actions.
- PASS: Parent Play resolves the selected parent TTS Profile before speaking ordered Sentences.
- PASS: Child Play resolves Sentence -> Parent Message -> selected TTS Profile before speaking only that Sentence.
- PASS: Message playback does not read Local Preview voice selection, preview voice dropdown, or preview voice state.
- PASS: Message playback resolves Voice from the selected TTS Profile voice field.
- PASS: Playback diagnostics display Profile, Gender, Voice, Language, and Age Filter.
- PASS: Missing gender or age-filter metadata is displayed with Creator-safe `Any` defaults rather than exposing implementation details.
- PASS: The old `Select an available browser voice before preview.` message is absent from the Messages runtime and covered by negative Playwright assertions.
- PASS: Text To Speech remains the owner of profile voice/filter/audio settings; Messages only reads the selected profile for playback.
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
- BLOCKED: `npx playwright install chromium` was attempted once and timed out after three minutes without producing the required Chromium executable. The timed-out installer helper processes were stopped; the existing local API process was left running.
- BLOCKED: Fallback `npm run test:workspace-v2` reached the same missing Chromium blocker after completing static/preflight report generation.

## Manual Validation Notes
- Reviewed `speechItemFromSegment`: child playback continues to derive `profileKey` from the parent message, not from sentence-owned voice data or preview state.
- Reviewed `browserVoiceForProfile`: Messages playback uses the selected profile voice name and never calls the Text To Speech Local Preview voice selector.
- Reviewed new diagnostics: the status log now persists `Playing:`, `Profile:`, `Gender:`, `Voice:`, `Language:`, and `Age Filter:` for playback.
- Updated Playwright assertions to verify the Hero profile diagnostics for both child Sentence Play and parent Message Play, and to keep guarding against the old preview voice error.
- Browser-backed manual execution was not possible in this environment because the required Playwright Chromium binary is not installed.

## Changed Files
- docs_build/dev/reports/PR_26174_BRAVO_017-message-play-profile-resolution.md
- docs_build/dev/reports/codex_review.diff
- docs_build/dev/reports/codex_changed_files.txt
- tests/playwright/tools/MessagesTool.spec.mjs
- toolbox/messages/messages.js

## Artifact
- tmp/PR_26174_BRAVO_017-message-play-profile-resolution_delta.zip
