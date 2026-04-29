# PR 11.37 — Deep Rename Vector Asset Studio to SVG Asset Studio

## Purpose
Perform a full repo-level rename from Vector Asset Studio to SVG Asset Studio.

## Problem
PR 11.36 was display-only. That is not enough.

The rename must be deep and consistent across:
- directories
- filenames
- tool IDs where appropriate
- manifests
- registries
- workspace usage
- schema references
- sample JSON payloads
- tests
- docs
- import paths
- launch URLs
- reports/help text

## Required Rename

### Human-facing name
Vector Asset Studio → SVG Asset Studio

### Capability framing
Old meaning:
- generic vector asset editor

New meaning:
- SVG-focused asset authoring studio

### Preferred internal ID migration
If current internal id is:
- vector-asset-studio

Migrate to:
- svg-asset-studio

## Compatibility Requirement
This is a deep rename, but existing old sample links or payload references must not hard-break during migration.

Provide a temporary compatibility alias:
- vector-asset-studio → svg-asset-studio

The alias must be centralized and documented.

Do not create scattered remapping chains.

## Scope
- Rename code paths and references intentionally.
- Update sample 1902 workspace JSON references.
- Update manifests and schema contracts.
- Update tests and smoke expectations.
- Update docs/reports references.
- Preserve behavior.
- Do not change unrelated tool logic.
- Do not touch start_of_day folders unless they contain active runtime references required for tests.

## Anti-Pattern Guard
- One concept = one canonical new name.
- Use `svg-asset-studio` as canonical.
- Only keep old name as centralized compatibility alias.
- Do not create duplicate tools.
- Do not keep both tools in Workspace Manager.
- Do not create fallback hidden assets.

## Acceptance
- Workspace Manager shows SVG Asset Studio.
- Tool opens and functions from Workspace Manager.
- Sample 1902 payload references new canonical name.
- Old `vector-asset-studio` references are removed or centralized as compatibility aliases.
- No duplicate Vector/SVG Asset Studio tiles.
- Runtime smoke passes.
- Repo search for "Vector Asset Studio" only finds intentional migration/history docs.
- Repo search for "vector-asset-studio" only finds centralized compatibility alias or migration docs.
