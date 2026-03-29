Toolbox Aid
David Quesenberry
03/29/2026
PLAN_PR_REPO_CLEANUP_PHASE_1C_SPRITE_EDITOR_HELPER_OWNERSHIP_AND_PANEL_BOUNDARY_NORMALIZATION.md

# PLAN_PR - Repo Cleanup Phase 1C

## Title
Repo Cleanup Phase 1C - Sprite Editor Helper Ownership and Panel Boundary Normalization

## Purpose
Define a docs-first, Sprite Editor-only cleanup pass that normalizes helper ownership and panel boundaries without changing behavior.

## Workflow Lock
- PLAN_PR -> BUILD_PR -> APPLY_PR
- No scope expansion
- No architecture rewrite

## Scope Lock
Allowed:
- `tools/SpriteEditor/modules/`
- `docs/dev/`

Not allowed:
- `engine/`
- `games/`
- `samples/`
- `tests/`
- tools outside `tools/SpriteEditor/`

## In Scope
1. Left-panel ownership normalization
- Left panel retains action wiring and section ownership.
- Single-open accordion behavior remains unchanged.

2. Right-panel ownership normalization
- Right panel retains palette/state presentation ownership.
- No left-panel action migration into right panel modules.

3. Helper ownership normalization (tool-local only)
- Move misplaced helpers to the narrowest local owner.
- Remove duplicate local helper logic where behavior is equivalent.
- Keep all helper reuse inside Sprite Editor.

4. Behavior preservation
- No feature additions.
- No UI workflow redesign.
- No visual redesign outside boundary normalization.

## Out of Scope
- Engine extraction
- Cross-tool shared utility creation
- Sprite Editor feature refactor
- Sample/game changes

## Expected BUILD Deliverables
- Sprite Editor module deltas only (minimal set)
- `docs/dev/BUILD_PR_REPO_CLEANUP_PHASE_1C_SPRITE_EDITOR_HELPER_OWNERSHIP_AND_PANEL_BOUNDARY_NORMALIZATION.md`
- `docs/dev/CODEX_COMMANDS.md`
- `docs/dev/COMMIT_COMMENT.txt`
- `docs/dev/NEXT_COMMAND.txt`
- `docs/dev/README.md`
- helper ownership before/after table in BUILD output

## Acceptance Criteria
1. Behavior is stable.
2. Ownership is clearer from module location and naming.
3. No files changed under `engine/`, `games/`, `samples/`, or `tests/`.
4. Build output includes full repo-relative path list.
5. Build output includes helper ownership before/after table.
