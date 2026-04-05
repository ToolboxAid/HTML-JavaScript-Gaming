Toolbox Aid
David Quesenberry
04/05/2026
BUILD_PR_RENDER_PIPELINE_CONTRACT_ALL_4_TOOLS.md

# BUILD_PR_RENDER_PIPELINE_CONTRACT_ALL_4_TOOLS

## Purpose
Tighten the render pipeline contract into a production-grade, docs-only BUILD PR that closes the remaining gaps for all four tool producers:
- Tile Map Editor
- Parallax Editor
- Sprite Editor
- Vector Asset Studio

This PR formalizes the engine-facing contract, deterministic render pipeline, locked engine mappings, validation rules, composition layer, and exact Codex execution boundaries without introducing implementation code.

## Scope
In scope:
- Formal canonical schema definitions for shared contract documents
- Formal render pipeline ordering and stage ownership
- Locked tool-to-engine mappings
- Validation/error handling rules
- Composition document for cross-tool scene assembly
- Codex execution constraints and acceptance targets

Out of scope:
- Runtime implementation code
- Engine renderer rewrite
- Asset conversion utilities
- 3D features
- Unrelated sample, game, or tool UX changes

## 1. Canonical Contract Family
The render pipeline uses a small contract family instead of ad hoc tool payloads.

### 1.1 Document Types
Allowed engine-facing document types:
- `toolbox.render.asset-document`
- `toolbox.render.composition-document`

### 1.2 Shared Envelope
Every engine-facing document MUST use this envelope:

```json
{
  "documentType": "toolbox.render.asset-document",
  "contractVersion": "1.0.0",
  "producer": {
    "tool": "tile-map-editor",
    "toolVersion": "string"
  },
  "document": {
    "id": "level.01",
    "name": "Level 01",
    "coordinateSpace": "2d",
    "units": "pixels"
  },
  "metadata": {},
  "payload": {}
}
```

Required top-level fields:
- `documentType`
- `contractVersion`
- `producer.tool`
- `producer.toolVersion`
- `document.id`
- `document.name`
- `document.coordinateSpace`
- `document.units`
- `metadata`
- `payload`

Rules:
- `contractVersion` must be `1.0.0` for this PR
- `document.coordinateSpace` must be `2d`
- `document.units` must be `pixels` unless a future PR extends this explicitly
- `metadata` and `payload` must exist even when empty

## 2. Shared Schema Definitions

### 2.1 Shared Metadata Schema

```json
{
  "projectId": "optional-string",
  "createdAt": "ISO-8601 optional",
  "updatedAt": "ISO-8601 optional",
  "tags": ["optional", "strings"],
  "runtimeFlags": {},
  "notes": "optional-string"
}
```

Metadata rules:
- Unknown metadata fields may be preserved but must not change runtime behavior unless explicitly documented
- Runtime behavior may only depend on documented `runtimeFlags`
- Editor-only notes must not become runtime requirements

### 2.2 Shared Asset Record Schema
Every asset document may declare shared assets using the normalized asset record:

```json
{
  "id": "asset.background.sky",
  "type": "image",
  "path": "assets/backgrounds/sky.png",
  "source": "relative",
  "preload": true,
  "role": "render",
  "metadata": {}
}
```

Required asset fields:
- `id`
- `type`
- `path`
- `source`
- `preload`
- `role`
- `metadata`

Allowed `type` values:
- `image`
- `spritesheet`
- `vector`
- `tileset`
- `template`

Allowed `source` values:
- `relative`

Allowed `role` values:
- `render`
- `collision`
- `reference`
- `ui`

Asset rules:
- No absolute machine paths
- No temp paths
- Paths are project-relative and slash-normalized
- Duplicate asset IDs are invalid
- Duplicate `type + path` combinations should be rejected unless explicitly aliased in a future PR

### 2.3 Shared Layer Schema
Every renderable payload normalizes to layers.

```json
{
  "id": "layer.background",
  "name": "Background",
  "kind": "parallax",
  "visible": true,
  "opacity": 1,
  "zIndex": 0,
  "runtimeInclusion": "gameplay",
  "items": [],
  "metadata": {}
}
```

Required layer fields:
- `id`
- `name`
- `kind`
- `visible`
- `opacity`
- `zIndex`
- `runtimeInclusion`
- `items`
- `metadata`

