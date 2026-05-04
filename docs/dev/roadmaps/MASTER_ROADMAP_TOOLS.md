# MASTER_ROADMAP_TOOLS

Task: PR_26124_022-tighten-tool-design-docs

## Core Tool Rebuild
- [.] Palette Browser: rebuild first as the global palette source of truth for `tools.palette-browser`.
- [ ] Asset Browser: rebuild approved asset browsing, import-plan validation, and `tools.asset-browser` publish.
- [ ] Asset Pipeline: rebuild pipeline payload validation, normalized output, and `tools.asset-pipeline` publish.
- [ ] SVG Asset Studio: rebuild vector asset authoring, validation, export, and `tools.svg-asset-studio` publish.
- [ ] Sprite Editor: rebuild sprite project editing, validation, export, and `tools.sprite-editor` publish.
- [ ] Skin Editor: rebuild primitive skin editing, validation, export, and `tools.skin-editor` publish.
- [ ] Tilemap Studio: rebuild tile map/layer authoring, validation, export, and `tools.tile-map-editor` publish.
- [ ] Tile Model Converter: rebuild candidate/conversion validation, normalized output, and `tools.tile-model-converter` publish.
- [ ] Parallax Scene Studio: rebuild parallax document editing, path-based references, validation, export, and `tools.parallax-editor` publish.
- [ ] Vector Map Editor: rebuild vector map geometry editing, validation, export, and `tools.vector-map-editor` publish.
- [ ] 3D JSON Payload: rebuild map payload normalization, validation, export, and `tools.3d-json-payload` publish.
- [ ] 3D Asset Viewer: rebuild read-only asset inspection, validation report export, and `tools.3d-asset-viewer` publish.
- [ ] 3D Camera Path Editor: rebuild waypoint editing, path validation, export, and `tools.3d-camera-path-editor` publish.
- [ ] Physics Sandbox: rebuild physics body validation, step preview, export, and `tools.physics-sandbox` publish.
- [ ] State Inspector: rebuild snapshot validation, inspection report export, and `tools.state-inspector` publish.
- [ ] Replay Visualizer: rebuild replay event validation, playback controls, export, and `tools.replay-visualizer` publish.
- [ ] Performance Profiler: rebuild profile settings validation, report export, and `tools.performance-profiler` publish.

## Transitional And Global Cleanup
- [ ] palette-manager-v2: review only after Palette Browser is rebuilt.
- [ ] asset-manager-v2: review only after Asset Browser and Asset Pipeline are rebuilt.
- [ ] svg-asset-studio-v2: review only after SVG Asset Studio is rebuilt.
- [ ] tilemap-studio-v2: review only after Tilemap Studio is rebuilt.
- [ ] vector-map-editor-v2: review only after Vector Map Editor is rebuilt.
- [ ] workspace-v2: review toolState launch/copy behavior only after core tool contracts are stable.
- [ ] Workspace Manager: keep as launcher/global coordinator; cleanup after core tools and toolState contracts are stable.

## Deferred References
- [ ] Support folders remain reference-only: common, shared, dev, preview, codex, templates.
- [ ] Schemas remain the current contract baseline until a schema-scoped PR.
- [ ] Samples remain deferred until core tools are rebuilt and published outputs are stable.
