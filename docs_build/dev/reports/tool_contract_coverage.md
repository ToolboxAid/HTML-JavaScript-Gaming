# Tool Contract Coverage

PR: PR_26152_077-model-b-contract-final-cleanup
Date: 2026-06-02

## Discovery Sources

- Root Tools Index page: `toolbox/index.html`
- Root Tools Index card data: `toolbox/tools-page-accordions.js`
- Active first-class tool registry: `toolbox/toolRegistry.js`
- Shared tool behavior and output vocabulary: `src/shared/contracts/tools/toolContract.js`
- Per-tool declarations: `src/shared/contracts/tools/*Contract.js`
- Contract index: `src/shared/contracts/tools/toolContractsIndex.js`

## Model B Status

- Platform contract tests remain at the top-level contract surface for identity/permissions, projects, and tool state.
- Shared tool behavior now owns tool status, visibility, versioning, import/export formats, supported output types, and output format compatibility vocabulary.
- Per-tool modules remain split: 34/34 retained.
- Matching per-tool declaration tests remain split: 34/34 retained.
- Tool output declarations live in per-tool modules through `producedOutputs`, `supportedAssetTypes`, `importFormats`, and `exportFormats`.
- Standalone top-level output object behavior models for asset, palette, and vector asset records were removed.
- No separate behavior models were created for asset, palette, or vector outputs.

## Active Registered First-Class Tools

All active visible registered first-class tools discovered through `getVisibleActiveToolRegistry()` have matching contracts.

| Tool ID | Contract Module | Matching Test |
|---|---|---|
| `world-vector-studio-v2` | `src/shared/contracts/tools/worldVectorStudioContract.js` | `tests/shared/tools/WorldVectorStudioV2ToolContract.test.mjs` |
| `object-vector-studio-v2` | `src/shared/contracts/tools/objectVectorStudioContract.js` | `tests/shared/tools/ObjectVectorStudioV2ToolContract.test.mjs` |
| `tile-map-editor` | `src/shared/contracts/tools/tileMapEditorContract.js` | `tests/shared/tools/TileMapEditorToolContract.test.mjs` |
| `parallax-editor` | `src/shared/contracts/tools/parallaxEditorContract.js` | `tests/shared/tools/ParallaxEditorToolContract.test.mjs` |
| `sprite-editor` | `src/shared/contracts/tools/spriteEditorContract.js` | `tests/shared/tools/SpriteEditorToolContract.test.mjs` |
| `asset-manager-v2` | `src/shared/contracts/tools/assetManagerContract.js` | `tests/shared/tools/AssetManagerV2ToolContract.test.mjs` |
| `workspace-manager-v2` | `src/shared/contracts/tools/workspaceManagerContract.js` | `tests/shared/tools/WorkspaceManagerV2ToolContract.test.mjs` |
| `palette-manager-v2` | `src/shared/contracts/tools/paletteManagerContract.js` | `tests/shared/tools/PaletteManagerV2ToolContract.test.mjs` |
| `preview-generator-v2` | `src/shared/contracts/tools/previewGeneratorContract.js` | `tests/shared/tools/PreviewGeneratorV2ToolContract.test.mjs` |
| `text2speech-V2` | `src/shared/contracts/tools/textToSpeechContract.js` | `tests/shared/tools/Text2SpeechV2ToolContract.test.mjs` |
| `audio-sfx-playground-v2` | `src/shared/contracts/tools/audioSfxPlaygroundContract.js` | `tests/shared/tools/AudioSfxPlaygroundV2ToolContract.test.mjs` |
| `midi-studio-v2` | `src/shared/contracts/tools/midiStudioContract.js` | `tests/shared/tools/MidiStudioV2ToolContract.test.mjs` |
| `collision-inspector-v2` | `src/shared/contracts/tools/collisionInspectorContract.js` | `tests/shared/tools/CollisionInspectorV2ToolContract.test.mjs` |
| `storage-inspector-v2` | `src/shared/contracts/tools/storageInspectorContract.js` | `tests/shared/tools/StorageInspectorV2ToolContract.test.mjs` |
| `input-mapping-v2` | `src/shared/contracts/tools/inputMappingContract.js` | `tests/shared/tools/InputMappingV2ToolContract.test.mjs` |
| `state-inspector` | `src/shared/contracts/tools/stateInspectorContract.js` | `tests/shared/tools/StateInspectorToolContract.test.mjs` |
| `replay-visualizer` | `src/shared/contracts/tools/replayVisualizerContract.js` | `tests/shared/tools/ReplayVisualizerToolContract.test.mjs` |
| `performance-profiler` | `src/shared/contracts/tools/performanceProfilerContract.js` | `tests/shared/tools/PerformanceProfilerToolContract.test.mjs` |
| `physics-sandbox` | `src/shared/contracts/tools/physicsSandboxContract.js` | `tests/shared/tools/PhysicsSandboxToolContract.test.mjs` |
| `asset-pipeline` | `src/shared/contracts/tools/assetPipelineContract.js` | `tests/shared/tools/AssetPipelineToolContract.test.mjs` |
| `3d-json-payload` | `src/shared/contracts/tools/threeDJsonPayloadContract.js` | `tests/shared/tools/ThreeDJsonPayloadToolContract.test.mjs` |
| `3d-asset-viewer` | `src/shared/contracts/tools/threeDAssetViewerContract.js` | `tests/shared/tools/ThreeDAssetViewerToolContract.test.mjs` |
| `3d-camera-path-editor` | `src/shared/contracts/tools/threeDCameraPathEditorContract.js` | `tests/shared/tools/ThreeDCameraPathEditorToolContract.test.mjs` |

