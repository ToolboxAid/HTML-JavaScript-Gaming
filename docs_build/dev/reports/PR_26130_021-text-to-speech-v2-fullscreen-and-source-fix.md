# PR_26130_021-text-to-speech-v2-fullscreen-and-source-fix

## Summary

- Added Text to Speech V2 fullscreen-style workspace behavior for Hide Header and Details.
- Kept left and right columns pinned to the sides while the center work column fills the remaining horizontal space.
- Rejected stale Text to Speech V2 object/queue payloads before render or import, including stale session/local runtime state.
- Updated Workspace Manager V2 launch integration so `text2speach-V2` session hydration requires a root array payload and launch logs the exact manifest array source.
- Kept Output Summary limited to the active validated root array payload.
- Confirmed sample phase 19 item 1903 loads `samples/phase-19/1903/sample.1903.text2speach-V2.json`.

## Implementation Notes

- `toolbox/text2speach-V2/js/controls/TextToSpeechShellControl.js` owns the Text to Speech V2 fullscreen shell state, body classes, summary metadata, and fullscreen toggle behavior.
- `toolbox/text2speach-V2/index.html` and `toolbox/text2speach-V2/styles/text2speach-V2.css` now use the common fullscreen layout classes with Text to Speech V2-specific sizing.
- `toolbox/text2speach-V2/js/TextToSpeechToolApp.js` rejects stale object payloads containing `queue`, runtime selection/status fields, duplicated option fields, or root `text` before schema validation/render.
- Text to Speech V2 Output Summary now renders only `queueControl.selectedQueue()`, so runtime status, selected item, and queued speech state are not shown as persisted payload.
- `toolbox/workspace-manager-v2/js/services/WorkspaceManagerV2ContextService.js` rejects stale `workspace.tools.text2speach-V2` session data unless `session.data` is an array.
- `toolbox/workspace-manager-v2/js/WorkspaceManagerV2App.js` logs the exact Text to Speech V2 launch source as `root.tools.text2speach-V2` array data before navigation.
- Current Workspace Manager V2 game manifests keep `game.workspace.tools.text2speach-V2` as root arrays of named speech items.

## Validation

- Passed: `npm run test:workspace-v2`
  - Result: 33 passed.
- Passed: targeted Playwright rerun for Text to Speech V2 URL JSON/fullscreen coverage after layout adjustment.
- Passed: `git diff --check`
  - Note: Git printed line-ending normalization warnings for several existing Windows-touched files, but no whitespace errors were reported.
- Passed: JavaScript syntax checks for changed Text to Speech V2, Workspace Manager V2, and Playwright files.
- Passed: JSON parse/root-array checks for the updated game manifests and sample 1903 JSON.

## Notes

- The first full `npm run test:workspace-v2` attempt timed out at the command timeout limit before useful output. It was rerun with a longer timeout and passed.
- During development, one fullscreen assertion caught the right column expanding too wide; the fullscreen grid constraints were tightened and the focused Playwright test passed before the full suite rerun.

## Skipped

- Full samples smoke test was not run. The BUILD request explicitly said not to run the full samples smoke test; this PR is scoped to Text to Speech V2 fullscreen/source behavior, sample 1903 loading, and Workspace Manager V2 launch integration.

## Scope Guard

- No `start_of_day` files changed.
- No unrelated schemas were changed.
- No unrelated tools were changed.
- No old Text to Speech V2 root object/queue wrapper was reintroduced.
