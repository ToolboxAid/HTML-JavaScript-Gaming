# Tool Contract Coverage

PR: PR_26152_074-tool-contract-deduplication-audit
Date: 2026-06-02

## Discovery Sources

- Root Tools Index page: `tools/index.html`
- Root Tools Index card data: `tools/tools-page-accordions.js`
- Active first-class tool registry: `tools/toolRegistry.js`
- Shared contract primitives: `src/shared/contracts/toolContractPrimitives.js`
- Per-tool contracts: `src/shared/contracts/tools/*ToolContract.js`
- Contract index: `src/shared/contracts/tools/toolContractsIndex.js`

## Deduplication Status

- Per-tool modules remain split: 34/34 retained.
- Matching per-tool tests remain split: 34/34 retained.
- Shared primitives now own repeated empty/all supported asset declarations and draft contract creation.
- Per-tool declarations still own only tool-specific ids, types, inputs, outputs, asset support, imports, and exports.
- Registered first-class tool coverage remains unchanged.

## Active Registered First-Class Tools

All active visible registered first-class tools discovered through `getVisibleActiveToolRegistry()` have matching contracts.

| Tool ID | Contract Module | Matching Test |
|---|---|---|
| `world-vector-studio-v2` | `src/shared/contracts/tools/worldVectorStudioV2ToolContract.js` | `tests/shared/tools/WorldVectorStudioV2ToolContract.test.mjs` |
| `object-vector-studio-v2` | `src/shared/contracts/tools/objectVectorStudioV2ToolContract.js` | `tests/shared/tools/ObjectVectorStudioV2ToolContract.test.mjs` |
| `tile-map-editor` | `src/shared/contracts/tools/tileMapEditorToolContract.js` | `tests/shared/tools/TileMapEditorToolContract.test.mjs` |
| `parallax-editor` | `src/shared/contracts/tools/parallaxEditorToolContract.js` | `tests/shared/tools/ParallaxEditorToolContract.test.mjs` |
| `sprite-editor` | `src/shared/contracts/tools/spriteEditorToolContract.js` | `tests/shared/tools/SpriteEditorToolContract.test.mjs` |
| `asset-manager-v2` | `src/shared/contracts/tools/assetManagerV2ToolContract.js` | `tests/shared/tools/AssetManagerV2ToolContract.test.mjs` |
| `workspace-manager-v2` | `src/shared/contracts/tools/workspaceManagerV2ToolContract.js` | `tests/shared/tools/WorkspaceManagerV2ToolContract.test.mjs` |
| `palette-manager-v2` | `src/shared/contracts/tools/paletteManagerV2ToolContract.js` | `tests/shared/tools/PaletteManagerV2ToolContract.test.mjs` |
| `preview-generator-v2` | `src/shared/contracts/tools/previewGeneratorV2ToolContract.js` | `tests/shared/tools/PreviewGeneratorV2ToolContract.test.mjs` |
| `text2speech-V2` | `src/shared/contracts/tools/text2speechV2ToolContract.js` | `tests/shared/tools/Text2SpeechV2ToolContract.test.mjs` |
| `audio-sfx-playground-v2` | `src/shared/contracts/tools/audioSfxPlaygroundV2ToolContract.js` | `tests/shared/tools/AudioSfxPlaygroundV2ToolContract.test.mjs` |
| `midi-studio-v2` | `src/shared/contracts/tools/midiStudioV2ToolContract.js` | `tests/shared/tools/MidiStudioV2ToolContract.test.mjs` |
| `collision-inspector-v2` | `src/shared/contracts/tools/collisionInspectorV2ToolContract.js` | `tests/shared/tools/CollisionInspectorV2ToolContract.test.mjs` |
| `storage-inspector-v2` | `src/shared/contracts/tools/storageInspectorV2ToolContract.js` | `tests/shared/tools/StorageInspectorV2ToolContract.test.mjs` |
| `input-mapping-v2` | `src/shared/contracts/tools/inputMappingV2ToolContract.js` | `tests/shared/tools/InputMappingV2ToolContract.test.mjs` |
| `state-inspector` | `src/shared/contracts/tools/stateInspectorToolContract.js` | `tests/shared/tools/StateInspectorToolContract.test.mjs` |
| `replay-visualizer` | `src/shared/contracts/tools/replayVisualizerToolContract.js` | `tests/shared/tools/ReplayVisualizerToolContract.test.mjs` |
| `performance-profiler` | `src/shared/contracts/tools/performanceProfilerToolContract.js` | `tests/shared/tools/PerformanceProfilerToolContract.test.mjs` |
| `physics-sandbox` | `src/shared/contracts/tools/physicsSandboxToolContract.js` | `tests/shared/tools/PhysicsSandboxToolContract.test.mjs` |
| `asset-pipeline` | `src/shared/contracts/tools/assetPipelineToolContract.js` | `tests/shared/tools/AssetPipelineToolContract.test.mjs` |
| `3d-json-payload` | `src/shared/contracts/tools/threeDJsonPayloadToolContract.js` | `tests/shared/tools/ThreeDJsonPayloadToolContract.test.mjs` |
| `3d-asset-viewer` | `src/shared/contracts/tools/threeDAssetViewerToolContract.js` | `tests/shared/tools/ThreeDAssetViewerToolContract.test.mjs` |
| `3d-camera-path-editor` | `src/shared/contracts/tools/threeDCameraPathEditorToolContract.js` | `tests/shared/tools/ThreeDCameraPathEditorToolContract.test.mjs` |

