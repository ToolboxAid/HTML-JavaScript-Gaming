# BUILD_PR_LEVEL_09_05_SHARED_ASSET_HANDOFF_ENFORCEMENT

## Purpose
Implement the smallest enforcement slice that makes the shared asset and shared palette handoff contract real across first-class tools after 09_04 asset structure simplification.

This PR must tighten launch/consume behavior for shared asset flows without widening into engine refactors, sample work, or broad UI redesign.

## Why This PR Exists
09_04 established the asset usage contract, moved active template surfaces under `tools/templates/`, and proved normalized shared asset locations across Asteroids and the starter project baseline. However, the contract is still only partially effective until active tools consistently:
- launch shared browse/import/manage flows through the common shell
- publish normalized handoff payloads under the approved storage keys
- consume shared handoff summaries without silently forking tool-private defaults

This PR closes that enforcement gap.

## Source Baseline
Treat these as the architectural baseline for this PR:
- `docs/reference/architecture-standards/specs/asset_usage_contract.md`
- `tools/shared/vectorAssetSystem.js`
- `tools/Asset Browser/main.js`
- `tools/templates/starter-project-template/config/starter.project.json`
- `tests/tools/VectorAssetSystem.test.mjs`

## In Scope
- first-class tool launch and consume enforcement for shared asset/palette handoff
- shared shell action normalization where required for the in-scope tools
- storage-key and payload-shape enforcement against the 09_04 contract
- narrow validation/tests that prove the contract is being used consistently
- starter template compatibility only where required to preserve the contract

## Out of Scope
- engine core API changes
- game runtime behavior changes
- sample curriculum work
- broad tool UI cleanup or redesign
- legacy tool reintegration
- filesystem mutation/import-copy automation expansion
- broad asset registry redesign

## Required Contract Enforcement

### 1. Shared action labels remain exact
For active first-class tools in scope, shared actions must continue using these exact labels:
- `Browse Assets`
- `Import Assets`
- `Browse Palettes`
- `Manage Palettes`

Do not introduce tool-specific label drift.

### 2. Shared launch query contract must be real
When an in-scope tool launches the shared Asset Browser or Palette Browser flow, it must use the normalized query-parameter contract defined in `docs/reference/architecture-standards/specs/asset_usage_contract.md`:
- `view`
- `sourceToolId`

Examples:
- `../Asset Browser/index.html?view=import&sourceToolId=tile-map-editor`
- `../Palette Browser/index.html?view=browse&sourceToolId=sprite-editor`

No alternate ad hoc query names may be introduced.

### 3. Shared handoff storage keys must be canonical
Asset handoff must use:
- `toolboxaid.shared.assetHandoff`

Palette handoff must use:
- `toolboxaid.shared.paletteHandoff`

Do not add duplicate parallel keys for the same responsibility.

### 4. Handoff payload shape must be normalized
For the tools touched in this PR, handoff payloads must preserve the stable top-level fields documented in the contract.

Asset handoff must preserve at minimum:
- `assetId`
- `assetType`
- `sourcePath`
- `displayName`
- `metadata`
- `sourceToolId`
- `selectedAt`

Palette handoff must preserve at minimum:
- `paletteId`
- `displayName`
- `colors`
- `metadata`
- `sourceToolId`
- `selectedAt`

Metadata may extend the shape but must not replace the stable top-level fields.

### 5. Active tools must consume the shared handoff, not fork private defaults
For each in-scope tool, consuming a handoff must prefer the shared contract payload over hidden tool-private default copies whenever the handoff payload is valid.

Graceful degradation is required:
- invalid or missing handoff payloads must not crash the tool
- invalid or missing payloads may fall back safely
- fallback must not overwrite the canonical handoff contract with malformed data

## Required Implementation Shape
Implement the smallest safe slice that proves the contract across the most important active tools.

### Minimum in-scope tools
At minimum, cover:
- `Asset Browser / Import Hub`
- `Sprite Editor`
- `Vector Map Editor`
- `Vector Asset Studio`
- `Tile Map Editor`
- `Parallax Editor`

If some tools already comply, keep edits surgical and only normalize the drift that still exists.

### Likely file targets
Use only if needed; do not expand beyond proven necessity.
- `tools/shared/...` shared launch/handoff helper(s)
- active tool entry scripts for the in-scope tools
- `tools/Asset Browser/main.js`
- palette browser/manager entry script if present and required
- focused tests under `tests/tools/`
- starter template config only if compatibility needs a narrow update

## Acceptance Criteria
1. In-scope first-class tools launch shared browse/import/manage flows using the normalized query contract.
2. Asset and palette handoffs use the canonical storage keys only.
3. Published handoff payloads preserve the stable top-level contract fields.
4. Consuming tools prefer valid shared handoff payloads over hidden tool-private defaults.
5. Invalid or missing handoff payloads degrade safely without crashes.
6. Legacy tools remain excluded.
7. No engine core API files change.
8. No unrelated tool-shell cleanup is bundled into this PR.

## Validation Requirements
Provide focused proof, not broad regression theater.

### Required validation lanes
- targeted unit/integration coverage for launch query generation and handoff payload normalization
- targeted coverage for consumer-side safe fallback on invalid/missing payloads
- targeted coverage that shared asset selection preserves canonical fields and source paths
- targeted coverage that shared palette selection preserves canonical fields and colors

### Manual validation checklist
1. Launch each in-scope tool and confirm shared actions use normalized labels.
2. Trigger `Browse Assets` or `Import Assets` from at least two tools and confirm the browser opens with `view` and `sourceToolId`.
3. Select a shared asset and confirm `toolboxaid.shared.assetHandoff` stores the normalized payload.
4. Select a shared palette and confirm `toolboxaid.shared.paletteHandoff` stores the normalized payload.
5. Re-open a consuming tool and confirm it reads the shared handoff without creating a hidden private duplicate.
6. Corrupt the stored handoff payload and confirm the tool degrades safely.
7. Confirm starter project template still opens without contract breakage.
8. Confirm no engine-core files changed.

## Constraints
- Docs-first, surgical PR only.
- One purpose only: enforce shared handoff behavior.
- Preserve 09_04 asset ownership and template relocation outcomes.
- Do not move assets again in this PR.
- Do not add new showcase/sample surfacing.
- Do not change engine/game runtime contracts.

## Approved Commit Comment
build(assets): enforce shared tool asset and palette handoff contract

## Next Command
APPLY_PR_LEVEL_09_05_SHARED_ASSET_HANDOFF_ENFORCEMENT
