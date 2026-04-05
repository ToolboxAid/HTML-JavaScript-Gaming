# Vector Asset Contract

## Purpose And Scope
This document defines the canonical contract for first-class vector assets used by the toolchain, packaging flows, loaders, and future geometry/runtime consumers.

Scope:
- vector asset authoring outputs
- validation expectations
- packaging and loader expectations
- runtime consumption boundaries

Out of scope:
- broad engine API redesign
- shader or material systems
- physics or collision standards baked into the base vector asset format

## Canonical Vector Asset File Role
- canonical persisted vector assets should be stored as structured JSON documents
- preferred extension: `.vector.json`
- SVG may be used as an import or authoring bridge, but the canonical asset contract must live in the normalized vector asset document

## Required Core Structure
A canonical vector asset should define at minimum:
- `format`
- `version`
- `assetId`
- `name`
- `viewport`
- `origin`
- `layers`
- optional `anchors`
- optional `metadata`

## Coordinate System
- coordinates are asset-local, not screen-global
- default authoring orientation uses top-left origin, positive `x` to the right, positive `y` downward
- viewport width and height must be explicit
- no implicit coordinate normalization may be assumed by loaders or runtime consumers

## Origin Conventions
- every asset must declare a default origin reference
- the origin must be stable and deterministic
- origin naming must be explicit when not using the default asset origin
- anchors may extend origin behavior for domain-specific attachment points

## Transform Expectations
- transforms must be explicit and serializable
- if transform stacks are supported, ordering must be deterministic
- authoring tools may preview derived transforms, but canonical persisted geometry must remain stable
- runtime consumers may apply scene transforms, but must not reinterpret the asset’s native coordinate system

## Stroke Behavior
- stroke presence must be explicit per shape or via deterministic inherited layer rules
- stroke width, join, cap, and opacity rules must be serializable where supported
- unsupported stroke features should fail validation instead of silently degrading

## Fill And Color Rules
- fills must be explicit and deterministic
- color values must use a stable serialized format
- no editor-only shorthand color tokens in canonical persisted assets
- unsupported fill styles must be rejected or explicitly version-gated

## Palette Strategy
- palette-linked vector assets may reference palette IDs
- runtime-relevant effective color values must remain derivable without editor-only state
- palette references must not make the asset ambiguous at validation/load time
- validation should fail when required palette references cannot be resolved

## Supported Shape Primitives
Minimum intended primitive support:
- line
- rectangle
- ellipse
- polyline
- polygon
- path

Future primitives may be added only through versioned contract extension.

## Layering Expectations
- layers must be ordered arrays
- within a layer, shape order is the deterministic draw order unless an explicit z-policy is introduced
- hidden or locked editor-only state must not redefine canonical runtime ordering

## Naming Conventions
- `assetId` must be stable and unique within the relevant packaging scope
- layer and anchor names should be human-readable and deterministic
- naming should avoid runtime-derived or random identifiers
- tool-generated default names should be normalized and reproducible

## Runtime Expectations
- loaders should fail fast on malformed or unsupported vector assets
- packaging should include vector assets through stable manifest entries and canonical paths
- runtime consumers should receive validated, runtime-ready vector data without guessing missing contract fields
- no hidden runtime normalization or coordinate rewriting

## Future Geometry Runtime Support
The future geometry runtime must support:
- canonical viewport interpretation
- deterministic transform application
- layer-ordered rendering
- anchor/origin lookups
- explicit stroke and fill consumption
- fail-fast handling for unsupported or malformed contract fields

## Validation Expectations
Validation should reject:
- missing `format` or unsupported `version`
- missing or malformed `viewport`
- duplicate anchor names
- malformed layer structures
- unsupported stroke or fill payloads
- unresolved required palette references

Validation should accept assets only when they can move through authoring, packaging, loading, and runtime handoff without lossy path-specific hacks.

## Explicit Non-Goals
- no scene graph engine design
- no animation contract inside the base vector asset format
- no physics or collision spec folded into the same core document
- no rendering backend commitments beyond the validated asset handoff boundary
