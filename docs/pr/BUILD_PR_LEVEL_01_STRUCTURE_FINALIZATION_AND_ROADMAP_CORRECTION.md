# BUILD_PR_LEVEL_01_STRUCTURE_FINALIZATION_AND_ROADMAP_CORRECTION

## Purpose
Finalize the remaining planning/definition work for roadmap section 1 and re-anchor execution order to the correct top-down next lane.

## Scope
- docs-first only
- roadmap status markers only
- no implementation code or broad file churn

## Evidence Snapshot (Current Repo State)
- Root structure contains `src/`, `games/`, `samples/`, `tools/`, `scripts/`, `docs/`, `tests/`.
- Legacy root folders targeted by section-1 move-map are already absent at root: `engine/`, `shared/`, `templates/`.
- Structure-target evidence:
  - `samples/phase-01` exists.
  - `samples/phase-13` exists.
  - `src/engine/render` and `src/engine/scenes` exist, while `src/engine/rendering` and `src/engine/scene` remain pending target names.
  - legacy retention candidate still exists in archive path: `docs/archive/tools/SpriteEditor_old_keep/`.

## Folder Inventory To Target Homes (Definition Closeout)
- Root runtime/shared home: `src/`
- Game ownership home: `games/`
- Tool ownership home: `tools/`
- Sample ownership home: `samples/`
- Docs/archive retention home: `docs/archive/`

## Exact Move-Map Lanes (For Later Implementation PRs)
1. `MOVE_MAP_L1_ENGINE_ALIAS_CONVERGENCE`
- Scope: converge `src/engine/render` -> `src/engine/rendering` and `src/engine/scenes` -> `src/engine/scene`.
- Guard: move-only with import/path fixups and targeted runtime/tool launch checks.
2. `MOVE_MAP_L1_SAMPLE_SHARED_SURFACE_CONVERGENCE`
- Scope: resolve `samples/shared` vs `samples/_shared` to one canonical shared sample surface.
- Guard: no sample behavior rewrite; path and import normalization only.
3. `MOVE_MAP_L1_TOOL_NAME_PATH_ALIGNMENT`
- Scope: align active tool path names with roadmap naming conventions where mismatched.
- Guard: preserve tool entry behavior; no UI redesign.

## Exact Rename-Map Lanes (For Later Implementation PRs)
1. `RENAME_MAP_L1_ENGINE_DIRECTORY_NAMES`
- Targets: `render` -> `rendering`, `scenes` -> `scene`.
2. `RENAME_MAP_L1_TOOL_DIRECTORY_NAMES`
- Targets (where touched): directory names that drift from active canonical tool naming in roadmap and docs.
3. `RENAME_MAP_L1_SAMPLE_SHARED_NAMESPACE`
- Target: one canonical shared-samples namespace.

## Legacy Migration Map (For Later Implementation PRs)
1. `LEGACY_MAP_L1_ARCHIVE_BOUNDARY_CONFIRMATION`
- Keep legacy tool snapshots under `docs/archive/` unless explicitly reactivated.
2. `LEGACY_MAP_L1_IMPORT_AND_REFERENCE_QUARANTINE`
- Ensure active paths do not depend on archive-only legacy paths.
3. `LEGACY_MAP_L1_RETIREMENT_PREREQ_INDEX`
- Add explicit retirement prerequisites before any archive removal decision.

## Validation Gates (For Later Implementation PRs)
1. Path resolution and import normalization checks for touched files.
2. `node --check` for touched JavaScript modules.
3. Focused launch/smoke checks for touched games/tools only.
4. Boundary check: no cross-layer dependency inversion introduced.
5. Delta check: no unrelated repo churn outside defined move/rename lanes.

## Explicit No-Go Areas (For Now)
- No engine core API redesign.
- No asset moves under `games/*/assets/**` in section-1 move-map PRs.
- No runtime feature changes bundled with structure-only PRs.
- No archive deletion from `docs/archive/**` during mapping/definition lanes.

## Roadmap Status Marker Updates Applied
- `current folder inventory mapped to target homes` -> `[x]`
- `move-map defined for root engine -> src/engine` -> `[x]`
- `ambiguous-name rename map defined` -> `[x]`
- `legacy migration map defined` -> `[x]`
- `samples/phase-01` structure target -> `[x]`
- `samples/phase-13` structure target -> `[x]`
- `current active execution lanes are 3 / 6 / 8` -> `[ ]` (de-anchored as next lane signal)

## Next Active Anchor
- Section 1 remains the active top-down anchor via:
  - `Apply repo structure normalization implementation plan` as `[.]`

## Packaging
`<project folder>/tmp/BUILD_PR_LEVEL_01_STRUCTURE_FINALIZATION_AND_ROADMAP_CORRECTION.zip`
