Toolbox Aid
David Quesenberry
04/05/2026
APPLY_PR_RENDER_PIPELINE_CONTRACT_ALL_4_TOOLS.md

# APPLY_PR_RENDER_PIPELINE_CONTRACT_ALL_4_TOOLS

## Purpose
Apply the approved render pipeline contract to runtime with one surgical implementation PR. This APPLY_PR executes the production-grade BUILD_PR contract for all four tool producers:
- Tile Map Editor
- Parallax Editor
- Sprite Editor
- Vector Asset Studio

This PR implements contract loading, validation, deterministic render ordering, locked tool-to-engine mappings, and composition-driven scene assembly. The implementation must preserve current engine layering boundaries and must not introduce unrelated refactors.

## Source of Truth
Codex MUST implement from the approved BUILD_PR contract bundle and treat these rules as authoritative:
- Canonical asset-document envelope
- Canonical composition-document envelope
- Shared asset, layer, and item normalization
- Deterministic render stages and ordering
- Locked engine mappings
- Validation reject rules
- Composition assembly rules

## Implementation Goals
1. Add a runtime contract loader path that accepts only approved `toolbox.render.asset-document` and `toolbox.render.composition-document` documents.
2. Add normalization and validation before documents reach renderer-facing systems.
3. Implement deterministic stage ordering so render order is formal and repeatable.
4. Wire tool-specific payloads into the correct engine systems without guessing.
5. Add composition loading so one scene can assemble tile, parallax, sprite, and vector documents together.
6. Add focused tests for valid documents, invalid documents, stage ordering, and composition assembly.

## Required Implementation Areas

### 1. Shared Runtime Contract Module
Create a shared runtime module under the engine-side public contract area or the existing shared/runtime utility area used by the repo.

Required responsibilities:
- Detect document type
- Validate required envelope fields
- Normalize asset records
- Normalize layers
- Normalize items
- Freeze or otherwise protect normalized output from accidental mutation where practical

Required runtime exports:
- `isRenderAssetDocument(input)`
- `isRenderCompositionDocument(input)`
- `validateRenderDocument(input)`
- `normalizeRenderAssetDocument(input)`
- `normalizeRenderCompositionDocument(input)`

Rules:
- Reject unknown `documentType`
- Reject missing required top-level fields
- Reject unsupported `contractVersion`
- Reject unsupported `coordinateSpace`
- Reject unsupported `units`
- Reject duplicate asset IDs
- Reject duplicate layer IDs
- Reject invalid asset references
- Reject invalid render stage declarations

### 2. Deterministic Render Pipeline
Implement formal render stages. Runtime ordering must be based first on stage, then on `zIndex`, then on stable item order.

Required stage order:
1. `background-parallax`
2. `world-tilemap`
3. `world-sprite`
4. `world-vector`
5. `overlay-vector`
6. `debug`

Required mapping behavior:
- `runtimeInclusion = gameplay` goes through gameplay stages only
- `runtimeInclusion = debug` goes through debug stage only
- `runtimeInclusion = editor-only` is rejected or ignored by runtime according to the approved contract path; do not render it in gameplay

Stable ordering rules:
- Stage order always wins over `zIndex`
- Within a stage, lower `zIndex` renders first
- Ties are broken by normalized item `order`
- Remaining ties are broken by insertion order after normalization

### 3. Locked Tool-to-Engine Mappings
Codex MUST NOT invent alternate mappings.

Required mappings:
- Tile Map Editor document payloads -> `src/engine/tilemap/` runtime and `TilemapRenderSystem`
- Parallax Editor document payloads -> renderer/background or parallax runtime path that feeds background rendering
- Sprite Editor document payloads -> sprite/entity render path already used by samples or tools
- Vector Asset Studio document payloads -> vector runtime path used by shared vector rendering/template systems

Boundary rules:
- Do not move reusable logic into samples
- Do not add tool-specific quirks to engine systems
- Keep engine consumption contract-driven
- If an adapter is required, place it in a narrow integration layer, not inside unrelated engine core APIs

