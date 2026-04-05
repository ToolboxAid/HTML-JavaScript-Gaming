# BUILD_PR_ASSET_BROWSER_IMPORT_HUB_AND_PALETTE_BROWSER_MANAGER

## Objective
Implement two new first-class tools under `tools/`:

1. `Asset Browser / Import Hub`
2. `Palette Browser / Manager`

The build stays surgical: both tools use the shared engine theme and platform shell, are surfaced through the registry-driven tools landing page, keep `Sprite Editor` first-class, and keep `SpriteEditor_old_keep` preserved but hidden.

## Files Added
- `tools/Asset Browser/index.html`
- `tools/Asset Browser/main.js`
- `tools/Asset Browser/assetBrowser.css`
- `tools/Asset Browser/README.md`
- `tools/Palette Browser/index.html`
- `tools/Palette Browser/main.js`
- `tools/Palette Browser/paletteBrowser.css`
- `tools/Palette Browser/README.md`

## Files Updated
- `tools/toolRegistry.js`
- `tools/index.html`
- `scripts/validate-tool-registry.mjs`
- `scripts/validate-active-tools-surface.mjs`
- `docs/dev/COMMIT_COMMENT.txt`
- `docs/dev/reports/change_summary.txt`
- `docs/dev/reports/validation_checklist.txt`

## Implementation Summary

### Asset Browser / Import Hub
- Added a launchable first-class tool at `tools/Asset Browser/`.
- Uses shared shell and engine theme.
- Browses approved asset locations only.
- Previews real repo-backed vector, sprite, tilemap, parallax, palette, and workflow JSON assets.
- Provides a non-destructive import-plan flow with:
  - category selection
  - approved destination selection
  - lowercase naming validation
  - duplicate conflict warning
  - downloadable import-plan JSON

### Palette Browser / Manager
- Added a launchable first-class tool at `tools/Palette Browser/`.
- Uses shared shell and engine theme.
- Loads built-in palettes from `engine/paletteList.js`.
- Supports local custom palette workflows through browser storage:
  - create
  - duplicate
  - rename
  - add swatch
  - delete swatch
  - copy/export JSON
- Publishes a lightweight palette handoff record for active art tools.

### Registry and Landing Surface
- Registered both tools as active first-class entries in `tools/toolRegistry.js`.
- The tools landing page continues to render from the shared registry-driven grid.
- Removed the now-obsolete planned placeholder cards for the two live tools.
- Kept samples off the tools landing page.
- Kept `Sprite Editor` visible and first-class.
- Kept `SpriteEditor_old_keep` hidden legacy.

## Validation Changes
- Extended `scripts/validate-tool-registry.mjs` to require both new tools in the registry and on disk.
- Extended `scripts/validate-active-tools-surface.mjs` to validate both new tool pages.
- Added checks that fail if the static landing page still contains placeholder text for live tools.

## Validation Performed
- `node --check tools/Asset Browser/main.js`
- `node --check tools/Palette Browser/main.js`
- `node scripts/validate-tool-registry.mjs`
- `node scripts/validate-active-tools-surface.mjs`

## Acceptance Summary
- Both tools exist under `tools/`.
- Both tools are active in the shared registry.
- Both tools load through the shared engine/platform shell.
- The tools landing page surfaces them through the existing registry-driven launcher.
- Legacy sprite tooling remains excluded from the active surface.
