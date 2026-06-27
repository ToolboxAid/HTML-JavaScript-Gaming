# PR_26171_010-message-speech-preview

## Branch Validation

- Branch: `pr/PR_26171_010-message-speech-preview`
- Source: clean `main` after PR_26171_008 merge and push.
- Status: PASS for branch setup and scoped implementation.

## Requirement Checklist

- PASS: Added a Theme V2 Speech Preview section to the Messages tool.
- PASS: Added selected full-message preview.
- PASS: Added selected ordered active-segment preview.
- PASS: Preview uses selected/default active TTS Profile settings for language and voice.
- PASS: Segment preview uses each segment's Emotion Profile settings for volume, pitch, and rate.
- PASS: Browser-local preview uses `speechSynthesis` and `SpeechSynthesisUtterance` when available.
- PASS: Missing browser speech support shows a visible actionable diagnostic.
- PASS: Stop Preview calls `speechSynthesis.cancel()` and updates status.
- PASS: Preview logic lives in external `toolbox/messages/messages.js`.
- PASS: Playwright stubs browser speech synthesis and validates preview payloads without real audio output.
- PASS: No server-side TTS generation, audio file generation, audio persistence, AI voices, voice adapters, runtime playback API, dialog trees, localization, translation, game runtime integration, or preview history storage was added.
- PASS: No new API/DB persistence was added.
- PASS: No inline styles, style blocks, inline scripts, or inline event handlers were introduced.
- FAIL: Required `npm run test:workspace-v2` lane failed in existing `RootToolsFutureState.spec.mjs` coverage outside the Messages speech preview scope.

## Validation Lane Report

- PASS: `node --check toolbox/messages/messages.js`
- PASS: `node --check tests/playwright/tools/MessagesTool.spec.mjs`
- PASS: `npx playwright test tests/playwright/tools/MessagesTool.spec.mjs --project=playwright --workers=1 --reporter=list`
- PASS: Validated preview selected message payload with stubbed speech synthesis.
- PASS: Validated preview active ordered segment payloads with emotion profile settings.
- PASS: Validated Stop Preview cancel behavior.
- PASS: Validated unavailable speech synthesis diagnostic.
- PASS: `git diff --check` on touched files.
- FAIL: `npm run test:workspace-v2`

## Workspace-V2 Failure Summary

`npm run test:workspace-v2` failed in `tests/playwright/tools/RootToolsFutureState.spec.mjs`:

- Toolbox accordion `.control-card` count was `0`.
- Header alphabetical expectation failed around `Game Hub` and `Game Journey`.
- Non-Messages pages reported failed requests to session, platform banner, registry, and toolbox constants APIs.

These failures were already present for the batch and are outside PR_010's browser-local Messages speech preview scope.

## Manual Validation Notes

- Selected message preview reports a preview request and produces one stubbed utterance.
- Active ordered segment preview reports a preview request and produces ordered stubbed utterances.
- Segment utterances use the segment emotion profile's volume, pitch, and rate.
- Stop Preview reports stopped status and calls cancel.
- Missing browser speech synthesis shows an actionable diagnostic.
- No audio is generated or persisted.

## Samples Decision

- Full samples smoke was not run because samples are out of scope for browser-local Messages speech preview.
