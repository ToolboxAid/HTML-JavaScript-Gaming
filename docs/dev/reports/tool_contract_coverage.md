# Tool Contract Coverage

PR: PR_26152_075-unify-tool-contract-behavior
Date: 2026-06-02

## Discovery Sources

- Root Tools Index page: `tools/index.html`
- Root Tools Index card data: `tools/tools-page-accordions.js`
- Active first-class tool registry: `tools/toolRegistry.js`
- Shared tool behavior: `src/shared/contracts/toolContract.js`
- Per-tool declarations: `src/shared/contracts/tools/*Contract.js`
- Contract index: `src/shared/contracts/tools/toolContractsIndex.js`

## Unified Behavior Status

- Per-tool modules remain split: 34/34 retained.
- Matching per-tool tests remain split: 34/34 retained.
- Shared tool behavior owns owner/project/visibility/status/version, import/export, produced output, supported asset, source tool state, archive, and permission rules.
- Per-tool declarations own only tool-specific ids, types, inputs, outputs, asset support, imports, exports, and tool metadata.
- Registered first-class tool coverage remains unchanged.

## Active Registered First-Class Tools

All active visible registered first-class tools discovered through `getVisibleActiveToolRegistry()` have matching contracts.

| Tool ID | Contract Module | Matching Test |
|---|---|---|
| `world-vector-studio-v2` | `src/shared/contracts/tools/worldVectorStudioV2Contract.js` | `tests/shared/tools/WorldVectorStudioV2ToolContract.test.mjs` |
| `object-vector-studio-v2` | `src/shared/contracts/tools/objectVectorStudioV2Contract.js` | `tests/shared/tools/ObjectVectorStudioV2ToolContract.test.mjs` |
| `tile-map-editor` | `src/shared/contracts/tools/tileMapEditorContract.js` | `tests/shared/tools/TileMapEditorToolContract.test.mjs` |
| `parallax-editor` | `src/shared/contracts/tools/parallaxEditorContract.js` | `tests/shared/tools/ParallaxEditorToolContract.test.mjs` |
| `sprite-editor` | `src/shared/contracts/tools/spriteEditorContract.js` | `tests/shared/tools/SpriteEditorToolContract.test.mjs` |
| `asset-manager-v2` | `src/shared/contracts/tools/assetManagerV2Contract.js` | `tests/shared/tools/AssetManagerV2ToolContract.test.mjs` |
| `workspace-manager-v2` | `src/shared/contracts/tools/workspaceManagerV2Contract.js` | `tests/shared/tools/WorkspaceManagerV2ToolContract.test.mjs` |
| `palette-manager-v2` | `src/shared/contracts/tools/paletteManagerV2Contract.js` | `tests/shared/tools/PaletteManagerV2ToolContract.test.mjs` |
| `preview-generator-v2` | `src/shared/contracts/tools/previewGeneratorV2Contract.js` | `tests/shared/tools/PreviewGeneratorV2ToolContract.test.mjs` |
| `text2speech-V2` | `src/shared/contracts/tools/text2speechV2Contract.js` | `tests/shared/tools/Text2SpeechV2ToolContract.test.mjs` |
| `audio-sfx-playground-v2` | `src/shared/contracts/tools/audioSfxPlaygroundV2Contract.js` | `tests/shared/tools/AudioSfxPlaygroundV2ToolContract.test.mjs` |
| `midi-studio-v2` | `src/shared/contracts/tools/midiStudioV2Contract.js` | `tests/shared/tools/MidiStudioV2ToolContract.test.mjs` |
| `collision-inspector-v2` | `src/shared/contracts/tools/collisionInspectorV2Contract.js` | `tests/shared/tools/CollisionInspectorV2ToolContract.test.mjs` |
| `storage-inspector-v2` | `src/shared/contracts/tools/storageInspectorV2Contract.js` | `tests/shared/tools/StorageInspectorV2ToolContract.test.mjs` |
| `input-mapping-v2` | `src/shared/contracts/tools/inputMappingV2Contract.js` | `tests/shared/tools/InputMappingV2ToolContract.test.mjs` |
| `state-inspector` | `src/shared/contracts/tools/stateInspectorContract.js` | `tests/shared/tools/StateInspectorToolContract.test.mjs` |
| `replay-visualizer` | `src/shared/contracts/tools/replayVisualizerContract.js` | `tests/shared/tools/ReplayVisualizerToolContract.test.mjs` |
| `performance-profiler` | `src/shared/contracts/tools/performanceProfilerContract.js` | `tests/shared/tools/PerformanceProfilerToolContract.test.mjs` |
| `physics-sandbox` | `src/shared/contracts/tools/physicsSandboxContract.js` | `tests/shared/tools/PhysicsSandboxToolContract.test.mjs` |
| `asset-pipeline` | `src/shared/contracts/tools/assetPipelineContract.js` | `tests/shared/tools/AssetPipelineToolContract.test.mjs` |
| `3d-json-payload` | `src/shared/contracts/tools/threeDJsonPayloadContract.js` | `tests/shared/tools/ThreeDJsonPayloadToolContract.test.mjs` |
| `3d-asset-viewer` | `src/shared/contracts/tools/threeDAssetViewerContract.js` | `tests/shared/tools/ThreeDAssetViewerToolContract.test.mjs` |
| `3d-camera-path-editor` | `src/shared/contracts/tools/threeDCameraPathEditorContract.js` | `tests/shared/tools/ThreeDCameraPathEditorToolContract.test.mjs` |

