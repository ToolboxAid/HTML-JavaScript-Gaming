MODEL: GPT-5.4
REASONING: high

COMMAND:
Create BUILD_PR_TOOLS_REGISTRY_AND_SPRITE_RENAME as a docs-aligned implementation PR.

REPO RULES:
- Treat tools/ as a first-class product surface.
- Keep this PR surgical and limited to tool naming, tool registry, generated navigation, and validation.
- Do not delete preserved legacy content unless absolutely required and explicitly approved.
- Prefer one canonical source of truth for active tool metadata.
- Preserve existing behavior except where required for the canonical Sprite Editor path and tool-surface cleanup.

TASKS:
1. Standardize the active sprite tool at tools/Sprite Editor.
2. Update active references, labels, titles, links, and path usage to Sprite Editor.
3. Introduce a single source of truth registry for active tools.
4. Ensure the active tools list/navigation renders from that registry rather than duplicated hardcoded names.
5. Mark only these as active first-class tools:
   - Vector Map Editor
   - Vector Asset Studio
   - Tile Map Editor
   - Parallax Editor
   - Sprite Editor
6. Ensure legacy-preserved tools do not appear in the active tools list.
7. Add a lightweight validation check/script that detects:
   - missing active tool folders
   - stale sprite-editor rename references
   - legacy tools appearing in active navigation
   - disallowed active naming suffixes like V2/V3/new/final/copy
8. Validate all active tool loading paths after the rename.

OUTPUTS:
- Repo changes only for this PR scope
- docs/pr/BUILD_PR_TOOLS_REGISTRY_AND_SPRITE_RENAME.md retained
- docs/dev/commit_comment.txt updated
- package final delta zip to:
  <project folder>/tmp/BUILD_PR_TOOLS_REGISTRY_AND_SPRITE_RENAME_delta.zip

COMMIT COMMENT:
Unify active tools under a first-class tools registry, standardize Sprite Editor at tools/Sprite Editor, generate active tool navigation from a single source of truth, and add validation to prevent naming/path drift.

NEXT COMMAND:
MODEL: GPT-5.4
REASONING: high
COMMAND: Create BUILD_PR_VECTOR_PLATFORM_SURFACE_POLISH to standardize tool landing UX, descriptions, icons/labels, and showcase ordering across the active tools registry without changing engine behavior.
