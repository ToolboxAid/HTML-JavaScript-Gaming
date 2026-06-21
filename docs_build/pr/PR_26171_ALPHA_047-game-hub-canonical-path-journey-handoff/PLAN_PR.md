# PR_26171_ALPHA_047-game-hub-canonical-path-journey-handoff PLAN

## Source Of Truth
- `docs_build/dev/PROJECT_INSTRUCTIONS.md`
- `docs_build/dev/PROJECT_MULTI_PC.txt`
- User request: `PR_26171_ALPHA_047-game-hub-canonical-path-journey-handoff`

## Purpose
Canonicalize the active Game Hub route from `toolbox/game-workspace/` to `toolbox/game-hub/` and preserve the Idea Board to Game Hub to Game Journey handoff.

## Ownership
- Team: Alpha
- Area: Game Hub, Idea flow, Game Journey handoff
- Merge gate: do not merge without explicit Team Alpha owner approval.

## Scope
- Rename active Game Hub path and active Game Hub JavaScript files.
- Update active navigation, registry, imports, tests, tool display mode slug, and creator-facing paths.
- Keep the existing shared repository/API contract unless a minimal alias is required for route compatibility.
- Ensure Idea Board Create Project opens the canonical Game Hub route and preserves source Idea/Pitch/Notes.
- Ensure Game Journey can display executable journey items created from source idea notes.

## Non-Scope
- No full database migration.
- No real Postgres/API expansion.
- No duplicate active Game Hub path.
- No merge without Team Alpha approval.
