# PLAN_PR_11_13_WORKSPACE_1902_SCHEMA_CONFORMANCE_FIX

## Purpose
Fix sample 1902 so it conforms to the actual Workspace schema instead of using a mixed sample/tool payload shape.

## Problem
Sample 1902 still opens with Palette as the only valid tool. The uploaded JSON does not match the Workspace schema shape:
- it uses `$schema: ../../../tools/schemas/sample.tool-payload.schema.json`
- it uses `tool: workspace-all-tools-integration`
- it uses `activeWorkspaceTools`
- it contains copied game/sample/tool payload sections
- it mixes `config` and `payload` copies
- it is not shaped as a Workspace manifest

The available Workspace schemas indicate:
- `workspace.schema.json` requires: `documentKind`, `schema`, `version`, `games`
- `workspace.manifest.schema.json` requires: `palettes`, `tools`

## Scope
- Sample 1902 only.
- Workspace schema conformance only.
- Replace the current mixed payload with schema-valid Workspace data.
- Ensure Workspace loads all active workspace-supported tools.
- No palette sidecar.
- No copied unrelated sample/game garbage.
- Do not modify standalone tool samples.
- Do not modify start_of_day folders.

## Acceptance
- `sample.1902.workspace-all-tools.json` validates against the correct Workspace schema.
- Workspace no longer treats Palette as the only valid tool.
- All included tools are resolved through the Workspace-supported schema path.
- Tool data lives under the schema-correct location.
- No duplicated `config`/`payload` blocks.
- No `activeWorkspaceTools` unless the Workspace schema actually supports it.
- Report includes schema validation proof.
