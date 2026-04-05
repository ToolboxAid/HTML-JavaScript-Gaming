MODEL: GPT-5.4
REASONING: high

COMMAND:
Create BUILD_PR_VECTOR_PLATFORM_SURFACE_POLISH as a surgical tools-surface implementation PR.

OBJECTIVE:
Make the `tools/` folder first-class and visually unified by adding a shared platform shell and registry-driven active tools surface for:
- Vector Map Editor
- Vector Asset Studio
- Tile Map Editor
- Parallax Editor

PRESERVE:
- legacy Sprite Editor under preserved pathing such as `tools/SpritEditor_old_keep/`
- existing unique editor workspaces per tool
- current repo boundaries; do not modify engine/game runtime code

IMPLEMENT:
1. Add/update a first-class tools landing surface.
2. Generate active tool entries from the canonical tool registry.
3. Add a lightweight shared platform CSS/JS layer for header/nav/status/workspace chrome.
4. Apply the shared shell to all active tools.
5. Normalize visible labels/actions across active tools.
6. Exclude legacy Sprite Editor from active tools surface.
7. Validate all renamed paths and remove stale references.

GUARDRAILS:
- no destructive deletes
- no framework migration
- no gameplay/runtime engine changes
- no ad hoc duplicated tool menus in multiple files
- keep changes small, readable, and reversible

OUTPUT:
<project folder>/tmp/BUILD_PR_VECTOR_PLATFORM_SURFACE_POLISH.zip
