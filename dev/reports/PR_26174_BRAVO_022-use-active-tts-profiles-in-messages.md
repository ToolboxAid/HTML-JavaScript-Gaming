# PR_26174_BRAVO_022-use-active-tts-profiles-in-messages

## Branch Validation
PASS - Current branch is `team/BRAVO/messages`; main was not checked out, merged, or targeted.

## Summary
- Added a shared Text To Speech profile store/contract helper for active saved TTS profiles.
- Text To Speech now persists its own profile/emotion model for sibling tools.
- Messages now loads saved TTS profiles, syncs profile/emotion names to Local API-owned keys, filters Sentence emotions by selected parent profile, and keeps playback off Text To Speech Local Preview validation.
- Removed the dev-runtime import of the browser Text To Speech UI module and removed separate Message Studio default TTS profile builders.

## Requirement Checklist
PASS - /toolbox/messages/ loads active saved TTS Profiles from /toolbox/text-to-speech/ via `tts-profile-store.js`.
PASS - Parent Message TTS Profile dropdown is populated from saved active TTS profiles.
PASS - Child Sentence Emotion dropdown is populated only from the selected parent profile's saved emotions.
PASS - Parent Play remains in Message row Actions and resolves ordered Sentences through the selected parent profile.
PASS - Child Play remains in Sentence row Actions and resolves only that Sentence through the parent profile.
PASS - Messages playback does not call Text To Speech Local Preview validation and `toolbox/messages/messages.js` contains no `before preview` text.
PASS - Browser UI module imports were removed from `src/dev-runtime/messages/messages-postgres-service.mjs`.
PASS - Separate Message Studio default TTS profile builders were removed.
PASS - No inline styles, inline scripts, style blocks, or inline handlers were added.
PASS - Local API owns authoritative database keys; Messages syncs saved names to server-created TTS/emotion keys.
PASS - Creator-safe guidance is used for Messages TTS profile load failures.

## Validation Lane Report
PASS - `node --check toolbox/messages/messages.js`.
PASS - `node --check toolbox/text-to-speech/text2speech.js`.
PASS - `node --check toolbox/text-to-speech/tts-profile-store.js`.
PASS - `node --check src/dev-runtime/messages/messages-postgres-service.mjs`.
PASS - `node --test tests/tools/Text2SpeechShell.test.mjs`.
PASS - `node --test tests/tools/MessagesPlaybackSource.test.mjs`.
PASS - `node --test tests/dev-runtime/MessagesPublishValidation.test.mjs`.
PASS - `node --test --test-name-pattern "Messages Local API" tests/dev-runtime/DbSeedIntegrity.test.mjs`.
BLOCKED - `npx playwright test tests/playwright/tools/MessagesTool.spec.mjs tests/playwright/tools/TextToSpeechFunctional.spec.mjs` could not launch because Chromium is not installed at `C:\Users\davidq\AppData\Local\ms-playwright\chromium-1217\chrome-win64\chrome.exe`.
BLOCKED - Fallback `npm run test:workspace-v2` completed static preflight report generation, then hit the same missing Chromium executable.
KNOWN - Full `tests/dev-runtime/DbSeedIntegrity.test.mjs` still has unrelated Local DB snapshot failures in non-Messages cases.

## Manual Validation Notes
- Browser manual validation was not completed because Playwright Chromium is missing in this environment.
- Added Playwright coverage for creating/editing a TTS Profile in Text To Speech, opening Messages on the same origin, confirming the saved profile appears, confirming Sentence emotions are profile-filtered, and exercising Parent/Child Play.
- Static grep confirmed Messages no longer contains `Select an available browser voice before preview` or `before preview` wording.

## Branch Status
- Branch: `team/BRAVO/messages`
- Latest commit: `c45328678`
- Ahead of main: 2
- Behind main: 0
- Existing unrelated local edit excluded from PR package: `.gitignore`.

## ZIP
- Expected ZIP: `tmp/PR_26174_BRAVO_022-use-active-tts-profiles-in-messages_delta.zip`
