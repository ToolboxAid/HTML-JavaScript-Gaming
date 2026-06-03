# Level 8.33 Legacy Catalog Parity Report

## Scope
- Compared `game.manifest.json` parity against legacy catalogs for all game folders with `index.html`.
- Audited safe-removal conditions for:
  - `games/*/assets/workspace.asset-catalog.json`
  - `games/*/assets/tools.manifest.json`
- Deletion rule applied: remove only if no runtime/script/test/tool dependency and no manifest parity loss.

## Per-Game Parity
| Game | `workspace.asset-catalog.json` | Parity vs `game.manifest.json` | `tools.manifest.json` | Parity vs `game.manifest.json` | Safe Removal |
|---|---|---|---|---|---|
| `_template` | n/a | n/a | present | n/a (`domains` empty) | no |
| `AITargetDummy` | present | pass (`1/1` assets covered) | n/a | n/a | no |
| `Asteroids` | present | pass (`12/12` assets covered) | present | pass (`9/9` entries covered) | no |
| `Bouncing-ball` | present | pass (`2/2` assets covered) | n/a | n/a | no |
| `Breakout` | present | pass (`2/2` assets covered) | n/a | n/a | no |
| `GravityWell` | present | pass (`1/1` assets covered) | n/a | n/a | no |
| `Pacman` | present | pass (`2/2` assets covered) | n/a | n/a | no |
| `Pong` | present | pass (`2/2` assets covered) | n/a | n/a | no |
| `SolarSystem` | present | pass (`2/2` assets covered) | n/a | n/a | no |
| `SpaceDuel` | present | pass (`9/9` assets covered) | n/a | n/a | no |
| `SpaceInvaders` | present | pass (`10/10` assets covered) | n/a | n/a | no |
| `vector-arcade-sample` | present | pass (`11/11` assets covered) | n/a | n/a | no |

## Removable Files Identified
- none

## Deleted Files
- none

## Retained Legacy Files and Reasons
### `workspace.asset-catalog.json` files (all present game folders)
- retained for runtime/tooling dependency safety.
- dependency evidence (runtime/tooling convention by filename):
  - `games/shared/workspaceGameAssetCatalog.js`
  - `games/shared/gameSkinLoader.js`
  - `tools/Workspace Manager/main.js`
  - `tools/Asset Browser/main.js`
  - `tools/Asset Pipeline Tool/main.js`
  - `tools/Skin Editor/main.js`
  - `tools/shared/platformShell.js`
  - `scripts/sync-tool-hints-from-workspace-manager.mjs`

### `tools.manifest.json` files
- `games/Asteroids/assets/tools.manifest.json` retained:
  - runtime/tooling/test/script references remain, including:
    - `tools/shared/pipeline/assetManifestLoader.js`
    - `tools/shared/pipeline/gameAssetManifestCoordinator.js`
    - `tools/shared/pipeline/assetPipelineTooling.js`
    - `scripts/validate-asset-ownership-strategy.mjs`
    - `tests/tools/GameAssetManifestDiscovery.test.mjs`
    - `tests/tools/AssetPipelineTooling.test.mjs`
- `games/_template/assets/tools.manifest.json` retained:
  - template contract/tooling dependency:
    - `scripts/validate-games-template-contract.mjs`
    - `scripts/PS/New-Game-from-Template.ps1`

## Safety Outcome
- Manifest parity is proven for all currently present legacy catalogs.
- Safe-removal gate is **not met** due active runtime/tooling/test/script dependencies.
- No deletions were performed to avoid runtime breakage.

## Constraints Check
- `runtime_breakage=none`
- `runtime_code_changes=0`
- `start_of_day_changes=0`
- `validators_added=0`
