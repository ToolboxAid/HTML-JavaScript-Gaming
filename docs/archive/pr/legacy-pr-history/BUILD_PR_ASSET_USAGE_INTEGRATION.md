# BUILD_PR_ASSET_USAGE_INTEGRATION

## Goal
Wire the shared asset and palette systems into all active first-class tools without changing the tool-only launcher surface, without reviving legacy sprite tooling, and without introducing tool-private asset duplication as the default path.

## Scope
Integrated tools:
- `Vector Map Editor`
- `Vector Asset Studio`
- `Tilemap Studio`
- `Parallax Scene Studio`
- `Sprite Editor`
- `Asset Browser / Import Hub`
- `Palette Browser / Manager`

Out of scope:
- `SpriteEditor_old_keep`
- sample restoration on `tools/index.html`
- showcase/game content
- unrelated structural refactors

## Files Added
- `tools/shared/assetUsageIntegration.js`
- `docs/specs/asset_usage_contract.md`

## Files Updated
- `tools/shared/platformShell.js`
- `tools/shared/platformShell.css`
- `tools/Asset Browser/index.html`
- `tools/Asset Browser/main.js`
- `tools/Palette Browser/index.html`
- `tools/Palette Browser/main.js`
- `scripts/validate-active-tools-surface.mjs`
- `docs/dev/COMMIT_COMMENT.txt`
- `docs/dev/reports/change_summary.txt`
- `docs/dev/reports/validation_checklist.txt`

## Implementation Summary

### Shared Shell Integration
- Added a shared asset-usage integration module under `tools/shared/`.
- The shared platform shell now renders normalized launch actions for every active tool page:
  - `Browse Assets`
  - `Import Assets`
  - `Browse Palettes`
  - `Manage Palettes`
- The shared shell also shows the current shared asset and shared palette handoff summaries.

### Shared Handoff Contracts
- Added a documented contract in `docs/specs/asset_usage_contract.md`.
- Normalized shared storage keys:
  - `toolboxaid.shared.assetHandoff`
  - `toolboxaid.shared.paletteHandoff`
- Tools consume shared references by contract instead of creating private default copies.

### Asset Browser / Import Hub
- Added launch-context handling through query params.
- Added a `Use In Active Tool` action that publishes a normalized shared asset handoff.
- Preserved non-destructive import planning behavior.

### Palette Browser / Manager
- Added launch-context handling through query params.
- Updated palette handoff publishing to use the normalized shared contract.
- Preserved built-in palette browsing and local editable palette workflows.

## Surface and Visibility Rules
- `Sprite Editor` remains first-class and visible.
- `SpriteEditor_old_keep` remains preserved and hidden from active surfacing.
- `tools/index.html` remains tool-only.
- No samples were reintroduced to the tools launcher.

## Validation
- `node --check tools/shared/assetUsageIntegration.js`
- `node --check tools/shared/platformShell.js`
- `node --check tools/Asset Browser/main.js`
- `node --check tools/Palette Browser/main.js`
- `node scripts/validate-tool-registry.mjs`
- `node scripts/validate-active-tools-surface.mjs`

## Acceptance Summary
- Every active first-class tool page now exposes the same shared asset/palette launch actions through the engine-themed shell.
- Asset and palette handoffs are normalized and documented.
- Surfacing remains registry-safe and legacy-safe.
