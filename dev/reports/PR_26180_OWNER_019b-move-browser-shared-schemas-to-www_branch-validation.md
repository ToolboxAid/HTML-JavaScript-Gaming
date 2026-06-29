# PR_26180_OWNER_019b-move-browser-shared-schemas-to-www Branch Validation

| Check | Status | Evidence |
| --- | --- | --- |
| Current branch | PASS | `PR_26180_OWNER_019b-move-browser-shared-schemas-to-www` |
| Expected stacked base | PASS | Branch created from `PR_26180_OWNER_019a-contracts-schemas-obsolescence-audit`. |
| Worktree at start | PASS | Clean before branch creation. |
| Worktree after implementation | PASS | Contains only scoped PR changes and generated reports. |
| Branch model | PASS | Owner stacked PR based on prior direct dependency. |
| Protected developer workspace | PASS | No protected dev workspace paths moved. |

## Current Status Snapshot

```text
 M dev/build/ProjectInstructions/PROJECT_INSTRUCTIONS.md
 M dev/build/ProjectInstructions/PROJECT_INSTRUCTIONS_VERSION.md
 M dev/build/ProjectInstructions/PROJECT_STATE.md
 M dev/build/ProjectInstructions/backlog/BACKLOG_MASTER.md
 M dev/build/ProjectInstructions/repository/canonical_repository_structure.md
 M dev/reports/codex_changed_files.txt
 M dev/reports/codex_review.diff
 M dev/scripts/validate-json-contracts.mjs
 M dev/tests/tools/ObjectVectorStudioV2DeleteCleanup.test.mjs
 M dev/tests/tools/ToolManifestBoundary.test.mjs
R  src/shared/contracts/replayContracts.js -> www/src/shared/contracts/replayContracts.js
R  src/shared/schemas/tools/3d-asset-viewer.schema.json -> www/src/shared/schemas/tools/3d-asset-viewer.schema.json
R  src/shared/schemas/tools/3d-camera-path-editor.schema.json -> www/src/shared/schemas/tools/3d-camera-path-editor.schema.json
R  src/shared/schemas/tools/3d-json-payload.schema.json -> www/src/shared/schemas/tools/3d-json-payload.schema.json
R  src/shared/schemas/tools/asset-manager-v2.schema.json -> www/src/shared/schemas/tools/asset-manager-v2.schema.json
R  src/shared/schemas/tools/asset-pipeline.schema.json -> www/src/shared/schemas/tools/asset-pipeline.schema.json
R  src/shared/schemas/tools/audio-sfx-playground-v2.schema.json -> www/src/shared/schemas/tools/audio-sfx-playground-v2.schema.json
R  src/shared/schemas/tools/collision-inspector-v2.schema.json -> www/src/shared/schemas/tools/collision-inspector-v2.schema.json
R  src/shared/schemas/tools/input-mapping-v2.schema.json -> www/src/shared/schemas/tools/input-mapping-v2.schema.json
R  src/shared/schemas/tools/midi-studio-v2.schema.json -> www/src/shared/schemas/tools/midi-studio-v2.schema.json
R  src/shared/schemas/tools/object-vector-studio-v2.schema.json -> www/src/shared/schemas/tools/object-vector-studio-v2.schema.json
R  src/shared/schemas/tools/palette-browser.schema.json -> www/src/shared/schemas/tools/palette-browser.schema.json
R  src/shared/schemas/tools/palette-manager-v2.schema.json -> www/src/shared/schemas/tools/palette-manager-v2.schema.json
R  src/shared/schemas/tools/parallax-editor.schema.json -> www/src/shared/schemas/tools/parallax-editor.schema.json
R  src/shared/schemas/tools/performance-profiler.schema.json -> www/src/shared/schemas/tools/performance-profiler.schema.json
R  src/shared/schemas/tools/physics-sandbox.schema.json -> www/src/shared/schemas/tools/physics-sandbox.schema.json
R  src/shared/schemas/tools/replay-visualizer.schema.json -> www/src/shared/schemas/tools/replay-visualizer.schema.json
R  src/shared/schemas/tools/sprite-editor.schema.json -> www/src/shared/schemas/tools/sprite-editor.schema.json
R  src/shared/schemas/tools/state-inspector.schema.json -> www/src/shared/schemas/tools/state-inspector.schema.json
R  src/shared/schemas/tools/svg-asset-studio.schema.json -> www/src/shared/schemas/tools/svg-asset-studio.schema.json
R  src/shared/schemas/tools/text2speech-V2.schema.json -> www/src/shared/schemas/tools/text2speech-V2.schema.json
R  src/shared/schemas/tools/tile-map-editor.schema.json -> www/src/shared/schemas/tools/tile-map-editor.schema.json
R  src/shared/schemas/tools/vector-map-editor.schema.json -> www/src/shared/schemas/tools/vector-map-editor.schema.json
```
