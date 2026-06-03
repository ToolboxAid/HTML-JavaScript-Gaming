# PR_26130_025-text-to-speech-v2-deep-rename-and-accordion-state

## Scope

Updated Text to Speech V2 and direct Workspace Manager/tool references for the canonical `text2speech-V2` spelling, playback gating, scroll behavior, last-item delete behavior, and accordion height behavior.

## Changes

- Renamed Text to Speech V2 direct code, CSS, DOM ids, test selectors, tool ids, schema ids, logs, sample wiring, and workspace/tool references from `text2speach` to `text2speech`.
- Added explicit legacy compatibility for the old `text2speach-V2` tool path, schema path, sample JSON path, workspace toolState key, and tool id alias so existing links/session state migrate visibly instead of silently failing.
- Disabled Speak, Pause, Resume, and Stop until a valid named speech item is selected and text/voice options are present.
- Added internal scrolling for Output Summary content and summary pre blocks.
- Allowed deleting the last Named Sentence, leaves a safe empty runtime state, and blocks copy/export/save through schema validation until a new schema-valid item is added.
- Centered Add, Duplicate, and Delete actions.
- Updated Text to Speech V2 accordions so open accordions share available vertical space and closed accordions collapse in normal and fullscreen modes.
- Kept Workspace Manager V2 Text to Speech tile availability based on normal repo/game selection and selected-game launch purpose.

## Legacy Migration Notes

Preserved compatibility only for required direct Text to Speech V2 references:

- `/toolbox/text2speach-V2/index.html` redirects to `/toolbox/text2speech-V2/index.html` while preserving query string and hash.
- `/toolbox/schemas/tools/text2speach-V2.schema.json` remains as an alias file whose `$id` points to `toolbox/schemas/tools/text2speech-V2.schema.json`.
- `/samples/phase-19/1903/sample.1903.text2speach-V2.json` remains as an alias payload matching the canonical `sample.1903.text2speech-V2.json`.
- `workspace.tools.text2speach-V2` session state migrates to `workspace.tools.text2speech-V2` with a status log entry.
- `root.tools.text2speach-V2` workspace payloads migrate to `root.tools.text2speech-V2` during Workspace Manager context normalization and report the migration in status.
- Tool registry alias maps `text2speach-V2` to `text2speech-V2`.

## Validation

- `node --check toolbox/text2speech-V2/js/TextToSpeechToolApp.js` passed.
- `node --check toolbox/workspace-manager-v2/js/services/WorkspaceManagerV2ContextService.js` passed.
- `node --check toolbox/toolRegistry.js` passed.
- `node --check tests/playwright/tools/WorkspaceManagerV2.spec.mjs` passed.
- `npm run test:workspace-v2` passed: 35 tests passed.
- `git diff --check` passed with line-ending normalization warnings only.

## Skipped

- Full samples smoke test skipped because the BUILD request explicitly said not to run it.
