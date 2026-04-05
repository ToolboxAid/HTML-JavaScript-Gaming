Toolbox Aid
David Quesenberry
04/05/2026
BUILD_PR_RENDER_PIPELINE_CONTRACT_ALL_4_TOOLS.md

# BUILD_PR_RENDER_PIPELINE_CONTRACT_ALL_4_TOOLS

## Purpose
Define a unified 2D render pipeline contract for Tile Map Editor, Parallax Editor, Sprite Editor, and Vector Asset Studio using a docs-first, non-destructive seam that does not redesign engine architecture.

## Scope
In scope:
- Unified top-level render contract shape
- Shared metadata and asset record rules
- Normalized layer model + deterministic render ordering
- Tool-specific mapping notes for all 4 tools
- Runtime ownership boundaries
- Validation and acceptance checklist
- Incremental migration guidance that preserves unrelated engine APIs

Out of scope:
- Implementation code
- Engine renderer rewrite
- 3D scope
- Unrelated tool/game/sample edits

## 1. Unified Top-Level Render Contract
Canonical engine-facing document (2D only):

```json
{
  "documentType": "toolbox.render-pipeline.contract",
  "contractVersion": "1.0.0",
  "producer": {
    "tool": "tile-map-editor|parallax-editor|sprite-editor|vector-asset-studio",
    "toolVersion": "string"
  },
  "scene": {
    "id": "string",
    "name": "string",
    "coordinateSpace": "2d"
  },
  "assets": [],
  "layers": [],
  "entities": [],
  "metadata": {}
}
```

Required:
- `documentType`, `contractVersion`, `producer.tool`, `scene.id`, `scene.name`, `scene.coordinateSpace`
- `assets`, `layers`, `entities`, `metadata` always present (can be empty)
- `scene.coordinateSpace` must be `2d`

## 2. Shared Metadata Rules
Top-level metadata standards:
- `projectId` (optional but recommended)
- `createdAt` ISO timestamp (optional)
- `updatedAt` ISO timestamp (optional)
- `tags` array of strings (optional)
- `runtimeFlags` object (optional)

Common object metadata standards:
- `id` required, stable within document
- `name` required, human-readable
- `type` required where enumerated
- `visible` required for renderable items
- `locked` editor-side only (optional for runtime)

ID rules:
- Deterministic where practical
- No duplicates per collection
- No implicit ID rewriting at runtime

## 3. Shared Asset Record Rules
Asset entries under `assets` must use normalized project-relative paths.

Minimal record:

```json
{
  "id": "asset.id",
  "type": "image|spritesheet|vector|tileset",
  "path": "assets/path/file.ext",
  "source": "relative",
  "preload": true,
  "metadata": {}
}
```

Rules:
- No absolute machine paths
- No temp/session-only paths
- Prefer additive updates over replacement
- Avoid duplicates by `id`, then by normalized `type + path` where practical
- Unknown extra fields must be preserved where low-risk

## 4. Normalized Layer Model + Deterministic Ordering
Layer contract fields:
- `id`, `name`, `kind`, `visible`, `opacity`, `zIndex`, `items`
- optional: `parallaxFactorX`, `parallaxFactorY`, `blendMode`

Allowed `kind` values for this contract:
- `tilemap`
- `parallax`
- `sprite`
- `vector`
- `collision`
- `guide`
- `overlay`

Render order rules:
1. Sort by `zIndex` ascending
2. Tie-break by source order (stable)
3. Within layer, render items by explicit item order if present, else source order
4. `guide` and tool-only diagnostic layers excluded from gameplay render unless explicitly flagged

## 5. Tool-Specific Mapping Notes
Tile Map Editor:
- Produces `tilemap` layers
- Declares tileset/image assets
- Maps tile grids, map dimensions, tile size
- `collision`/`data` tool layers mapped as non-art or debug/runtime utility layers by policy

Parallax Editor:
- Produces `parallax` layers
- Declares image/vector assets for background planes
- Maps `parallaxFactorX/Y`, repeat flags, wrap behavior
- Preserves deterministic draw stack through `zIndex`

Sprite Editor:
- Produces `sprite` layers or sprite-entity records
- Declares sprite/spritesheet assets
- Maps frame/animation metadata and origin hints
- Supports shared palette references through metadata links (non-authoritative at runtime)

Vector Asset Studio:
- Produces `vector` layers or vector item collections
- Declares vector/template assets
- Maps primitives/style/transform payloads to normalized render items

## 6. Runtime Ownership Boundaries
Engine/runtime owns:
- Contract validation
- Relative asset resolution
- Normalized runtime model projection
- Deterministic render sequencing
- Clear validation errors

Tools own:
- Valid contract output
- Stable IDs
- Correct layer/asset typing
- Cross-reference integrity

Boundary guardrails:
- Runtime must not silently repair missing required fields
- Runtime must not infer absolute/local paths
- Contract seam should avoid unrelated engine API redesign

## 7. Validation Rules + Acceptance Checklist
Validation rules:
- Required key presence
- Supported `contractVersion`
- Allowed `producer.tool`
- Unique IDs by collection
- Allowed layer kinds only
- Valid asset references from layers/entities
- Numeric/order field sanity (`zIndex`, opacity range)
- 2D coordinate-space enforcement

Acceptance checklist for this BUILD docs PR:
- Contract covers all 4 tools
- Metadata rules are explicit
- Asset record rules are explicit
- Layer model + deterministic ordering are explicit
- Runtime ownership boundary is explicit
- Migration guidance is incremental and non-breaking
- Docs-only scope preserved

## 8. Incremental Migration Guidance (Non-Breaking)
Phase 1: Contract publication
- Publish contract docs and validation checklist
- No runtime or tool behavior changes required in this PR

Phase 2: Tool-side adapters (future BUILD/APPLY PRs)
- Add tool exporters that emit normalized contract fields
- Preserve legacy payload loading in parallel

Phase 3: Runtime seam adoption (future BUILD/APPLY PRs)
- Introduce a contract validation/normalization seam
- Keep existing public engine APIs stable
- Deprecate legacy ad hoc mappings only after coverage and parity checks

## Guardrails Confirmed
- No implementation code added
- No engine architecture redesign beyond contract seam
- No 3D scope introduced
- No unrelated sample/game/tool modifications
- Contract remains 2D-focused and low-risk extensible
