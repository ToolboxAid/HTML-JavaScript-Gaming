# PLAN_PR_VECTOR_ASSET_CONTRACT

## Goal
Define the canonical vector asset contract for authoring, validation, packaging, loading, and runtime consumption so future vector-native work shares one stable data model and acceptance boundary.

## Purpose And Goals
- make vector assets first-class platform content
- keep vector authoring deterministic across tools
- ensure validation, packaging, and runtime consume the same contract
- separate authoring concerns from rendering/runtime concerns
- keep the contract narrow enough to avoid engine creep

## Canonical File Format Expectations
- canonical persisted format: JSON-based vector asset document
- file extension target: `.vector.json`
- root object must contain:
  - `format`
  - `version`
  - `assetId`
  - `name`
  - `viewport`
  - `anchors`
  - `layers`
  - optional `metadata`
- SVG may be used as an authoring interchange or import source, but not as the authoritative canonical contract unless explicitly wrapped into canonical vector metadata

## Coordinate System Rules
- coordinate system must be explicit and stable in the document
- default authoring space uses top-left origin with positive `x` to the right and positive `y` downward
- all geometry coordinates must be expressed in document-local units
- viewport width and height must be required
- no implicit screen-space assumptions may be baked into the asset

## Origin And Anchor Rules
- each asset must define a default origin/anchor reference
- anchors must be named and deterministic
- supported anchor examples:
  - `center`
  - `topLeft`
  - `bottomCenter`
  - domain-specific anchors such as `muzzle`, `thruster`, `pivot`
- render/runtime consumers may read anchors but must not redefine asset-local anchor meaning

## Scale And Normalization Policy
- source geometry remains in asset-local units
- no hidden normalization at runtime
- any normalized preview bounds used by tools must be derived, not destructive
- packaging may compute derived bounds and metrics, but must preserve original coordinates
- scaling for runtime use must be explicit in consuming config, not silently embedded by loaders

## Stroke Fill Color And Palette Rules
- fill and stroke definitions must be explicit per shape or inherited through deterministic layer rules
- color values must use stable serialized forms
- palette-linked vector assets may reference palette IDs, but the asset contract must still resolve to explicit effective colors for validation/runtime use
- no editor-only color shorthands in canonical persisted assets
- unsupported paint features should fail validation rather than degrade silently

## Layering And Z-Order Semantics
- `layers` must be ordered arrays
- within each layer, shape order is authoritative draw order unless a stricter explicit z-index field is adopted
- if z-index metadata exists, ordering rules must define tie-break behavior deterministically
- hidden or locked editor-only states must not alter canonical runtime draw order

## Metadata And Extensibility Rules
- `metadata` must be optional and namespaced
- metadata extensions must not redefine core geometry semantics
- unknown metadata keys must be preserved where safe and ignored by core validation unless claimed by an enabled feature/consumer
- future extensions must version-gate breaking changes

## Ownership Boundaries
### Tools
- authoring tools own editing UX, import/export helpers, previews, and contract-compliant serialization

### Loaders
- loaders own canonical document parsing, fail-fast checks, and runtime-ready handoff objects

### Geometry Runtime
- geometry runtime owns geometry interpretation and transform application, not authoring semantics

### Render And Runtime Consumers
- render/runtime consumers own presentation, transforms, scaling, and scene integration using the validated canonical asset

### Validation And Packaging
- validation owns correctness checks for structure, coordinates, anchors, colors, ordering, and required fields
- packaging owns manifest inclusion, deterministic summaries, and dependency declaration for vector assets

## Validation Examples And Acceptance Criteria
- reject missing `format` or unsupported `version`
- reject assets with no `viewport`
- reject duplicate anchor names
- reject layers with malformed shape lists
- reject unsupported fill/stroke declarations
- accept only assets that can be authored, saved, validated, packaged, and loaded without lossy path-specific hacks
- acceptance requires deterministic validation output and stable runtime-ready data handoff

## Migration Notes
- existing SVG-first content should migrate through a bridge that produces canonical `.vector.json` output plus explicit metadata
- legacy vector-like tool outputs must be mapped field-by-field into the new contract
- migration reports should identify unsupported legacy fields instead of guessing runtime behavior
- future template/demo migrations should prefer contract-compliant vector assets over ad hoc SVG path loading

## Non-Goals
- no scene graph engine expansion
- no shader/material system
- no physics or collision standard folded into the base vector asset format
- no runtime API redesign as part of the contract definition
