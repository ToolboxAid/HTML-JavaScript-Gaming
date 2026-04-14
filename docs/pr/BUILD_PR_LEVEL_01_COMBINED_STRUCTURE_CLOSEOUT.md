# BUILD_PR_LEVEL_01_COMBINED_STRUCTURE_CLOSEOUT

## Purpose
Reduce PR count by combining the remaining section-1 work into one closeout-oriented PR.

## Applied Delta
- Roadmap status-marker closeout pass for section 1 completed where directly supported by repo state.
- Structure boundaries validated and documented.
- Incomplete section-1 items left open with exact blockers.

## Boundary Confirmation (Current Repo)
- `src/engine/` exists and is the active runtime structure root.
- `src/shared/` exists and is the active cross-domain shared structure root.
- `games/` exists and is the game ownership root.
- `games/_template/` exists and remains the canonical game template root.
- `samples/` exists and includes phase-grouped folders (including `phase-01` and `phase-13`).
- `tools/` exists and remains the tool ownership root.
- `tools/shared/` exists and remains the shared tool surface.

## Section-1 Items Closed In This PR
- `target structure defined at high level` -> `[x]`
- `src/engine` target established -> `[x]`
- `src/shared` target established -> `[x]`
- `games/` target established -> `[x]`
- `games/_template/` target established -> `[x]`
- `tools/shared` target established -> `[x]`
- `phase-based samples grouping target established` -> `[x]`
- `dependency direction rules defined` -> `[x]`
- `shared asset promotion rules defined` -> `[x]`
- `network samples classified as sample-phase content` -> `[x]`

## Section-1 Items Still Open (Truthful Residue)
- `src/engine/rendering` remains `[ ]`
- `src/engine/physics` remains `[ ]`
- `src/engine/scene` remains `[ ]`
- `implementation PRs executed` remains `[.]`

## Exact Blockers
- Current engine folders are `src/engine/render/` and `src/engine/scenes/`, not the target names `rendering` and `scene`.
- No `src/engine/physics/` target folder is present yet.
- Closing these requires move/rename PRs with import/path normalization and focused smoke validation, which is implementation scope beyond this docs-first closeout pass.

## Handoff Guidance For Follow-On Surgical PRs
1. `MOVE_MAP_L1_ENGINE_RENDER_AND_SCENE_ALIGNMENT`: Move/rename `src/engine/render` -> `src/engine/rendering` and `src/engine/scenes` -> `src/engine/scene`.
2. `MOVE_MAP_L1_ENGINE_PHYSICS_TARGET_BOOTSTRAP`: Establish `src/engine/physics` target structure in a minimal scoped PR.
3. `VALIDATE_L1_STRUCTURE_ALIGNMENT`: Run path/import normalization checks and focused smoke checks on touched games/tools only.

## Validation Notes
- Roadmap edits are status-marker-only.
- No roadmap prose was rewritten.
- No implementation code changes were made in this PR.
- Section 1 is not fully complete yet; only the truly incomplete items remain open.

## Packaging
`<project folder>/tmp/BUILD_PR_LEVEL_01_COMBINED_STRUCTURE_CLOSEOUT.zip`

## Scope guard
- combine work to reduce PR count
- docs-first planning/build bundle
- implementation deferred to follow-on surgical PRs for remaining blockers
- no unrelated repo changes
