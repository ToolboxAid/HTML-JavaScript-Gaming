Toolbox Aid
David Quesenberry
04/05/2026
PLAN_PR_RENDER_PIPELINE_CONTRACT_ALL_4_TOOLS.md

# PLAN PR — Render Pipeline Contract for All 4 Tools

## Objective
Define the docs-first contract plan for a single, surgical PR that standardizes how the following tool outputs are authored, validated, loaded, and rendered by the engine runtime:

- Tile Map Editor
- Parallax Editor
- Sprite Editor
- Vector Asset Studio

This PLAN_PR does not introduce implementation code. It defines scope, contracts, boundaries, acceptance criteria, validation targets, and Codex build direction for the next BUILD_PR.

## Why This PR Exists
The repository already contains active tool/runtime work for vector-native assets, shared tooling, runtime demos, and tests. The missing backbone is a unified render pipeline contract that makes all four tools behave as first-class producers for the same engine-facing loading and rendering model.

This PR establishes the contract layer that lets tools produce compatible payloads without requiring per-tool runtime hacks.

## Alignment With Repo Rules
- Workflow remains PLAN_PR -> BUILD_PR -> APPLY_PR
- Docs-first only
- One PR per purpose
- No implementation code in this bundle
- Codex owns repo edits and command execution
- Output ZIP paths remain under <project folder>/tmp/

## Scope
This plan covers:
1. Shared engine-facing asset contract for all four tools
2. Shared metadata requirements
3. Layer ordering and render ordering rules
4. Asset path and dependency rules
5. Validation and error-handling expectations
6. Runtime ownership boundaries
7. Documentation targets for the subsequent BUILD_PR

This plan does not cover:
- Engine feature expansion beyond contract support
- Runtime refactors outside the contract seam
- New editor UX features
- Tool redesigns
- Game-specific custom loaders
- 3D systems or non-2D rendering

## Architectural Intent
The engine should consume a normalized, versioned, tool-produced contract rather than tool-specific ad hoc payloads.

Target flow:

Tool Output -> Contract Validator -> Loader/Normalizer -> Runtime Model -> Render System(s)

The runtime may normalize safe structural defaults, but it must not become a repair layer for malformed tool exports.

## Primary Design Principles
1. Engine-facing consistency over tool-specific convenience
2. Public contract first, internal representation second
3. Strict versioned payloads
4. Small surface area for loader logic
5. Deterministic layer/render ordering
6. Shared naming and metadata conventions
7. Explicit boundaries between authoring tools and runtime systems

## Contract Plan

### 1) Top-Level Unified Document
Each tool export should map into a unified top-level document shape.

Planned canonical shape:

```json
{
  "documentType": "renderPipelineAsset",
  "contractVersion": "1.0.0",
  "producer": {
    "tool": "<tool-name>",
    "toolVersion": "<tool-version>"
  },
  "scene": {
    "id": "<scene-id>",
    "name": "<scene-name>",
    "coordinateSpace": "2d"
  },
  "assets": [],
  "layers": [],
  "entities": [],
  "metadata": {}
}
```

Notes:
- `documentType` is fixed for engine-facing ingestion
- `contractVersion` is required and validated
- `producer.tool` identifies Tile Map Editor, Parallax Editor, Sprite Editor, or Vector Asset Studio
- `coordinateSpace` remains 2d
- `assets`, `layers`, and `metadata` are always present even if empty

### 2) Shared Metadata Rules
Required top-level metadata fields:
- id
- name
- tags (optional array)
- createdAt (optional)
- updatedAt (optional)
- authoringNotes (optional)
- runtimeFlags (optional object)

Required object-level metadata fields where applicable:
- id
- type
- name
- visible
- locked (tool-side only if relevant)
- zIndex or renderOrder depending on level

Naming rules:
- IDs must be stable within the document
- Names should be human-readable
- Types must use enumerated values only

### 3) Asset Record Plan
All referenced resources should be declared in a shared `assets` collection.

Planned minimal asset record:

```json
{
  "id": "asset_bg_mountains",
  "type": "image|spritesheet|vector|tileset",
  "path": "assets/backgrounds/mountains.png",
  "source": "relative",
  "preload": true,
  "metadata": {}
}
```

Rules:
- Relative repo-friendly paths only
- No absolute machine-local paths
- No tool-temp paths
- Runtime resolves assets through existing engine asset services
- Missing assets fail validation clearly

### 4) Layer Model Plan
All renderable content must land in a normalized layer model.

Planned common fields:
- id
- name
- kind
- visible
- opacity
- parallaxFactorX
- parallaxFactorY
- zIndex
- blendMode (reserved, optional)
- items

Enumerated `kind` values for this PR:
- tilemap
- parallax
- sprite
- vector
- collision
- guide
- overlay

Rules:
- `guide` and editor-only layers are not rendered in gameplay unless explicitly flagged
- `collision` may be loaded for debug/physics concerns but is not treated as a visible art layer by default
- Ordering is deterministic: lowest `zIndex` renders first; ties resolved by document order

### 5) Tool-Specific Mapping Plan

#### Tile Map Editor
Maps into:
- asset records for tilesets/images
- one or more `tilemap` layers
- tile grid payloads attached to layer items
- collision/debug layer references when present