Allowed `kind` values:
- `parallax`
- `tilemap`
- `sprite`
- `vector`
- `collision`
- `guide`
- `overlay`

Allowed `runtimeInclusion` values:
- `gameplay`
- `debug`
- `editor-only`

Layer rules:
- `opacity` range: `0` to `1`
- `zIndex` is integer
- `guide` layers default to `editor-only`
- `collision` layers default to non-art utility handling
- Layers must not reference missing assets or items

### 2.4 Shared Item Schema
Layer items normalize to a common item shell.

```json
{
  "id": "item.sky.01",
  "type": "image-plane",
  "assetId": "asset.background.sky",
  "visible": true,
  "order": 0,
  "transform": {
    "x": 0,
    "y": 0,
    "scaleX": 1,
    "scaleY": 1,
    "rotation": 0
  },
  "metadata": {}
}
```

Required item fields:
- `id`
- `type`
- `visible`
- `order`
- `transform`
- `metadata`

Optional but common fields:
- `assetId`
- `tileId`
- `frame`
- `style`
- `bounds`
- `points`
- `animation`

## 3. Tool-Specific Asset Document Schemas
Each tool produces an asset document using the shared envelope plus a locked payload shape.

### 3.1 Tile Map Editor Schema

```json
{
  "documentType": "toolbox.render.asset-document",
  "contractVersion": "1.0.0",
  "producer": { "tool": "tile-map-editor", "toolVersion": "string" },
  "document": { "id": "level.01", "name": "Level 01", "coordinateSpace": "2d", "units": "pixels" },
  "metadata": {},
  "payload": {
    "assets": [],
    "layers": [
      {
        "id": "layer.ground",
        "name": "Ground",
        "kind": "tilemap",
        "visible": true,
        "opacity": 1,
        "zIndex": 100,
        "runtimeInclusion": "gameplay",
        "items": [],
        "metadata": {
          "tileWidth": 32,
          "tileHeight": 32,
          "mapWidth": 100,
          "mapHeight": 20
        }
      }
    ],
    "entities": []
  }
}
```

Tile map rules:
- Tile dimensions must be explicit
- Map dimensions must be explicit
- Collision content must use `kind: collision` or explicit collision metadata
- Tile references must point to declared tileset assets

### 3.2 Parallax Editor Schema

```json
{
  "documentType": "toolbox.render.asset-document",
  "contractVersion": "1.0.0",
  "producer": { "tool": "parallax-editor", "toolVersion": "string" },
  "document": { "id": "bg.01", "name": "Background Stack", "coordinateSpace": "2d", "units": "pixels" },
  "metadata": {},
  "payload": {
    "assets": [],
    "layers": [
      {
        "id": "layer.sky",
        "name": "Sky",
        "kind": "parallax",
        "visible": true,
        "opacity": 1,
        "zIndex": 0,
        "runtimeInclusion": "gameplay",
        "items": [],
        "metadata": {
          "parallaxFactorX": 0.2,
          "parallaxFactorY": 0,
          "repeatX": true,
          "repeatY": false
        }
      }
    ],
    "entities": []
  }
}
```

Parallax rules:
- Each plane must define parallax factors through metadata
- Repeat behavior must be explicit when supported
- Draw order is controlled by `zIndex`, not editor tab order alone

### 3.3 Sprite Editor Schema

```json
{
  "documentType": "toolbox.render.asset-document",
  "contractVersion": "1.0.0",
  "producer": { "tool": "sprite-editor", "toolVersion": "string" },
  "document": { "id": "player.sprite", "name": "Player Sprite", "coordinateSpace": "2d", "units": "pixels" },
  "metadata": {},
  "payload": {
    "assets": [],
    "layers": [
      {
        "id": "layer.player",
        "name": "Player",
        "kind": "sprite",
        "visible": true,
        "opacity": 1,
        "zIndex": 200,
        "runtimeInclusion": "gameplay",
        "items": [],
        "metadata": {}
      }
    ],
    "entities": [
      {
        "id": "entity.player",
        "name": "Player",
        "spriteLayerId": "layer.player",
        "metadata": {
          "origin": "center",
          "animations": []
        }
      }
    ]
  }
}
```