## Root Tools Index Card Coverage

The root Tools Index card data includes public/root cards that are not all active registered first-class tools. Split contracts cover registered tools directly, map legacy/root card names to their first-class contract where applicable, and document non-tool cards.

| Root Card | Coverage | Contract ID | Contract Module | Matching Test | Notes |
|---|---|---|---|---|---|
| Asset Studio | Contracted | `asset-studio` | `src/shared/contracts/tools/assetStudioToolContract.js` | `tests/shared/tools/AssetStudioToolContract.test.mjs` | Root planning/tool card contract. |
| Object Vector Studio | Mapped | `object-vector-studio-v2` | `src/shared/contracts/tools/objectVectorStudioV2ToolContract.js` | `tests/shared/tools/ObjectVectorStudioV2ToolContract.test.mjs` | Root card links `object-vector-studio.html`; first-class contract is `object-vector-studio-v2`. |
| World Vector Studio | Mapped | `world-vector-studio-v2` | `src/shared/contracts/tools/worldVectorStudioV2ToolContract.js` | `tests/shared/tools/WorldVectorStudioV2ToolContract.test.mjs` | Root card links `world-vector-studio.html`; first-class contract is `world-vector-studio-v2`. |
| Palette Manager | Mapped | `palette-manager-v2` | `src/shared/contracts/tools/paletteManagerV2ToolContract.js` | `tests/shared/tools/PaletteManagerV2ToolContract.test.mjs` | Root card links `palette-manager.html`; first-class contract is `palette-manager-v2`. |
| Game Builder | Contracted | `game-builder` | `src/shared/contracts/tools/gameBuilderToolContract.js` | `tests/shared/tools/GameBuilderToolContract.test.mjs` | Root planning/tool card contract. |
| Game Design Studio | Contracted | `game-design-studio` | `src/shared/contracts/tools/gameDesignStudioToolContract.js` | `tests/shared/tools/GameDesignStudioToolContract.test.mjs` | Root planning/tool card contract. |
| Publish Studio | Contracted | `publish-studio` | `src/shared/contracts/tools/publishStudioToolContract.js` | `tests/shared/tools/PublishStudioToolContract.test.mjs` | Root planning/tool card contract. |
| Animation Studio | Contracted | `animation-studio` | `src/shared/contracts/tools/animationStudioToolContract.js` | `tests/shared/tools/AnimationStudioToolContract.test.mjs` | Root planning/tool card contract. |
| Particle Studio | Contracted | `particle-studio` | `src/shared/contracts/tools/particleStudioToolContract.js` | `tests/shared/tools/ParticleStudioToolContract.test.mjs` | Root planning/tool card contract. |
| MIDI Studio | Mapped | `midi-studio-v2` | `src/shared/contracts/tools/midiStudioV2ToolContract.js` | `tests/shared/tools/MidiStudioV2ToolContract.test.mjs` | Root card links `midi-studio.html`; first-class contract is `midi-studio-v2`. |
| Sound Studio | Contracted | `sound-studio` | `src/shared/contracts/tools/soundStudioToolContract.js` | `tests/shared/tools/SoundStudioToolContract.test.mjs` | Root planning/tool card contract. |
| AI Assistant | Contracted | `ai-assistant` | `src/shared/contracts/tools/aiAssistantToolContract.js` | `tests/shared/tools/AiAssistantToolContract.test.mjs` | Root planning/tool card contract. |
| Code Studio | Contracted | `code-studio` | `src/shared/contracts/tools/codeStudioToolContract.js` | `tests/shared/tools/CodeStudioToolContract.test.mjs` | Root planning/tool card contract. |
| Input Studio | Contracted | `input-studio` | `src/shared/contracts/tools/inputStudioToolContract.js` | `tests/shared/tools/InputStudioToolContract.test.mjs` | Root planning/tool card contract. |
| Marketplace | Skipped | n/a | n/a | n/a | Targets `marketplace/index.html`, which is a marketplace page rather than a first-class tool contract. |
| Localization Studio | Contracted | `localization-studio` | `src/shared/contracts/tools/localizationStudioToolContract.js` | `tests/shared/tools/LocalizationStudioToolContract.test.mjs` | Root planning/tool card contract. |
| Arcade | Skipped | n/a | n/a | n/a | Targets `arcade/index.html`, which is a play surface rather than a first-class tool contract. |
| Storage Inspector | Mapped | `storage-inspector-v2` | `src/shared/contracts/tools/storageInspectorV2ToolContract.js` | `tests/shared/tools/StorageInspectorV2ToolContract.test.mjs` | Root card links `storage-inspector.html`; first-class contract is `storage-inspector-v2`. |

## Summary

- Active visible registered first-class tools discovered: 23
- Tool contracts defined: 34
- Per-tool contract modules: 34
- Matching per-tool tests: 34
- Registered first-class tools without contract: 0
- Root Tools Index cards reviewed: 18
- Root Tools Index cards skipped as non-tool surfaces: 2
- Duplicated empty supported asset declarations remaining in tool files: 0
- Duplicated all-supported-assets declarations remaining in tool files: 0
- Duplicated draft status declarations remaining in tool files: 0
