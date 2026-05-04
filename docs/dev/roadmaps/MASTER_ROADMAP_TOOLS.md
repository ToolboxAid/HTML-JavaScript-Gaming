# MASTER_ROADMAP_TOOLS

Task: PR_26124_025-remove-v2-common-rebuild-surface

## Core Tool Rebuild
- [.] Palette Browser: rebuild first as the global palette source of truth; publish `tools.palette-browser`.
- [ ] Asset Browser: rebuild approved asset browsing and manifest validation; publish `tools.asset-browser`.
- [ ] Asset Pipeline: rebuild pipeline payload validation and normalized output; publish `tools.asset-pipeline`.
- [ ] SVG Asset Studio: rebuild vector asset authoring, validation, and export; publish `tools.svg-asset-studio`.
- [ ] Sprite Editor: rebuild sprite project editing, validation, and export; publish `tools.sprite-editor`.
- [ ] Skin Editor: rebuild primitive skin editing, validation, and export; publish `tools.skin-editor`.
- [ ] Tilemap Studio: rebuild tile map/layer authoring, validation, and export; publish `tools.tile-map-editor`.
- [ ] Tile Model Converter: rebuild candidate conversion validation and normalized output; publish `tools.tile-model-converter`.
- [ ] Parallax Scene Studio: rebuild parallax document editing, validation, and export; publish `tools.parallax-editor`.
- [ ] Vector Map Editor: rebuild vector map geometry editing, validation, and export; publish `tools.vector-map-editor`.
- [ ] 3D JSON Payload: rebuild map payload normalization, validation, and export; publish `tools.3d-json-payload`.
- [ ] 3D Asset Viewer: rebuild read-only asset inspection and report export; publish `tools.3d-asset-viewer`.
- [ ] 3D Camera Path Editor: rebuild waypoint editing, path validation, and export; publish `tools.3d-camera-path-editor`.
- [ ] Physics Sandbox: rebuild physics body validation, step preview, and export; publish `tools.physics-sandbox`.
- [ ] State Inspector: rebuild snapshot validation and inspection report export; publish `tools.state-inspector`.
- [ ] Replay Visualizer: rebuild replay event validation, playback controls, and export; publish `tools.replay-visualizer`.
- [ ] Performance Profiler: rebuild profile settings validation and report export; publish `tools.performance-profiler`.

## Deferred References
- [x] Transitional V2/workspace rebuild surface removed before Palette Browser rebuild.
- [x] Unused common support files removed after confirming no remaining imports.
- [ ] Support folders remain reference-only: shared, dev, preview, codex, templates.
- [ ] Schemas remain the current contract baseline until a schema-scoped PR.
- [ ] Samples remain deferred until core tools are rebuilt and published outputs are stable.
