# PR_26171_016-message-studio-speech-test-and-tts-service-picker

## Branch Validation

PASS - Work was implemented on `pr/26171-016-message-studio-speech-test-and-tts-service-picker` after starting from `main`.

## Summary

Message Studio now exposes a TTS Service picker and guarded Test Speech action. The picker is sourced from the existing browser-safe `TextToSpeechEngine` path, and speech tests run only through browser `SpeechSynthesis` when that engine is available. No external provider calls, API keys, AI voice generation, audio generation, or new database persistence were added.

## Prior Text To Speech Search

- PASS - `src/engine/audio/TextToSpeechEngine.js` exists and still provides the browser-safe speech engine path.
- PASS - `src/engine/audio/TextToSpeechDefaults.js` exists and still defines Text to Speech V2 defaults.
- PASS - `toolbox/text-to-speech/index.html` exists as a public Voice Output placeholder/wireframe.
- PASS - `toolbox/tts/` does not exist.
- PASS - Active `toolbox/text2speech-V2/` is not present.
- PASS - The older full Text to Speech V2 implementation is archived under `archive/v1-v2/tools/old_text2speech-V2/`.
- PASS - Shared Text to Speech contracts/schemas still exist under `src/shared/contracts/tools/textToSpeechContract.js` and `src/shared/schemas/tools/text2speech-V2.schema.json`.

## Requirement Checklist

- PASS - Searched the requested TTS locations and broader speech/TTS references.
- PASS - Added a TTS Service dropdown to Message Studio.
- PASS - Service options come from `TextToSpeechEngine` through `toolbox/messages/message-tts-service-registry.js`.
- PASS - Added unavailable/disabled service state when browser speech synthesis is unavailable.
- PASS - Added a Test Speech button for the selected Message Row or selected Segment Row.
- PASS - Button remains disabled until a service, message or segment, emotion profile, active TTS profile, and voice are available.
- PASS - Test Speech uses browser-local speech only through the existing engine.
- PASS - No external provider calls, AI voice generation, API keys, or generated audio were introduced.
- PASS - No new SQLite persistence, SQLite DDL, SQLite seed data, or SQLite service was introduced.
- PASS - Existing SQLite references remain test/dev technical debt only; the report documents Postgres as authoritative direction.

## Impacted Lane

Message Studio Theme V2 tool, existing browser-safe TTS engine integration, and targeted Message Studio Playwright coverage.

## Validation Summary

- PASS - `node --check toolbox/messages/message-tts-service-registry.js`
- PASS - `node --check toolbox/messages/messages.js`
- PASS - `node --check tests/playwright/tools/MessagesTool.spec.mjs`
- PASS - `node --check src/engine/audio/TextToSpeechEngine.js`
- PASS - `npx playwright test tests/playwright/tools/MessagesTool.spec.mjs --workers=1 --reporter=list`
- PASS - External provider/API-key scan returned no Message Studio matches.
- PASS - `git diff --check`
- FAIL - `npm run test:workspace-v2` failed in existing `RootToolsFutureState.spec.mjs` coverage outside this PR scope.

## Workspace V2 Failure Details

The required `npm run test:workspace-v2` command failed with five failures:

- `root tools surface links current tool pages without old_* routes`: expected toolbox accordion cards, received zero.
- `common header renders primary navigation order across active pages`: existing Game Journey/Game Hub alphabetical expectation mismatch.
- `learn wireframe pages load with shared Theme V2 structure`: unrelated failed requests for `/api/session/current` and `/api/platform-settings/banner`.
- `tool template future-state page loads from root Theme V2 paths`: unrelated failed requests for `/api/session/current`, `/api/toolbox/registry/snapshot`, and `/api/platform-settings/banner`.
- `representative active tool pages align center cleanup and registry group colors`: unrelated failed requests for toolbox constants, registry snapshot, session, and banner endpoints.

These failures were not introduced by the Message Studio speech test picker changes and were not fixed because they are outside this PR scope.

## Database Direction

Postgres remains authoritative. This PR did not add SQLite persistence or new SQLite runtime behavior. The existing Message Studio Playwright harness still uses the legacy dev SQLite adapter and is documented as technical debt only.

## Samples Decision

SKIPPED - Full samples validation was not run because samples are outside the Message Studio speech test and TTS service picker scope.
