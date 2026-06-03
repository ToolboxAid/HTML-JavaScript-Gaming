# PR_26130_028-text-to-speech-v2-empty-array-save-fix

## Summary
- Removed the Text to Speech V2 root array `minItems: 1` schema requirement so zero named speech items is a valid payload.
- Updated Text to Speech V2 load/import/delete behavior so validated `[]` renders as a safe empty state without selecting a missing item or fabricating defaults.
- Allowed Name input to act as draft Add input when no item is selected, without logging the no-selection name update failure.
- Kept Add blocked with a visible failure when Name is empty.
- Preserved schema-gated workspace dirty/write-back behavior while allowing `[]` to return to Workspace Manager V2 and save into `game.manifest.json`.

## Playwright Coverage
- Typing Name with no selected item does not log `FAIL Text to Speech V2 name update failed: no named speech item is selected.`
- Add still requires a populated Name.
- Deleting the last named speech item produces a valid empty array state.
- Text to Speech V2 schema validation accepts an empty root array.
- Workspace return writes `[]` into the active Workspace Manager V2 manifest/toolState payload.
- Workspace Manager Save persists `root.tools.text2speech-V2: []` into `game.manifest.json`.
- Relaunching Text to Speech V2 from workspace with `[]` shows the safe empty state.

## Scope Notes
- Scope was limited to Text to Speech V2, its schema, and direct Workspace Manager V2 integration coverage.
- No unrelated tool schemas were changed.
- No start_of_day changes.
- No built-in default speech items were introduced.

## Validation
- Passed: `npm run test:workspace-v2`
- Result: 36 passed.
- Playwright V8 coverage updated for changed runtime JS:
  - `(90%) tools/text2speech-V2/js/TextToSpeechToolApp.js - executed lines 807/807; executed functions 62/69`

## Skipped
- Full samples smoke test was not run. Reason: this PR is limited to Text to Speech V2 empty-array save/load behavior and direct Workspace Manager V2 integration; the requested `npm run test:workspace-v2` suite covers the scoped behavior.

## Artifacts
- Diff report: `docs_build/dev/reports/codex_review.diff`
- Changed files report: `docs_build/dev/reports/codex_changed_files.txt`
- Delta ZIP: `tmp/PR_26130_028-text-to-speech-v2-empty-array-save-fix_delta.zip`