Sprite rules:
- Animation metadata belongs to sprite items/entities, not parallax or tilemap layers
- Sprite frames must resolve to declared sprite or spritesheet assets
- Palette hints may exist in metadata but are not authoritative runtime behavior unless explicitly documented

### 3.4 Vector Asset Studio Schema

```json
{
  "documentType": "toolbox.render.asset-document",
  "contractVersion": "1.0.0",
  "producer": { "tool": "vector-asset-studio", "toolVersion": "string" },
  "document": { "id": "overlay.01", "name": "Vector Overlay", "coordinateSpace": "2d", "units": "pixels" },
  "metadata": {},
  "payload": {
    "assets": [],
    "layers": [
      {
        "id": "layer.overlay",
        "name": "Overlay",
        "kind": "vector",
        "visible": true,
        "opacity": 1,
        "zIndex": 400,
        "runtimeInclusion": "gameplay",
        "items": [],
        "metadata": {}
      }
    ],
    "entities": []
  }
}
```

Vector rules:
- Vector items must define style/geometry in item metadata or normalized item fields
- Templates must resolve to declared vector/template assets
- Debug overlays must use `runtimeInclusion: debug` or `editor-only`

## 4. Formal Render Pipeline
This PR locks the formal pipeline stages for 2D composition.

### 4.1 Pipeline Stages
1. **Load**
   - Read asset and composition documents
   - Reject unsupported document types or contract versions
2. **Validate**
   - Validate required fields, IDs, references, types, ranges, and mappings
3. **Normalize**
   - Normalize assets, layers, items, and composition references into runtime-safe records
4. **Resolve**
   - Resolve project-relative paths and cross-document references
5. **Compose**
   - Merge referenced documents into one deterministic scene graph
6. **Sequence**
   - Sort layers and items according to the contract rules below
7. **Render**
   - Submit normalized ordered layers to engine systems

### 4.2 Formal Render Order
Canonical render buckets for composed scenes:
1. `parallax` background layers
2. `tilemap` world layers
3. gameplay `sprite` layers and sprite-backed entities
4. gameplay `vector` layers
5. `overlay` layers
6. debug `collision` and `guide` layers only when explicitly enabled

Formal ordering rules:
- Bucket order above applies first
- Then sort by `zIndex` ascending within bucket
- Then sort by source document order
- Then sort by item `order`
- Then preserve stable source order as final tie-breaker

### 4.3 Visibility Rules
- `visible: false` excludes the item or layer from render submission
- `runtimeInclusion: editor-only` excludes the layer from gameplay runtime
- `runtimeInclusion: debug` excludes the layer unless debug mode explicitly enables it

## 5. Locked Engine Mappings
This PR locks the intended engine seam so Codex does not guess.

| Producer | Contract Kind / Content | Engine Responsibility | Notes |
|---|---|---|---|
| Tile Map Editor | `tilemap`, `collision` | `engine/tilemap/`, renderer, collision, camera consumption | Tile art and collision data remain distinct even when exported together |
| Parallax Editor | `parallax` | renderer + camera-based parallax handling | Camera motion modifies parallax factors, not source asset coordinates |
| Sprite Editor | `sprite`, sprite-backed `entities` | ECS movement/collision + renderer consumption | Sprite content stays engine-facing through public contracts only |
| Vector Asset Studio | `vector`, `overlay`, optional debug layers | renderer/debug paths as appropriate | Vector overlays may be gameplay or debug depending on `runtimeInclusion` |

Mapping rules:
- Tools export contract data only
- Runtime owns validation, normalization, composition, and sequencing
- Runtime must not silently rewrite invalid tool output
- Existing public engine APIs remain stable unless a future PR explicitly changes them

## 6. Validation Layer
Validation is mandatory and non-silent.

### 6.1 Required Validation Checks
- Supported `documentType`
- Supported `contractVersion`
- Allowed `producer.tool`
- Presence of required envelope fields
- `document.coordinateSpace === "2d"`
- Unique IDs within assets, layers, items, and entities collections
- Valid enum values for `type`, `kind`, `source`, `role`, `runtimeInclusion`
- Valid numeric ranges (`opacity`, transform values where constrained)
- Valid cross-references (`assetId`, `spriteLayerId`, composition references)
- Valid path rules (relative only)

