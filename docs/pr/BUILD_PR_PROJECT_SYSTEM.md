# BUILD_PR_PROJECT_SYSTEM

## Runtime scope
- Shared project manifest contract for active first-class tools
- Shared project controller in the engine-themed shell
- Serializer, validator, and migration entry points
- Dirty-state tracking, prompts, and project header status
- Per-tool persistence adapters for active tools only

## Modules created
- `tools/shared/projectManifestContract.js`
- `tools/shared/projectSystem.js`
- `tools/shared/projectSystemAdapters.js`
- `docs/specs/project_manifest_contract.md`
- `scripts/validate-project-system.mjs`

## Modules changed
- `tools/shared/platformShell.js`
- `tools/shared/platformShell.css`
- `tools/Tilemap Studio/main.js`
- `tools/Parallax Scene Studio/main.js`
- `tools/Sprite Editor/main.js`
- `tools/Sprite Editor/modules/spriteEditorApp.js`
- `tools/Vector Asset Studio/main.js`
- `tools/Asset Browser/main.js`
- `tools/Palette Browser/main.js`

## Public/runtime boundaries
- The shell owns project actions: New, Open, Save, Save As, Close
- The manifest contract owns schema/version/validation/migration rules
- Adapters own tool-specific capture/apply behavior
- Shared asset/palette references stay rooted in manifest `sharedReferences`
- `tools/index.html` remains tool-only
- `Sprite Editor` remains first-class
- `SpriteEditor_old_keep` remains hidden legacy and excluded

## Implementation summary
- Added `html-js-gaming.project` as the shared project root with `version: 1`
- Added migration and validation entry points before manifest use
- Added shell project controls and project-name/dirty-state chrome in the shared header
- Added unsaved-change prompts for tool navigation, new/open, and close flows
- Added per-tool adapters for:
  - Vector Map Editor
  - Vector Asset Studio
  - Tilemap Studio
  - Parallax Scene Studio
  - Sprite Editor
  - Asset Browser / Import Hub
  - Palette Browser / Manager
- Persisted shared asset/palette handoffs through manifest references instead of duplicating them in shell state

## Validation performed
- `node --check tools/shared/projectManifestContract.js`
- `node --check tools/shared/projectSystem.js`
- `node --check tools/shared/projectSystemAdapters.js`
- `node --check tools/shared/platformShell.js`
- `node --check tools/Tilemap Studio/main.js`
- `node --check tools/Parallax Scene Studio/main.js`
- `node --check tools/Sprite Editor/main.js`
- `node --check tools/Sprite Editor/modules/spriteEditorApp.js`
- `node --check tools/Vector Asset Studio/main.js`
- `node --check tools/Asset Browser/main.js`
- `node --check tools/Palette Browser/main.js`
- `node scripts/validate-tool-registry.mjs`
- `node scripts/validate-active-tools-surface.mjs`
- `node scripts/validate-project-system.mjs`

## Follow-up recommendations
- Add focused browser/manual QA for cross-tool open/save navigation flows
- Add explicit automated round-trip tests for each adapter
- Add future manifest migrations through `migrateProjectManifest()` only
