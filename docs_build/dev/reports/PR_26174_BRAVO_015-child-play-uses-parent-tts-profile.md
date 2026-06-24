# PR_26174_BRAVO_015-child-play-uses-parent-tts-profile

## Branch Validation
- PASS: Current branch is `team/BRAVO/messages`.
- PASS: Continued on the existing Bravo branch; no merge and no return to main.

## Purpose
- PASS: Scoped to Messages playback resolving child Sentence Play through the parent Message TTS Profile.

## Requirement Checklist
- PASS: Parent Message owns the selected TTS Profile; playback items resolve `message.voiceProfileKey` before speaking.
- PASS: Child Sentence owns only Text and Emotion in the Messages UI; voice/profile settings remain outside sentence rows.
- PASS: Child Sentence Play resolves Sentence -> Parent Message -> TTS Profile -> Profile Voice -> Sentence Emotion -> Profile Emotion Settings.
- PASS: Parent Message Play resolves Message -> TTS Profile -> ordered Sentences -> Profile Voice and each Sentence Emotion.
- PASS: Messages playback does not use Local Preview voice selection or the Text To Speech preview workflow.
- PASS: The old Messages playback failure `Select an available browser voice before preview.` is not present in `toolbox/messages` and is covered by negative Playwright assertions.
- PASS: Missing TTS Profile, missing profile voice, missing sentence emotion, and profile/emotion mismatch use Creator-safe guidance.
- PASS: Text To Speech remains the owner of profile voice and emotion slider settings.
- PASS: No inline styles, inline scripts, inline handlers, style blocks, or page-local CSS were added.
- PASS: No browser-owned authoritative product data or browser-generated authoritative database keys were added.

## Validation Lane Report
- PASS: `node --check toolbox/messages/messages.js`
- PASS: `node --check tests/playwright/tools/MessagesTool.spec.mjs`
- PASS: `rg --pcre2 -n "<style|style=| on[a-z]+\\s*=|<script(?![^>]*\\bsrc=)" toolbox/messages/index.html toolbox/messages/messages.js tests/playwright/tools/MessagesTool.spec.mjs` returned no matches.
- PASS: `rg --pcre2 -n "localStorage|sessionStorage|imageDataUrl" toolbox/messages/index.html toolbox/messages/messages.js tests/playwright/tools/MessagesTool.spec.mjs` returned no matches.
- PASS: `rg -n "Select an available browser voice before preview|Local Preview|Text To Speak" toolbox/messages` returned no matches.
- PASS: `git diff --check -- toolbox/messages/messages.js tests/playwright/tools/MessagesTool.spec.mjs`
- BLOCKED: `npx playwright test tests/playwright/tools/MessagesTool.spec.mjs --project=playwright` could not launch because Chromium is missing at `C:\Users\davidq\AppData\Local\ms-playwright\chromium-1217\chrome-win64\chrome.exe`.
- BLOCKED: Fallback `npm run test:workspace-v2` reached the same missing Chromium blocker after completing the static/preflight report generation.

## Manual Validation Notes
- Reviewed `speechItemFromSegment`: child Sentence Play now derives the profile key from the parent Message and does not use any sentence/local preview voice value.
- Reviewed `speakQueue`: profile voice and profile emotion settings are applied before `speechSynthesis.speak`.
- Updated Playwright coverage to select the Hero TTS Profile, assert child Sentence Play speaks only one sentence with `Browser hero`, assert parent Message Play speaks all ordered sentences with `Browser hero`, and assert the old preview failure does not appear from Messages playback.
- Browser-backed manual execution was not possible in this environment because the required Playwright Chromium binary is not installed.

## Changed Files
- docs_build/dev/reports/PR_26174_BRAVO_015-child-play-uses-parent-tts-profile.md
- docs_build/dev/reports/codex_review.diff
- docs_build/dev/reports/codex_changed_files.txt
- tests/playwright/tools/MessagesTool.spec.mjs
- toolbox/messages/messages.js

## Artifact
- tmp/PR_26174_BRAVO_015-child-play-uses-parent-tts-profile_delta.zip
