# PR_26130_019-text-to-speech-v2-schema-and-tool-json-nav

## Summary

- Converted the Text to Speech V2 schema contract to a root array of named speech items only.
- Updated Text to Speech V2 defaults, load validation, workspace write-back, and standalone Import JSON / Copy JSON / Export JSON actions to use the root array payload.
- Added template-style standalone/workspace nav behavior: standalone shows JSON actions; workspace launch shows Return to Workspace and preserves `hostContextId`.
- Removed planned roadmap cards from `tools/index.html` for Browser Speech Backend, eSpeak NG WASM Backend, Queue-Based Speech Playback, Offline / Local Speech Support, and Raspberry Pi Speech Deployment.
- Kept unrelated tool schemas unchanged; only `tools/schemas/tools/text2speach-V2.schema.json` was updated.

## Scope Notes

- Runtime-only Text to Speech V2 UI state such as selected item, status, and queued runtime speaker details remains in the UI summary only and is not copied/exported/saved as the schema payload.
- Workspace Manager V2 runtime glue was updated only where required to keep Text to Speech V2 array payloads hydrated, refreshed, summarized, and saved.
- Workspace Manager schema contracts were not changed.

## Validation

- `npm run test:workspace-v2` passed: 31 tests passed.
- Full samples smoke test skipped: this PR is limited to Text to Speech V2 schema/tool JSON navigation and `tools/index.html` planned-section cleanup; it does not modify broad sample launch/runtime paths.

## Artifacts

- `docs/dev/reports/codex_review.diff`
- `docs/dev/reports/codex_changed_files.txt`
- `tmp/PR_26130_019-text-to-speech-v2-schema-and-tool-json-nav_delta.zip`
