# Tool Contract Coverage

PR: PR_26152_072-tool-contract-bundle-tests
Date: 2026-06-02

## Discovery Sources

- Root Tools Index page: `tools/index.html`
- Root Tools Index card data: `tools/tools-page-accordions.js`
- Active first-class tool registry: `tools/toolRegistry.js`
- Contract bundle: `src/shared/contracts/toolContractBundle.js`

## Active Registered First-Class Tools

All active visible registered first-class tools discovered through `getVisibleActiveToolRegistry()` have matching contracts.

| Tool ID | Coverage |
|---|---|
| `world-vector-studio-v2` | Contracted |
| `object-vector-studio-v2` | Contracted |
| `tile-map-editor` | Contracted |
| `parallax-editor` | Contracted |
| `sprite-editor` | Contracted |
| `asset-manager-v2` | Contracted |
| `workspace-manager-v2` | Contracted |
| `palette-manager-v2` | Contracted |
| `preview-generator-v2` | Contracted |
| `text2speech-V2` | Contracted |
| `audio-sfx-playground-v2` | Contracted |
| `midi-studio-v2` | Contracted |
| `collision-inspector-v2` | Contracted |
| `storage-inspector-v2` | Contracted |
| `input-mapping-v2` | Contracted |
| `state-inspector` | Contracted |
| `replay-visualizer` | Contracted |
| `performance-profiler` | Contracted |
| `physics-sandbox` | Contracted |
| `asset-pipeline` | Contracted |
| `3d-json-payload` | Contracted |
| `3d-asset-viewer` | Contracted |
| `3d-camera-path-editor` | Contracted |

## Root Tools Index Card Coverage

The root Tools Index card data includes public/root cards that are not all active registered first-class tools. The contract bundle covers registered tools directly, maps legacy/root card names to their first-class contract where applicable, and documents non-tool cards.

| Root Card | Coverage | Contract ID | Notes |
|---|---|---|---|
| Asset Studio | Contracted | `asset-studio` | Root planning/tool card contract. |
| Object Vector Studio | Mapped | `object-vector-studio-v2` | Root card links `object-vector-studio.html`; first-class contract is `object-vector-studio-v2`. |
| World Vector Studio | Mapped | `world-vector-studio-v2` | Root card links `world-vector-studio.html`; first-class contract is `world-vector-studio-v2`. |
| Palette Manager | Mapped | `palette-manager-v2` | Root card links `palette-manager.html`; first-class contract is `palette-manager-v2`. |
| Game Builder | Contracted | `game-builder` | Root planning/tool card contract. |
| Game Design Studio | Contracted | `game-design-studio` | Root planning/tool card contract. |
| Publish Studio | Contracted | `publish-studio` | Root planning/tool card contract. |
| Animation Studio | Contracted | `animation-studio` | Root planning/tool card contract. |
| Particle Studio | Contracted | `particle-studio` | Root planning/tool card contract. |
| MIDI Studio | Mapped | `midi-studio-v2` | Root card links `midi-studio.html`; first-class contract is `midi-studio-v2`. |
| Sound Studio | Contracted | `sound-studio` | Root planning/tool card contract. |
| AI Assistant | Contracted | `ai-assistant` | Root planning/tool card contract. |
| Code Studio | Contracted | `code-studio` | Root planning/tool card contract. |
| Input Studio | Contracted | `input-studio` | Root planning/tool card contract. |
| Marketplace | Skipped | n/a | Targets `marketplace/index.html`, which is a marketplace page rather than a first-class tool contract. |
| Localization Studio | Contracted | `localization-studio` | Root planning/tool card contract. |
| Arcade | Skipped | n/a | Targets `arcade/index.html`, which is a play surface rather than a first-class tool contract. |
| Storage Inspector | Mapped | `storage-inspector-v2` | Root card links `storage-inspector.html`; first-class contract is `storage-inspector-v2`. |

## Summary

- Active visible registered first-class tools discovered: 23
- Tool contracts defined: 34
- Registered first-class tools without contract: 0
- Root Tools Index cards reviewed: 18
- Root Tools Index cards skipped as non-tool surfaces: 2
