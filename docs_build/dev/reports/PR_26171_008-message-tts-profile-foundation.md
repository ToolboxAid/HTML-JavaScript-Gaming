# PR_26171_008-message-tts-profile-foundation

## Branch Validation

- Branch: `pr/PR_26171_008-message-tts-profile-foundation`
- Source: clean `main` after PR_26171_006 merge and push.
- Status: PASS for branch setup and scoped implementation.

## Requirement Checklist

- PASS: Added `messages_tts_profiles` persistence under the grouped `messages` ownership area.
- PASS: Added Local API contracts for list, get, create, and update TTS profiles.
- PASS: Added server-seeded `Browser Speech Default` and `Narration Preview` TTS profiles.
- PASS: TTS profile fields include Name, Description, Provider Key, Voice Name, Language, Volume, Pitch, Rate, and Active/Inactive.
- PASS: Added Theme V2 TTS Profiles management section to the Messages tool.
- PASS: TTS profiles are configuration records only.
- PASS: No speech preview, synthesis, audio playback, audio generation, voice adapters, runtime playback, delete endpoint, dialog trees, localization, translation, or AI voices were added.
- PASS: Browser uses Local API contracts only and does not generate authoritative keys.
- PASS: SQLite service generates keys and audit fields.
- PASS: Missing TTS Name, Provider Key, or Language fails visibly in the UI and actionably in the API.
- PASS: No inline styles, style blocks, inline scripts, or inline event handlers were introduced.
- FAIL: Required `npm run test:workspace-v2` lane failed in existing `RootToolsFutureState.spec.mjs` coverage outside the Messages/TTS scope.

## Validation Lane Report

- PASS: `node --check src/dev-runtime/messages/messages-sqlite-service.mjs`
- PASS: `node --check toolbox/messages/messages-api-client.js`
- PASS: `node --check toolbox/messages/messages.js`
- PASS: `node --check tests/playwright/tools/MessagesTool.spec.mjs`
- PASS: Direct SQLite/API validation for TTS seed, create, update, and restart persistence.
- PASS: `npx playwright test tests/playwright/tools/MessagesTool.spec.mjs --project=playwright --workers=1 --reporter=list`
- PASS: `git diff --check` on touched files.
- FAIL: `npm run test:workspace-v2`

## Workspace-V2 Failure Summary

`npm run test:workspace-v2` failed in `tests/playwright/tools/RootToolsFutureState.spec.mjs`:

- Toolbox accordion `.control-card` count was `0`.
- Header alphabetical expectation failed around `Game Hub` and `Game Journey`.
- Non-Messages pages reported failed requests to session, platform banner, registry, and toolbox constants APIs.

These failures were already present for the batch and are outside PR_008's Messages TTS profile scope.

## Manual Validation Notes

- Confirmed seeded TTS profiles appear in the Messages UI.
- Confirmed a custom TTS profile can be created.
- Confirmed a custom TTS profile can be edited, disabled, and re-enabled.
- Confirmed Local API returns TTS profile list/get payloads with server-owned ULIDs and audit fields.
- Confirmed SQLite restart persistence for the custom TTS profile.
- Confirmed no speech preview or audio playback occurs in this PR.

## Samples Decision

- Full samples smoke was not run because samples are out of scope for Messages TTS profile configuration.