Tile-specific planned fields:
- tileSize
- mapWidth
- mapHeight
- tileData
- tilesetAssetId

#### Parallax Editor
Maps into:
- image/vector asset records
- `parallax` layers with deterministic scroll factors
- optional repeat/loop flags for backgrounds

Parallax-specific planned fields:
- parallaxFactorX
- parallaxFactorY
- repeatX
- repeatY
- cameraInfluence

#### Sprite Editor
Maps into:
- spritesheet/image asset records
- `sprite` layers or entity-linked sprite definitions
- frame/animation definitions when present

Sprite-specific planned fields:
- frameWidth
- frameHeight
- animations
- defaultAnimation
- origin

#### Vector Asset Studio
Maps into:
- vector asset records
- `vector` layers or reusable vector instances
- shape/style payloads or vector template references

Vector-specific planned fields:
- primitiveSet or templateRef
- stroke
- fill
- transform
- anchor

### 6) Entity Attachment Plan
Where runtime objects need composition, the contract may place references in `entities`.

Planned entity shape:

```json
{
  "id": "entity_player_spawn",
  "name": "Player Spawn",
  "components": {
    "transform": {
      "x": 0,
      "y": 0,
      "rotation": 0,
      "scaleX": 1,
      "scaleY": 1
    },
    "renderRef": {
      "layerId": "gameplaySprites",
      "itemId": "player_idle"
    }
  }
}
```

This PR does not attempt ECS redesign. It only defines safe attachment seams where tool-authored content must reference runtime-renderable items consistently.

### 7) Runtime Ownership Boundaries
Engine owns:
- loading validated contracts
- resolving relative assets
- creating runtime models
- deterministic rendering
- safe defaults for omitted optional fields
- reporting contract violations

Tools own:
- producing valid contract exports
- stable IDs and metadata
- correct layer typing
- correct asset references
- correct per-tool payload mapping

Engine must not:
- infer missing required fields
- silently repair broken exports
- accept machine-local paths
- encode editor-only assumptions into gameplay runtime

### 8) Validation Plan
The BUILD_PR should define or document validation rules for:
- missing required top-level keys
- invalid contract version
- invalid tool producer names
- duplicate IDs
- unknown layer kinds
- missing asset references
- invalid zIndex values
- invalid per-tool mapping payloads
- editor-only layers marked for gameplay unexpectedly

Validation outcomes must be explicit and developer-readable.

### 9) Render Ordering Plan
Final render sequencing should follow:
1. Global layer sort by `zIndex`
2. Stable tie-break by source order
3. Within each layer, item order by explicit order field or source order
4. Overlay/debug rules applied after gameplay-visible layers if enabled

Expected visual stack guidance:
- background parallax
- back decorative vector/image layers
- tilemap world layers
- gameplay sprites
- foreground vector/tile overlays
- debug/guide overlays when enabled

### 10) Compatibility and Migration Plan
This PR should favor additive normalization rather than destructive rewrites.

BUILD_PR should:
- document the current state of each tool output
- define the target normalized contract
- identify any adapter seam required for incremental migration
- avoid breaking unrelated engine APIs
- avoid broad sample/game churn

### 11) Documentation Targets for BUILD_PR
The subsequent BUILD_PR should create or update docs such as:
- docs/pr/BUILD_PR_RENDER_PIPELINE_CONTRACT_ALL_4_TOOLS.md
- docs/architecture/render_pipeline_contract.md
- docs/architecture/tool_output_mapping.md
- docs/operations/dev/validation_checklist.txt
- docs/operations/dev/change_summary.txt
- docs/operations/dev/file_tree.txt

Codex may refine filenames if existing repo patterns require a nearby equivalent, but the purpose must remain unchanged.

## Acceptance Criteria for This PLAN_PR
This plan is complete when the next BUILD_PR can be executed without re-scoping.

Required outcomes for BUILD_PR:
- One documented engine-facing contract covering all four tools
- Clear required and optional fields
- Deterministic layer/render ordering rules
- Defined ownership boundaries
- Defined validation expectations
- Defined mapping expectations per tool
- No implementation code included in the PLAN_PR bundle

## Out of Scope Guardrails
The following must not be pulled into the next PR unless explicitly approved:
- Engine-wide renderer rewrite
- New scene lifecycle model
- New ECS model
- Tool UI redesign
- New sample/game content unrelated to proving the contract
- Serialization formats unrelated to the 2D render pipeline contract

## Risks
- Scope creep into runtime refactors
- Hidden incompatibilities between existing tool payloads
- Loader complexity if normalization is underspecified
- Accidental leakage of editor semantics into engine runtime

## Risk Controls
- Keep the PR contract-first
- Keep mappings explicit per tool
- Prefer incremental normalization
- Preserve engine public boundaries
- Document unknowns instead of solving them implicitly in code

## Build Recommendation
Proceed to BUILD_PR_RENDER_PIPELINE_CONTRACT_ALL_4_TOOLS as a docs-first implementation-planning PR that prepares Codex to author the required repo edits and any minimal contract-supporting runtime documentation/tests.

## Next Step After Approval
Create BUILD_PR_RENDER_PIPELINE_CONTRACT_ALL_4_TOOLS as a docs-only, repo-structured delta ZIP with Codex command, commit comment, change summary, file tree, and validation checklist aligned to this plan.
