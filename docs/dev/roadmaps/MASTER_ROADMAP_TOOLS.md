# MASTER_ROADMAP_TOOLS

Task: PR_26124_021-tool-folder-design-reset

## Palette / Palette Browser
- [.] Palette Browser: rebuild the global palette tool first with tool-owned import/load, validate, edit/process, export/save, and publish to `tools.palette-browser`.
- [ ] Palette Manager V2: align hosted palette session reading with the palette contract after Palette Browser is clean.

## Asset Flow
- [ ] Asset Browser: rebuild browsing, filters, import plan validation, and published asset-browser output.
- [ ] Asset Pipeline: rebuild pipeline payload validation and normalized export/report behavior.
- [ ] Asset Manager V2: align hosted asset catalog edits, persistence, and copy/create toolState behavior.

## Vector And Sprite Authoring
- [ ] SVG Asset Studio: rebuild vector document import, preview, validation, and export/publish behavior.
- [ ] SVG Asset Studio V2: align hosted vector asset session reading with the rebuilt SVG contract.
- [ ] Sprite Editor: rebuild sprite project controls, frame/animation state, validation, and export/publish behavior.
- [ ] Skin Editor: rebuild primitive skin controls, validation, and export/publish behavior.

## Tile And Scene Authoring
- [ ] Tilemap Studio: rebuild tile map editing, layer controls, validation, and export/publish behavior.
- [ ] Tilemap Studio V2: align hosted tile map session reading with the rebuilt tile map contract.
- [ ] Tile Model Converter: rebuild candidate/conversion validation and normalized conversion output.
- [ ] Parallax Scene Studio: rebuild layer controls, path-based image references, validation, and export/publish behavior.

## Vector Map And Spatial Tools
- [ ] Vector Map Editor: rebuild vector map object editing, geometry validation, and export/publish behavior.
- [ ] Vector Map Editor V2: align hosted vector map session reading with the rebuilt vector map contract.
- [ ] 3D JSON Payload: rebuild map payload normalization, invalid JSON rejection, and export behavior.
- [ ] 3D Asset Viewer: rebuild read-only asset inspection, validation reporting, and export behavior.
- [ ] 3D Camera Path Editor: rebuild waypoint editing, path validation, and camera path export behavior.

## Runtime Inspection Tools
- [ ] Physics Sandbox: rebuild physics payload validation, preview, and export behavior.
- [ ] State Inspector: rebuild snapshot import, validation, inspection, and export behavior.
- [ ] Replay Visualizer: rebuild event replay import, validation, playback controls, and export behavior.
- [ ] Performance Profiler: rebuild profiler settings, capture controls, validation, and report export behavior.

## Workspace And Support Folders
- [ ] Workspace Manager: keep launch/coordination only and remove any expectation that workspace owns tool internals.
- [ ] Workspace V2: keep validation and launch only; preserve copy/create toolState behavior without editing nested tool JSON.
- [ ] Tool Schemas: keep the completed schema baseline unchanged until a later schema-scoped PR.
- [ ] Common Tool Contracts: keep support helpers aligned with rebuilt tool-owned contracts.
- [ ] Shared Tool Support: keep shared modules as callers/helpers for rebuilt tools, not owners of tool JSON.
- [ ] Developer Tooling: keep guards/debug helpers aligned with the rebuilt tool surfaces.
- [ ] Preview Utilities: keep preview generation separate from persisted tool JSON contracts.
- [ ] Codex Path Utilities: keep maintenance scripts outside runtime/tool payload ownership.
- [ ] Tool Templates: keep templates outside this rebuild until tool contracts are complete.

## Completion Gates
- [ ] Every `tools/*` folder has a current reengineering design doc.
- [ ] Every launchable tool owns import/load, validate, edit/process, export/save, and publish behavior where applicable.
- [ ] Workspace validates and launches only.
- [ ] No runtime code rollback, schema mutation, sample edit, game edit, or tool deletion occurs in the reset/design anchor.
