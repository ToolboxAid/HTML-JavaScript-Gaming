# PR_26130_020-text-to-speech-v2-sample-json-source

## Summary

- Updated Text to Speech V2 so it no longer fabricates built-in named speech items on empty launch.
- Added explicit load paths for URL JSON, workspace/session payload, and Import JSON only.
- Updated Workspace Manager V2 default/current manifest data so `root.tools.text2speach-V2` is a root array of named speech items.
- Added a phase 19 Text to Speech V2 sample JSON source using the root-array schema contract.
- Kept Text to Speech V2 schema shape unchanged from the prior root-array contract and avoided root queue wrappers or duplicated root fields.

## Implementation Notes

- `tools/text2speach-V2/js/TextToSpeechToolApp.js` now shows a safe empty/actionable state when no JSON source is provided instead of creating default speech items.
- URL-provided sample JSON is loaded through `samplePresetPath`, validated before render, and logged as the active preset source.
- Workspace/session payload loading remains schema-validated and rejects invalid payloads before partial render.
- `tools/workspace-manager-v2/js/services/WorkspaceManagerV2ContextService.js` only provides Text to Speech V2 session data when a real array payload exists.
- `games/Asteroids/game.manifest.json`, `games/GravityWell/game.manifest.json`, and `games/pong/game.manifest.json` now store `tools.text2speach-V2` as a root array.
- `samples/phase-19/1903/sample.1903.text2speach-V2.json` contains the prepopulated named speech items as the selected sample source.
- `tests/runtime/SampleStandaloneToolDataFlow.test.mjs` now recognizes the Text to Speech V2 sample as a tool-specific root-array contract instead of requiring the older wrapper JSON contract.

## Validation

- Passed: `npm run test:workspace-v2`
  - Result: 32 passed.
- Passed: `node --check tests/runtime/SampleStandaloneToolDataFlow.test.mjs`
- Passed: `git diff --check`
  - Note: Git printed line-ending normalization warnings for existing CRLF/LF handling, but no whitespace errors were reported.

## Skipped

- Full samples smoke test was not run. The BUILD request explicitly said not to run the full samples smoke test; this PR is scoped to Workspace Manager V2/Text to Speech V2 manifest loading, one sample JSON source, and focused Playwright coverage.

## Scope Guard

- No `start_of_day` files changed.
- No unrelated tool schemas were changed.
- No root queue wrapper or duplicated Text to Speech V2 root fields were reintroduced.
