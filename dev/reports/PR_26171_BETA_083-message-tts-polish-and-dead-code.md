# PR_26171_BETA_083-message-tts-polish-and-dead-code

## Summary
- Team: Bravo
- Scope: Message Studio and TTS Studio polish after parent/child table and playback integration.
- Branch: pr/26171-BETA-083-message-tts-polish-and-dead-code
- Instruction compliance: PASS

## Ownership Confirmation
- Bravo owns Message Studio work.
- Bravo owns TTS Studio and TextToSpeechEngine integration work.
- Message Studio owns message text, ordered message parts, Emotion selection, and TTS Profile selection.
- TTS Studio owns profiles, voices, language, per-profile emotion settings, Delivery, and Presets.
- src/engine/audio owns playback.

## Changes
- Removed dead Message Studio speech-test controls and unused selection code.
- Replaced Message Studio speech-test status with playback readiness/status.
- Kept Message Studio playback controls visible and clarified Stop as Stop Playback.
- Updated Message parent and part table labels to be more creator-friendly.
- Added explicit missing TTS Profile and missing Emotion Setting validation coverage.
- Clarified TTS Profile table and Emotion Settings table labels.
- Clarified that TTS presets belong to Emotion Settings as Delivery Preset.

## Architecture Notes
- Theme V2 only.
- External JavaScript only.
- No inline styles, style blocks, inline handlers, page-local CSS, or tool-local CSS were added.
- No database changes.
- No separate Emotion Studio was added.
- Browser-owned product data was not introduced as a source of truth.
- Silent fallback for an explicitly stale TTS Profile selection was removed.

## Validation Summary
- PASS: node --check toolbox/messages/messages.js
- PASS: node --check toolbox/text-to-speech/text2speech.js
- PASS: node --check tests/playwright/tools/MessagesTool.spec.mjs
- PASS: node --check tests/playwright/tools/TextToSpeechFunctional.spec.mjs
- PASS: npx playwright test tests/playwright/tools/TextToSpeechFunctional.spec.mjs --reporter=list
- PASS: npx playwright test tests/playwright/tools/MessagesTool.spec.mjs --reporter=list
- PASS: npm run test:workspace-v2

## Notes
- The first parallel Message Studio Playwright run timed out during report contention; the targeted Message Studio rerun passed by itself.
- npm run test:workspace-v2 is a legacy command name; user-facing language remains Project Workspace.
