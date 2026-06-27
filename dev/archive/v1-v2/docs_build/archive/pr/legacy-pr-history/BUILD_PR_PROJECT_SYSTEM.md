# BUILD_PR_PROJECT_SYSTEM

## Runtime scope
- Shared project manifest contract for active first-class tools
- Shared project controller in the engine-themed shell
- Serializer, validator, and migration entry points
- Dirty-state tracking, prompts, and project header status
- Per-tool persistence adapters for active tools only

## Modules created
- `toolbox/shared/projectManifestContract.js`
- `toolbox/shared/projectSystem.js`
- `toolbox/shared/projectSystemAdapters.js`
- `docs/reference/architecture-standards/specs/project_manifest_contract.md`
- `scripts/validate-project-system.mjs`

## Modules changed
- `toolbox/shared/platformShell.js`
- `toolbox/shared/platformShell.css`
- `toolbox/Tilemap Studio/main.js`
- `toolbox/Parallax Scene Studio/main.js`
- `toolbox/Sprite Editor/main.js`
- `toolbox/Sprite Editor/modules/spriteEditorApp.js`
- `toolbox/Vector Asset Studio/main.js`
- `toolbox/Asset Browser/main.js`
- `toolbox/Palette Browser/main.js`

## Public/runtime boundaries
- The shell owns project actions: New, Open, Save, Save As, Close
- The manifest contract owns schema/version/validation/migration rules
- Adapters own tool-specific capture/apply behavior
- Shared asset/palette references stay rooted in manifest `sharedReferences`
- `toolbox/index.html` remains tool-only
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
- `node --check toolbox/shared/projectManifestContract.js`
- `node --check toolbox/shared/projectSystem.js`
- `node --check toolbox/shared/projectSystemAdapters.js`
- `node --check toolbox/shared/platformShell.js`
- `node --check toolbox/Tilemap Studio/main.js`
- `node --check toolbox/Parallax Scene Studio/main.js`
- `node --check toolbox/Sprite Editor/main.js`
- `node --check toolbox/Sprite Editor/modules/spriteEditorApp.js`
- `node --check toolbox/Vector Asset Studio/main.js`
- `node --check toolbox/Asset Browser/main.js`
- `node --check toolbox/Palette Browser/main.js`
- `node scripts/validate-tool-registry.mjs`
- `node scripts/validate-active-tools-surface.mjs`
- `node scripts/validate-project-system.mjs`

## Follow-up recommendations
- Add focused browser/manual QA for cross-tool open/save navigation flows
- Add explicit automated round-trip tests for each adapter
- Add future manifest migrations through `migrateProjectManifest()` only
