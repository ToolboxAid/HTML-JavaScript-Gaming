# PLAN_PR_11_14_WORKSPACE_SCHEMA_PALETTE_TOOL_AND_1902_REBUILD

## Purpose
Update the Workspace manifest schema so Palette is a singular tool payload under `tools.palette-browser`, then rebuild only sample 1902 to match.

## Problem
Workspace currently shows only Palette. The schema separates `palettes` from `tools`, but Palette is a tool and should be represented as a single allowed `tools.palette-browser` payload. Sample 1902 must not use a separate palette sidecar or workspace-level palettes collection.

## Scope
- Update Workspace manifest schema contract.
- Palette becomes singular and tool-owned:
  - `tools.palette-browser`
  - only one palette allowed
- Rebuild only sample 1902 against the updated schema.
- Do not modify other samples.
- Do not modify standalone tool samples.
- Do not modify start_of_day folders.

## Acceptance
- `workspace.manifest.schema.json` no longer requires top-level `palettes`.
- `tools.palette-browser` is the single palette source for Workspace.
- Only one palette payload is allowed in Workspace manifest.
- Sample 1902 contains no `sample.1902.palette.json`.
- Sample 1902 Workspace JSON validates against updated schema.
- Workspace shows all valid tools, not only Palette.