## Tool Output Declaration Coverage

| Output Family | Shared Vocabulary | Representative Tool Declaration |
|---|---|---|
| Vector | `vector`, `vector-json`, `svg` | `object-vector-studio-v2` produces `vector-json` and `svg`. |
| Palette | `palette`, `palette-json` | `palette-manager-v2` produces `palette-json`. |
| Image | `image`, `image-file` | `asset-studio` produces `image-file`. |
| Audio | `audio`, `audio-file` | `audio-sfx-playground-v2` produces `audio-file`. |
| Tilemap | `tilemap`, `tilemap-json` | `tile-map-editor` produces `tilemap-json`. |
| Localization | `localization`, `localization-json` | `localization-studio` produces `localization-json`. |

The shared output vocabulary is validated by `tests/shared/tools/ToolOutputDeclarationContract.test.mjs`.

## All Tool Declarations

| Tool Contract | Grouping | Contract Module | Matching Test |
|---|---|---|---|
| `ai-assistant` | AI | `src/shared/contracts/tools/aiAssistantContract.js` | `tests/shared/tools/AiAssistantToolContract.test.mjs` |
| `animation-studio` | Animation | `src/shared/contracts/tools/animationStudioContract.js` | `tests/shared/tools/AnimationStudioToolContract.test.mjs` |
| `asset-manager-v2` | Assets | `src/shared/contracts/tools/assetManagerContract.js` | `tests/shared/tools/AssetManagerV2ToolContract.test.mjs` |
| `asset-pipeline` | Pipeline | `src/shared/contracts/tools/assetPipelineContract.js` | `tests/shared/tools/AssetPipelineToolContract.test.mjs` |
| `asset-studio` | Assets | `src/shared/contracts/tools/assetStudioContract.js` | `tests/shared/tools/AssetStudioToolContract.test.mjs` |
| `audio-sfx-playground-v2` | Audio | `src/shared/contracts/tools/audioSfxPlaygroundContract.js` | `tests/shared/tools/AudioSfxPlaygroundV2ToolContract.test.mjs` |
| `code-studio` | Code | `src/shared/contracts/tools/codeStudioContract.js` | `tests/shared/tools/CodeStudioToolContract.test.mjs` |
| `collision-inspector-v2` | Debug | `src/shared/contracts/tools/collisionInspectorContract.js` | `tests/shared/tools/CollisionInspectorV2ToolContract.test.mjs` |
| `game-builder` | Build | `src/shared/contracts/tools/gameBuilderContract.js` | `tests/shared/tools/GameBuilderToolContract.test.mjs` |
| `game-design-studio` | Design | `src/shared/contracts/tools/gameDesignStudioContract.js` | `tests/shared/tools/GameDesignStudioToolContract.test.mjs` |
| `input-mapping-v2` | Input | `src/shared/contracts/tools/inputMappingContract.js` | `tests/shared/tools/InputMappingV2ToolContract.test.mjs` |
| `input-studio` | Input | `src/shared/contracts/tools/inputStudioContract.js` | `tests/shared/tools/InputStudioToolContract.test.mjs` |
| `localization-studio` | Localization | `src/shared/contracts/tools/localizationStudioContract.js` | `tests/shared/tools/LocalizationStudioToolContract.test.mjs` |
| `midi-studio-v2` | Audio | `src/shared/contracts/tools/midiStudioContract.js` | `tests/shared/tools/MidiStudioV2ToolContract.test.mjs` |
| `object-vector-studio-v2` | Object Vectors | `src/shared/contracts/tools/objectVectorStudioContract.js` | `tests/shared/tools/ObjectVectorStudioV2ToolContract.test.mjs` |
| `palette-manager-v2` | Palettes | `src/shared/contracts/tools/paletteManagerContract.js` | `tests/shared/tools/PaletteManagerV2ToolContract.test.mjs` |
| `parallax-editor` | Parallax | `src/shared/contracts/tools/parallaxEditorContract.js` | `tests/shared/tools/ParallaxEditorToolContract.test.mjs` |
| `particle-studio` | FX | `src/shared/contracts/tools/particleStudioContract.js` | `tests/shared/tools/ParticleStudioToolContract.test.mjs` |
| `performance-profiler` | Debug | `src/shared/contracts/tools/performanceProfilerContract.js` | `tests/shared/tools/PerformanceProfilerToolContract.test.mjs` |
| `physics-sandbox` | Debug | `src/shared/contracts/tools/physicsSandboxContract.js` | `tests/shared/tools/PhysicsSandboxToolContract.test.mjs` |
| `preview-generator-v2` | Preview | `src/shared/contracts/tools/previewGeneratorContract.js` | `tests/shared/tools/PreviewGeneratorV2ToolContract.test.mjs` |
| `publish-studio` | Publishing | `src/shared/contracts/tools/publishStudioContract.js` | `tests/shared/tools/PublishStudioToolContract.test.mjs` |
| `replay-visualizer` | Debug | `src/shared/contracts/tools/replayVisualizerContract.js` | `tests/shared/tools/ReplayVisualizerToolContract.test.mjs` |
| `sound-studio` | Audio | `src/shared/contracts/tools/soundStudioContract.js` | `tests/shared/tools/SoundStudioToolContract.test.mjs` |
| `sprite-editor` | Sprites | `src/shared/contracts/tools/spriteEditorContract.js` | `tests/shared/tools/SpriteEditorToolContract.test.mjs` |
| `state-inspector` | Debug | `src/shared/contracts/tools/stateInspectorContract.js` | `tests/shared/tools/StateInspectorToolContract.test.mjs` |
| `storage-inspector-v2` | Debug | `src/shared/contracts/tools/storageInspectorContract.js` | `tests/shared/tools/StorageInspectorV2ToolContract.test.mjs` |
| `text2speech-V2` | Audio | `src/shared/contracts/tools/textToSpeechContract.js` | `tests/shared/tools/Text2SpeechV2ToolContract.test.mjs` |
| `3d-asset-viewer` | 3D | `src/shared/contracts/tools/threeDAssetViewerContract.js` | `tests/shared/tools/ThreeDAssetViewerToolContract.test.mjs` |
| `3d-camera-path-editor` | 3D | `src/shared/contracts/tools/threeDCameraPathEditorContract.js` | `tests/shared/tools/ThreeDCameraPathEditorToolContract.test.mjs` |
| `3d-json-payload` | 3D | `src/shared/contracts/tools/threeDJsonPayloadContract.js` | `tests/shared/tools/ThreeDJsonPayloadToolContract.test.mjs` |
| `tile-map-editor` | Tile Maps | `src/shared/contracts/tools/tileMapEditorContract.js` | `tests/shared/tools/TileMapEditorToolContract.test.mjs` |
| `workspace-manager-v2` | Workspace | `src/shared/contracts/tools/workspaceManagerContract.js` | `tests/shared/tools/WorkspaceManagerV2ToolContract.test.mjs` |
| `world-vector-studio-v2` | World Vectors | `src/shared/contracts/tools/worldVectorStudioContract.js` | `tests/shared/tools/WorldVectorStudioV2ToolContract.test.mjs` |

