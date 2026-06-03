# PR_26130_008-text2speach-v2-schema-queue

## Summary

- Renamed the prior tool-facing speech surface to the exact name `text2speach-V2`.
- Renamed the tool folder, stylesheet, registry entry, Workspace Manager V2 launch entry, labels, logs, CSS classes, DOM ids, Playwright selectors, and toolState ids.
- Preserved the existing text-to-speech defaults, speaking queue action, Workspace Manager V2 launch behavior, Preview Generator V2 Repo Destination hiding, and shared audio engine location under `src/engine/audio/`.

## Scope

Changed only the text2speach-V2 naming pass and the existing Workspace Manager V2 / Preview Generator V2 coverage surface from the prior speech baseline.

No `start_of_day` files were modified.

No `toolbox/shared` dependency was added.

No inline script/style/event handlers were added.

`src/engine/audio/` was not renamed or restructured. Its existing modules remain in place; only tool-facing default text/id strings were updated.

## Naming Coverage

Updated tool-facing naming in:

- Tool registry id, display name, folder path, entry point, and README path.
- Tools index utility grouping.
- Workspace Manager V2 launchable tool id/name/path.
- Workspace Manager V2 tile details.
- Tool folder and stylesheet path: `toolbox/text2speach-V2/`.
- HTML title, `data-tool-id`, header label, CSS classes, DOM ids, and status log id.
- Browser status logs: `text2speach-V2 ready` / `text2speach-V2 unavailable`.
- Playwright helper names, route URLs, selectors, expected labels, status logs, and sessionStorage toolState key assertions.
- ToolState id/session key: `workspace.tools.text2speach-V2`.

Schema/session metadata now carries `toolId: "text2speach-V2"` for Workspace Manager V2 launch-context schema sessions. No new tool payload schema was introduced in this naming-only update.

## Validation

- `node --check tests/playwright/tools/WorkspaceManagerV2.spec.mjs`
- `node --check toolbox/text2speach-V2/js/bootstrap.js`
- `node --check toolbox/text2speach-V2/js/TextToSpeechToolApp.js`
- `node --check src/engine/audio/TextToSpeechDefaults.js`
- `node --check src/engine/audio/TextToSpeechEngine.js`
- `node --check toolbox/workspace-manager-v2/js/services/WorkspaceManagerV2ContextService.js`
- `npm run test:workspace-v2`: 25 passed
- Inline/dependency guard grep: no matches for inline scripts/styles/event handlers, `toolbox/shared`, `imageDataUrl`, or `start_of_day` in touched implementation/test paths
- `git diff --check`: passed

Full samples smoke test was skipped because this PR is scoped to text2speach-V2 naming, Workspace Manager V2 launch coverage, and existing speech queue behavior, not broad sample runtime behavior.

## Playwright Coverage

Playwright impacted: Yes.

Validated behavior:

- Direct `text2speach-V2` launch uses `/toolbox/text2speach-V2/index.html`.
- The first-class tool surface exposes `data-tool-id="text2speach-V2"` and heading text `text2speach-V2`.
- Sample text uses the exact `text2speach-V2` name.
- Enum-populated language, rate, pitch, and volume controls remain available.
- Speak remains disabled for empty text and enabled for non-empty text.
- Speak queues browser speech synthesis and logs the existing queued status.
- Workspace Manager V2 exposes and launches the `text2speach-V2` tile.
- Session Inspector sees the toolState key as `sessionStorage:workspace.tools.text2speach-V2`.
- Returning from the tool keeps Workspace Manager V2 tools enabled.

Expected pass behavior: all tool-facing names use `text2speach-V2`, existing queue/status behavior still works, and Workspace Manager V2 preserves the renamed toolState id.

Expected fail behavior: tests fail if the registry, tools index, Workspace Manager tile, DOM selectors, logs, route, or toolState id regress to a legacy speech-tool name.

## Manual Test

1. Open `/toolbox/text2speach-V2/index.html`.
2. Confirm the header shows `text2speach-V2`.
3. Confirm the default sample text mentions `text2speach-V2`.
4. Click `Speak`.
5. Expected: status logs `OK Speak queued...` and the output summary shows `speak-queued`.
6. Open Workspace Manager V2, pick the repo folder, open Asteroids, and launch `text2speach-V2`.
7. Expected: the tool opens under `/toolbox/text2speach-V2/index.html?launch=workspace...`, workspace nav is visible, and returning to Workspace Manager keeps tools enabled.

Out of scope: full samples smoke validation and sample JSON alignment.

## Changed Files

- `docs_build/dev/codex_commands.md`
- `docs_build/dev/commit_comment.txt`
- `docs_build/dev/reports/PR_26130_008-text2speach-v2-schema-queue.md`
- `src/engine/audio/TextToSpeechDefaults.js`
- `src/engine/audio/TextToSpeechEngine.js`
- `src/engine/audio/index.js`
- `tests/playwright/tools/WorkspaceManagerV2.spec.mjs`
- `toolbox/preview-generator-v2/PreviewGeneratorV2App.js`
- `toolbox/preview-generator-v2/PreviewGeneratorV2Ui.js`
- `toolbox/preview-generator-v2/controls/RepoDestinationControl.js`
- `toolbox/preview-generator-v2/index.html`
- `toolbox/preview-generator-v2/previewGeneratorV2.css`
- `toolbox/renderToolsIndex.js`
- `toolbox/text2speach-V2/README.md`
- `toolbox/text2speach-V2/how_to_use.html`
- `toolbox/text2speach-V2/index.html`
- `toolbox/text2speach-V2/js/TextToSpeechToolApp.js`
- `toolbox/text2speach-V2/js/bootstrap.js`
- `toolbox/text2speach-V2/js/controls/ActionNavControl.js`
- `toolbox/text2speach-V2/js/controls/OutputSummaryControl.js`
- `toolbox/text2speach-V2/js/controls/SpeechOptionsControl.js`
- `toolbox/text2speach-V2/js/controls/StatusLogControl.js`
- `toolbox/text2speach-V2/js/controls/TextInputControl.js`
- `toolbox/text2speach-V2/styles/text2speach-V2.css`
- `toolbox/toolRegistry.js`
- `toolbox/workspace-manager-v2/js/controls/ToolTilesControl.js`
- `toolbox/workspace-manager-v2/js/services/WorkspaceManagerV2ContextService.js`