### 6.2 Error Policy
- Missing required field -> reject document
- Unsupported version -> reject document
- Unknown producer -> reject document
- Duplicate ID -> reject document
- Missing referenced asset/layer/document -> reject document
- Unsupported layer kind -> reject document
- Invalid `runtimeInclusion` -> reject document
- Invalid opacity or malformed transform -> reject document

Rules:
- No silent repairs
- No automatic absolute path inference
- No hidden default insertion for required fields
- Optional fields may default only when the contract explicitly allows it

### 6.3 Allowed Explicit Defaults
Only these defaults are permitted when fields are omitted in future-compatible payloads:
- `visible: true`
- `opacity: 1`
- `metadata: {}`
- `items: []`

If a tool omits any other required field, validation fails.

## 7. Composition Layer
Cross-tool composition is formally added in this PR so the four tools behave as one pipeline.

### 7.1 Composition Document Schema

```json
{
  "documentType": "toolbox.render.composition-document",
  "contractVersion": "1.0.0",
  "producer": {
    "tool": "composition-manifest",
    "toolVersion": "1.0.0"
  },
  "document": {
    "id": "scene.level.01",
    "name": "Scene Level 01",
    "coordinateSpace": "2d",
    "units": "pixels"
  },
  "metadata": {},
  "payload": {
    "references": [
      {
        "id": "ref.background",
        "documentPath": "assets/contracts/background.json",
        "role": "parallax"
      },
      {
        "id": "ref.world",
        "documentPath": "assets/contracts/level01.json",
        "role": "tilemap"
      },
      {
        "id": "ref.player",
        "documentPath": "assets/contracts/player.json",
        "role": "sprite"
      },
      {
        "id": "ref.overlay",
        "documentPath": "assets/contracts/overlay.json",
        "role": "vector"
      }
    ]
  }
}
```

Required composition reference fields:
- `id`
- `documentPath`
- `role`

Allowed composition `role` values:
- `parallax`
- `tilemap`
- `sprite`
- `vector`
- `overlay`

Composition rules:
- Composition documents do not redefine referenced content inline
- Composition documents assemble existing normalized contract documents
- Scene assembly order is derived from render bucket + `zIndex`, not composition file row order alone
- Composition references must use project-relative paths

## 8. Codex Execution Contract
Codex must execute this BUILD PR without drifting scope.

### 8.1 Required Deliverables
- `docs/pr/BUILD_PR_RENDER_PIPELINE_CONTRACT_ALL_4_TOOLS.md`
- `docs/dev/codex_commands.md`
- `docs/dev/commit_comment.txt`
- `docs/dev/change_summary.txt`
- `docs/dev/validation_checklist.txt`
- `docs/dev/file_tree.txt`
- `docs/dev/next_command.txt`

### 8.2 Codex Must Do
- Tighten the contract schemas exactly as documented here
- Preserve docs-only scope
- Preserve repo-relative structure
- Preserve file header rules on every created file
- Write explicit acceptance and validation language
- Package the output as a delta ZIP at:
  - `HTML-JavaScript-Gaming-main/tmp/BUILD_PR_RENDER_PIPELINE_CONTRACT_ALL_4_TOOLS_delta.zip`

### 8.3 Codex Must Not Do
- Add implementation code
- Change engine runtime files
- Change tool runtime files
- Rewrite unrelated docs
- Expand to 3D or unrelated asset systems
- Collapse this PR into multiple PR purposes

## 9. Acceptance Criteria
This BUILD PR is complete only if:
- All four tools have explicit schema coverage
- Render pipeline stages are formalized
- Render ordering is deterministic and documented
- Engine mappings are locked and explicit
- Validation policy is explicit and non-silent
- Composition document exists and is documented
- Codex execution instructions are exact
- The bundle remains docs-only and repo-structured

## 10. Incremental Follow-Through
Future PR sequence after this BUILD PR:
1. APPLY_PR_RENDER_PIPELINE_CONTRACT_ALL_4_TOOLS
2. BUILD_PR_TOOL_EXPORTERS_RENDER_CONTRACT_ADAPTERS
3. BUILD_PR_RUNTIME_VALIDATION_NORMALIZATION_SEAM
4. BUILD_PR_SCENE_COMPOSITION_MANIFEST_LOADER

## Guardrails Confirmed
- Docs-only bundle
- No implementation code
- No unrelated architecture redesign
- No skipped workflow step
- 2D-only scope retained
- One PR purpose retained