## Root Tools Index Card Coverage

The root Tools Index card data includes public/root cards that are not all active registered first-class tools. Unified tool contracts cover registered tools directly, map legacy/root card names to their first-class contract where applicable, and document non-tool cards.

| Root Card | Coverage | Contract ID | Contract Module | Matching Test | Notes |
|---|---|---|---|---|---|
| Asset Studio | Contracted | `asset-studio` | `src/shared/contracts/tools/assetStudioContract.js` | `tests/shared/tools/AssetStudioToolContract.test.mjs` | Root planning/tool card contract. |
| Object Vector Studio | Mapped | `object-vector-studio-v2` | `src/shared/contracts/tools/objectVectorStudioV2Contract.js` | `tests/shared/tools/ObjectVectorStudioV2ToolContract.test.mjs` | Root card links `object-vector-studio.html`; first-class contract is `object-vector-studio-v2`. |
| World Vector Studio | Mapped | `world-vector-studio-v2` | `src/shared/contracts/tools/worldVectorStudioV2Contract.js` | `tests/shared/tools/WorldVectorStudioV2ToolContract.test.mjs` | Root card links `world-vector-studio.html`; first-class contract is `world-vector-studio-v2`. |
| Palette Manager | Mapped | `palette-manager-v2` | `src/shared/contracts/tools/paletteManagerV2Contract.js` | `tests/shared/tools/PaletteManagerV2ToolContract.test.mjs` | Root card links `palette-manager.html`; first-class contract is `palette-manager-v2`. |
| Game Builder | Contracted | `game-builder` | `src/shared/contracts/tools/gameBuilderContract.js` | `tests/shared/tools/GameBuilderToolContract.test.mjs` | Root planning/tool card contract. |
| Game Design Studio | Contracted | `game-design-studio` | `src/shared/contracts/tools/gameDesignStudioContract.js` | `tests/shared/tools/GameDesignStudioToolContract.test.mjs` | Root planning/tool card contract. |
| Publish Studio | Contracted | `publish-studio` | `src/shared/contracts/tools/publishStudioContract.js` | `tests/shared/tools/PublishStudioToolContract.test.mjs` | Root planning/tool card contract. |
| Animation Studio | Contracted | `animation-studio` | `src/shared/contracts/tools/animationStudioContract.js` | `tests/shared/tools/AnimationStudioToolContract.test.mjs` | Root planning/tool card contract. |
| Particle Studio | Contracted | `particle-studio` | `src/shared/contracts/tools/particleStudioContract.js` | `tests/shared/tools/ParticleStudioToolContract.test.mjs` | Root planning/tool card contract. |
| MIDI Studio | Mapped | `midi-studio-v2` | `src/shared/contracts/tools/midiStudioV2Contract.js` | `tests/shared/tools/MidiStudioV2ToolContract.test.mjs` | Root card links `midi-studio.html`; first-class contract is `midi-studio-v2`. |
| Sound Studio | Contracted | `sound-studio` | `src/shared/contracts/tools/soundStudioContract.js` | `tests/shared/tools/SoundStudioToolContract.test.mjs` | Root planning/tool card contract. |
| AI Assistant | Contracted | `ai-assistant` | `src/shared/contracts/tools/aiAssistantContract.js` | `tests/shared/tools/AiAssistantToolContract.test.mjs` | Root planning/tool card contract. |
| Code Studio | Contracted | `code-studio` | `src/shared/contracts/tools/codeStudioContract.js` | `tests/shared/tools/CodeStudioToolContract.test.mjs` | Root planning/tool card contract. |
| Input Studio | Contracted | `input-studio` | `src/shared/contracts/tools/inputStudioContract.js` | `tests/shared/tools/InputStudioToolContract.test.mjs` | Root planning/tool card contract. |
| Marketplace | Skipped | n/a | n/a | n/a | Targets `marketplace/index.html`, which is a marketplace page rather than a first-class tool contract. |
| Localization Studio | Contracted | `localization-studio` | `src/shared/contracts/tools/localizationStudioContract.js` | `tests/shared/tools/LocalizationStudioToolContract.test.mjs` | Root planning/tool card contract. |
| Arcade | Skipped | n/a | n/a | n/a | Targets `arcade/index.html`, which is a play surface rather than a first-class tool contract. |
| Storage Inspector | Mapped | `storage-inspector-v2` | `src/shared/contracts/tools/storageInspectorV2Contract.js` | `tests/shared/tools/StorageInspectorV2ToolContract.test.mjs` | Root card links `storage-inspector.html`; first-class contract is `storage-inspector-v2`. |

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
