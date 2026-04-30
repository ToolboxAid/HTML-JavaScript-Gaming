# PLAN_PR_11_17_SCHEMA_SET_NORMALIZATION_AND_WORKSPACE_REF_ENFORCEMENT

## Purpose
Normalize the full schema set and make Workspace validation follow the tool schemas as SSoT.

## Input
User supplied `schemas.zip` as the candidate complete schema set.

## Problem
The current schema set has drift:
- `workspace.manifest.schema.json` still requires top-level `palettes`
- palette should be singular and tool-owned at `tools.palette-browser`
- Workspace manifest does not `$ref` tool schemas
- `tools.additionalProperties` is too loose
- Workspace accepts invalid/unknown tool payloads
- sample 1902 can pass with copied garbage payloads instead of schema-valid Workspace data

## Scope
- Correct schemas under `tools/schemas/`
- Use each tool schema as the payload SSoT via `$ref`
- Tighten Workspace manifest validation
- Rebuild/validate only sample 1902 against corrected schemas
- Do not modify other samples
- Do not modify start_of_day folders

## Acceptance
- Full schema set is syntactically valid JSON Schema draft 2020-12
- Workspace manifest uses `tools` as the only top-level data bucket
- `tools.palette-browser` is required, singular, and schema-valid
- Every supported tool key is explicitly listed under `tools.properties`
- Every supported tool payload uses `$ref` to its tool schema where available
- `tools.additionalProperties` is false
- Sample 1902 validates against corrected Workspace schema
- Workspace shows all valid tools, not only Palette
