# BUILD_PR_VECTOR_PLATFORM_SURFACE_POLISH

## Purpose
Polish the `tools/` product surface with one shared shell layer and a registry-driven active tools landing experience for the approved first-class tool set only.

## Scope
In scope:
- shared platform shell for active tools
- registry-driven active tool landing and navigation
- consistent first-class labels for the active tools surface
- active path cleanup and validation

Out of scope:
- gameplay or engine runtime changes
- destructive folder deletes
- framework migration
- broad refactors outside tool-surface polish
- reviving legacy Sprite Editor as a first-class tool

## First-Class Active Tools
- Vector Map Editor
- Vector Asset Studio
- Tile Map Editor
- Parallax Editor

## Preserved Sprite Paths
- `tools/Sprite Editor/` remains on disk but is intentionally excluded from the first-class active tools surface for this PR
- `tools/SpriteEditor_old_keep/` remains preserved on disk as legacy content
- no preserved sprite path is rendered in the active landing page or shared shell navigation

## Modules Created Or Changed
- `tools/toolRegistry.js`
- `tools/renderToolsIndex.js`
- `tools/index.html`
- `tools/shared/platformShell.css`
- `tools/shared/platformShell.js`
- `tools/Vector Asset Studio/index.html`
- `tools/Tilemap Studio/index.html`
- `tools/Parallax Scene Studio/index.html`
- `tools/Vector Map Editor/index.html`
- `scripts/validate-active-tools-surface.mjs`
- `docs/pr/BUILD_PR_VECTOR_PLATFORM_SURFACE_POLISH.md`
- `docs/dev/commit_comment.txt`

## Public Surface Boundaries
- `tools/toolRegistry.js` is the single source of truth for active-tool metadata
- `tools/renderToolsIndex.js` renders the landing-page cards from the registry
- `tools/shared/platformShell.js` renders shared header, nav, and status chrome from the registry
- `tools/shared/platformShell.css` provides shared shell framing without replacing tool-specific workspace CSS
- existing tool workspaces remain mounted inside each tool's current editor shell

## Implementation Summary
- narrowed the first-class tools surface to the four requested tools only
- added a shared platform shell with a consistent header, nav, and status band
- applied the shared shell to the landing page and all four active tool pages
- normalized the visible first-class labels to `Tile Map Editor` and `Parallax Editor` through the shared registry surface
- excluded preserved sprite tooling from the active landing page and shared nav
- kept the underlying tool folders and editor workspaces intact

## Validation Performed
- `node --check tools/toolRegistry.js`
- `node --check tools/renderToolsIndex.js`
- `node --check tools/shared/platformShell.js`
- `node --check scripts/validate-active-tools-surface.mjs`
- `node --check tools/Vector Asset Studio/main.js`
- `node --check tools/Tilemap Studio/main.js`
- `node --check tools/Parallax Scene Studio/main.js`
- `node --check tools/Vector Map Editor/main.js`
- `node scripts/validate-active-tools-surface.mjs`

## Validation Summary
- the landing page active tools list is registry-driven
- only the approved four tools appear in the first-class active surface
- preserved sprite tooling does not appear in active navigation
- shared shell chrome is available on the landing page and each active tool page
- active tool folders and entrypoints resolve cleanly
- stale deprecated sprite-rename references are rejected by the validation script
- disallowed active naming suffixes remain blocked for first-class tools

## Follow-Up Recommendations
- keep future landing-page or active-nav changes routed through the registry instead of hardcoded page lists
- if canonical folder names change later, update the registry and validator in the same PR
- keep future surface polish additive through the shared shell layer