### 4. Composition Loader
Implement a composition-driven scene assembly path.

Required behavior:
- Load a composition document containing references to multiple asset-documents
- Validate all references before runtime activation
- Assemble normalized documents into one runtime scene package
- Preserve deterministic stage ordering across all referenced documents
- Allow omission of optional document categories without failure

Required composition capabilities:
- Background/parallax-only scene
- Tilemap + sprite scene
- Tilemap + parallax + sprite + vector scene
- Overlay/debug vector composition

### 5. Validation Layer
Validation must fail fast and visibly.

Required behavior:
- Throw or return structured validation errors with code, path, and human-readable message
- Never silently coerce malformed contract structures into runtime success
- Support batch validation of composition references

Minimum error codes:
- `ERR_RENDER_DOCUMENT_TYPE`
- `ERR_RENDER_CONTRACT_VERSION`
- `ERR_RENDER_REQUIRED_FIELD`
- `ERR_RENDER_DUPLICATE_ASSET_ID`
- `ERR_RENDER_DUPLICATE_LAYER_ID`
- `ERR_RENDER_BAD_ASSET_REFERENCE`
- `ERR_RENDER_BAD_STAGE`
- `ERR_RENDER_BAD_RUNTIME_INCLUSION`
- `ERR_RENDER_COMPOSITION_REFERENCE`

### 6. Tests
Required automated coverage:
- Accept valid tilemap document
- Accept valid parallax document
- Accept valid sprite document
- Accept valid vector document
- Reject missing envelope field
- Reject bad contract version
- Reject duplicate asset IDs
- Reject missing asset reference from item
- Reject unsupported stage
- Verify deterministic render order across mixed documents
- Verify composition assembly for all four tool types

Test placement should follow current repo conventions under `tests/`.

## Explicit Non-Goals
- No engine-wide renderer rewrite
- No 3D support
- No editor UX changes
- No asset conversion CLI
- No unrelated sample upgrades
- No breaking engine API churn unless required for the contract integration layer

## Files Codex May Create or Update
Exact filenames may vary slightly to fit repo conventions, but output should stay surgical.

Likely targets:
- `src/engine/renderer/` shared render pipeline contract utilities
- `src/engine/assets/` shared contract loader utilities
- `src/engine/tilemap/` contract-aware integration updates
- `tools/shared/` vector-compatible contract helpers only if required by existing runtime path
- `tests/tools/` and/or `tests/src/src/engine/` new contract tests
- `docs/pr/APPLY_PR_RENDER_PIPELINE_CONTRACT_ALL_4_TOOLS.md`
- `docs/dev/change_summary.txt`
- `docs/dev/validation_checklist.txt`

## Acceptance Criteria
- All four tool document types load through one approved contract path
- Runtime rejects malformed documents with structured errors
- Deterministic stage ordering is test-covered
- Composition document can assemble a mixed scene
- Engine mappings are explicit and stable
- No reusable logic is placed in samples
- No unrelated repo areas are changed

## Codex Execution Instructions
- Follow the BUILD_PR contract exactly
- Keep the PR surgical
- Prefer adapters and shared validation over broad refactors
- Preserve public/internal/transitional boundaries
- Do not change engine core APIs unless needed for contract wiring
- Update docs/dev artifacts to match what was actually implemented
- Produce a repo-structured delta ZIP at:
  - `<project folder>/tmp/APPLY_PR_RENDER_PIPELINE_CONTRACT_ALL_4_TOOLS_delta.zip`

## Validation Checklist for User
1. Load one valid document from each of the four tool families.
2. Confirm invalid documents fail with readable error output.
3. Confirm parallax renders behind tilemap.
4. Confirm tilemap renders before sprites.
5. Confirm vector overlays render above gameplay.
6. Confirm debug-only layers do not render in gameplay mode.
7. Confirm a composition document assembles a mixed scene correctly.
8. Confirm no unrelated samples or games were modified.