## Root Tools Index Card Coverage

The root Tools Index card data includes public/root cards that are not all active registered first-class tools. Tool contracts cover registered tools directly, map legacy/root card names to their first-class contract where applicable, and document non-tool cards.

| Root Card | Coverage | Contract ID | Contract Module | Matching Test | Notes |
|---|---|---|---|---|---|
| Asset Studio | Contracted | `asset-studio` | `src/shared/contracts/tools/assetStudioContract.js` | `tests/shared/tools/AssetStudioToolContract.test.mjs` | Root planning/tool card contract. |
| Object Vector Studio | Mapped | `object-vector-studio-v2` | `src/shared/contracts/tools/objectVectorStudioContract.js` | `tests/shared/tools/ObjectVectorStudioV2ToolContract.test.mjs` | Root card links `object-vector-studio.html`; first-class contract is `object-vector-studio-v2`. |
| World Vector Studio | Mapped | `world-vector-studio-v2` | `src/shared/contracts/tools/worldVectorStudioContract.js` | `tests/shared/tools/WorldVectorStudioV2ToolContract.test.mjs` | Root card links `world-vector-studio.html`; first-class contract is `world-vector-studio-v2`. |
| Palette Manager | Mapped | `palette-manager-v2` | `src/shared/contracts/tools/paletteManagerContract.js` | `tests/shared/tools/PaletteManagerV2ToolContract.test.mjs` | Root card links `palette-manager.html`; first-class contract is `palette-manager-v2`. |
| Game Builder | Contracted | `game-builder` | `src/shared/contracts/tools/gameBuilderContract.js` | `tests/shared/tools/GameBuilderToolContract.test.mjs` | Root planning/tool card contract. |
| Game Design Studio | Contracted | `game-design-studio` | `src/shared/contracts/tools/gameDesignStudioContract.js` | `tests/shared/tools/GameDesignStudioToolContract.test.mjs` | Root planning/tool card contract. |
| Publish Studio | Contracted | `publish-studio` | `src/shared/contracts/tools/publishStudioContract.js` | `tests/shared/tools/PublishStudioToolContract.test.mjs` | Root planning/tool card contract. |
| Animation Studio | Contracted | `animation-studio` | `src/shared/contracts/tools/animationStudioContract.js` | `tests/shared/tools/AnimationStudioToolContract.test.mjs` | Root planning/tool card contract. |
| Particle Studio | Contracted | `particle-studio` | `src/shared/contracts/tools/particleStudioContract.js` | `tests/shared/tools/ParticleStudioToolContract.test.mjs` | Root planning/tool card contract. |
| MIDI Studio | Mapped | `midi-studio-v2` | `src/shared/contracts/tools/midiStudioContract.js` | `tests/shared/tools/MidiStudioV2ToolContract.test.mjs` | Root card links `midi-studio.html`; first-class contract is `midi-studio-v2`. |
| Sound Studio | Contracted | `sound-studio` | `src/shared/contracts/tools/soundStudioContract.js` | `tests/shared/tools/SoundStudioToolContract.test.mjs` | Root planning/tool card contract. |
| AI Assistant | Contracted | `ai-assistant` | `src/shared/contracts/tools/aiAssistantContract.js` | `tests/shared/tools/AiAssistantToolContract.test.mjs` | Root planning/tool card contract. |
| Code Studio | Contracted | `code-studio` | `src/shared/contracts/tools/codeStudioContract.js` | `tests/shared/tools/CodeStudioToolContract.test.mjs` | Root planning/tool card contract. |
| Input Studio | Contracted | `input-studio` | `src/shared/contracts/tools/inputStudioContract.js` | `tests/shared/tools/InputStudioToolContract.test.mjs` | Root planning/tool card contract. |
| Marketplace | Skipped | n/a | n/a | n/a | Targets `marketplace/index.html`, which is a marketplace page rather than a first-class tool contract. |
| Localization Studio | Contracted | `localization-studio` | `src/shared/contracts/tools/localizationStudioContract.js` | `tests/shared/tools/LocalizationStudioToolContract.test.mjs` | Root planning/tool card contract. |
| Arcade | Skipped | n/a | n/a | n/a | Targets `arcade/index.html`, which is a play surface rather than a first-class tool contract. |
| Storage Inspector | Mapped | `storage-inspector-v2` | `src/shared/contracts/tools/storageInspectorContract.js` | `tests/shared/tools/StorageInspectorV2ToolContract.test.mjs` | Root card links `storage-inspector.html`; first-class contract is `storage-inspector-v2`. |

## Summary

- Active visible registered first-class tools discovered: 23
- Tool contracts defined: 34
- Tool contracts with grouping metadata: 34
- Per-tool contract modules: 34
- Matching per-tool declaration tests: 34
- Shared tool behavior tests: 2
- Registered first-class tools without contract: 0
- Root Tools Index cards reviewed: 18
- Root Tools Index cards skipped as non-tool surfaces: 2
- Top-level asset/palette/vector output behavior contracts remaining: 0
- Duplicate output behavior models remaining: 0
