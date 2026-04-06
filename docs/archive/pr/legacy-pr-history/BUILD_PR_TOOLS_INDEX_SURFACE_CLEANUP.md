# BUILD_PR_TOOLS_INDEX_SURFACE_CLEANUP

## Purpose
Clean up `tools/index.html` so it acts as a user-facing launcher for true first-class tools only.

## Scope
In scope:
- remove non-launchable planning and platform/internal sections from `tools/index.html`
- keep the landing page aligned with the registry-driven first-class tool set
- keep `Sprite Editor` first-class and visible
- keep preserved legacy sprite tooling hidden
- preserve engine theme usage

Out of scope:
- registry shape changes beyond what is needed for alignment
- tool implementation changes
- engine runtime changes
- broader content refactors outside the tools landing surface

## First-Class Launchable Tools
- Vector Map Editor
- Vector Asset Studio
- Tilemap Studio
- Parallax Scene Studio
- Sprite Editor

## Preserved But Hidden
- `tools/SpriteEditor_old_keep/`

## Implementation Summary
- removed the `Planned Next` section from the tools landing page because it did not represent active launchable tools
- removed the `Advanced Systems & Extensions` section from the tools landing page because those entries are platform/dev placeholders rather than actual tools under `tools/`
- kept the landing page focused on the registry-driven first-class tool launcher only
- preserved the engine theme and shared shell usage
- kept registry and renderer behavior aligned with the active tool list

## Files Changed
- `tools/index.html`
- `docs/pr/BUILD_PR_TOOLS_INDEX_SURFACE_CLEANUP.md`
- `docs/dev/COMMIT_COMMENT.txt`

## Validation Performed
- `node scripts/validate-tool-registry.mjs`
- `node scripts/validate-active-tools-surface.mjs`

## Validation Summary
- the active landing page remains aligned with the registry
- `Sprite Editor` remains visible as a first-class tool
- `SpriteEditor_old_keep` remains hidden from the active UI
- no broken active tool links were introduced by this cleanup
