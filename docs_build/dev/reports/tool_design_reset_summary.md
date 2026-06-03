# Tool Design Reset Summary

Task: PR_26124_021-tool-folder-design-reset

## Scope Completed
- Created or rebuilt one design doc for every immediate `tools/*` folder.
- Rebuilt `docs/design/tools/TOOLS_REENGINEERING_INDEX.md` with the requested classifications.
- Rebuilt `docs_build/dev/roadmaps/MASTER_ROADMAP_TOOLS.md` as a clean tool rebuild roadmap starting with Palette / Palette Browser.
- Kept the work documentation/design-only: no runtime code, schema files, sample JSON, game files, tool folders, or start_of_day folders were modified.

## Counts
- Tool folders documented: 31
- Design docs generated: 31
- Launchable tool folders: 24
- Global-only/support folders: 11
- Published-output-capable folders: 21
- Folders needing schema alignment: 5
- Folders needing controls cleanup: 24

## Generated Design Docs
- `docs/design/tools/palette-browser/REENGINEERING_DESIGN.md`
- `docs/design/tools/palette-manager-v2/REENGINEERING_DESIGN.md`
- `docs/design/tools/asset-browser/REENGINEERING_DESIGN.md`
- `docs/design/tools/asset-pipeline/REENGINEERING_DESIGN.md`
- `docs/design/tools/asset-manager-v2/REENGINEERING_DESIGN.md`
- `docs/design/tools/svg-asset-studio/REENGINEERING_DESIGN.md`
- `docs/design/tools/svg-asset-studio-v2/REENGINEERING_DESIGN.md`
- `docs/design/tools/sprite-editor/REENGINEERING_DESIGN.md`
- `docs/design/tools/skin-editor/REENGINEERING_DESIGN.md`
- `docs/design/tools/tile-map-editor/REENGINEERING_DESIGN.md`
- `docs/design/tools/tilemap-studio-v2/REENGINEERING_DESIGN.md`
- `docs/design/tools/tile-model-converter/REENGINEERING_DESIGN.md`
- `docs/design/tools/parallax-editor/REENGINEERING_DESIGN.md`
- `docs/design/tools/vector-map-editor/REENGINEERING_DESIGN.md`
- `docs/design/tools/vector-map-editor-v2/REENGINEERING_DESIGN.md`
- `docs/design/tools/3d-json-payload/REENGINEERING_DESIGN.md`
- `docs/design/tools/3d-asset-viewer/REENGINEERING_DESIGN.md`
- `docs/design/tools/3d-camera-path-editor/REENGINEERING_DESIGN.md`
- `docs/design/tools/physics-sandbox/REENGINEERING_DESIGN.md`
- `docs/design/tools/state-inspector/REENGINEERING_DESIGN.md`
- `docs/design/tools/replay-visualizer/REENGINEERING_DESIGN.md`
- `docs/design/tools/performance-profiler/REENGINEERING_DESIGN.md`
- `docs/design/tools/workspace-manager/REENGINEERING_DESIGN.md`
- `docs/design/tools/workspace-v2/REENGINEERING_DESIGN.md`
- `docs/design/tools/schemas/REENGINEERING_DESIGN.md`
- `docs/design/tools/common/REENGINEERING_DESIGN.md`
- `docs/design/tools/shared/REENGINEERING_DESIGN.md`
- `docs/design/tools/dev/REENGINEERING_DESIGN.md`
- `docs/design/tools/preview/REENGINEERING_DESIGN.md`
- `docs/design/tools/codex/REENGINEERING_DESIGN.md`
- `docs/design/tools/templates/REENGINEERING_DESIGN.md`

## Validation Expected
- Confirm all generated docs are markdown.
- Confirm every immediate `tools/*` folder has a corresponding `docs/design/tools/<tool-id>/REENGINEERING_DESIGN.md`.
- No Playwright impact is expected for this documentation-only PR.
